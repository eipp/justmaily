import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse, type NextRequest } from 'next/server'

import { config } from './api/config'
import { logger, trackError } from './lib/monitoring'

// Initialize Redis client
const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    config.rateLimit.maxRequests,
    `${config.rateLimit.window}ms`
  ),
})

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/webhook (handled separately)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /robots.txt (static files)
     */
    '/((?!api/webhook|_next|static|_vercel|favicon.ico|robots.txt).*)',
  ],
}

export async function middleware(req: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Clone the response to modify headers
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    )
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )
    
    // Skip rate limiting for non-API routes
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      return response
    }
    
    // Skip rate limiting if disabled
    if (!config.features.rateLimiting) {
      return response
    }
    
    // Get identifier for rate limiting (API key or IP)
    const identifier = req.headers.get(config.api.keyHeader) || req.ip
    
    // Check rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    
    // Add request timing header
    const duration = Date.now() - startTime
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  } catch (error) {
    trackError(error as Error, {
      component: 'middleware',
      path: req.nextUrl.pathname,
      method: req.method,
    })
    
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 
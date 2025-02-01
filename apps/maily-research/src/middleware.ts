import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from '@/api/config'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    config.api.rateLimit.requests,
    config.api.rateLimit.window
  ),
})

// Middleware
export async function middleware(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.next()

    // Add security headers
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    )
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    // Check if request is for API route
    if (request.nextUrl.pathname.startsWith('/api')) {
      // Check rate limit
      const ip = request.ip ?? 'anonymous'
      const { success, limit, remaining, reset } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: {
              message: 'Rate limit exceeded',
              code: 'RATE_LIMIT_ERROR',
              details: {
                reset,
              },
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

      // Create Supabase client
      const supabase = createMiddlewareClient({ req: request, res: response })

      // Refresh session if it exists
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await supabase.auth.refreshSession()
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    // Return 500 error for internal server errors
    return new NextResponse(
      JSON.stringify({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
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

// Configure middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 
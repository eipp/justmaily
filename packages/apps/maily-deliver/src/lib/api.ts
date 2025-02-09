import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger, trackRequest, trackError , MetricsService } from './monitoring'
import { config } from '../api/config'
import { APIKeyManager } from '@justmaily/auth-core'
import { SecurityService } from './security'

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

// Initialize rate limiter with sliding window
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    config.rateLimit.maxRequests,
    `${config.rateLimit.window}ms`
  ),
  analytics: true, // Enable analytics for monitoring
  prefix: 'ratelimit:global', // Prefix for Redis keys
})

// Initialize services
const metrics = new MetricsService()
const security = new SecurityService(config.security, null, metrics, null)
const apiKeyManager = new APIKeyManager(config.apiKeys, metrics, security)

interface APIHandlerOptions<T> {
  schema?: z.ZodSchema<T>
  requireAuth?: boolean
  rateLimit?: boolean
  cors?: {
    origin?: string[]
    methods?: string[]
    headers?: string[]
  }
  permissions?: string[]
  maxBodySize?: number // Maximum request body size in bytes
  cacheControl?: string // Cache-Control header value
  securityHeaders?: boolean // Whether to add security headers
}

const defaultSecurityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

export async function createAPIHandler<T = unknown>(
  handler: (req: NextRequest, data?: T) => Promise<Response>,
  options: APIHandlerOptions<T> = {}
) {
  return async function (req: NextRequest): Promise<Response> {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    
    try {
      // Add request ID to response headers
      const responseHeaders = new Headers({
        'X-Request-ID': requestId,
      })

      // Add security headers if enabled
      if (options.securityHeaders !== false) {
        Object.entries(defaultSecurityHeaders).forEach(([key, value]) => {
          responseHeaders.set(key, value)
        })
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return handleCORS(new Response(null, { 
          status: 204,
          headers: responseHeaders
        }), options.cors)
      }

      // Validate request size
      if (options.maxBodySize) {
        const contentLength = parseInt(req.headers.get('content-length') || '0')
        if (contentLength > options.maxBodySize) {
          return createErrorResponse({
            code: 'REQUEST_TOO_LARGE',
            message: 'Request body too large',
            status: 413,
            headers: responseHeaders
          })
        }
      }
      
      // Parse request data if schema provided
      let data: T | undefined
      if (options.schema && req.method !== 'GET') {
        try {
          const body = await req.json()
          data = await options.schema.parseAsync(body)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return createErrorResponse({
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors,
              status: 400,
              headers: responseHeaders
            })
          }
          throw error
        }
      }

      // Check IP whitelist if configured
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip
      if (config.security.ipWhitelist?.length > 0) {
        const isWhitelisted = config.security.ipWhitelist.includes(clientIP)
        if (!isWhitelisted) {
          await security.logAuditEvent({
            action: 'ip_blocked',
            userId: 'system',
            resource: 'api',
            details: { ip: clientIP, path: req.url }
          })
          return createErrorResponse({
            code: 'IP_NOT_ALLOWED',
            message: 'IP address not allowed',
            status: 403,
            headers: responseHeaders
          })
        }
      }
      
      // Check authentication if required
      let keyData: any
      if (options.requireAuth) {
        const apiKey = req.headers.get(config.api.keyHeader)
        if (!apiKey) {
          await security.logAuditEvent({
            action: 'auth_failed',
            userId: 'system',
            resource: 'api',
            details: { reason: 'missing_key', path: req.url }
          })
          return createErrorResponse({
            code: 'UNAUTHORIZED',
            message: 'API key is required',
            status: 401,
            headers: {
              ...responseHeaders,
              'WWW-Authenticate': `Bearer realm="API"`,
            }
          })
        }

        // Validate API key
        const validationResult = await apiKeyManager.validateAPIKey(apiKey)
        if (!validationResult.valid) {
          await security.logAuditEvent({
            action: 'auth_failed',
            userId: 'system',
            resource: 'api',
            details: { reason: 'invalid_key', path: req.url }
          })
          return createErrorResponse({
            code: 'UNAUTHORIZED',
            message: 'Invalid API key',
            status: 401,
            headers: responseHeaders
          })
        }

        keyData = validationResult.keyData
        responseHeaders.set('X-Rate-Limit-Remaining', 
          (config.apiKeys.rateLimit.maxRequests - keyData.requestCount).toString()
        )

        // Check permissions if specified
        if (options.permissions && options.permissions.length > 0) {
          const hasPermission = options.permissions.every(permission =>
            keyData.permissions.includes(permission)
          )
          if (!hasPermission) {
            await security.logAuditEvent({
              action: 'auth_failed',
              userId: keyData.ownerId,
              resource: 'api',
              details: { 
                reason: 'insufficient_permissions',
                path: req.url,
                required: options.permissions,
                provided: keyData.permissions
              }
            })
            return createErrorResponse({
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
              status: 403,
              headers: responseHeaders
            })
          }
        }
      }
      
      // Check rate limit if enabled
      if (options.rateLimit && config.features.rateLimiting) {
        const identifier = options.requireAuth
          ? keyData.id
          : clientIP
        
        const { success, limit, reset, remaining } = await ratelimit.limit(
          identifier
        )
        
        if (!success) {
          await security.logAuditEvent({
            action: 'rate_limit_exceeded',
            userId: keyData?.ownerId || 'system',
            resource: 'api',
            details: { identifier, path: req.url }
          })
          return createErrorResponse({
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
            status: 429,
            headers: {
              ...responseHeaders,
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
            },
          })
        }

        // Add rate limit headers
        responseHeaders.set('X-RateLimit-Limit', limit.toString())
        responseHeaders.set('X-RateLimit-Remaining', remaining.toString())
        responseHeaders.set('X-RateLimit-Reset', reset.toString())
      }
      
      // Execute handler
      const response = await handler(req, data)
      
      // Add common headers
      const finalHeaders = new Headers(response.headers)
      responseHeaders.forEach((value, key) => {
        finalHeaders.set(key, value)
      })

      // Add cache control if specified
      if (options.cacheControl) {
        finalHeaders.set('Cache-Control', options.cacheControl)
      }
      
      // Add CORS headers if configured
      const finalResponse = options.cors
        ? handleCORS(new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: finalHeaders
          }), options.cors)
        : new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: finalHeaders
          })
      
      // Track metrics
      const duration = (Date.now() - startTime) / 1000
      trackRequest(
        new URL(req.url).pathname,
        req.method,
        finalResponse.status,
        duration
      )

      // Log successful request
      await security.logAuditEvent({
        action: 'api_request',
        userId: keyData?.ownerId || 'system',
        resource: 'api',
        details: {
          path: req.url,
          method: req.method,
          status: finalResponse.status,
          duration,
          requestId
        }
      })
      
      return finalResponse
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000
      
      // Log error
      trackError(error as Error, {
        path: new URL(req.url).pathname,
        method: req.method,
        duration,
        requestId
      })

      await security.logAuditEvent({
        action: 'api_error',
        userId: 'system',
        resource: 'api',
        details: {
          path: req.url,
          method: req.method,
          error: error.message,
          duration,
          requestId
        }
      })
      
      return createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        status: 500,
        headers: new Headers({
          'X-Request-ID': requestId,
          ...defaultSecurityHeaders
        })
      })
    }
  }
}

function handleCORS(response: Response, cors?: APIHandlerOptions['cors']): Response {
  if (!cors) return response
  
  const headers = new Headers(response.headers)
  
  if (cors.origin) {
    headers.set('Access-Control-Allow-Origin', cors.origin.join(', '))
    headers.set('Vary', 'Origin')
  }
  
  if (cors.methods) {
    headers.set('Access-Control-Allow-Methods', cors.methods.join(', '))
  }
  
  if (cors.headers) {
    headers.set('Access-Control-Allow-Headers', cors.headers.join(', '))
  }
  
  headers.set('Access-Control-Max-Age', '86400')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

interface ErrorResponseOptions {
  code: string
  message: string
  details?: unknown
  status?: number
  headers?: Headers
}

function createErrorResponse(options: ErrorResponseOptions): Response {
  const { code, message, details, status = 500, headers = new Headers() } = options
  
  headers.set('Content-Type', 'application/json')
  
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details,
      },
    }),
    {
      status,
      headers,
    }
  )
}

export function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

export function stream(readable: ReadableStream, init?: ResponseInit): Response {
  return new Response(readable, {
    ...init,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...init?.headers,
    },
  })
} 
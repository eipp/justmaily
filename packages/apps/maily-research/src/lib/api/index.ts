import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { trackRequest } from '../monitoring'
import { checkRateLimit } from '../cache'
import { createErrorResponse } from '../errors'
import { config } from '@/api/config'
import type { Database } from '@/types/supabase'

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// API handler options
interface APIHandlerOptions {
  schema?: z.ZodType<any>
  requireAuth?: boolean
  cors?: {
    origin?: string | string[]
    methods?: string[]
    credentials?: boolean
  }
}

// Create API handler
export const createAPIHandler = (
  handler: (
    req: NextRequest,
    context: { data: any }
  ) => Promise<Response>,
  options: APIHandlerOptions = {}
) => {
  return async (req: NextRequest): Promise<Response> => {
    const start = Date.now()

    try {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return handleCORS(req, options.cors)
      }

      // Parse request data
      const data = await parseRequestData(req, options.schema)

      // Check authentication
      if (options.requireAuth) {
        const token = req.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
          throw new Error('Authentication required')
        }

        const { data: session, error } = await supabase.auth.getSession()
        if (error || !session) {
          throw new Error('Invalid token')
        }
      }

      // Check rate limit
      const rateLimit = await checkRateLimit(
        req.ip || 'unknown',
        config.api.rateLimit.requests,
        config.api.rateLimit.window
      )

      if (!rateLimit.success) {
        return new Response(
          JSON.stringify({
            error: {
              message: 'Rate limit exceeded',
              code: 'RATE_LIMIT_ERROR',
              details: {
                reset: rateLimit.reset,
              },
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': config.api.rateLimit.requests.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': rateLimit.reset.toString(),
              ...(options.cors && getCORSHeaders(req, options.cors)),
            },
          }
        )
      }

      // Execute handler
      const response = await handler(req, { data })

      // Track metrics
      const duration = Date.now() - start
      const size = parseInt(response.headers.get('content-length') || '0')
      trackRequest(req.method, req.url, response.status, duration, size)

      // Add CORS headers
      if (options.cors) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            ...getCORSHeaders(req, options.cors),
          },
        })
      }

      return response
    } catch (error) {
      // Create error response
      const errorResponse = createErrorResponse(error)

      // Add CORS headers
      if (options.cors) {
        return new Response(errorResponse.body, {
          status: errorResponse.status,
          headers: {
            ...Object.fromEntries(errorResponse.headers),
            ...getCORSHeaders(req, options.cors),
          },
        })
      }

      return errorResponse
    }
  }
}

// Parse request data
async function parseRequestData(
  req: NextRequest,
  schema?: z.ZodType<any>
): Promise<any> {
  let data: any = {}

  // Parse query parameters
  const url = new URL(req.url)
  url.searchParams.forEach((value, key) => {
    data[key] = value
  })

  // Parse request body
  if (req.body) {
    const contentType = req.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await req.json()
      data = { ...data, ...body }
    }
  }

  // Validate data
  if (schema) {
    data = schema.parse(data)
  }

  return data
}

// Handle CORS
function handleCORS(
  req: NextRequest,
  cors?: APIHandlerOptions['cors']
): Response {
  if (!cors) {
    return new Response(null, { status: 204 })
  }

  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(req, cors),
  })
}

// Get CORS headers
function getCORSHeaders(
  req: NextRequest,
  cors: APIHandlerOptions['cors']
): Record<string, string> {
  const headers: Record<string, string> = {}

  if (cors.origin) {
    const origin = req.headers.get('origin')
    if (origin) {
      if (cors.origin === '*') {
        headers['Access-Control-Allow-Origin'] = '*'
      } else if (Array.isArray(cors.origin)) {
        if (cors.origin.includes(origin)) {
          headers['Access-Control-Allow-Origin'] = origin
        }
      } else if (cors.origin === origin) {
        headers['Access-Control-Allow-Origin'] = origin
      }
    }
  }

  if (cors.methods) {
    headers['Access-Control-Allow-Methods'] = cors.methods.join(', ')
  }

  if (cors.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  headers['Access-Control-Allow-Headers'] =
    'Content-Type, Authorization, X-Requested-With'
  headers['Access-Control-Max-Age'] = '86400'

  return headers
}

// Create JSON response
export function json(
  data: any,
  init?: ResponseInit
): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

// Create stream response
export function stream(
  stream: ReadableStream,
  init?: ResponseInit
): Response {
  return new Response(stream, {
    ...init,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...init?.headers,
    },
  })
} 
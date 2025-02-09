import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { withErrorHandling } from './errors'
import { validateRequest } from './validation'
import { trackRequest } from './monitoring'
import { config } from '@/api/config'

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// API route handler options
interface APIHandlerOptions<T> {
  schema?: z.ZodSchema<T>
  requireAuth?: boolean
  cors?: {
    origin?: string | string[]
    methods?: string[]
    credentials?: boolean
  }
}

// API route handler
export function createAPIHandler<T = any>(
  handler: (
    req: NextRequest,
    params: { data: T; userId?: string }
  ) => Promise<Response>,
  options: APIHandlerOptions<T> = {}
) {
  return async function (req: NextRequest): Promise<Response> {
    const startTime = performance.now()

    try {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return handleCORS(req, options.cors)
      }

      // Parse request data
      let data: T | undefined
      if (options.schema) {
        const body = await req.json().catch(() => ({}))
        data = validateRequest(options.schema, body)
      }

      // Check authentication
      let userId: string | undefined
      if (options.requireAuth) {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          throw new Error('Missing or invalid authorization header')
        }

        const token = authHeader.slice(7)
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
          throw new Error('Invalid authentication token')
        }

        userId = user.id
      }

      // Handle request
      const response = await withErrorHandling(
        () => handler(req, { data: data as T, userId }),
        {
          timeout: config.timeouts.default,
          retries: config.batch.retryAttempts,
          retryDelay: config.batch.retryDelay,
        }
      )

      // Add CORS headers if needed
      if (options.cors) {
        return addCORSHeaders(response, options.cors)
      }

      return response
    } catch (error) {
      // Handle errors
      const errorResponse = handleError(error)

      // Add CORS headers if needed
      if (options.cors) {
        return addCORSHeaders(errorResponse, options.cors)
      }

      return errorResponse
    } finally {
      // Track request metrics
      const duration = performance.now() - startTime
      const response = new NextResponse()
      
      trackRequest(
        req.nextUrl.pathname,
        req.method,
        response.status,
        duration,
        parseInt(response.headers.get('content-length') ?? '0')
      )
    }
  }
}

// Handle CORS preflight requests
function handleCORS(
  req: NextRequest,
  cors?: APIHandlerOptions<any>['cors']
): Response {
  if (!cors) {
    return new Response(null, { status: 204 })
  }

  const response = new Response(null, { status: 204 })
  return addCORSHeaders(response, cors)
}

// Add CORS headers to response
function addCORSHeaders(
  response: Response,
  cors: APIHandlerOptions<any>['cors']
): Response {
  const headers = new Headers(response.headers)

  if (cors?.origin) {
    headers.set(
      'Access-Control-Allow-Origin',
      Array.isArray(cors.origin) ? cors.origin[0] : cors.origin
    )
  }

  if (cors?.methods) {
    headers.set(
      'Access-Control-Allow-Methods',
      Array.isArray(cors.methods) ? cors.methods.join(', ') : cors.methods
    )
  }

  if (cors?.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true')
  }

  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// Handle errors
function handleError(error: unknown): Response {
  console.error('API error:', error)

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        errors: error.errors,
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  )
}

// Helper to create JSON response
export function json<T>(data: T, init?: ResponseInit): Response {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  })
}

// Helper to create stream response
export function stream(
  stream: ReadableStream,
  init?: ResponseInit
): Response {
  return new Response(stream, {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
} 
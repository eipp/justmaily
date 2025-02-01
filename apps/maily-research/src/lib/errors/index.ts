import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { config } from '@/api/config'

// Base error class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    }
  }
}

// Specific error classes
export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

export class TimeoutError extends APIError {
  constructor(message: string = 'Request timeout') {
    super(message, 504, 'TIMEOUT_ERROR')
  }
}

// Error handling function
export const handleError = (error: unknown): APIError => {
  // Handle known errors
  if (error instanceof APIError) {
    return error
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return new ValidationError(
      'Validation error',
      {
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      }
    )
  }

  // Log unknown errors
  console.error('Unhandled error:', error)

  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error)
  }

  // Return generic error
  return new APIError(
    'An unexpected error occurred',
    500,
    'INTERNAL_SERVER_ERROR'
  )
}

// Error handling wrapper for async functions
export const withErrorHandling = async <T>(
  promise: Promise<T>,
  options: {
    timeout?: number
    retries?: number
    retryDelay?: number
  } = {}
): Promise<T> => {
  const {
    timeout = config.api.timeout,
    retries = config.api.retries,
    retryDelay = config.api.retryDelay,
  } = options

  let lastError: Error | undefined

  // Add timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError())
    }, timeout)
  })

  // Retry logic
  for (let i = 0; i <= retries; i++) {
    try {
      return await Promise.race([promise, timeoutPromise])
    } catch (error) {
      lastError = error as Error

      // Don't retry on certain errors
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }

      // Last attempt failed
      if (i === retries) {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, i)))
    }
  }

  // This should never happen due to the throw in the loop
  throw lastError || new Error('Unknown error')
}

// Create error response
export const createErrorResponse = (error: unknown) => {
  const apiError = handleError(error)
  return new Response(JSON.stringify(apiError.toJSON()), {
    status: apiError.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
} 
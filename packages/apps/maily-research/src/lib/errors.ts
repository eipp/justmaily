import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'
import { config } from '@/api/config'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: ZodError) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'PERMISSION_DENIED')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class TimeoutError extends APIError {
  constructor(message: string = 'Request timeout') {
    super(message, 504, 'TIMEOUT')
    this.name = 'TimeoutError'
  }
}

export function handleError(error: unknown) {
  // Handle known errors
  if (error instanceof APIError) {
    return {
      error: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      errors: error.errors,
      statusCode: 400,
    }
  }

  // Log unknown errors
  console.error('Unhandled error:', error)

  // Report to Sentry in production
  if (config.isProduction) {
    Sentry.captureException(error)
  }

  // Return generic error response
  return {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    timeout?: number
    retries?: number
    retryDelay?: number
  } = {}
): Promise<T> {
  const {
    timeout = config.timeouts.default,
    retries = 0,
    retryDelay = 1000,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError())
        }, timeout)
      })

      // Race between function and timeout
      return await Promise.race([fn(), timeoutPromise]) as T
    } catch (error) {
      lastError = error

      // Don't retry if it's a known error that shouldn't be retried
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }

      // Last attempt, throw error
      if (attempt === retries) {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }

  // This should never happen due to the throw in the loop
  throw lastError
}

export function createErrorResponse(error: unknown) {
  const { statusCode, ...errorData } = handleError(error)

  return new Response(JSON.stringify(errorData), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
} 
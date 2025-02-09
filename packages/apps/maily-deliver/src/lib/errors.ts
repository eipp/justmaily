export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, details)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details)
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, details)
  }
}

export class EmailDeliveryError extends AppError {
  constructor(
    message: string,
    public provider: string,
    public messageId?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'EMAIL_DELIVERY_ERROR', 502, {
      provider,
      messageId,
      ...details,
    })
  }
}

export class EmailTemplateError extends AppError {
  constructor(
    message: string,
    public templateId: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'EMAIL_TEMPLATE_ERROR', 400, {
      templateId,
      ...details,
    })
  }
}

export class EmailBounceError extends AppError {
  constructor(
    message: string,
    public recipient: string,
    public bounceType: 'hard' | 'soft',
    details?: Record<string, unknown>
  ) {
    super(message, 'EMAIL_BOUNCE_ERROR', 422, {
      recipient,
      bounceType,
      ...details,
    })
  }
}

export class EmailRateLimitError extends AppError {
  constructor(
    message: string,
    public provider: string,
    public retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'EMAIL_RATE_LIMIT_ERROR', 429, {
      provider,
      retryAfter,
      ...details,
    })
  }
}

export class EmailValidationError extends AppError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>,
    details?: Record<string, unknown>
  ) {
    super(message, 'EMAIL_VALIDATION_ERROR', 400, {
      validationErrors,
      ...details,
    })
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function toErrorResponse(error: unknown) {
  if (isAppError(error)) {
    const response = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      requestId: process.env.AWS_LAMBDA_REQUEST_ID || undefined,
    }

    // Add provider-specific error details for email errors
    if (error instanceof EmailDeliveryError) {
      return {
        ...response,
        provider: error.provider,
        messageId: error.messageId,
      }
    }

    return response
  }

  // Handle unknown errors
  const unknownError = error instanceof Error ? error : new Error(String(error))
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: {
      originalError: unknownError.message,
    },
    statusCode: 500,
    timestamp: new Date().toISOString(),
    requestId: process.env.AWS_LAMBDA_REQUEST_ID || undefined,
  }
}
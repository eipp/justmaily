import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { Resource } from '@opentelemetry/resources'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import * as Sentry from '@sentry/node'
import pino from 'pino'
import { v4 as uuidv4 } from 'uuid'

import { config } from '../api/config'
import { AppError } from './errors'

// Initialize correlation ID context
const asyncLocalStorage = new (require('async_hooks').AsyncLocalStorage)()

// Enhanced Sentry configuration
if (config.monitoring.sentryDsn) {
  Sentry.init({
    dsn: config.monitoring.sentryDsn,
    environment: config.env,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
    ],
    beforeSend(event) {
      // Add correlation ID if available
      const context = asyncLocalStorage.getStore()
      if (context?.correlationId) {
        event.tags = {
          ...event.tags,
          correlationId: context.correlationId,
        }
      }
      return event
    },
  })
}

// Enhanced logger configuration
export const logger = pino({
  level: config.monitoring.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
  mixin() {
    const context = asyncLocalStorage.getStore()
    return {
      correlationId: context?.correlationId,
      requestId: process.env.AWS_LAMBDA_REQUEST_ID,
    }
  },
})

// Initialize Prometheus exporter with additional metrics
const exporter = new PrometheusExporter({
  port: config.monitoring.prometheusPort,
  endpoint: '/metrics',
})

// Create meter provider with enhanced resource attributes
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'maily-deliver',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    environment: config.env,
  }),
})

// Add exporter to meter provider
meterProvider.addMetricReader(exporter)

// Create meters for different metric types
const errorMeter = meterProvider.getMeter('errors')
const emailMeter = meterProvider.getMeter('email')

// Create counters and histograms
const errorCounter = errorMeter.createCounter('error_total', {
  description: 'Total number of errors',
})

const errorHistogram = errorMeter.createHistogram('error_frequency', {
  description: 'Frequency of errors over time',
})

const providerErrorCounter = errorMeter.createCounter('provider_error_total', {
  description: 'Total number of provider-specific errors',
})

// Correlation ID middleware
export function correlationMiddleware(req: any, res: any, next: Function) {
  const correlationId = req.headers['x-correlation-id'] || uuidv4()
  asyncLocalStorage.run({ correlationId }, () => {
    next()
  })
}

// Enhanced error tracking
export function trackError(error: Error, context: Record<string, any> = {}) {
  const errorContext = asyncLocalStorage.getStore()
  const timestamp = new Date()

  // Increment error counters
  errorCounter.add(1, {
    type: error.constructor.name,
    ...context,
  })

  // Record error in histogram
  errorHistogram.record(1, {
    type: error.constructor.name,
    ...context,
  })

  // Track provider-specific errors
  if (context.provider) {
    providerErrorCounter.add(1, {
      provider: context.provider,
      errorType: error.constructor.name,
    })
  }

  // Enhanced error logging
  logger.error({
    error: error.message,
    stack: error.stack,
    type: error.constructor.name,
    correlationId: errorContext?.correlationId,
    timestamp: timestamp.toISOString(),
    ...context,
  })

  // Enhanced Sentry reporting
  if (error instanceof AppError) {
    Sentry.captureException(error, {
      tags: {
        errorType: error.constructor.name,
        correlationId: errorContext?.correlationId,
        ...context,
      },
      extra: {
        code: error.code,
        details: error.details,
        timestamp: timestamp.toISOString(),
      },
    })
  } else {
    Sentry.captureException(error, {
      tags: {
        errorType: error.constructor.name,
        correlationId: errorContext?.correlationId,
        ...context,
      },
    })
  }
}

// Track email delivery metrics
export function trackEmailDelivery(
  provider: string,
  status: 'success' | 'failure',
  duration: number,
  error?: Error
) {
  const context = asyncLocalStorage.getStore()
  
  emailMeter.createCounter('email_delivery_total').add(1, {
    provider,
    status,
  })

  emailMeter.createHistogram('email_delivery_duration').record(duration, {
    provider,
    status,
  })

  if (error) {
    trackError(error, {
      provider,
      operation: 'email_delivery',
      duration,
    })
  }

  logger.info({
    event: 'email_delivery',
    provider,
    status,
    duration,
    error: error?.message,
    correlationId: context?.correlationId,
  })
}

// Track batch operations
export function trackBatch(
  messageCount: number,
  successCount: number,
  duration: number,
  provider: string
) {
  const failureCount = messageCount - successCount
  
  emailMeter.createCounter('batch_total').add(1, {
    provider,
  })

  emailMeter.createCounter('batch_messages_total').add(messageCount, {
    provider,
    status: 'total',
  })

  emailMeter.createCounter('batch_messages_total').add(successCount, {
    provider,
    status: 'success',
  })

  emailMeter.createCounter('batch_messages_total').add(failureCount, {
    provider,
    status: 'failure',
  })

  emailMeter.createHistogram('batch_duration').record(duration, {
    provider,
  })

  logger.info({
    event: 'batch_delivery',
    provider,
    messageCount,
    successCount,
    failureCount,
    duration,
  })
}

// Graceful shutdown
export async function shutdownMonitoring() {
  await Promise.all([
    new Promise(resolve => Sentry.close(2000).then(resolve)),
    meterProvider.shutdown(),
  ])
}
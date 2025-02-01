import * as Sentry from '@sentry/nextjs'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import {
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { config } from '@/api/config'

// Initialize Prometheus exporter
const exporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
})

// Create meter provider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: config.app.name,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.app.version,
  }),
})

// Add metric reader
meterProvider.addMetricReader(exporter as MetricReader)

// Create meter
const meter = meterProvider.getMeter(config.app.name)

// Define metrics
const metrics = {
  // Request metrics
  totalRequests: meter.createCounter('total_requests', {
    description: 'Total number of API requests',
  }),
  totalErrors: meter.createCounter('total_errors', {
    description: 'Total number of API errors',
  }),
  requestDuration: meter.createHistogram('request_duration_ms', {
    description: 'API request duration in milliseconds',
    unit: 'ms',
  }),
  responseSize: meter.createHistogram('response_size_bytes', {
    description: 'API response size in bytes',
    unit: 'bytes',
  }),

  // Service metrics
  serviceStatus: meter.createUpDownCounter('service_status', {
    description: 'Service status (1 = up, 0 = down)',
  }),

  // Cache metrics
  cacheHits: meter.createCounter('cache_hits', {
    description: 'Total number of cache hits',
  }),
  cacheMisses: meter.createCounter('cache_misses', {
    description: 'Total number of cache misses',
  }),

  // Rate limit metrics
  rateLimitHits: meter.createCounter('rate_limit_hits', {
    description: 'Total number of rate limit hits',
  }),

  // External service metrics
  externalRequests: meter.createCounter('external_requests', {
    description: 'Total number of external service requests',
  }),
  externalErrors: meter.createCounter('external_errors', {
    description: 'Total number of external service errors',
  }),
  externalDuration: meter.createHistogram('external_duration_ms', {
    description: 'External service request duration in milliseconds',
    unit: 'ms',
  }),
}

// Track request
export const trackRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  size: number
) => {
  const labels = { method, path, status: statusCode.toString() }

  metrics.totalRequests.add(1, labels)
  if (statusCode >= 400) {
    metrics.totalErrors.add(1, labels)
  }
  metrics.requestDuration.record(duration, labels)
  metrics.responseSize.record(size, labels)
}

// Track error
export const trackError = (
  error: Error,
  context: Record<string, any> = {}
) => {
  // Log error
  console.error('Error:', error, 'Context:', context)

  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setExtras(context)
      Sentry.captureException(error)
    })
  }

  // Increment error counter
  metrics.totalErrors.add(1, {
    type: error.constructor.name,
    ...context,
  })
}

// Track external request
export const trackExternalRequest = (
  service: string,
  operation: string,
  success: boolean,
  duration: number
) => {
  const labels = { service, operation }

  metrics.externalRequests.add(1, labels)
  if (!success) {
    metrics.externalErrors.add(1, labels)
  }
  metrics.externalDuration.record(duration, labels)
}

// Track cache operation
export const trackCache = (hit: boolean) => {
  if (hit) {
    metrics.cacheHits.add(1)
  } else {
    metrics.cacheMisses.add(1)
  }
}

// Track rate limit
export const trackRateLimit = (key: string) => {
  metrics.rateLimitHits.add(1, { key })
}

// Performance monitoring
export const withPerformanceTracking = async <T>(
  name: string,
  fn: () => Promise<T>,
  context: Record<string, any> = {}
): Promise<T> => {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start

    // Record metrics
    metrics.requestDuration.record(duration, {
      name,
      success: 'true',
      ...context,
    })

    return result
  } catch (error) {
    const duration = Date.now() - start

    // Record metrics
    metrics.requestDuration.record(duration, {
      name,
      success: 'false',
      ...context,
    })

    // Track error
    trackError(error as Error, {
      operation: name,
      duration,
      ...context,
    })

    throw error
  }
}

// Performance monitoring decorator
export function tracked(
  name: string,
  context: Record<string, any> = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      return withPerformanceTracking(
        name,
        () => originalMethod.apply(this, args),
        context
      )
    }

    return descriptor
  }
}

// Service health check
export const checkHealth = async () => {
  try {
    // Add your health checks here
    // For example, check database connection, cache connection, etc.
    const healthy = true

    // Update service status
    metrics.serviceStatus.add(healthy ? 1 : -1)

    return {
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      checks: {
        // Add individual check results here
      },
    }
  } catch (error) {
    // Update service status
    metrics.serviceStatus.add(-1)

    // Track error
    trackError(error as Error, { operation: 'health_check' })

    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      error: (error as Error).message,
    }
  }
} 
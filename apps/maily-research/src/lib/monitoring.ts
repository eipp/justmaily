import * as Sentry from '@sentry/nextjs'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
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
    [SemanticResourceAttributes.SERVICE_NAME]: '@justmaily/research',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
  }),
})

// Add Prometheus exporter to meter provider
meterProvider.addMetricReader(exporter)

// Create meters
const meter = meterProvider.getMeter('@justmaily/research')

// Create counters
const requestCounter = meter.createCounter('api_requests_total', {
  description: 'Total number of API requests',
})

const errorCounter = meter.createCounter('api_errors_total', {
  description: 'Total number of API errors',
})

// Create histograms
const requestDuration = meter.createHistogram('api_request_duration_seconds', {
  description: 'API request duration in seconds',
})

const responseSizeBytes = meter.createHistogram('api_response_size_bytes', {
  description: 'API response size in bytes',
})

// Create up/down gauges
const serviceStatus = meter.createUpDownCounter('service_status', {
  description: 'Service status (1 = up, 0 = down)',
})

// Track request
export function trackRequest(
  route: string,
  method: string,
  statusCode: number,
  duration: number,
  size: number
) {
  try {
    // Track request count
    requestCounter.add(1, {
      route,
      method,
      status: statusCode.toString(),
    })

    // Track request duration
    requestDuration.record(duration / 1000, {
      route,
      method,
      status: statusCode.toString(),
    })

    // Track response size
    responseSizeBytes.record(size, {
      route,
      method,
      status: statusCode.toString(),
    })

    // Track errors
    if (statusCode >= 400) {
      errorCounter.add(1, {
        route,
        method,
        status: statusCode.toString(),
      })
    }
  } catch (error) {
    console.error('Monitoring error:', error)
  }
}

// Track error
export function trackError(
  error: Error,
  context?: Record<string, any>
) {
  try {
    // Increment error counter
    errorCounter.add(1, {
      name: error.name,
      ...context,
    })

    // Report to Sentry in production
    if (config.isProduction) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context)
        }
        Sentry.captureException(error)
      })
    }
  } catch (err) {
    console.error('Error tracking error:', err)
  }
}

// Performance monitoring
export async function withPerformanceTracking<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    // Record duration
    requestDuration.record(duration / 1000, {
      name,
      success: 'true',
      ...context,
    })

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    // Record duration for failed operations
    requestDuration.record(duration / 1000, {
      name,
      success: 'false',
      ...context,
    })

    // Track error
    trackError(error as Error, {
      name,
      duration: duration / 1000,
      ...context,
    })

    throw error
  }
}

// Service health check
export function updateServiceStatus(isHealthy: boolean) {
  try {
    serviceStatus.add(isHealthy ? 1 : -1)
  } catch (error) {
    console.error('Error updating service status:', error)
  }
}

// Performance monitoring decorator
export function monitored(
  name: string,
  context?: Record<string, any>
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

// Initialize monitoring
export function initializeMonitoring() {
  try {
    // Initialize Sentry
    if (config.isProduction) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: config.env,
        tracesSampleRate: config.monitoring.sampleRate,
        ignoreErrors: config.monitoring.errorReporting.ignoreErrors,
      })
    }

    // Set initial service status
    updateServiceStatus(true)

    // Handle graceful shutdown
    const cleanup = () => {
      updateServiceStatus(false)
      process.exit(0)
    }

    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
  } catch (error) {
    console.error('Error initializing monitoring:', error)
  }
} 
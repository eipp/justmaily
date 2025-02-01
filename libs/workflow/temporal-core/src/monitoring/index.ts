import { NodeSDK } from '@opentelemetry/sdk-node'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { MetricsService } from './metrics'
import { config } from '../config'
import pino from 'pino'

// Initialize logger
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
})

let sdk: NodeSDK | undefined

export async function initializeMonitoring(
  serviceName: string,
  version: string,
  environment: string
): Promise<MetricsService> {
  // Create Prometheus exporter
  const exporter = new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics'
  })

  // Create meter provider
  const meterProvider = new MeterProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: version,
      environment
    })
  })

  // Add Prometheus exporter
  meterProvider.addMetricReader(exporter)

  // Create metrics service
  const metricsService = new MetricsService(meterProvider, {
    version,
    environment
  })

  // Create SDK
  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: version,
      environment
    })
  })

  // Start SDK
  await sdk.start()

  return metricsService
}

export async function shutdownMonitoring(): Promise<void> {
  if (sdk) {
    await sdk.shutdown()
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  await shutdownMonitoring()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await shutdownMonitoring()
  process.exit(0)
})

// Create meters for different components
const workflowMeter = sdk?.getMeter('workflow')
const activityMeter = sdk?.getMeter('activity')
const workerMeter = sdk?.getMeter('worker')

// Workflow metrics
export const workflowMetrics = {
  started: workflowMeter?.createCounter('workflow.started', {
    description: 'Number of workflows started',
  }),
  completed: workflowMeter?.createCounter('workflow.completed', {
    description: 'Number of workflows completed',
  }),
  failed: workflowMeter?.createCounter('workflow.failed', {
    description: 'Number of workflows failed',
  }),
  duration: workflowMeter?.createHistogram('workflow.duration', {
    description: 'Workflow execution duration',
    unit: 'ms',
  }),
}

// Activity metrics
export const activityMetrics = {
  started: activityMeter?.createCounter('activity.started', {
    description: 'Number of activities started',
  }),
  completed: activityMeter?.createCounter('activity.completed', {
    description: 'Number of activities completed',
  }),
  failed: activityMeter?.createCounter('activity.failed', {
    description: 'Number of activities failed',
  }),
  duration: activityMeter?.createHistogram('activity.duration', {
    description: 'Activity execution duration',
    unit: 'ms',
  }),
  retries: activityMeter?.createCounter('activity.retries', {
    description: 'Number of activity retries',
  }),
}

// Worker metrics
export const workerMetrics = {
  activeWorkflows: workerMeter?.createUpDownCounter('worker.active_workflows', {
    description: 'Number of active workflows',
  }),
  activeActivities: workerMeter?.createUpDownCounter('worker.active_activities', {
    description: 'Number of active activities',
  }),
  taskQueueLatency: workerMeter?.createHistogram('worker.task_queue_latency', {
    description: 'Task queue latency',
    unit: 'ms',
  }),
  memoryUsage: workerMeter?.createObservableGauge('worker.memory_usage', {
    description: 'Worker memory usage',
    unit: 'bytes',
  }),
  cpuUsage: workerMeter?.createObservableGauge('worker.cpu_usage', {
    description: 'Worker CPU usage',
    unit: 'percent',
  }),
} 
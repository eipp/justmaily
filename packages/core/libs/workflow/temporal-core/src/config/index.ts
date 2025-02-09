import { z } from 'zod'
import { Duration } from '@temporalio/common'

// Helper function to convert string to Duration
function toDuration(value: string): Duration {
  const [amount, unit] = value.split(' ')
  const numericAmount = parseInt(amount, 10)
  
  switch (unit) {
    case 'seconds':
      return numericAmount * 1000
    case 'minutes':
      return numericAmount * 60 * 1000
    case 'hours':
      return numericAmount * 60 * 60 * 1000
    case 'days':
      return numericAmount * 24 * 60 * 60 * 1000
    default:
      throw new Error(`Unsupported duration unit: ${unit}`)
  }
}

const envSchema = z.object({
  // Temporal Configuration
  TEMPORAL_SERVER_URL: z.string().url(),
  TEMPORAL_NAMESPACE: z.string(),
  TEMPORAL_TASK_QUEUE: z.string(),
  TEMPORAL_WORKFLOW_TIMEOUT: z.string().default('24 hours'),
  TEMPORAL_ACTIVITY_TIMEOUT: z.string().default('5 minutes'),
  TEMPORAL_RETRY_ATTEMPTS: z.coerce.number().default(3),
  TEMPORAL_RETRY_INTERVAL: z.string().default('30 seconds'),

  // Worker Configuration
  WORKER_MAX_CONCURRENT_ACTIVITIES: z.coerce.number().default(100),
  WORKER_MAX_CONCURRENT_WORKFLOWS: z.coerce.number().default(50),
  WORKER_STICKY_QUEUE_TTL: z.string().default('24 hours'),
  WORKER_SHUTDOWN_GRACE_PERIOD: z.string().default('30 seconds'),

  // Monitoring
  PROMETHEUS_PORT: z.coerce.number().default(9464),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  TRACING_ENABLED: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Rate Limiting
  MAX_WORKFLOWS_PER_SECOND: z.coerce.number().default(100),
  MAX_ACTIVITIES_PER_SECOND: z.coerce.number().default(1000),

  // Batch Processing
  BATCH_SIZE: z.coerce.number().default(100),
  MAX_CONCURRENT_BATCHES: z.coerce.number().default(10),

  // Feature Flags
  ENABLE_WORKFLOW_VERSIONING: z.coerce.boolean().default(true),
  ENABLE_LOCAL_ACTIVITIES: z.coerce.boolean().default(true),
  ENABLE_STICKY_EXECUTION: z.coerce.boolean().default(true),
  ENABLE_ARCHIVAL: z.coerce.boolean().default(true),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment variables')
  }

  return result.data
}

const env = validateEnv()

export const config = {
  temporal: {
    serverUrl: env.TEMPORAL_SERVER_URL,
    namespace: env.TEMPORAL_NAMESPACE,
    taskQueue: env.TEMPORAL_TASK_QUEUE,
    workflowTimeout: toDuration(env.TEMPORAL_WORKFLOW_TIMEOUT),
    activityTimeout: toDuration(env.TEMPORAL_ACTIVITY_TIMEOUT),
    retryAttempts: env.TEMPORAL_RETRY_ATTEMPTS,
    retryInterval: toDuration(env.TEMPORAL_RETRY_INTERVAL),
  },
  worker: {
    maxConcurrentActivities: env.WORKER_MAX_CONCURRENT_ACTIVITIES,
    maxConcurrentWorkflows: env.WORKER_MAX_CONCURRENT_WORKFLOWS,
    stickyQueueTtl: toDuration(env.WORKER_STICKY_QUEUE_TTL),
    shutdownGracePeriod: toDuration(env.WORKER_SHUTDOWN_GRACE_PERIOD),
  },
  monitoring: {
    prometheusPort: env.PROMETHEUS_PORT,
    metricsEnabled: env.METRICS_ENABLED,
    tracingEnabled: env.TRACING_ENABLED,
    logLevel: env.LOG_LEVEL,
  },
  rateLimiting: {
    maxWorkflowsPerSecond: env.MAX_WORKFLOWS_PER_SECOND,
    maxActivitiesPerSecond: env.MAX_ACTIVITIES_PER_SECOND,
  },
  batch: {
    size: env.BATCH_SIZE,
    maxConcurrentBatches: env.MAX_CONCURRENT_BATCHES,
  },
  features: {
    enableWorkflowVersioning: env.ENABLE_WORKFLOW_VERSIONING,
    enableLocalActivities: env.ENABLE_LOCAL_ACTIVITIES,
    enableStickyExecution: env.ENABLE_STICKY_EXECUTION,
    enableArchival: env.ENABLE_ARCHIVAL,
  },
} as const

export type Config = typeof config 
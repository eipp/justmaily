'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.config = void 0;
const zod_1 = require('zod');
// Helper function to convert string to Duration
function toDuration(value) {
  const [amount, unit] = value.split(' ');
  const numericAmount = parseInt(amount, 10);
  switch (unit) {
    case 'seconds':
      return numericAmount * 1000;
    case 'minutes':
      return numericAmount * 60 * 1000;
    case 'hours':
      return numericAmount * 60 * 60 * 1000;
    case 'days':
      return numericAmount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
}
const envSchema = zod_1.z.object({
  // Temporal Configuration
  TEMPORAL_SERVER_URL: zod_1.z.string().url(),
  TEMPORAL_NAMESPACE: zod_1.z.string(),
  TEMPORAL_TASK_QUEUE: zod_1.z.string(),
  TEMPORAL_WORKFLOW_TIMEOUT: zod_1.z.string().default('24 hours'),
  TEMPORAL_ACTIVITY_TIMEOUT: zod_1.z.string().default('5 minutes'),
  TEMPORAL_RETRY_ATTEMPTS: zod_1.z.coerce.number().default(3),
  TEMPORAL_RETRY_INTERVAL: zod_1.z.string().default('30 seconds'),
  // Worker Configuration
  WORKER_MAX_CONCURRENT_ACTIVITIES: zod_1.z.coerce.number().default(100),
  WORKER_MAX_CONCURRENT_WORKFLOWS: zod_1.z.coerce.number().default(50),
  WORKER_STICKY_QUEUE_TTL: zod_1.z.string().default('24 hours'),
  WORKER_SHUTDOWN_GRACE_PERIOD: zod_1.z.string().default('30 seconds'),
  // Monitoring
  PROMETHEUS_PORT: zod_1.z.coerce.number().default(9464),
  METRICS_ENABLED: zod_1.z.coerce.boolean().default(true),
  TRACING_ENABLED: zod_1.z.coerce.boolean().default(true),
  LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Rate Limiting
  MAX_WORKFLOWS_PER_SECOND: zod_1.z.coerce.number().default(100),
  MAX_ACTIVITIES_PER_SECOND: zod_1.z.coerce.number().default(1000),
  // Batch Processing
  BATCH_SIZE: zod_1.z.coerce.number().default(100),
  MAX_CONCURRENT_BATCHES: zod_1.z.coerce.number().default(10),
  // Feature Flags
  ENABLE_WORKFLOW_VERSIONING: zod_1.z.coerce.boolean().default(true),
  ENABLE_LOCAL_ACTIVITIES: zod_1.z.coerce.boolean().default(true),
  ENABLE_STICKY_EXECUTION: zod_1.z.coerce.boolean().default(true),
  ENABLE_ARCHIVAL: zod_1.z.coerce.boolean().default(true),
});
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }
  return result.data;
}
const env = validateEnv();
exports.config = {
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
};

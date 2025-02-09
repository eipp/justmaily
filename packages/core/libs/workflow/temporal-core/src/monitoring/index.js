'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.workerMetrics =
  exports.activityMetrics =
  exports.workflowMetrics =
  exports.logger =
    void 0;
exports.initializeMonitoring = initializeMonitoring;
exports.shutdownMonitoring = shutdownMonitoring;
const sdk_node_1 = require('@opentelemetry/sdk-node');
const exporter_prometheus_1 = require('@opentelemetry/exporter-prometheus');
const sdk_metrics_1 = require('@opentelemetry/sdk-metrics');
const resources_1 = require('@opentelemetry/resources');
const semantic_conventions_1 = require('@opentelemetry/semantic-conventions');
const metrics_1 = require('./metrics');
const config_1 = require('../config');
const pino_1 = __importDefault(require('pino'));
// Initialize logger
exports.logger = (0, pino_1.default)({
  level: config_1.config.monitoring.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});
let sdk;
async function initializeMonitoring(serviceName, version, environment) {
  // Create Prometheus exporter
  const exporter = new exporter_prometheus_1.PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
  });
  // Create meter provider
  const meterProvider = new sdk_metrics_1.MeterProvider({
    resource: new resources_1.Resource({
      [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]:
        serviceName,
      [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]:
        version,
      environment,
    }),
  });
  // Add Prometheus exporter
  meterProvider.addMetricReader(exporter);
  // Create metrics service
  const metricsService = new metrics_1.MetricsService(meterProvider, {
    version,
    environment,
  });
  // Create SDK
  sdk = new sdk_node_1.NodeSDK({
    resource: new resources_1.Resource({
      [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]:
        serviceName,
      [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]:
        version,
      environment,
    }),
  });
  // Start SDK
  await sdk.start();
  return metricsService;
}
async function shutdownMonitoring() {
  if (sdk) {
    await sdk.shutdown();
  }
}
// Handle process termination
process.on('SIGTERM', async () => {
  await shutdownMonitoring();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await shutdownMonitoring();
  process.exit(0);
});
// Create meters for different components
const workflowMeter =
  sdk === null || sdk === void 0 ? void 0 : sdk.getMeter('workflow');
const activityMeter =
  sdk === null || sdk === void 0 ? void 0 : sdk.getMeter('activity');
const workerMeter =
  sdk === null || sdk === void 0 ? void 0 : sdk.getMeter('worker');
// Workflow metrics
exports.workflowMetrics = {
  started:
    workflowMeter === null || workflowMeter === void 0
      ? void 0
      : workflowMeter.createCounter('workflow.started', {
          description: 'Number of workflows started',
        }),
  completed:
    workflowMeter === null || workflowMeter === void 0
      ? void 0
      : workflowMeter.createCounter('workflow.completed', {
          description: 'Number of workflows completed',
        }),
  failed:
    workflowMeter === null || workflowMeter === void 0
      ? void 0
      : workflowMeter.createCounter('workflow.failed', {
          description: 'Number of workflows failed',
        }),
  duration:
    workflowMeter === null || workflowMeter === void 0
      ? void 0
      : workflowMeter.createHistogram('workflow.duration', {
          description: 'Workflow execution duration',
          unit: 'ms',
        }),
};
// Activity metrics
exports.activityMetrics = {
  started:
    activityMeter === null || activityMeter === void 0
      ? void 0
      : activityMeter.createCounter('activity.started', {
          description: 'Number of activities started',
        }),
  completed:
    activityMeter === null || activityMeter === void 0
      ? void 0
      : activityMeter.createCounter('activity.completed', {
          description: 'Number of activities completed',
        }),
  failed:
    activityMeter === null || activityMeter === void 0
      ? void 0
      : activityMeter.createCounter('activity.failed', {
          description: 'Number of activities failed',
        }),
  duration:
    activityMeter === null || activityMeter === void 0
      ? void 0
      : activityMeter.createHistogram('activity.duration', {
          description: 'Activity execution duration',
          unit: 'ms',
        }),
  retries:
    activityMeter === null || activityMeter === void 0
      ? void 0
      : activityMeter.createCounter('activity.retries', {
          description: 'Number of activity retries',
        }),
};
// Worker metrics
exports.workerMetrics = {
  activeWorkflows:
    workerMeter === null || workerMeter === void 0
      ? void 0
      : workerMeter.createUpDownCounter('worker.active_workflows', {
          description: 'Number of active workflows',
        }),
  activeActivities:
    workerMeter === null || workerMeter === void 0
      ? void 0
      : workerMeter.createUpDownCounter('worker.active_activities', {
          description: 'Number of active activities',
        }),
  taskQueueLatency:
    workerMeter === null || workerMeter === void 0
      ? void 0
      : workerMeter.createHistogram('worker.task_queue_latency', {
          description: 'Task queue latency',
          unit: 'ms',
        }),
  memoryUsage:
    workerMeter === null || workerMeter === void 0
      ? void 0
      : workerMeter.createObservableGauge('worker.memory_usage', {
          description: 'Worker memory usage',
          unit: 'bytes',
        }),
  cpuUsage:
    workerMeter === null || workerMeter === void 0
      ? void 0
      : workerMeter.createObservableGauge('worker.cpu_usage', {
          description: 'Worker CPU usage',
          unit: 'percent',
        }),
};

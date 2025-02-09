'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = run;
const worker_1 = require('@temporalio/worker');
const activities_1 = require('../activities');
const metrics_1 = require('../monitoring/metrics');
async function run() {
  const connection = await worker_1.NativeConnection.connect({});
  const metrics = new metrics_1.MetricsService();
  const workerMetrics = {
    activeActivities: await metrics.createGauge('temporal_active_activities'),
    activeWorkflows: await metrics.createGauge('temporal_active_workflows'),
    memoryUsage: await metrics.createGauge('temporal_memory_usage'),
    cpuUsage: await metrics.createGauge('temporal_cpu_usage'),
  };
  const worker = await worker_1.Worker.create({
    connection,
    namespace: 'default',
    taskQueue: 'email-marketing',
    activities: activities_1.activities,
    workflowsPath: require.resolve('../workflows'),
    interceptors: {
      activity: [
        {
          inbound: new worker_1.ActivityInboundLogInterceptor(),
          async execute(input, next) {
            const startTime = Date.now();
            let error;
            try {
              await metrics.recordEvent('activity_started');
              await metrics.incrementCounter('active_activities');
              const result = await next(input);
              await metrics.recordEvent('activity_completed');
              return result;
            } catch (e) {
              error = e instanceof Error ? e : new Error(String(e));
              await metrics.recordError('activity_failed', error.message);
              throw error;
            } finally {
              const duration = Date.now() - startTime;
              await metrics.recordLatency('activity_duration', duration);
              await metrics.decrementCounter('active_activities');
            }
          },
        },
      ],
      workflow: [
        {
          inbound: new worker_1.WorkflowInboundLogInterceptor(),
          async execute(input, next) {
            const startTime = Date.now();
            let error;
            try {
              await metrics.recordEvent('workflow_started');
              await metrics.incrementCounter('active_workflows');
              const result = await next(input);
              await metrics.recordEvent('workflow_completed');
              return result;
            } catch (e) {
              error = e instanceof Error ? e : new Error(String(e));
              await metrics.recordError('workflow_failed', error.message);
              throw error;
            } finally {
              const duration = Date.now() - startTime;
              await metrics.recordLatency('workflow_duration', duration);
              await metrics.decrementCounter('active_workflows');
            }
          },
        },
      ],
    },
  });
  // Monitor worker metrics
  setInterval(async () => {
    const memUsage = process.memoryUsage();
    await metrics.recordMetric('memory_usage', memUsage.heapUsed);
    const cpuUsage = process.cpuUsage();
    const totalCPU = cpuUsage.user + cpuUsage.system;
    await metrics.recordMetric('cpu_usage', totalCPU / 1000000); // Convert to percentage
  }, 5000);
  await worker.run();
}
// Run worker
if (require.main === module) {
  void run().catch((error) => {
    console.error('Worker failed:', error);
    process.exit(1);
  });
}

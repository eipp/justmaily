'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MetricsService =
  exports.matrixMessageCounter =
  exports.matrixEventCounter =
  exports.matrixLatencyHistogram =
  exports.aiErrorCounter =
  exports.aiPredictionLatencyHistogram =
  exports.aiCacheCounter =
  exports.queueSizeGauge =
  exports.systemErrorCounter =
  exports.variantPerformanceGauge =
  exports.abTestCounter =
  exports.providerLatencyGauge =
  exports.providerHealthGauge =
  exports.bounceRateGauge =
  exports.clickRateGauge =
  exports.openRateGauge =
  exports.deliveryLatencyHistogram =
  exports.emailSentCounter =
    void 0;
const prom_client_1 = require('prom-client');
const prom_client_2 = require('prom-client');
// Email Delivery Metrics
exports.emailSentCounter = new prom_client_1.Counter({
  name: 'email_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['provider', 'campaign', 'status'],
});
exports.deliveryLatencyHistogram = new prom_client_1.Histogram({
  name: 'email_delivery_latency_seconds',
  help: 'Email delivery latency in seconds',
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});
// Campaign Performance Metrics
exports.openRateGauge = new prom_client_1.Gauge({
  name: 'campaign_open_rate',
  help: 'Email campaign open rate',
  labelNames: ['campaign'],
});
exports.clickRateGauge = new prom_client_1.Gauge({
  name: 'campaign_click_rate',
  help: 'Email campaign click rate',
  labelNames: ['campaign'],
});
exports.bounceRateGauge = new prom_client_1.Gauge({
  name: 'campaign_bounce_rate',
  help: 'Email campaign bounce rate',
  labelNames: ['campaign'],
});
// Provider Health Metrics
exports.providerHealthGauge = new prom_client_1.Gauge({
  name: 'provider_health_status',
  help: 'Email provider health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['provider'],
});
exports.providerLatencyGauge = new prom_client_1.Gauge({
  name: 'provider_latency_seconds',
  help: 'Email provider API latency',
  labelNames: ['provider', 'operation'],
});
// A/B Testing Metrics
exports.abTestCounter = new prom_client_1.Counter({
  name: 'ab_test_total',
  help: 'Total number of A/B tests run',
  labelNames: ['campaign'],
});
exports.variantPerformanceGauge = new prom_client_1.Gauge({
  name: 'variant_performance_score',
  help: 'A/B test variant performance score',
  labelNames: ['campaign', 'variant'],
});
// System Health Metrics
exports.systemErrorCounter = new prom_client_1.Counter({
  name: 'system_error_total',
  help: 'Total number of system errors',
  labelNames: ['type', 'severity'],
});
exports.queueSizeGauge = new prom_client_1.Gauge({
  name: 'email_queue_size',
  help: 'Number of emails in queue',
  labelNames: ['priority'],
});
// AI Metrics
exports.aiCacheCounter = new prom_client_1.Counter({
  name: 'ai_cache_total',
  help: 'Total number of AI cache operations',
  labelNames: ['operation', 'model'],
});
exports.aiPredictionLatencyHistogram = new prom_client_1.Histogram({
  name: 'ai_prediction_latency_seconds',
  help: 'AI prediction latency in seconds',
  labelNames: ['model'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});
exports.aiErrorCounter = new prom_client_1.Counter({
  name: 'ai_error_total',
  help: 'Total number of AI errors',
  labelNames: ['model', 'error_type'],
});
// Matrix Metrics
exports.matrixLatencyHistogram = new prom_client_1.Histogram({
  name: 'matrix_operation_latency_seconds',
  help: 'Matrix operation latency in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});
exports.matrixEventCounter = new prom_client_1.Counter({
  name: 'matrix_event_total',
  help: 'Total number of Matrix events',
  labelNames: ['type'],
});
exports.matrixMessageCounter = new prom_client_1.Counter({
  name: 'matrix_message_total',
  help: 'Total number of Matrix messages',
  labelNames: ['direction', 'encrypted'],
});
class MetricsService {
  constructor(meterProvider, config = {}) {
    this.meterProvider = meterProvider;
    this.config = config;
    this.counters = new Map();
    this.histograms = new Map();
    this.gauges = new Map();
    this.meter = meterProvider.getMeter('justmaily');
    this.defaultLabels = Object.assign(
      {
        version: config.version || 'unknown',
        environment: config.environment || 'development',
      },
      config.defaultLabels,
    );
  }
  async recordEmailSent(provider, campaign, status) {
    exports.emailSentCounter.labels(provider, campaign, status).inc();
  }
  async recordDeliveryLatency(provider, latencyMs) {
    exports.deliveryLatencyHistogram.labels(provider).observe(latencyMs / 1000);
  }
  async updateCampaignMetrics(campaign, metrics) {
    if (metrics.openRate !== undefined) {
      exports.openRateGauge.labels(campaign).set(metrics.openRate);
    }
    if (metrics.clickRate !== undefined) {
      exports.clickRateGauge.labels(campaign).set(metrics.clickRate);
    }
    if (metrics.bounceRate !== undefined) {
      exports.bounceRateGauge.labels(campaign).set(metrics.bounceRate);
    }
  }
  async recordProviderHealth(provider, isHealthy) {
    exports.providerHealthGauge.labels(provider).set(isHealthy ? 1 : 0);
  }
  async recordProviderLatency(provider, operation, latencyMs) {
    exports.providerLatencyGauge
      .labels(provider, operation)
      .set(latencyMs / 1000);
  }
  async recordABTest(campaign) {
    exports.abTestCounter.labels(campaign).inc();
  }
  async recordVariantPerformance(campaign, variant, score) {
    exports.variantPerformanceGauge.labels(campaign, variant).set(score);
  }
  async recordError(type, severity) {
    exports.systemErrorCounter.labels(type, severity).inc();
  }
  async updateQueueSize(priority, size) {
    exports.queueSizeGauge.labels(priority).set(size);
  }
  async recordAiCache(result, model) {
    const counter = await this.getCounter('ai_cache', {
      description: 'AI cache hits and misses',
      unit: 'events',
    });
    counter.add(1, { result, model });
  }
  async recordAiPrediction(model, duration) {
    const histogram = await this.getHistogram('ai_prediction_latency', {
      description: 'AI prediction latency',
      unit: 'ms',
    });
    histogram.record(duration, { model });
  }
  async recordAiError(model, errorType) {
    exports.aiErrorCounter.labels(model, errorType).inc();
  }
  async recordLatency(operation, duration) {
    const histogram = await this.getHistogram('matrix_latency', {
      description: 'Matrix operation latency',
      unit: 'ms',
    });
    histogram.record(duration, { operation });
  }
  async recordEvent(type) {
    const counter = await this.getCounter('matrix_events', {
      description: 'Matrix events counter',
      unit: 'events',
    });
    counter.add(1, { type });
  }
  async incrementCounter(name) {
    const counter = await this.getCounter(name, {
      description: `Counter for ${name}`,
      unit: 'events',
    });
    counter.add(1);
  }
  async decrementCounter(name) {
    const counter = await this.getCounter(name, {
      description: `Counter for ${name}`,
      unit: 'events',
    });
    counter.add(-1);
  }
  async createGauge(name) {
    return await this.getGauge(name, {
      description: `Gauge for ${name}`,
      unit: 'value',
    });
  }
  async recordMetric(name, value) {
    const gauge = await this.getGauge(name, {
      description: `Metric gauge for ${name}`,
      unit: 'value',
    });
    gauge.set(value);
  }
  async getMetrics() {
    return await prom_client_2.register.metrics();
  }
  async getCounter(name, options) {
    const key = `counter_${name}`;
    if (!this.counters.has(key)) {
      this.counters.set(
        key,
        this.meter.createCounter(name, {
          description: options.description,
          unit: options.unit,
        }),
      );
    }
    return this.counters.get(key);
  }
  async getHistogram(name, options) {
    const key = `histogram_${name}`;
    if (!this.histograms.has(key)) {
      this.histograms.set(
        key,
        this.meter.createHistogram(name, {
          description: options.description,
          unit: options.unit,
        }),
      );
    }
    return this.histograms.get(key);
  }
  async getGauge(name, options) {
    const key = `gauge_${name}`;
    if (!this.gauges.has(key)) {
      this.gauges.set(
        key,
        this.meter.createObservableGauge(name, {
          description: options.description,
          unit: options.unit,
        }),
      );
    }
    return this.gauges.get(key);
  }
}
exports.MetricsService = MetricsService;

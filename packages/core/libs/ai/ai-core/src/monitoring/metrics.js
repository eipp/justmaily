'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AIMetrics = void 0;
const prom_client_1 = require('prom-client');
class AIMetrics {
  constructor() {
    this.registry = new prom_client_1.Registry();
    // Request metrics
    this.requestCounter = new prom_client_1.Counter({
      name: 'ai_requests_total',
      help: 'Total number of AI requests',
      labelNames: ['provider', 'model', 'operation', 'status'],
      registers: [this.registry],
    });
    // Latency metrics
    this.latencyHistogram = new prom_client_1.Histogram({
      name: 'ai_request_duration_seconds',
      help: 'AI request latency in seconds',
      labelNames: ['provider', 'model', 'operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30],
      registers: [this.registry],
    });
    // Token usage metrics
    this.tokenCounter = new prom_client_1.Counter({
      name: 'ai_tokens_total',
      help: 'Total number of tokens used',
      labelNames: ['provider', 'model', 'type'],
      registers: [this.registry],
    });
    // Error metrics
    this.errorCounter = new prom_client_1.Counter({
      name: 'ai_errors_total',
      help: 'Total number of AI errors',
      labelNames: ['provider', 'model', 'error_type'],
      registers: [this.registry],
    });
    // Model usage metrics
    this.modelUsageGauge = new prom_client_1.Gauge({
      name: 'ai_model_usage',
      help: 'Current model usage statistics',
      labelNames: ['provider', 'model', 'metric'],
      registers: [this.registry],
    });
    // Cache metrics
    this.cacheHitCounter = new prom_client_1.Counter({
      name: 'ai_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['provider', 'model'],
      registers: [this.registry],
    });
    this.cacheMissCounter = new prom_client_1.Counter({
      name: 'ai_cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['provider', 'model'],
      registers: [this.registry],
    });
    // Rate limit metrics
    this.rateLimitCounter = new prom_client_1.Counter({
      name: 'ai_rate_limits_total',
      help: 'Total number of rate limit hits',
      labelNames: ['provider', 'model'],
      registers: [this.registry],
    });
  }
  recordRequest(provider, model, operation, status) {
    this.requestCounter.labels(provider, model, operation, status).inc();
  }
  recordLatency(provider, model, operation, durationMs) {
    this.latencyHistogram
      .labels(provider, model, operation)
      .observe(durationMs / 1000);
  }
  recordTokens(provider, model, type, count) {
    this.tokenCounter.labels(provider, model, type).inc(count);
  }
  recordError(provider, model, errorType) {
    this.errorCounter.labels(provider, model, errorType).inc();
  }
  updateModelUsage(provider, model, metric, value) {
    this.modelUsageGauge.labels(provider, model, metric).set(value);
  }
  recordCacheHit(provider, model) {
    this.cacheHitCounter.labels(provider, model).inc();
  }
  recordCacheMiss(provider, model) {
    this.cacheMissCounter.labels(provider, model).inc();
  }
  recordRateLimit(provider, model) {
    this.rateLimitCounter.labels(provider, model).inc();
  }
  async getMetrics() {
    return this.registry.metrics();
  }
  async resetMetrics() {
    return this.registry.resetMetrics();
  }
  getContentMetrics() {
    const totalRequests = this.requestCounter
      .get()
      .values.reduce((sum, value) => sum + value.value, 0);
    const totalErrors = this.errorCounter
      .get()
      .values.reduce((sum, value) => sum + value.value, 0);
    const latencySum = this.latencyHistogram.get().sum;
    const latencyCount = this.latencyHistogram.get().count;
    const cacheHits = this.cacheHitCounter
      .get()
      .values.reduce((sum, value) => sum + value.value, 0);
    const cacheMisses = this.cacheMissCounter
      .get()
      .values.reduce((sum, value) => sum + value.value, 0);
    return {
      requestRate: totalRequests / (process.uptime() / 60), // requests per minute
      errorRate: totalErrors / Math.max(totalRequests, 1),
      avgLatency: latencyCount > 0 ? latencySum / latencyCount : 0,
      cacheHitRate: cacheHits / Math.max(cacheHits + cacheMisses, 1),
    };
  }
}
exports.AIMetrics = AIMetrics;

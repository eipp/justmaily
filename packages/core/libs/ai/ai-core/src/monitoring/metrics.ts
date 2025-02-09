import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { ModelProvider } from '../types/models';
import { Histogram as OpenTelemetryHistogram } from '@opentelemetry/api';

export class AIMetrics {
  private registry: Registry;
  private requestCounter: Counter<string>;
  private latencyHistogram: Histogram<string>;
  private tokenCounter: Counter<string>;
  private errorCounter: Counter<string>;
  private modelUsageGauge: Gauge<string>;
  private cacheHitCounter: Counter<string>;
  private cacheMissCounter: Counter<string>;
  private rateLimitCounter: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // Request metrics
    this.requestCounter = new Counter({
      name: 'ai_requests_total',
      help: 'Total number of AI requests',
      labelNames: ['provider', 'model', 'operation', 'status'] as const,
      registers: [this.registry]
    });

    // Latency metrics
    this.latencyHistogram = new Histogram({
      name: 'ai_request_duration_seconds',
      help: 'AI request latency in seconds',
      labelNames: ['provider', 'model', 'operation'] as const,
      buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30],
      registers: [this.registry]
    });

    // Token usage metrics
    this.tokenCounter = new Counter({
      name: 'ai_tokens_total',
      help: 'Total number of tokens used',
      labelNames: ['provider', 'model', 'type'] as const,
      registers: [this.registry]
    });

    // Error metrics
    this.errorCounter = new Counter({
      name: 'ai_errors_total',
      help: 'Total number of AI errors',
      labelNames: ['provider', 'model', 'error_type'] as const,
      registers: [this.registry]
    });

    // Model usage metrics
    this.modelUsageGauge = new Gauge({
      name: 'ai_model_usage',
      help: 'Current model usage statistics',
      labelNames: ['provider', 'model', 'metric'] as const,
      registers: [this.registry]
    });

    // Cache metrics
    this.cacheHitCounter = new Counter({
      name: 'ai_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['provider', 'model'] as const,
      registers: [this.registry]
    });

    this.cacheMissCounter = new Counter({
      name: 'ai_cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['provider', 'model'] as const,
      registers: [this.registry]
    });

    // Rate limit metrics
    this.rateLimitCounter = new Counter({
      name: 'ai_rate_limits_total',
      help: 'Total number of rate limit hits',
      labelNames: ['provider', 'model'] as const,
      registers: [this.registry]
    });
  }

  public recordRequest(
    provider: ModelProvider,
    model: string,
    operation: string,
    status: 'success' | 'error'
  ): void {
    this.requestCounter.labels(provider, model, operation, status).inc();
  }

  public recordLatency(
    provider: ModelProvider,
    model: string,
    operation: string,
    durationMs: number
  ): void {
    this.latencyHistogram
      .labels(provider, model, operation)
      .observe(durationMs / 1000);
  }

  public recordTokens(
    provider: ModelProvider,
    model: string,
    type: 'prompt' | 'completion',
    count: number
  ): void {
    this.tokenCounter.labels(provider, model, type).inc(count);
  }

  public recordError(
    provider: ModelProvider,
    model: string,
    errorType: string
  ): void {
    this.errorCounter.labels(provider, model, errorType).inc();
  }

  public updateModelUsage(
    provider: ModelProvider,
    model: string,
    metric: 'requests_per_minute' | 'tokens_per_minute' | 'error_rate',
    value: number
  ): void {
    this.modelUsageGauge.labels(provider, model, metric).set(value);
  }

  public recordCacheHit(provider: ModelProvider, model: string): void {
    this.cacheHitCounter.labels(provider, model).inc();
  }

  public recordCacheMiss(provider: ModelProvider, model: string): void {
    this.cacheMissCounter.labels(provider, model).inc();
  }

  public recordRateLimit(provider: ModelProvider, model: string): void {
    this.rateLimitCounter.labels(provider, model).inc();
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public async resetMetrics(): Promise<void> {
    return this.registry.resetMetrics();
  }

  public async getContentMetrics(): Promise<{
    requestRate: number;
    errorRate: number;
    avgLatency: number;
    cacheHitRate: number;
  }> {
    const [
      requestMetrics,
      errorMetrics,
      latencyMetrics,
      cacheHitMetrics,
      cacheMissMetrics
    ] = await Promise.all([
      this.requestCounter.get(),
      this.errorCounter.get(),
      this.latencyHistogram.get(),
      this.cacheHitCounter.get(),
      this.cacheMissCounter.get()
    ]);

    const totalRequests = requestMetrics.values.reduce(
      (sum, value) => sum + value.value,
      0
    );

    const totalErrors = errorMetrics.values.reduce(
      (sum, value) => sum + value.value,
      0
    );

    const cacheHits = cacheHitMetrics.values.reduce(
      (sum, value) => sum + value.value,
      0
    );

    const cacheMisses = cacheMissMetrics.values.reduce(
      (sum, value) => sum + value.value,
      0
    );

    // Calculate average latency from histogram
    let totalObservations = 0;
    let totalSum = 0;
    for (const bucket of latencyMetrics.values) {
      if ('sum' in bucket && typeof bucket.sum === 'number') {
        totalObservations += bucket.value;
        totalSum += bucket.sum;
      }
    }

    return {
      requestRate: totalRequests / (process.uptime() / 60), // requests per minute
      errorRate: totalErrors / Math.max(totalRequests, 1),
      avgLatency: totalObservations > 0 ? totalSum / totalObservations : 0,
      cacheHitRate: (cacheHits / Math.max(cacheHits + cacheMisses, 1))
    };
  }
} 
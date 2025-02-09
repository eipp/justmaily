import { Counter, Gauge, Histogram } from 'prom-client'
import { register } from 'prom-client'
import { MetricsConfig } from '../types'
import { ObservableGauge, Meter, MeterProvider } from '@opentelemetry/api'

// Email Delivery Metrics
export const emailSentCounter = new Counter({
  name: 'email_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['provider', 'campaign', 'status']
})

export const deliveryLatencyHistogram = new Histogram({
  name: 'email_delivery_latency_seconds',
  help: 'Email delivery latency in seconds',
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

// Campaign Performance Metrics
export const openRateGauge = new Gauge({
  name: 'campaign_open_rate',
  help: 'Email campaign open rate',
  labelNames: ['campaign']
})

export const clickRateGauge = new Gauge({
  name: 'campaign_click_rate',
  help: 'Email campaign click rate',
  labelNames: ['campaign']
})

export const bounceRateGauge = new Gauge({
  name: 'campaign_bounce_rate',
  help: 'Email campaign bounce rate',
  labelNames: ['campaign']
})

// Provider Health Metrics
export const providerHealthGauge = new Gauge({
  name: 'provider_health_status',
  help: 'Email provider health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['provider']
})

export const providerLatencyGauge = new Gauge({
  name: 'provider_latency_seconds',
  help: 'Email provider API latency',
  labelNames: ['provider', 'operation']
})

// A/B Testing Metrics
export const abTestCounter = new Counter({
  name: 'ab_test_total',
  help: 'Total number of A/B tests run',
  labelNames: ['campaign']
})

export const variantPerformanceGauge = new Gauge({
  name: 'variant_performance_score',
  help: 'A/B test variant performance score',
  labelNames: ['campaign', 'variant']
})

// System Health Metrics
export const systemErrorCounter = new Counter({
  name: 'system_error_total',
  help: 'Total number of system errors',
  labelNames: ['type', 'severity']
})

export const queueSizeGauge = new Gauge({
  name: 'email_queue_size',
  help: 'Number of emails in queue',
  labelNames: ['priority']
})

// AI Metrics
export const aiCacheCounter = new Counter({
  name: 'ai_cache_total',
  help: 'Total number of AI cache operations',
  labelNames: ['operation', 'model']
})

export const aiPredictionLatencyHistogram = new Histogram({
  name: 'ai_prediction_latency_seconds',
  help: 'AI prediction latency in seconds',
  labelNames: ['model'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

export const aiErrorCounter = new Counter({
  name: 'ai_error_total',
  help: 'Total number of AI errors',
  labelNames: ['model', 'error_type']
})

// Matrix Metrics
export const matrixLatencyHistogram = new Histogram({
  name: 'matrix_operation_latency_seconds',
  help: 'Matrix operation latency in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

export const matrixEventCounter = new Counter({
  name: 'matrix_event_total',
  help: 'Total number of Matrix events',
  labelNames: ['type']
})

export const matrixMessageCounter = new Counter({
  name: 'matrix_message_total',
  help: 'Total number of Matrix messages',
  labelNames: ['direction', 'encrypted']
})

interface MetricsConfig {
  version?: string
  environment?: string
  defaultLabels?: Record<string, string>
}

export class MetricsService {
  private meter: Meter
  private counters: Map<string, Counter> = new Map()
  private histograms: Map<string, Histogram> = new Map()
  private gauges: Map<string, ObservableGauge> = new Map()
  private defaultLabels: Record<string, string>

  constructor(
    private meterProvider: MeterProvider,
    private config: MetricsConfig = {}
  ) {
    this.meter = meterProvider.getMeter('justmaily')
    this.defaultLabels = {
      version: config.version || 'unknown',
      environment: config.environment || 'development',
      ...config.defaultLabels
    }
  }

  async recordEmailSent(provider: string, campaign: string, status: string) {
    emailSentCounter.labels(provider, campaign, status).inc()
  }

  async recordDeliveryLatency(provider: string, latencyMs: number) {
    deliveryLatencyHistogram.labels(provider).observe(latencyMs / 1000)
  }

  async updateCampaignMetrics(campaign: string, metrics: {
    openRate?: number
    clickRate?: number
    bounceRate?: number
  }) {
    if (metrics.openRate !== undefined) {
      openRateGauge.labels(campaign).set(metrics.openRate)
    }
    if (metrics.clickRate !== undefined) {
      clickRateGauge.labels(campaign).set(metrics.clickRate)
    }
    if (metrics.bounceRate !== undefined) {
      bounceRateGauge.labels(campaign).set(metrics.bounceRate)
    }
  }

  async recordProviderHealth(provider: string, isHealthy: boolean) {
    providerHealthGauge.labels(provider).set(isHealthy ? 1 : 0)
  }

  async recordProviderLatency(provider: string, operation: string, latencyMs: number) {
    providerLatencyGauge.labels(provider, operation).set(latencyMs / 1000)
  }

  async recordABTest(campaign: string) {
    abTestCounter.labels(campaign).inc()
  }

  async recordVariantPerformance(campaign: string, variant: string, score: number) {
    variantPerformanceGauge.labels(campaign, variant).set(score)
  }

  async recordError(type: string, severity: string) {
    systemErrorCounter.labels(type, severity).inc()
  }

  async updateQueueSize(priority: string, size: number) {
    queueSizeGauge.labels(priority).set(size)
  }

  async recordAiCache(result: 'hit' | 'miss', model: string) {
    const counter = await this.getCounter('ai_cache', {
      description: 'AI cache hits and misses',
      unit: 'events'
    })
    counter.add(1, { result, model })
  }

  async recordAiPrediction(model: string, duration: number) {
    const histogram = await this.getHistogram('ai_prediction_latency', {
      description: 'AI prediction latency',
      unit: 'ms'
    })
    histogram.record(duration, { model })
  }

  async recordAiError(model: string, errorType: string) {
    aiErrorCounter.labels(model, errorType).inc()
  }

  async recordLatency(operation: string, duration: number) {
    const histogram = await this.getHistogram('matrix_latency', {
      description: 'Matrix operation latency',
      unit: 'ms'
    })
    histogram.record(duration, { operation })
  }

  async recordEvent(type: string) {
    const counter = await this.getCounter('matrix_events', {
      description: 'Matrix events counter',
      unit: 'events'
    })
    counter.add(1, { type })
  }

  async incrementCounter(name: string): Promise<void> {
    const counter = await this.getCounter(name, {
      description: `Counter for ${name}`,
      unit: 'events'
    })
    counter.add(1)
  }

  async decrementCounter(name: string): Promise<void> {
    const counter = await this.getCounter(name, {
      description: `Counter for ${name}`,
      unit: 'events'
    })
    counter.add(-1)
  }

  async createGauge(name: string): Promise<ObservableGauge> {
    return await this.getGauge(name, {
      description: `Gauge for ${name}`,
      unit: 'value'
    })
  }

  async recordMetric(name: string, value: number): Promise<void> {
    const gauge = await this.getGauge(name, {
      description: `Metric gauge for ${name}`,
      unit: 'value'
    })
    gauge.set(value)
  }

  async getMetrics() {
    return await register.metrics()
  }

  private async getCounter(
    name: string,
    options: {
      description: string
      unit: string
    }
  ): Promise<Counter> {
    const key = `counter_${name}`
    if (!this.counters.has(key)) {
      this.counters.set(
        key,
        this.meter.createCounter(name, {
          description: options.description,
          unit: options.unit
        })
      )
    }
    return this.counters.get(key)!
  }

  private async getHistogram(
    name: string,
    options: {
      description: string
      unit: string
    }
  ): Promise<Histogram> {
    const key = `histogram_${name}`
    if (!this.histograms.has(key)) {
      this.histograms.set(
        key,
        this.meter.createHistogram(name, {
          description: options.description,
          unit: options.unit
        })
      )
    }
    return this.histograms.get(key)!
  }

  private async getGauge(
    name: string,
    options: {
      description: string
      unit: string
    }
  ): Promise<ObservableGauge> {
    const key = `gauge_${name}`
    if (!this.gauges.has(key)) {
      this.gauges.set(
        key,
        this.meter.createObservableGauge(name, {
          description: options.description,
          unit: options.unit
        })
      )
    }
    return this.gauges.get(key)!
  }
} 
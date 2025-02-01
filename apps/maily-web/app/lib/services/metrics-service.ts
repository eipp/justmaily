import { Redis } from 'ioredis'
import { StatsD } from 'hot-shots'

export interface MetricTags {
  [key: string]: string | number | boolean
}

export interface HistogramOptions {
  buckets?: number[]
  min?: number
  max?: number
}

export class MetricsService {
  private redis: Redis
  private statsd: StatsD
  private prefix: string

  constructor(
    private config: {
      redisUrl: string
      statsdHost: string
      statsdPort: number
      environment: string
    }
  ) {
    this.redis = new Redis(config.redisUrl)
    this.statsd = new StatsD({
      host: config.statsdHost,
      port: config.statsdPort,
      prefix: 'maily.',
      errorHandler: this.handleStatsdError.bind(this),
      globalTags: { env: config.environment }
    })
    this.prefix = `metrics:${config.environment}:`
  }

  // Counter metrics
  increment(metric: string, tags: MetricTags = {}, value: number = 1): void {
    const tagString = this.formatTags(tags)
    this.statsd.increment(metric, value, tagString)
    this.recordToRedis(`${this.prefix}counter:${metric}${tagString}`, value)
  }

  decrement(metric: string, tags: MetricTags = {}, value: number = 1): void {
    const tagString = this.formatTags(tags)
    this.statsd.decrement(metric, value, tagString)
    this.recordToRedis(`${this.prefix}counter:${metric}${tagString}`, -value)
  }

  // Gauge metrics
  gauge(metric: string, value: number, tags: MetricTags = {}): void {
    const tagString = this.formatTags(tags)
    this.statsd.gauge(metric, value, tagString)
    this.recordToRedis(`${this.prefix}gauge:${metric}${tagString}`, value)
  }

  // Histogram metrics
  histogram(
    metric: string,
    value: number,
    tags: MetricTags = {},
    options: HistogramOptions = {}
  ): void {
    const tagString = this.formatTags(tags)
    this.statsd.histogram(metric, value, tagString)
    this.recordHistogramToRedis(
      `${this.prefix}histogram:${metric}${tagString}`,
      value,
      options
    )
  }

  // Timer metrics
  async timing<T>(
    metric: string,
    fn: () => Promise<T>,
    tags: MetricTags = {}
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.recordTiming(metric, duration, tags)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.recordTiming(metric, duration, { ...tags, error: 'true' })
      throw error
    }
  }

  // Distribution metrics (for p50, p90, p99 calculations)
  distribution(metric: string, value: number, tags: MetricTags = {}): void {
    const tagString = this.formatTags(tags)
    this.statsd.distribution(metric, value, tagString)
    this.recordToRedis(`${this.prefix}distribution:${metric}${tagString}`, value)
  }

  // Set metrics (for counting unique occurrences)
  async uniqueCount(metric: string, value: string | number, tags: MetricTags = {}): Promise<void> {
    const tagString = this.formatTags(tags)
    const key = `${this.prefix}set:${metric}${tagString}`
    await this.redis.sadd(key, value)
    await this.redis.expire(key, 86400) // 24 hours retention
  }

  // Retrieve metrics
  async getMetric(
    type: 'counter' | 'gauge' | 'histogram' | 'distribution' | 'set',
    metric: string,
    tags: MetricTags = {}
  ): Promise<number | string[] | null> {
    const tagString = this.formatTags(tags)
    const key = `${this.prefix}${type}:${metric}${tagString}`

    switch (type) {
      case 'set':
        return this.redis.smembers(key)
      case 'histogram':
      case 'distribution':
        return this.getHistogramMetrics(key)
      default:
        return this.redis.get(key)
    }
  }

  // Reset metrics (mainly for testing)
  async resetMetrics(metric: string, tags: MetricTags = {}): Promise<void> {
    const tagString = this.formatTags(tags)
    const pattern = `${this.prefix}*:${metric}${tagString}`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  private formatTags(tags: MetricTags): string {
    return Object.entries(tags)
      .map(([key, value]) => `,${key}:${value}`)
      .join('')
  }

  private async recordToRedis(key: string, value: number): Promise<void> {
    try {
      await this.redis
        .multi()
        .incrby(key, value)
        .expire(key, 86400) // 24 hours retention
        .exec()
    } catch (error) {
      console.error('Failed to record metric to Redis:', error)
    }
  }

  private async recordHistogramToRedis(
    key: string,
    value: number,
    options: HistogramOptions
  ): Promise<void> {
    try {
      const multi = this.redis.multi()
      
      // Record the raw value
      multi.zadd(`${key}:values`, Date.now(), value)
      
      // Update min/max
      multi.zrange(`${key}:values`, 0, 0, 'WITHSCORES')
      multi.zrange(`${key}:values`, -1, -1, 'WITHSCORES')
      
      // Calculate bucket counts if buckets are specified
      if (options.buckets) {
        for (const bucket of options.buckets) {
          if (value <= bucket) {
            multi.hincrby(`${key}:buckets`, bucket.toString(), 1)
          }
        }
      }

      // Set expiration
      multi.expire(`${key}:values`, 86400)
      multi.expire(`${key}:buckets`, 86400)

      await multi.exec()
    } catch (error) {
      console.error('Failed to record histogram to Redis:', error)
    }
  }

  private async getHistogramMetrics(key: string): Promise<{
    min: number
    max: number
    avg: number
    p50: number
    p90: number
    p99: number
  } | null> {
    try {
      const values = await this.redis.zrange(`${key}:values`, 0, -1)
      if (!values.length) return null

      const numbers = values.map(Number)
      const sorted = numbers.sort((a, b) => a - b)
      
      return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: numbers.reduce((a, b) => a + b) / numbers.length,
        p50: this.percentile(sorted, 50),
        p90: this.percentile(sorted, 90),
        p99: this.percentile(sorted, 99)
      }
    } catch (error) {
      console.error('Failed to get histogram metrics from Redis:', error)
      return null
    }
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index]
  }

  private recordTiming(metric: string, duration: number, tags: MetricTags): void {
    const tagString = this.formatTags(tags)
    this.statsd.timing(metric, duration, tagString)
    this.recordToRedis(`${this.prefix}timing:${metric}${tagString}`, duration)
  }

  private handleStatsdError(error: Error): void {
    console.error('StatsD error:', error)
    // Could add additional error handling here, like alerting
  }
} 
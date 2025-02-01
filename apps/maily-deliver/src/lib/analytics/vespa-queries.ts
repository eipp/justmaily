import { Redis } from '@upstash/redis'
import { z } from 'zod'

import { VespaClient } from './vespa-client'
import { MetricsService } from '../monitoring'
import { YQLBuilder } from './yql-builder'

// Initialize Redis client for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: true,
})

// Query validation schemas
const timeRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
})

const filtersSchema = z.object({
  providers: z.array(z.string()).optional(),
  campaigns: z.array(z.string()).optional(),
  templates: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
}).optional()

const baseQuerySchema = z.object({
  timeRange: timeRangeSchema,
  filters: filtersSchema,
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
})

const timeSeriesQuerySchema = baseQuerySchema.extend({
  interval: z.enum(['hour', 'day', 'week', 'month']),
  metrics: z.array(z.string()),
})

const aggregationQuerySchema = baseQuerySchema.extend({
  aggregations: z.array(z.object({
    type: z.enum(['count', 'sum', 'avg', 'min', 'max', 'percentile']),
    field: z.string(),
    percentile: z.number().min(0).max(100).optional(),
  })),
})

const funnelStepSchema = z.object({
  name: z.string(),
  event: z.string(),
  filters: z.record(z.any()).optional(),
  window: z.number().optional(),
})

const funnelQuerySchema = baseQuerySchema.extend({
  steps: z.array(funnelStepSchema),
})

const cohortQuerySchema = baseQuerySchema.extend({
  initialEvent: z.object({
    name: z.string(),
    filters: z.record(z.any()).optional(),
  }),
  returnEvent: z.object({
    name: z.string(),
    filters: z.record(z.any()).optional(),
  }),
  intervals: z.array(z.number()),
})

export class VespaQueries {
  private yqlBuilder: YQLBuilder
  private queryCache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(
    private vespa: VespaClient,
    private metrics: MetricsService
  ) {
    this.yqlBuilder = new YQLBuilder()
  }

  private async getCachedResult(key: string): Promise<any | null> {
    try {
      const result = await redis.get(key)
      if (result) {
        this.metrics.incrementCounter('analytics_cache_hit')
        return result
      }
      this.metrics.incrementCounter('analytics_cache_miss')
      return null
    } catch (error) {
      this.metrics.recordError('analytics_cache_error', error.message)
      return null
    }
  }

  private async setCachedResult(key: string, value: any, ttl: number = this.CACHE_TTL): Promise<void> {
    try {
      await redis.set(key, value, { ex: Math.floor(ttl / 1000) })
    } catch (error) {
      this.metrics.recordError('analytics_cache_set_error', error.message)
    }
  }

  async queryDeliveryMetrics(query: z.infer<typeof baseQuerySchema>): Promise<{
    total: number
    delivered: number
    failed: number
    bounced: number
    opened: number
    clicked: number
    unsubscribed: number
    complained: number
    metrics: Record<string, number>
  }> {
    const startTime = Date.now()
    try {
      // Validate query
      const validatedQuery = baseQuerySchema.parse(query)

      // Generate cache key
      const cacheKey = `analytics:delivery:${JSON.stringify(validatedQuery)}`

      // Try cache first
      const cachedResult = await this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      // Execute query
      const yql = this.yqlBuilder.buildDeliveryMetricsQuery(validatedQuery)
      const result = await this.vespa.query(yql)
      const parsedResult = this.parseDeliveryMetrics(result)

      // Cache result
      await this.setCachedResult(cacheKey, parsedResult)

      // Record metrics
      this.metrics.recordLatency('delivery_metrics_query', Date.now() - startTime)
      this.metrics.incrementCounter('delivery_metrics_query_total')

      return parsedResult
    } catch (error) {
      this.metrics.recordError('delivery_metrics_query_error', error.message)
      throw error
    }
  }

  async queryTimeSeries(query: z.infer<typeof timeSeriesQuerySchema>): Promise<{
    intervals: Array<{
      start: Date
      end: Date
      metrics: Record<string, number>
    }>
  }> {
    const startTime = Date.now()
    try {
      // Validate query
      const validatedQuery = timeSeriesQuerySchema.parse(query)

      // Generate cache key
      const cacheKey = `analytics:timeseries:${JSON.stringify(validatedQuery)}`

      // Try cache first
      const cachedResult = await this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      // Execute query
      const yql = this.yqlBuilder.buildTimeSeriesQuery(validatedQuery)
      const result = await this.vespa.query(yql)
      const parsedResult = this.parseTimeSeries(result, validatedQuery)

      // Cache result
      await this.setCachedResult(cacheKey, parsedResult)

      // Record metrics
      this.metrics.recordLatency('time_series_query', Date.now() - startTime)
      this.metrics.incrementCounter('time_series_query_total')

      return parsedResult
    } catch (error) {
      this.metrics.recordError('time_series_query_error', error.message)
      throw error
    }
  }

  async queryAggregations(query: z.infer<typeof aggregationQuerySchema>): Promise<{
    aggregations: Record<string, {
      value: number
      count: number
      details?: any
    }>
  }> {
    const startTime = Date.now()
    try {
      // Validate query
      const validatedQuery = aggregationQuerySchema.parse(query)

      // Generate cache key
      const cacheKey = `analytics:aggregations:${JSON.stringify(validatedQuery)}`

      // Try cache first
      const cachedResult = await this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      // Execute query
      const yql = this.yqlBuilder.buildAggregationQuery(validatedQuery)
      const result = await this.vespa.query(yql)
      const parsedResult = this.parseAggregations(result, validatedQuery)

      // Cache result
      await this.setCachedResult(cacheKey, parsedResult)

      // Record metrics
      this.metrics.recordLatency('aggregation_query', Date.now() - startTime)
      this.metrics.incrementCounter('aggregation_query_total')

      return parsedResult
    } catch (error) {
      this.metrics.recordError('aggregation_query_error', error.message)
      throw error
    }
  }

  async queryFunnel(query: z.infer<typeof funnelQuerySchema>): Promise<{
    steps: Array<{
      name: string
      count: number
      dropoff: number
      conversionRate: number
    }>
    overall: {
      conversionRate: number
      dropoffRate: number
    }
  }> {
    const startTime = Date.now()
    try {
      // Validate query
      const validatedQuery = funnelQuerySchema.parse(query)

      // Generate cache key
      const cacheKey = `analytics:funnel:${JSON.stringify(validatedQuery)}`

      // Try cache first
      const cachedResult = await this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      // Execute queries in parallel
      const stepQueries = validatedQuery.steps.map((step, index) =>
        this.vespa.query(
          this.yqlBuilder.buildFunnelStepQuery({
            ...validatedQuery,
            step,
            index
          })
        )
      )

      const stepResults = await Promise.all(stepQueries)
      const parsedResult = this.parseFunnel(stepResults, validatedQuery)

      // Cache result
      await this.setCachedResult(cacheKey, parsedResult)

      // Record metrics
      this.metrics.recordLatency('funnel_query', Date.now() - startTime)
      this.metrics.incrementCounter('funnel_query_total')

      return parsedResult
    } catch (error) {
      this.metrics.recordError('funnel_query_error', error.message)
      throw error
    }
  }

  async queryCohorts(query: z.infer<typeof cohortQuerySchema>): Promise<{
    intervals: Array<{
      interval: number
      size: number
      returnRate: number
    }>
    overall: {
      totalUsers: number
      averageReturnRate: number
    }
  }> {
    const startTime = Date.now()
    try {
      // Validate query
      const validatedQuery = cohortQuerySchema.parse(query)

      // Generate cache key
      const cacheKey = `analytics:cohorts:${JSON.stringify(validatedQuery)}`

      // Try cache first
      const cachedResult = await this.getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      // Execute initial cohort query
      const initialQuery = this.yqlBuilder.buildCohortInitialQuery(validatedQuery)
      const initialResult = await this.vespa.query(initialQuery)

      // Execute return queries in parallel
      const returnQueries = validatedQuery.intervals.map(interval =>
        this.vespa.query(
          this.yqlBuilder.buildCohortReturnQuery(validatedQuery, interval)
        )
      )

      const returnResults = await Promise.all(returnQueries)
      const parsedResult = this.parseCohorts(initialResult, returnResults, validatedQuery)

      // Cache result
      await this.setCachedResult(cacheKey, parsedResult)

      // Record metrics
      this.metrics.recordLatency('cohort_query', Date.now() - startTime)
      this.metrics.incrementCounter('cohort_query_total')

      return parsedResult
    } catch (error) {
      this.metrics.recordError('cohort_query_error', error.message)
      throw error
    }
  }

  // Helper methods
  private parseDeliveryMetrics(result: any): any {
    const fields = result.root.fields
    return {
      total: fields.total || 0,
      delivered: fields.delivered || 0,
      failed: fields.failed || 0,
      bounced: fields.bounced || 0,
      opened: fields.opened || 0,
      clicked: fields.clicked || 0,
      unsubscribed: fields.unsubscribed || 0,
      complained: fields.complained || 0,
      metrics: {
        deliveryRate: fields.delivered ? fields.delivered / fields.total : 0,
        openRate: fields.delivered ? fields.opened / fields.delivered : 0,
        clickRate: fields.opened ? fields.clicked / fields.opened : 0,
        bounceRate: fields.total ? fields.bounced / fields.total : 0,
        complaintRate: fields.delivered ? fields.complained / fields.delivered : 0
      }
    }
  }

  private parseTimeSeries(result: any, query: z.infer<typeof timeSeriesQuerySchema>): any {
    const intervals = result.root.children.map((child: any) => ({
      start: new Date(child.fields.interval_start),
      end: new Date(child.fields.interval_end),
      metrics: query.metrics.reduce((acc: any, metric: string) => {
        acc[metric] = child.fields[metric] || 0
        return acc
      }, {})
    }))

    return { intervals }
  }

  private parseAggregations(result: any, query: z.infer<typeof aggregationQuerySchema>): any {
    const aggregations = query.aggregations.reduce((acc: any, agg: any) => {
      const field = result.root.fields[agg.field] || {}
      acc[agg.field] = {
        value: field.value || 0,
        count: field.count || 0,
        details: field.details
      }
      return acc
    }, {})

    return { aggregations }
  }

  private parseFunnel(results: any[], query: z.infer<typeof funnelQuerySchema>): any {
    const steps = results.map((result, index) => {
      const count = result.root.fields.count || 0
      const previousCount = index > 0 ? results[index - 1].root.fields.count || 0 : count
      const dropoff = previousCount - count
      const conversionRate = previousCount > 0 ? count / previousCount : 0

      return {
        name: query.steps[index].name,
        count,
        dropoff,
        conversionRate
      }
    })

    const overall = {
      conversionRate: steps[0].count > 0 ? steps[steps.length - 1].count / steps[0].count : 0,
      dropoffRate: steps[0].count > 0 ? 1 - (steps[steps.length - 1].count / steps[0].count) : 0
    }

    return { steps, overall }
  }

  private parseCohorts(initialResult: any, returnResults: any[], query: z.infer<typeof cohortQuerySchema>): any {
    const totalUsers = initialResult.root.fields.count || 0

    const intervals = returnResults.map((result, index) => {
      const size = result.root.fields.count || 0
      const returnRate = totalUsers > 0 ? size / totalUsers : 0

      return {
        interval: query.intervals[index],
        size,
        returnRate
      }
    })

    const overall = {
      totalUsers,
      averageReturnRate: intervals.reduce((sum, i) => sum + i.returnRate, 0) / intervals.length
    }

    return { intervals, overall }
  }

  private getIntervalMs(interval: z.infer<typeof timeSeriesQuerySchema>['interval']): number {
    const intervals: Record<string, number> = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }
    return intervals[interval]
  }
} 
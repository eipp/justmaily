import { z } from 'zod'

// Validation schemas for query parameters
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
})

const querySchema = z.object({
  timeRange: timeRangeSchema,
  filters: filtersSchema.optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
})

const aggregationSchema = z.object({
  type: z.enum(['count', 'sum', 'avg', 'min', 'max', 'percentile']),
  field: z.string(),
  percentile: z.number().min(0).max(100).optional(),
})

const funnelStepSchema = z.object({
  name: z.string(),
  event: z.string(),
  filters: z.record(z.unknown()).optional(),
  window: z.number().int().positive().optional(),
})

export class YQLBuilder {
  private escapeString(value: string): string {
    // Escape single quotes and backslashes
    return value.replace(/['\\]/g, '\\$&')
  }

  private validateTimeRange(timeRange: unknown): z.infer<typeof timeRangeSchema> {
    return timeRangeSchema.parse(timeRange)
  }

  private validateFilters(filters: unknown): z.infer<typeof filtersSchema> {
    return filtersSchema.parse(filters)
  }

  private buildTimeCondition(timeRange: z.infer<typeof timeRangeSchema>): string {
    return `timestamp >= ${timeRange.start.getTime()} and timestamp <= ${timeRange.end.getTime()}`
  }

  private buildArrayCondition(field: string, values: string[]): string {
    const escapedValues = values.map(v => `'${this.escapeString(v)}'`)
    return `${field} in [${escapedValues.join(', ')}]`
  }

  private buildTagsCondition(tags: string[]): string {
    const escapedTags = tags.map(t => `'${this.escapeString(t)}'`)
    return `tags contains all [${escapedTags.join(', ')}]`
  }

  private buildFiltersCondition(filters: z.infer<typeof filtersSchema>): string[] {
    const conditions: string[] = []

    if (filters.providers) {
      conditions.push(this.buildArrayCondition('provider', filters.providers))
    }
    if (filters.campaigns) {
      conditions.push(this.buildArrayCondition('campaign_id', filters.campaigns))
    }
    if (filters.templates) {
      conditions.push(this.buildArrayCondition('template_id', filters.templates))
    }
    if (filters.tags) {
      conditions.push(this.buildTagsCondition(filters.tags))
    }
    if (filters.status) {
      conditions.push(this.buildArrayCondition('status', filters.status))
    }

    return conditions
  }

  buildDeliveryMetricsQuery(params: unknown): string {
    const query = querySchema.parse(params)
    const conditions: string[] = [this.buildTimeCondition(query.timeRange)]

    if (query.filters) {
      conditions.push(...this.buildFiltersCondition(query.filters))
    }

    let yql = `
      select
        count() as total,
        sum(if(status = 'delivered', 1, 0)) as delivered,
        sum(if(status = 'failed', 1, 0)) as failed,
        sum(if(status = 'bounced', 1, 0)) as bounced,
        sum(if(status = 'opened', 1, 0)) as opened,
        sum(if(status = 'clicked', 1, 0)) as clicked,
        sum(if(status = 'unsubscribed', 1, 0)) as unsubscribed,
        sum(if(status = 'complained', 1, 0)) as complained
      from delivery
      where ${conditions.join(' and ')}
    `

    if (query.groupBy) {
      const validFields = ['provider', 'campaign_id', 'template_id', 'status']
      const groupByFields = query.groupBy.filter(field => validFields.includes(field))
      if (groupByFields.length > 0) {
        yql += ` group by ${groupByFields.join(', ')}`
      }
    }

    if (query.limit) {
      yql += ` limit ${query.limit}`
    }
    if (query.offset) {
      yql += ` offset ${query.offset}`
    }

    return yql
  }

  buildTimeSeriesQuery(params: unknown & { interval: 'hour' | 'day' | 'week' | 'month' }): string {
    const query = querySchema.extend({
      interval: z.enum(['hour', 'day', 'week', 'month']),
      metrics: z.array(z.string()).min(1),
    }).parse(params)

    const conditions: string[] = [this.buildTimeCondition(query.timeRange)]
    const interval = this.getIntervalMs(query.interval)
    const buckets = Math.ceil(
      (query.timeRange.end.getTime() - query.timeRange.start.getTime()) / 
      interval
    )

    // Validate metrics against allowed list
    const validMetrics = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained']
    const metrics = query.metrics.filter(metric => validMetrics.includes(metric))

    if (metrics.length === 0) {
      throw new Error('No valid metrics specified')
    }

    return `
      select
        timestamp / ${interval} * ${interval} as bucket_start,
        ${metrics.map(metric => `
          sum(if(metric = '${this.escapeString(metric)}', value, 0)) as ${this.escapeString(metric)}
        `).join(',\n')}
      from metrics
      where ${conditions.join(' and ')}
      group by bucket_start
      order by bucket_start
      limit ${buckets}
    `
  }

  buildAggregationQuery(params: unknown & { aggregations: z.infer<typeof aggregationSchema>[] }): string {
    const query = querySchema.extend({
      aggregations: z.array(aggregationSchema).min(1),
    }).parse(params)

    const conditions: string[] = [this.buildTimeCondition(query.timeRange)]

    if (query.filters) {
      conditions.push(...this.buildFiltersCondition(query.filters))
    }

    // Validate fields against allowed list
    const validFields = ['value', 'duration', 'size', 'count']
    const aggregations = query.aggregations.filter(agg => validFields.includes(agg.field))

    if (aggregations.length === 0) {
      throw new Error('No valid aggregation fields specified')
    }

    return `
      select
        ${aggregations.map(agg => {
          const field = this.escapeString(agg.field)
          switch (agg.type) {
            case 'count':
              return `count() as ${field}_count`
            case 'sum':
              return `sum(${field}) as ${field}_sum`
            case 'avg':
              return `avg(${field}) as ${field}_avg`
            case 'min':
              return `min(${field}) as ${field}_min`
            case 'max':
              return `max(${field}) as ${field}_max`
            case 'percentile':
              return `percentile(${field}, ${agg.percentile}) as ${field}_p${agg.percentile}`
          }
        }).join(',\n')}
      from metrics
      where ${conditions.join(' and ')}
      ${query.groupBy ? `group by ${query.groupBy.join(', ')}` : ''}
    `
  }

  buildFunnelStepQuery(
    params: unknown & {
      step: z.infer<typeof funnelStepSchema>
      index: number
    }
  ): string {
    const query = querySchema.extend({
      step: funnelStepSchema,
      index: z.number().int().nonnegative(),
    }).parse(params)

    const conditions: string[] = [
      this.buildTimeCondition(query.timeRange),
      `event = '${this.escapeString(query.step.event)}'`
    ]

    if (query.step.filters) {
      // Validate and sanitize filters
      const validFilterKeys = ['user_id', 'session_id', 'campaign_id', 'template_id']
      Object.entries(query.step.filters)
        .filter(([key]) => validFilterKeys.includes(key))
        .forEach(([key, value]) => {
          conditions.push(`${key} = ${JSON.stringify(value)}`)
        })
    }

    if (query.index > 0 && query.step.window) {
      conditions.push(
        `exists(
          select * from previous_step
          where timestamp <= current.timestamp
          and timestamp >= current.timestamp - ${query.step.window}
        )`
      )
    }

    return `
      select count(distinct user_id) as count
      from events as current
      where ${conditions.join(' and ')}
    `
  }

  private getIntervalMs(interval: 'hour' | 'day' | 'week' | 'month'): number {
    const MS_PER_HOUR = 3600000
    const MS_PER_DAY = MS_PER_HOUR * 24
    const MS_PER_WEEK = MS_PER_DAY * 7
    const MS_PER_MONTH = MS_PER_DAY * 30 // Approximate

    switch (interval) {
      case 'hour':
        return MS_PER_HOUR
      case 'day':
        return MS_PER_DAY
      case 'week':
        return MS_PER_WEEK
      case 'month':
        return MS_PER_MONTH
    }
  }
} 
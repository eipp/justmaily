import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { config } from '../../../config'
import { db } from '../../../lib/db'

const AnalyticsRequestSchema = z.object({
  timeRange: z.object({
    start: z.string().datetime().transform(str => new Date(str)),
    end: z.string().datetime().transform(str => new Date(str))
  }),
  tags: z.array(z.string()).optional(),
  groupBy: z.enum(['hour', 'day']).optional()
})

export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>

interface MetricsData {
  sent: number
  delivered: number
  opens: number
  clicks: number
  bounced: number
  complained: number
  unsubscribes: number
}

interface RatesData {
  delivery: number
  open: number
  click: number
  bounce: number
  complaint: number
  unsubscribe: number
}

interface TrendPoint {
  timestamp: string
  metrics: MetricsData
  rates: RatesData
}

interface TrendData {
  interval: 'hour' | 'day'
  points: TrendPoint[]
}

interface AnalyticsResponse {
  metrics: MetricsData
  rates: RatesData
  trends?: TrendData
  metadata: {
    timeRange: {
      start: Date
      end: Date
    }
    tags?: string[]
    groupBy?: 'hour' | 'day'
    duration: number
    timestamp: string
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Skip if analytics are disabled
  if (!config.features.analytics) {
    return NextResponse.json(
      { status: 'skipped', message: 'Analytics are disabled' },
      { status: 200 }
    )
  }

  try {
    const body = await req.json()
    const { timeRange, tags, groupBy } = AnalyticsRequestSchema.parse(body)
    const startTime = Date.now()

    // Get base metrics
    const metrics = await db.metrics.get(timeRange, tags?.[0])

    // Calculate rates
    const rates: RatesData = {
      delivery: metrics.delivered / metrics.sent || 0,
      open: metrics.opens / metrics.delivered || 0,
      click: metrics.clicks / metrics.delivered || 0,
      bounce: metrics.bounced / metrics.sent || 0,
      complaint: metrics.complained / metrics.sent || 0,
      unsubscribe: metrics.unsubscribes / metrics.sent || 0,
    }

    // Calculate trends if groupBy is specified
    let trends: TrendData | undefined
    if (groupBy) {
      const interval = groupBy === 'hour' ? 3600000 : 86400000 // 1 hour or 1 day in ms
      const points: TrendPoint[] = []
      
      let current = timeRange.start.getTime()
      const end = timeRange.end.getTime()
      
      while (current <= end) {
        const pointStart = new Date(current)
        const pointEnd = new Date(current + interval)
        
        const pointMetrics = await db.metrics.get(
          { start: pointStart, end: pointEnd },
          tags?.[0]
        )
        
        points.push({
          timestamp: pointStart.toISOString(),
          metrics: pointMetrics,
          rates: {
            delivery: pointMetrics.delivered / pointMetrics.sent || 0,
            open: pointMetrics.opens / pointMetrics.delivered || 0,
            click: pointMetrics.clicks / pointMetrics.delivered || 0,
            bounce: pointMetrics.bounced / pointMetrics.sent || 0,
            complaint: pointMetrics.complained / pointMetrics.sent || 0,
            unsubscribe: pointMetrics.unsubscribes / pointMetrics.sent || 0,
          },
        })
        
        current += interval
      }
      
      trends = {
        interval: groupBy,
        points,
      }
    }

    const response: AnalyticsResponse = {
      metrics,
      rates,
      trends,
      metadata: {
        timeRange,
        tags,
        groupBy,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'ANALYTICS_FAILED',
          message: 'Failed to fetch analytics',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
} 
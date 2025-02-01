import { YQLBuilder } from '../yql-builder'
import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock services
vi.mock('../../monitoring', () => ({
  MetricsService: vi.fn(() => ({
    recordLatency: vi.fn(),
    recordError: vi.fn(),
    incrementCounter: vi.fn()
  }))
}))

vi.mock('../../security', () => ({
  SecurityService: vi.fn(() => ({
    logSecurityEvent: vi.fn()
  }))
}))

describe('YQLBuilder', () => {
  let yqlBuilder: YQLBuilder
  let metrics: MetricsService
  let security: SecurityService

  beforeEach(() => {
    metrics = new MetricsService()
    security = new SecurityService()
    yqlBuilder = new YQLBuilder(metrics, security)
  })

  describe('buildDeliveryMetricsQuery', () => {
    it('should build a valid delivery metrics query', () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: 'proj123',
        groupBy: ['status', 'provider'],
        filters: {
          status: ['delivered', 'bounced'],
          provider: ['sendgrid']
        }
      }

      const query = yqlBuilder.buildDeliveryMetricsQuery(params)

      expect(query).toContain('select')
      expect(query).toContain('from delivery_metrics')
      expect(query).toContain('where timestamp >= ')
      expect(query).toContain('and timestamp <= ')
      expect(query).toContain('and project_id = ')
      expect(query).toContain('group by')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_delivery_metrics',
        expect.any(Number)
      )
    })

    it('should handle invalid date formats', () => {
      const params = {
        startDate: 'invalid-date',
        endDate: '2024-01-31',
        projectId: 'proj123'
      }

      expect(() => yqlBuilder.buildDeliveryMetricsQuery(params))
        .toThrow('Invalid date format')
      expect(metrics.recordError).toHaveBeenCalled()
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'validation_error',
          details: expect.any(String)
        })
      )
    })

    it('should sanitize project ID', () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: "proj123'; drop table users; --"
      }

      const query = yqlBuilder.buildDeliveryMetricsQuery(params)

      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sanitization_applied',
          details: expect.any(String)
        })
      )
    })
  })

  describe('buildTimeSeriesQuery', () => {
    it('should build a valid time series query', () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'day',
        metrics: ['opens', 'clicks'],
        filters: {
          campaign_id: ['camp123']
        }
      }

      const query = yqlBuilder.buildTimeSeriesQuery(params)

      expect(query).toContain('select')
      expect(query).toContain('from events')
      expect(query).toContain('where timestamp >= ')
      expect(query).toContain('and timestamp <= ')
      expect(query).toContain('group by')
      expect(query).toContain('bucket(timestamp, ')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_time_series',
        expect.any(Number)
      )
    })

    it('should validate interval parameter', () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'invalid',
        metrics: ['opens']
      }

      expect(() => yqlBuilder.buildTimeSeriesQuery(params))
        .toThrow('Invalid interval')
      expect(metrics.recordError).toHaveBeenCalled()
    })

    it('should sanitize metric names', () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'day',
        metrics: ['opens; drop table users; --']
      }

      const query = yqlBuilder.buildTimeSeriesQuery(params)

      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalled()
    })
  })

  describe('buildAggregationQuery', () => {
    it('should build a valid aggregation query', () => {
      const params = {
        metric: 'opens',
        groupBy: ['campaign_id', 'email_client'],
        having: { min_count: 100 },
        filters: {
          date_range: { start: '2024-01-01', end: '2024-01-31' }
        }
      }

      const query = yqlBuilder.buildAggregationQuery(params)

      expect(query).toContain('select')
      expect(query).toContain('from events')
      expect(query).toContain('group by')
      expect(query).toContain('having')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_aggregation',
        expect.any(Number)
      )
    })

    it('should validate metric parameter', () => {
      const params = {
        metric: 'invalid_metric',
        groupBy: ['campaign_id']
      }

      expect(() => yqlBuilder.buildAggregationQuery(params))
        .toThrow('Invalid metric')
      expect(metrics.recordError).toHaveBeenCalled()
    })

    it('should sanitize having clause', () => {
      const params = {
        metric: 'opens',
        groupBy: ['campaign_id'],
        having: { 'count > 0; drop table users; --': 100 }
      }

      const query = yqlBuilder.buildAggregationQuery(params)

      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalled()
    })
  })

  describe('buildFunnelQuery', () => {
    it('should build a valid funnel query', () => {
      const params = {
        steps: [
          { event: 'email_delivered' },
          { event: 'email_opened' },
          { event: 'link_clicked' }
        ],
        timeWindow: '7d',
        filters: {
          campaign_id: ['camp123']
        }
      }

      const query = yqlBuilder.buildFunnelQuery(params)

      expect(query).toContain('select')
      expect(query).toContain('from events')
      expect(query).toContain('match')
      expect(query).toContain('within')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_funnel',
        expect.any(Number)
      )
    })

    it('should validate step events', () => {
      const params = {
        steps: [
          { event: 'invalid_event' }
        ],
        timeWindow: '7d'
      }

      expect(() => yqlBuilder.buildFunnelQuery(params))
        .toThrow('Invalid event type')
      expect(metrics.recordError).toHaveBeenCalled()
    })

    it('should sanitize time window', () => {
      const params = {
        steps: [
          { event: 'email_delivered' },
          { event: 'email_opened' }
        ],
        timeWindow: "7d; drop table users; --"
      }

      const query = yqlBuilder.buildFunnelQuery(params)

      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalled()
    })
  })

  describe('buildCohortQuery', () => {
    it('should build a valid cohort query', () => {
      const params = {
        cohortEvent: 'signup',
        returnEvent: 'purchase',
        timeWindow: '30d',
        groupBy: 'week',
        filters: {
          country: ['US', 'CA']
        }
      }

      const query = yqlBuilder.buildCohortQuery(params)

      expect(query).toContain('select')
      expect(query).toContain('from events')
      expect(query).toContain('match')
      expect(query).toContain('within')
      expect(query).toContain('group by')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_cohort',
        expect.any(Number)
      )
    })

    it('should validate event types', () => {
      const params = {
        cohortEvent: 'invalid_event',
        returnEvent: 'purchase',
        timeWindow: '30d'
      }

      expect(() => yqlBuilder.buildCohortQuery(params))
        .toThrow('Invalid event type')
      expect(metrics.recordError).toHaveBeenCalled()
    })

    it('should sanitize filter values', () => {
      const params = {
        cohortEvent: 'signup',
        returnEvent: 'purchase',
        timeWindow: '30d',
        filters: {
          country: ["US'; drop table users; --"]
        }
      }

      const query = yqlBuilder.buildCohortQuery(params)

      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalled()
    })
  })
}) 
import { YQLBuilder } from '../yql-builder'
import { VespaClient } from '../vespa'
import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

describe('Analytics Edge Cases', () => {
  let yqlBuilder: YQLBuilder
  let vespaClient: VespaClient
  let metrics: MetricsService
  let security: SecurityService

  beforeEach(() => {
    metrics = new MetricsService()
    security = new SecurityService()
    yqlBuilder = new YQLBuilder(metrics, security)
    vespaClient = new VespaClient({
      endpoint: 'http://localhost:8080',
      applicationName: 'test-app',
      tenant: 'test-tenant'
    }, metrics)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Large Dataset Handling', () => {
    it('should handle queries with large result sets', async () => {
      const query = yqlBuilder.buildDeliveryMetricsQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: 'proj123'
      })

      // Generate large mock response (100k records)
      const mockResponse = {
        data: {
          root: {
            children: Array(100000).fill(null).map((_, i) => ({
              fields: {
                id: `record_${i}`,
                timestamp: new Date(2024, 0, 1 + (i % 31)).toISOString(),
                type: i % 2 === 0 ? 'delivered' : 'opened',
                projectId: 'proj123'
              }
            }))
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children).toHaveLength(100000)
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'vespa_query_large_result',
        expect.any(Number)
      )
    })

    it('should handle pagination with large offsets', async () => {
      // Test querying page 1000 (high offset)
      const query = yqlBuilder.buildDeliveryMetricsQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: 'proj123',
        page: 1000,
        pageSize: 100
      })

      expect(query).toContain('offset 99900')
      expect(query).toContain('limit 100')

      // Mock response for high offset
      const mockResponse = {
        data: {
          root: {
            children: Array(100).fill(null).map((_, i) => ({
              fields: {
                id: `record_${99900 + i}`
              }
            }))
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children).toHaveLength(100)
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'vespa_query_high_offset',
        expect.any(Number)
      )
    })
  })

  describe('Complex Aggregations', () => {
    it('should handle multi-level grouping with complex metrics', async () => {
      const query = yqlBuilder.buildAggregationQuery({
        metric: 'delivery_time',
        groupBy: ['provider', 'status', 'campaign_type'],
        having: {
          min_count: 1000,
          avg_time: { gt: 100 }
        },
        aggregations: [
          { type: 'count', alias: 'total' },
          { type: 'avg', field: 'delivery_time', alias: 'avg_time' },
          { type: 'percentile', field: 'delivery_time', value: 95, alias: 'p95' },
          { type: 'stddev', field: 'delivery_time', alias: 'std_dev' }
        ]
      })

      expect(query).toContain('group by provider, status, campaign_type')
      expect(query).toContain('avg(delivery_time)')
      expect(query).toContain('percentile(delivery_time, 95)')
      expect(query).toContain('stddev(delivery_time)')

      const mockResponse = {
        data: {
          root: {
            children: [
              {
                fields: {
                  provider: 'sendgrid',
                  status: 'delivered',
                  campaign_type: 'marketing',
                  total: 1500,
                  avg_time: 150,
                  p95: 250,
                  std_dev: 45
                }
              }
            ]
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children[0].fields).toHaveProperty('p95')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'vespa_query_complex_agg',
        expect.any(Number)
      )
    })

    it('should handle nested aggregations with window functions', async () => {
      const query = yqlBuilder.buildTimeSeriesQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'hour',
        metrics: ['opens'],
        windows: [
          { type: 'rolling', period: '24h', metrics: ['sum', 'avg'] },
          { type: 'cumulative', metrics: ['sum'] }
        ]
      })

      expect(query).toContain('sum(opens) over (order by timestamp rows 24 preceding)')
      expect(query).toContain('sum(opens) over (order by timestamp rows unbounded preceding)')

      const mockResponse = {
        data: {
          root: {
            children: Array(24).fill(null).map((_, i) => ({
              fields: {
                timestamp: new Date(2024, 0, 1, i).toISOString(),
                opens: i * 10,
                opens_24h_sum: i * 100,
                opens_24h_avg: i * 10,
                opens_cumulative: i * i * 10
              }
            }))
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children[0].fields).toHaveProperty('opens_24h_sum')
      expect(result.data.root.children[0].fields).toHaveProperty('opens_cumulative')
    })
  })

  describe('Time Zone Edge Cases', () => {
    it('should handle queries across DST transitions', async () => {
      // Test period spanning US DST transition
      const query = yqlBuilder.buildTimeSeriesQuery({
        startDate: '2024-03-09', // Day before DST starts
        endDate: '2024-03-11',   // Day after DST starts
        interval: 'hour',
        metrics: ['opens'],
        timezone: 'America/New_York'
      })

      expect(query).toContain('timestamp_trunc(timestamp, "hour", "America/New_York")')

      const mockResponse = {
        data: {
          root: {
            children: Array(47).fill(null).map((_, i) => ({
              fields: {
                timestamp: new Date(2024, 2, 9 + Math.floor(i / 24), i % 24).toISOString(),
                opens: i * 10
              }
            }))
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children).toHaveLength(47) // 24 + 23 + 24 hours
    })

    it('should handle queries with different time zones', async () => {
      const timeZones = [
        'UTC',
        'America/New_York',
        'Asia/Tokyo',
        'Australia/Sydney',
        'Europe/London'
      ]

      for (const timezone of timeZones) {
        const query = yqlBuilder.buildTimeSeriesQuery({
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          interval: 'hour',
          metrics: ['opens'],
          timezone
        })

        expect(query).toContain(`timestamp_trunc(timestamp, "hour", "${timezone}")`)

        const mockResponse = {
          data: {
            root: {
              children: Array(24).fill(null).map((_, i) => ({
                fields: {
                  timestamp: new Date(2024, 0, 1, i).toISOString(),
                  opens: i * 10
                }
              }))
            }
          }
        }

        vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

        const result = await vespaClient.query(query)
        expect(result.data.root.children).toHaveLength(24)
      }
    })
  })

  describe('Data Quality Edge Cases', () => {
    it('should handle missing or null values in aggregations', async () => {
      const query = yqlBuilder.buildAggregationQuery({
        metric: 'delivery_time',
        groupBy: ['provider'],
        aggregations: [
          { type: 'count', alias: 'total' },
          { type: 'avg', field: 'delivery_time', alias: 'avg_time' },
          { type: 'min', field: 'delivery_time', alias: 'min_time' },
          { type: 'max', field: 'delivery_time', alias: 'max_time' }
        ]
      })

      const mockResponse = {
        data: {
          root: {
            children: [
              {
                fields: {
                  provider: 'sendgrid',
                  total: 1000,
                  avg_time: null,
                  min_time: null,
                  max_time: null
                }
              }
            ]
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result.data.root.children[0].fields.avg_time).toBeNull()
      expect(metrics.recordError).toHaveBeenCalledWith(
        'vespa_query_null_metrics',
        expect.any(Object)
      )
    })

    it('should handle malformed timestamps and data anomalies', async () => {
      const query = yqlBuilder.buildTimeSeriesQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        interval: 'hour',
        metrics: ['opens']
      })

      const mockResponse = {
        data: {
          root: {
            children: [
              {
                fields: {
                  timestamp: 'invalid_date',
                  opens: -1
                }
              },
              {
                fields: {
                  timestamp: '2024-01-01T25:00:00Z', // Invalid hour
                  opens: Number.MAX_SAFE_INTEGER + 1
                }
              },
              {
                fields: {
                  timestamp: null,
                  opens: NaN
                }
              }
            ]
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'data_anomaly_detected'
        })
      )
      expect(metrics.recordError).toHaveBeenCalledWith(
        'vespa_query_data_anomaly',
        expect.any(Object)
      )
    })
  })

  describe('Query Optimization Edge Cases', () => {
    it('should handle queries with many grouping combinations', async () => {
      // Generate query with 10 group by fields (2^10 possible combinations)
      const groupByFields = Array(10).fill(null).map((_, i) => `field_${i}`)
      
      const query = yqlBuilder.buildAggregationQuery({
        metric: 'count',
        groupBy: groupByFields
      })

      expect(query).toContain(groupByFields.join(', '))
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'complex_query_detected',
          details: 'high_cardinality_grouping'
        })
      )
    })

    it('should handle queries with deep subqueries', async () => {
      const query = yqlBuilder.buildFunnelQuery({
        steps: [
          {
            event: 'email_delivered',
            conditions: {
              provider: ['sendgrid'],
              campaign_type: ['marketing']
            }
          },
          {
            event: 'email_opened',
            conditions: {
              device_type: ['mobile'],
              country: ['US', 'CA']
            }
          },
          {
            event: 'link_clicked',
            conditions: {
              url_domain: ['example.com'],
              utm_source: ['newsletter']
            }
          }
        ],
        timeWindow: '7d',
        groupBy: ['campaign_id', 'segment_id']
      })

      expect(query).toContain('select * from (select * from (select')
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'complex_query_detected',
          details: 'deep_subqueries'
        })
      )
    })
  })
}) 
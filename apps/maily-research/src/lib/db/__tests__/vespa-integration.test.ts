import { YQLBuilder } from '../yql-builder'
import { VespaClient } from '../vespa'
import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios')

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

describe('Vespa Integration Tests', () => {
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

  describe('Query Execution Flow', () => {
    it('should execute delivery metrics query successfully', async () => {
      // 1. Build query
      const queryParams = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: 'proj123',
        groupBy: ['status', 'provider'],
        filters: {
          status: ['delivered', 'bounced'],
          provider: ['sendgrid']
        }
      }

      const query = yqlBuilder.buildDeliveryMetricsQuery(queryParams)
      expect(query).toContain('select')
      expect(query).toContain('from delivery_metrics')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'yql_build_delivery_metrics',
        expect.any(Number)
      )

      // 2. Execute query
      const mockResponse = {
        data: {
          root: {
            children: [
              {
                fields: {
                  status: 'delivered',
                  provider: 'sendgrid',
                  count: 1000
                }
              }
            ]
          }
        }
      }

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await vespaClient.query(query)
      expect(result).toEqual(mockResponse)
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'vespa_query',
        expect.any(Number)
      )
    })

    it('should handle query execution errors', async () => {
      // 1. Build query with potential injection
      const queryParams = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: "proj123'; drop table users; --"
      }

      // Query should be sanitized
      const query = yqlBuilder.buildDeliveryMetricsQuery(queryParams)
      expect(query).not.toContain(';')
      expect(query).not.toContain('--')
      expect(security.logSecurityEvent).toHaveBeenCalled()

      // 2. Execute query with error
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Query execution failed'))

      await expect(vespaClient.query(query)).rejects.toThrow('Query execution failed')
      expect(metrics.recordError).toHaveBeenCalled()
    })

    it('should handle concurrent queries', async () => {
      // 1. Build multiple queries
      const queries = [
        {
          type: 'timeSeries',
          params: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            interval: 'day',
            metrics: ['opens', 'clicks']
          }
        },
        {
          type: 'aggregation',
          params: {
            metric: 'opens',
            groupBy: ['campaign_id'],
            having: { min_count: 100 }
          }
        },
        {
          type: 'funnel',
          params: {
            steps: [
              { event: 'email_delivered' },
              { event: 'email_opened' }
            ],
            timeWindow: '7d'
          }
        }
      ]

      const builtQueries = queries.map(q => {
        switch (q.type) {
          case 'timeSeries':
            return yqlBuilder.buildTimeSeriesQuery(q.params)
          case 'aggregation':
            return yqlBuilder.buildAggregationQuery(q.params)
          case 'funnel':
            return yqlBuilder.buildFunnelQuery(q.params)
        }
      })

      expect(builtQueries).toHaveLength(queries.length)
      expect(metrics.recordLatency).toHaveBeenCalledTimes(queries.length)

      // 2. Execute queries concurrently
      const mockResponses = builtQueries.map((_, i) => ({
        data: { root: { children: [{ id: `result${i}` }] } }
      }))

      vi.mocked(axios.post)
        .mockResolvedValueOnce({ data: mockResponses[0] })
        .mockResolvedValueOnce({ data: mockResponses[1] })
        .mockResolvedValueOnce({ data: mockResponses[2] })

      const results = await Promise.all(
        builtQueries.map(q => vespaClient.query(q))
      )

      expect(results).toHaveLength(queries.length)
      expect(metrics.recordLatency).toHaveBeenCalledTimes(queries.length * 2) // Build + Execute
    })
  })

  describe('Document Operations', () => {
    it('should handle document feed operations', async () => {
      const documents = [
        {
          id: 'doc1',
          fields: {
            title: 'Test Document 1',
            content: 'Content 1'
          }
        },
        {
          id: 'doc2',
          fields: {
            title: 'Test Document 2',
            content: 'Content 2'
          }
        }
      ]

      // Mock successful feed
      vi.mocked(axios.post)
        .mockResolvedValueOnce({ data: { id: 'doc1', status: 'ok' } })
        .mockResolvedValueOnce({ data: { id: 'doc2', status: 'ok' } })

      const results = await Promise.all(
        documents.map(doc => vespaClient.feed(doc))
      )

      expect(results).toHaveLength(documents.length)
      expect(results.every(r => r.status === 'ok')).toBe(true)
      expect(metrics.incrementCounter).toHaveBeenCalledTimes(documents.length)
    })

    it('should handle feed errors with retries', async () => {
      const document = {
        id: 'doc1',
        fields: {
          title: 'Test Document',
          content: 'Content'
        }
      }

      // Mock feed with temporary error then success
      vi.mocked(axios.post)
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ data: { id: 'doc1', status: 'ok' } })

      const result = await vespaClient.feed(document)
      expect(result.status).toBe('ok')
      expect(metrics.recordError).toHaveBeenCalledTimes(1)
      expect(metrics.incrementCounter).toHaveBeenCalledWith('vespa_feed_retry')
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle connection errors', async () => {
      const query = yqlBuilder.buildDeliveryMetricsQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        projectId: 'proj123'
      })

      // Mock connection error
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('ECONNREFUSED'))

      await expect(vespaClient.query(query)).rejects.toThrow('ECONNREFUSED')
      expect(metrics.recordError).toHaveBeenCalledWith(
        'vespa_query_error',
        expect.any(Error)
      )
    })

    it('should handle rate limiting', async () => {
      const query = yqlBuilder.buildTimeSeriesQuery({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'day',
        metrics: ['opens']
      })

      // Mock rate limit response
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      })

      await expect(vespaClient.query(query)).rejects.toThrow('Rate limit exceeded')
      expect(metrics.recordError).toHaveBeenCalledWith(
        'vespa_rate_limit',
        expect.any(Error)
      )
    })

    it('should handle malformed query errors', async () => {
      // Attempt to build query with invalid parameters
      expect(() => yqlBuilder.buildAggregationQuery({
        metric: 'invalid_metric',
        groupBy: []
      })).toThrow('Invalid metric')

      expect(metrics.recordError).toHaveBeenCalled()
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'validation_error'
        })
      )
    })
  })
}) 
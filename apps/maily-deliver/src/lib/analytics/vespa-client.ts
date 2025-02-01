import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import { backOff } from 'exponential-backoff'
import pLimit from 'p-limit'
import { z } from 'zod'

import { MetricsService } from '../monitoring'
import { SecurityService } from '../security'

// Validation schemas
const vespaConfigSchema = z.object({
  endpoint: z.string().url(),
  maxConnections: z.number().int().positive().default(10),
  timeout: z.number().int().positive().default(5000),
  retries: z.number().int().nonnegative().default(3),
  retryDelay: z.number().int().positive().default(1000),
})

const vespaQuerySchema = z.object({
  yql: z.string(),
  hits: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  timeout: z.string().optional(),
})

export type VespaConfig = z.infer<typeof vespaConfigSchema>
export type VespaQuery = z.infer<typeof vespaQuerySchema>

export interface VespaResult<T = unknown> {
  totalCount: number
  hits: Array<{
    id: string
    relevance: number
    source: string
    fields: T
  }>
}

export interface VespaDocument {
  id: string
  type: string
  fields: Record<string, unknown>
}

export class VespaClient {
  private client: AxiosInstance
  private readonly concurrencyLimit: pLimit.Limit
  private readonly connectionPool: Set<AxiosInstance>
  private readonly idleConnections: AxiosInstance[]
  private readonly config: VespaConfig

  constructor(
    config: VespaConfig,
    private readonly metrics: MetricsService,
    private readonly security: SecurityService
  ) {
    this.config = vespaConfigSchema.parse(config)
    this.connectionPool = new Set()
    this.idleConnections = []
    this.concurrencyLimit = pLimit(this.config.maxConnections)
    this.initializeConnectionPool()
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.endpoint,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        this.metrics.increment('vespa.requests.total')
        return config
      },
      (error: unknown) => {
        if (error instanceof Error) {
          this.metrics.increment('vespa.requests.error')
        }
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.metrics.increment('vespa.responses.success')
        return response
      },
      (error: unknown) => {
        if (error instanceof Error) {
          this.metrics.increment('vespa.responses.error')
        }
        return Promise.reject(error)
      }
    )

    return instance
  }

  private initializeConnectionPool(): void {
    for (let i = 0; i < this.config.maxConnections; i++) {
      const connection = this.createAxiosInstance()
      this.connectionPool.add(connection)
      this.idleConnections.push(connection)
    }
  }

  private async getConnection(): Promise<AxiosInstance> {
    let connection = this.idleConnections.pop()
    if (!connection) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      connection = this.idleConnections.pop()
    }
    if (!connection) {
      throw new Error('No available connections in the pool')
    }
    return connection
  }

  private releaseConnection(connection: AxiosInstance): void {
    if (this.connectionPool.has(connection)) {
      this.idleConnections.push(connection)
    }
  }

  async query<T = unknown>(query: string | VespaQuery): Promise<VespaResult<T>> {
    const parsedQuery = typeof query === 'string' ? { yql: query } : query
    const validatedQuery = vespaQuerySchema.parse(parsedQuery)

    try {
      const connection = await this.getConnection()
      try {
        const response = await backOff(
          () => connection.post<VespaResult<T>>('/search/', validatedQuery),
          {
            numOfAttempts: this.config.retries,
            startingDelay: this.config.retryDelay,
          }
        )
        this.releaseConnection(connection)
        return response.data
      } catch (error) {
        this.releaseConnection(connection)
        if (error instanceof AxiosError) {
          this.metrics.increment('vespa.query.error')
          throw new Error(`Vespa query failed: ${error.message}`)
        }
        throw error
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.metrics.increment('vespa.query.error')
        throw new Error(`Vespa query failed: ${error.message}`)
      }
      if (error instanceof Error) {
        throw new Error(`Vespa query failed: ${error.message}`)
      }
      throw new Error('Vespa query failed with an unknown error')
    }
  }

  async feed(documents: VespaDocument[]): Promise<void> {
    const startTime = Date.now()
    const batchId = Math.random().toString(36).substring(7)

    try {
      // Process documents in parallel with concurrency limit
      await Promise.all(
        documents.map(doc =>
          this.concurrencyLimit(() =>
            backOff(
              async () => {
                const connection = await this.getConnection()
                try {
                  await connection.post('/document/v1/', doc)
                } finally {
                  this.releaseConnection(connection)
                }
              },
              {
                numOfAttempts: this.config.retries,
                startingDelay: this.config.retryDelay,
                timeMultiple: 2,
                maxDelay: 10000,
              }
            )
          )
        )
      )

      // Record metrics
      this.metrics.recordLatency('vespa_feed_duration', Date.now() - startTime)
      this.metrics.incrementCounter('vespa_feed_success', documents.length)
    } catch (error) {
      this.metrics.recordError('vespa_feed_error', error.message, {
        batch_id: batchId,
        document_count: documents.length,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    const startTime = Date.now()

    try {
      await this.concurrencyLimit(() =>
        backOff(
          async () => {
            const connection = await this.getConnection()
            try {
              await connection.delete(`/document/v1/${collection}/docid/${id}`)
            } finally {
              this.releaseConnection(connection)
            }
          },
          {
            numOfAttempts: this.config.retries,
            startingDelay: this.config.retryDelay,
            timeMultiple: 2,
            maxDelay: 10000,
          }
        )
      )

      // Record metrics
      this.metrics.recordLatency('vespa_delete_duration', Date.now() - startTime)
      this.metrics.incrementCounter('vespa_delete_success')
    } catch (error) {
      this.metrics.recordError('vespa_delete_error', error.message, {
        collection,
        document_id: id,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  async optimize(collection: string): Promise<void> {
    const startTime = Date.now()

    try {
      await this.concurrencyLimit(() =>
        backOff(
          async () => {
            const connection = await this.getConnection()
            try {
              await connection.post(`/document/v1/${collection}/optimize`)
            } finally {
              this.releaseConnection(connection)
            }
          },
          {
            numOfAttempts: this.config.retries,
            startingDelay: this.config.retryDelay,
            timeMultiple: 2,
            maxDelay: 10000,
          }
        )
      )

      // Record metrics
      this.metrics.recordLatency('vespa_optimize_duration', Date.now() - startTime)
      this.metrics.incrementCounter('vespa_optimize_success')
    } catch (error) {
      this.metrics.recordError('vespa_optimize_error', error.message, {
        collection,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  private transformHit(hit: any) {
    return {
      id: hit.id,
      relevance: hit.relevance,
      source: hit.source,
      fields: hit.fields
    }
  }

  private isSensitiveQuery(yql: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /credit.?card/i,
      /ssn/i,
      /social.?security/i,
      /bank.?account/i,
    ]
    return sensitivePatterns.some(pattern => pattern.test(yql))
  }

  // Cleanup method to be called when shutting down
  async cleanup(): Promise<void> {
    for (const connection of this.connectionPool) {
      if (connection) {
        connection.interceptors.request.eject(0)
        connection.interceptors.response.eject(0)
      }
    }
    this.connectionPool.clear()
    this.idleConnections.length = 0
  }
} 
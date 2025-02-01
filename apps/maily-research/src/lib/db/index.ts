import { createClient, SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import { VespaClient } from '@vespa/client'
import { withErrorHandling } from '../errors'
import { config } from '@/api/config'
import type { Database } from '@/types/supabase'
import { YQLBuilder } from './yql-builder'
import { z } from 'zod'
import { MetricsService } from '../monitoring'
import { Pool } from 'pg'

// Initialize metrics
const metrics = new MetricsService()

// Create connection pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_POSTGRES_URL,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Monitor pool events
pool.on('connect', () => {
  metrics.incrementCounter('db_pool_connection')
})

pool.on('error', (err) => {
  metrics.recordError('db_pool_error', err.message)
})

pool.on('remove', () => {
  metrics.incrementCounter('db_pool_remove')
})

// Create database clients
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: true,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 1000),
  },
})

const vespa = new VespaClient({
  endpoint: process.env.VESPA_ENDPOINT!,
  apiKey: process.env.VESPA_API_KEY!,
})

const yqlBuilder = new YQLBuilder()

// Database operation options with performance settings
interface DBOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  useCache?: boolean
  cacheTTL?: number
  useReadReplica?: boolean
  batchSize?: number
  priority?: 'high' | 'normal' | 'low'
}

// Enhanced database wrapper with performance monitoring
const withDB = async <T>(
  operation: () => Promise<T>,
  options: DBOptions = {}
): Promise<T> => {
  const startTime = Date.now()
  const operationId = Math.random().toString(36).substring(7)

  try {
    // Start transaction if needed
    const client = await pool.connect()
    
    try {
      // Set statement timeout
      if (options.timeout) {
        await client.query(`SET statement_timeout TO ${options.timeout}`)
      }

      // Set transaction priority
      if (options.priority === 'high') {
        await client.query('SET transaction_priority TO "high"')
      }

      // Execute operation with retry logic
      const result = await withErrorHandling(operation(), options)

      // Record metrics
      metrics.recordLatency('db_operation_duration', Date.now() - startTime, {
        operation_id: operationId,
        priority: options.priority || 'normal',
      })

      return result
    } finally {
      client.release()
    }
  } catch (error) {
    metrics.recordError('db_operation_error', error.message, {
      operation_id: operationId,
      duration: Date.now() - startTime,
    })
    throw error
  }
}

// Optimized query builder with performance considerations
const createQueryBuilder = <T extends Record<string, any>>(
  table: string,
  options: DBOptions = {}
): PostgrestFilterBuilder<Database['public']['Tables'][typeof table]> => {
  const builder = supabase.from(table)

  // Apply performance hints
  if (options.useReadReplica) {
    builder.headers.append('x-use-read-replica', 'true')
  }

  // Apply row limit for pagination
  if (options.batchSize) {
    builder.limit(options.batchSize)
  }

  return builder
}

// Database operations with performance optimizations
export const db = {
  // Company operations
  companies: {
    async create(data: any) {
      return withDB(async () => {
        const { data: company, error } = await createQueryBuilder('companies')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return company
      })
    },

    async update(id: string, data: any) {
      return withDB(async () => {
        const { data: company, error } = await createQueryBuilder('companies')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return company
      })
    },

    async delete(id: string) {
      return withDB(async () => {
        const { error } = await createQueryBuilder('companies')
          .delete()
          .eq('id', id)

        if (error) throw error
      })
    },

    async getById(id: string, options: DBOptions = {}) {
      return withDB(async () => {
        const { data: company, error } = await createQueryBuilder('companies', options)
          .select()
          .eq('id', id)
          .single()

        if (error) throw error
        return company
      }, options)
    },

    async getByDomain(domain: string, options: DBOptions = {}) {
      return withDB(async () => {
        const { data: company, error } = await createQueryBuilder('companies', options)
          .select()
          .eq('domain', domain)
          .single()

        if (error) throw error
        return company
      }, options)
    },
  },

  // Contact operations
  contacts: {
    async create(data: any) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return contact
      })
    },

    async update(id: string, data: any) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return contact
      })
    },

    async delete(id: string) {
      return withDB(async () => {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)

        if (error) throw error
      })
    },

    async getById(id: string, options: DBOptions = {}) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .select()
          .eq('id', id)
          .single()

        if (error) throw error
        return contact
      }, options)
    },

    async getByEmail(email: string, options: DBOptions = {}) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .select()
          .eq('email', email)
          .single()

        if (error) throw error
        return contact
      }, options)
    },
  },

  // Enrichment operations
  enrichment: {
    async create(data: any) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return enrichment
      })
    },

    async update(id: string, data: any) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return enrichment
      })
    },

    async getByUrl(url: string, options: DBOptions = {}) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .select()
          .eq('url', url)
          .single()

        if (error) throw error
        return enrichment
      }, options)
    },
  },
}

// Cache operations with performance optimizations
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()
    try {
      const value = await withDB(async () => {
        return redis.get<T>(key)
      })

      metrics.recordLatency('cache_get', Date.now() - startTime)
      metrics.incrementCounter('cache_get_total')
      
      if (value !== null) {
        metrics.incrementCounter('cache_hit')
      } else {
        metrics.incrementCounter('cache_miss')
      }

      return value
    } catch (error) {
      metrics.recordError('cache_get_error', error.message)
      throw error
    }
  },

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const startTime = Date.now()
    try {
      const values = await withDB(async () => {
        return redis.mget<T>(...keys)
      })

      metrics.recordLatency('cache_mget', Date.now() - startTime)
      metrics.incrementCounter('cache_mget_total')
      
      const hits = values.filter(v => v !== null).length
      metrics.incrementCounter('cache_hit', hits)
      metrics.incrementCounter('cache_miss', values.length - hits)

      return values
    } catch (error) {
      metrics.recordError('cache_mget_error', error.message)
      throw error
    }
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now()
    try {
      await withDB(async () => {
        const options: any = {}
        if (ttl) {
          options.ex = ttl
        }

        // Compress large values
        const serializedValue = JSON.stringify(value)
        if (serializedValue.length > 1024) {
          options.compression = true
        }

        await redis.set(key, value, options)
      })

      metrics.recordLatency('cache_set', Date.now() - startTime)
      metrics.incrementCounter('cache_set_total')
    } catch (error) {
      metrics.recordError('cache_set_error', error.message)
      throw error
    }
  },

  async mset<T>(entries: Array<[string, T]>, ttl?: number): Promise<void> {
    const startTime = Date.now()
    try {
      await withDB(async () => {
        const pipeline = redis.pipeline()
        
        for (const [key, value] of entries) {
          const options: any = {}
          if (ttl) {
            options.ex = ttl
          }

          // Compress large values
          const serializedValue = JSON.stringify(value)
          if (serializedValue.length > 1024) {
            options.compression = true
          }

          pipeline.set(key, value, options)
        }

        await pipeline.exec()
      })

      metrics.recordLatency('cache_mset', Date.now() - startTime)
      metrics.incrementCounter('cache_mset_total')
    } catch (error) {
      metrics.recordError('cache_mset_error', error.message)
      throw error
    }
  },

  async delete(key: string): Promise<void> {
    const startTime = Date.now()
    try {
      await withDB(async () => {
        await redis.del(key)
      })

      metrics.recordLatency('cache_delete', Date.now() - startTime)
      metrics.incrementCounter('cache_delete_total')
    } catch (error) {
      metrics.recordError('cache_delete_error', error.message)
      throw error
    }
  },

  async mdelete(keys: string[]): Promise<void> {
    const startTime = Date.now()
    try {
      await withDB(async () => {
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      })

      metrics.recordLatency('cache_mdelete', Date.now() - startTime)
      metrics.incrementCounter('cache_mdelete_total')
    } catch (error) {
      metrics.recordError('cache_mdelete_error', error.message)
      throw error
    }
  },

  async increment(key: string, value = 1): Promise<number> {
    const startTime = Date.now()
    try {
      const result = await withDB(async () => {
        return redis.incr(key)
      })

      metrics.recordLatency('cache_increment', Date.now() - startTime)
      metrics.incrementCounter('cache_increment_total')

      return result
    } catch (error) {
      metrics.recordError('cache_increment_error', error.message)
      throw error
    }
  },

  async expire(key: string, ttl: number): Promise<boolean> {
    const startTime = Date.now()
    try {
      const result = await withDB(async () => {
        return redis.expire(key, ttl)
      })

      metrics.recordLatency('cache_expire', Date.now() - startTime)
      metrics.incrementCounter('cache_expire_total')

      return result
    } catch (error) {
      metrics.recordError('cache_expire_error', error.message)
      throw error
    }
  },

  // Batch operations helper
  batch() {
    const pipeline = redis.pipeline()
    let operationCount = 0

    return {
      set<T>(key: string, value: T, ttl?: number) {
        const options: any = {}
        if (ttl) {
          options.ex = ttl
        }

        const serializedValue = JSON.stringify(value)
        if (serializedValue.length > 1024) {
          options.compression = true
        }

        pipeline.set(key, value, options)
        operationCount++
      },

      delete(key: string) {
        pipeline.del(key)
        operationCount++
      },

      increment(key: string, value = 1) {
        pipeline.incrby(key, value)
        operationCount++
      },

      async exec() {
        const startTime = Date.now()
        try {
          const results = await pipeline.exec()
          
          metrics.recordLatency('cache_batch', Date.now() - startTime)
          metrics.incrementCounter('cache_batch_operations', operationCount)
          
          return results
        } catch (error) {
          metrics.recordError('cache_batch_error', error.message)
          throw error
        }
      }
    }
  }
}

// Search operations with performance optimizations
export const search = {
  async index(collection: string, document: Record<string, any>): Promise<void> {
    const startTime = Date.now()
    const documentId = document.id || Math.random().toString(36).substring(7)
    
    try {
      await withDB(async () => {
        // Validate collection name
        if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
          throw new Error('Invalid collection name')
        }

        // Validate and sanitize document
        const sanitizedDoc = {
          ...document,
          id: documentId,
          _timestamp: Date.now(),
          _collection: collection
        }

        await vespa.index(collection, sanitizedDoc)
      })

      metrics.recordLatency('vespa_index', Date.now() - startTime)
      metrics.incrementCounter('vespa_index_total')
    } catch (error) {
      metrics.recordError('vespa_index_error', error.message, {
        collection,
        document_id: documentId
      })
      throw error
    }
  },

  async search(
    collection: string,
    options: z.infer<typeof searchOptionsSchema>
  ) {
    const startTime = Date.now()
    const queryId = Math.random().toString(36).substring(7)

    try {
      // Generate cache key
      const cacheKey = `vespa:${collection}:${JSON.stringify(options)}`

      // Try to get from cache first
      const cachedResult = await cache.get(cacheKey)
      if (cachedResult) {
        metrics.incrementCounter('vespa_query_cache_hit')
        return cachedResult
      }

      metrics.incrementCounter('vespa_query_cache_miss')

      // Execute search
      const result = await withDB(async () => {
        // Validate collection name
        if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
          throw new Error('Invalid collection name')
        }

        // Validate and build secure YQL query
        const validatedOptions = searchOptionsSchema.parse(options)
        const yql = yqlBuilder.buildQuery(collection, validatedOptions)

        // Add performance hints
        const queryOptions = {
          timeout: '10s',
          ranking: validatedOptions.orderBy ? 'custom' : 'default',
          trace: {
            level: 1,
            timestamps: true
          }
        }

        // Execute query
        const searchResult = await vespa.search(collection, {
          yql,
          ...queryOptions
        })

        // Cache successful results
        if (searchResult.totalCount > 0) {
          await cache.set(cacheKey, searchResult, 300) // Cache for 5 minutes
        }

        return searchResult
      })

      // Record metrics
      metrics.recordLatency('vespa_query', Date.now() - startTime)
      metrics.incrementCounter('vespa_query_total')
      metrics.recordHistogram('vespa_query_hits', result.totalCount)

      return result
    } catch (error) {
      metrics.recordError('vespa_query_error', error.message, {
        collection,
        query_id: queryId,
        duration: Date.now() - startTime
      })
      throw error
    }
  },

  async delete(collection: string, id: string): Promise<void> {
    const startTime = Date.now()
    
    try {
      await withDB(async () => {
        // Validate collection name and ID
        if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
          throw new Error('Invalid collection name')
        }
        if (!id) {
          throw new Error('Document ID is required')
        }

        await vespa.delete(collection, id)

        // Invalidate related caches
        const cachePattern = `vespa:${collection}:*`
        const keys = await redis.keys(cachePattern)
        if (keys.length > 0) {
          await cache.mdelete(keys)
        }
      })

      metrics.recordLatency('vespa_delete', Date.now() - startTime)
      metrics.incrementCounter('vespa_delete_total')
    } catch (error) {
      metrics.recordError('vespa_delete_error', error.message, {
        collection,
        document_id: id
      })
      throw error
    }
  },

  async bulkIndex(
    collection: string,
    documents: Record<string, any>[],
    options: { batchSize?: number } = {}
  ): Promise<void> {
    const startTime = Date.now()
    const batchSize = options.batchSize || 100
    
    try {
      // Process in batches
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize)
        const batchStartTime = Date.now()

        await withDB(async () => {
          // Validate collection name
          if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
            throw new Error('Invalid collection name')
          }

          // Prepare batch
          const sanitizedBatch = batch.map(doc => ({
            ...doc,
            id: doc.id || Math.random().toString(36).substring(7),
            _timestamp: Date.now(),
            _collection: collection
          }))

          // Index batch
          await vespa.feed(sanitizedBatch)
        })

        metrics.recordLatency('vespa_bulk_index_batch', Date.now() - batchStartTime)
        metrics.incrementCounter('vespa_bulk_index_documents', batch.length)
      }

      metrics.recordLatency('vespa_bulk_index_total', Date.now() - startTime)
      metrics.incrementCounter('vespa_bulk_index_batches')
    } catch (error) {
      metrics.recordError('vespa_bulk_index_error', error.message, {
        collection,
        document_count: documents.length
      })
      throw error
    }
  },

  async optimize(collection: string): Promise<void> {
    const startTime = Date.now()
    
    try {
      await withDB(async () => {
        // Validate collection name
        if (!/^[a-zA-Z0-9_-]+$/.test(collection)) {
          throw new Error('Invalid collection name')
        }

        // Trigger Vespa optimization
        await vespa.optimize(collection)
      })

      metrics.recordLatency('vespa_optimize', Date.now() - startTime)
      metrics.incrementCounter('vespa_optimize_total')
    } catch (error) {
      metrics.recordError('vespa_optimize_error', error.message, {
        collection
      })
      throw error
    }
  }
} 
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'

import { withErrorHandling } from './errors'
import { logger, trackError } from './monitoring'
import { config } from '../api/config'
import type { Message, MessageResponse, DeliveryMetrics } from '../types'
import type { Database } from '../types/supabase'

// Initialize Supabase client
const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceKey
)

// Initialize Redis client
const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

// Cache key prefixes
const CACHE_KEYS = {
  MESSAGE: 'message:',
  METRICS: 'metrics:',
  RATE_LIMIT: 'rate-limit:',
} as const

// Cache TTL values (in seconds)
const CACHE_TTL = {
  MESSAGE: 60 * 60 * 24, // 24 hours
  METRICS: 60 * 5, // 5 minutes
  RATE_LIMIT: 60, // 1 minute
} as const

// Database operations
export const db = {
  messages: {
    create: async (message: Message): Promise<MessageResponse> => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          to: message.to,
          cc: message.cc,
          bcc: message.bcc,
          from: message.from,
          sender: message.sender,
          subject: message.subject,
          html_body: message.htmlBody,
          plain_body: message.plainBody,
          attachments: message.attachments,
          headers: message.headers,
          track_opens: message.trackOpens,
          track_clicks: message.trackClicks,
          tag: message.tag,
          metadata: message.metadata,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id,
        messageId: data.message_id,
        status: data.status,
        timestamp: data.created_at,
      }
    },

    update: async (id: string, status: string): Promise<void> => {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', id)

      if (error) {
        throw error
      }
    },

    getById: async (id: string): Promise<MessageResponse> => {
      // Try cache first
      const cached = await cache.get<MessageResponse>(`${CACHE_KEYS.MESSAGE}${id}`)
      if (cached) {
        return cached
      }

      const { data, error } = await supabase
        .from('messages')
        .select()
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      const response = {
        id: data.id,
        messageId: data.message_id,
        status: data.status,
        timestamp: data.created_at,
      }

      // Cache the response
      await cache.set(`${CACHE_KEYS.MESSAGE}${id}`, response, CACHE_TTL.MESSAGE)

      return response
    },
  },

  metrics: {
    increment: async (
      metric: keyof DeliveryMetrics,
      tag?: string
    ): Promise<void> => {
      const { error } = await supabase.rpc('increment_metric', {
        metric_name: metric,
        metric_tag: tag,
      })

      if (error) {
        throw error
      }

      // Invalidate metrics cache
      if (tag) {
        await cache.delete(`${CACHE_KEYS.METRICS}${tag}`)
      }
      await cache.delete(CACHE_KEYS.METRICS)
    },

    get: async (
      timeRange: { start: Date; end: Date },
      tag?: string
    ): Promise<DeliveryMetrics> => {
      const cacheKey = tag
        ? `${CACHE_KEYS.METRICS}${tag}`
        : CACHE_KEYS.METRICS

      // Try cache first
      const cached = await cache.get<DeliveryMetrics>(cacheKey)
      if (cached) {
        return cached
      }

      const { data, error } = await supabase
        .from('metrics')
        .select()
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString())
        .eq('tag', tag)
        .single()

      if (error) {
        throw error
      }

      const metrics = {
        sent: data.sent,
        delivered: data.delivered,
        failed: data.failed,
        bounced: data.bounced,
        complained: data.complained,
        opens: data.opens,
        clicks: data.clicks,
        unsubscribes: data.unsubscribes,
      }

      // Cache the metrics
      await cache.set(cacheKey, metrics, CACHE_TTL.METRICS)

      return metrics
    },
  },
}

// Cache operations
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      return await redis.get(key)
    } catch (error) {
      trackError(error as Error, {
        component: 'cache',
        operation: 'get',
        key,
      })
      return null
    }
  },

  set: async <T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<void> => {
    try {
      await redis.set(key, value, {
        ex: ttl,
      })
    } catch (error) {
      trackError(error as Error, {
        component: 'cache',
        operation: 'set',
        key,
      })
    }
  },

  delete: async (key: string): Promise<void> => {
    try {
      await redis.del(key)
    } catch (error) {
      trackError(error as Error, {
        component: 'cache',
        operation: 'delete',
        key,
      })
    }
  },

  increment: async (key: string): Promise<void> => {
    try {
      await redis.incr(key)
    } catch (error) {
      trackError(error as Error, {
        component: 'cache',
        operation: 'increment',
        key,
      })
    }
  },
}

// Wrap database operations with error handling
Object.keys(db).forEach((namespace) => {
  const operations = db[namespace as keyof typeof db]
  Object.keys(operations).forEach((operation) => {
    const originalFn = operations[operation as keyof typeof operations]
    operations[operation as keyof typeof operations] = withErrorHandling(
      originalFn,
      {
        component: 'db',
        namespace,
        operation,
      }
    )
  })
})

// Add or update the invalidateCache function in db.ts
async function invalidateCache(key) {
  try {
    // ... existing cache invalidation logic ...
    // For example, assume we call a cache client method
    await cache.delete(key)
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error)
    // Optionally, rethrow error or handle it gracefully
    throw error
  }
}

// Export the invalidateCache function
module.exports = {
  // ... existing exports ...
  invalidateCache,
  query: async (sql) => {
    try {
      // ... existing query logic ...
      return await supabase.query(sql)
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  },
  // If data transformation exists, consider moving it to another service layer
  transformData: (data) => {
    // Placeholder for data transformation logic
    return data
  }
} 
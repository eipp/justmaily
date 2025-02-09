import { Redis } from '@upstash/redis'
import { config } from '@/api/config'

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache key prefixes
const CACHE_PREFIXES = {
  SEARCH: 'search',
  ENRICHMENT: 'enrichment',
  PROFILE: 'profile',
  RATE_LIMIT: 'rate-limit',
} as const

// Cache TTL values (in seconds)
const CACHE_TTL = {
  [CACHE_PREFIXES.SEARCH]: config.cache.ttl.search,
  [CACHE_PREFIXES.ENRICHMENT]: config.cache.ttl.enrichment,
  [CACHE_PREFIXES.PROFILE]: config.cache.ttl.profile,
  [CACHE_PREFIXES.RATE_LIMIT]: 60, // 1 minute
} as const

// Create cache key
function createCacheKey(prefix: keyof typeof CACHE_PREFIXES, key: string) {
  return `@justmaily/research:${prefix}:${key}`
}

// Get cached value
export async function getCached<T>(
  prefix: keyof typeof CACHE_PREFIXES,
  key: string
): Promise<T | null> {
  try {
    const cacheKey = createCacheKey(prefix, key)
    const cached = await redis.get<T>(cacheKey)
    return cached
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

// Set cached value
export async function setCached<T>(
  prefix: keyof typeof CACHE_PREFIXES,
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  try {
    const cacheKey = createCacheKey(prefix, key)
    await redis.set(cacheKey, value, {
      ex: ttl ?? CACHE_TTL[prefix],
    })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

// Delete cached value
export async function deleteCached(
  prefix: keyof typeof CACHE_PREFIXES,
  key: string
): Promise<void> {
  try {
    const cacheKey = createCacheKey(prefix, key)
    await redis.del(cacheKey)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

// Clear cache by prefix
export async function clearCache(
  prefix: keyof typeof CACHE_PREFIXES
): Promise<void> {
  try {
    const pattern = createCacheKey(prefix, '*')
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}

// Cache decorator for functions
export function cached<T>(
  prefix: keyof typeof CACHE_PREFIXES,
  keyFn: (...args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = keyFn(...args)
      const cached = await getCached<T>(prefix, key)

      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      await setCached(prefix, key, result, ttl)

      return result
    }

    return descriptor
  }
}

// Rate limiting
export async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{
  success: boolean
  remaining: number
  reset: number
}> {
  const now = Date.now()
  const cacheKey = createCacheKey(CACHE_PREFIXES.RATE_LIMIT, key)

  try {
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(cacheKey, 0, now - window * 1000)
    pipeline.zcard(cacheKey)
    pipeline.zadd(cacheKey, { score: now, member: now })
    pipeline.expire(cacheKey, window)

    const [, count] = await pipeline.exec()
    const remaining = Math.max(0, limit - ((count as any) ?? 0))
    const reset = Math.floor(now / 1000) + window

    return {
      success: remaining > 0,
      remaining,
      reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    return {
      success: true, // Fail open
      remaining: 1,
      reset: Math.floor(now / 1000) + window,
    }
  }
}

// Batch processing with cache
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    prefix: keyof typeof CACHE_PREFIXES
    keyFn: (item: T) => string
    ttl?: number
    concurrency?: number
  }
): Promise<R[]> {
  const {
    prefix,
    keyFn,
    ttl,
    concurrency = config.batch.concurrency,
  } = options

  // Process items in batches
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const key = keyFn(item)
        const cached = await getCached<R>(prefix, key)

        if (cached !== null) {
          return cached
        }

        const result = await processor(item)
        await setCached(prefix, key, result, ttl)

        return result
      })
    )
    results.push(...batchResults)
  }

  return results
} 
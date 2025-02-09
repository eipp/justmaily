import { Redis } from '@upstash/redis'
import { config } from '@/api/config'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache key prefixes
export const CACHE_KEYS = {
  SEARCH: 'search',
  ENRICHMENT: 'enrichment',
  PROFILE: 'profile',
  RATE_LIMIT: 'rate_limit',
} as const

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  [CACHE_KEYS.SEARCH]: 60 * 60, // 1 hour
  [CACHE_KEYS.ENRICHMENT]: 24 * 60 * 60, // 24 hours
  [CACHE_KEYS.PROFILE]: 7 * 24 * 60 * 60, // 7 days
  [CACHE_KEYS.RATE_LIMIT]: 60, // 1 minute
} as const

// Create cache key
export const createCacheKey = (prefix: keyof typeof CACHE_KEYS, key: string) => {
  return `${config.app.name}:${prefix}:${key}`
}

// Get cached value
export const getCached = async <T>(
  prefix: keyof typeof CACHE_KEYS,
  key: string
): Promise<T | null> => {
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
export const setCached = async <T>(
  prefix: keyof typeof CACHE_KEYS,
  key: string,
  value: T,
  ttl = CACHE_TTL[prefix]
): Promise<void> => {
  try {
    const cacheKey = createCacheKey(prefix, key)
    await redis.set(cacheKey, value, { ex: ttl })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

// Delete cached value
export const deleteCached = async (
  prefix: keyof typeof CACHE_KEYS,
  key: string
): Promise<void> => {
  try {
    const cacheKey = createCacheKey(prefix, key)
    await redis.del(cacheKey)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

// Clear cache by prefix
export const clearCache = async (
  prefix: keyof typeof CACHE_KEYS
): Promise<void> => {
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

// Cache decorator
export function cached<T>(
  prefix: keyof typeof CACHE_KEYS,
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
      const key = keyFn.apply(this, args)
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

// Check rate limit
export const checkRateLimit = async (
  key: string,
  limit: number,
  window: number
): Promise<{
  success: boolean
  remaining: number
  reset: number
}> => {
  const now = Date.now()
  const cacheKey = createCacheKey(CACHE_KEYS.RATE_LIMIT, key)

  try {
    // Get current count and timestamp
    const current = await redis.get<{ count: number; timestamp: number }>(cacheKey)

    // If no record exists or window has expired
    if (!current || now - current.timestamp >= window * 1000) {
      await redis.set(
        cacheKey,
        { count: 1, timestamp: now },
        { ex: window }
      )
      return {
        success: true,
        remaining: limit - 1,
        reset: now + window * 1000,
      }
    }

    // If under limit
    if (current.count < limit) {
      await redis.set(
        cacheKey,
        { count: current.count + 1, timestamp: current.timestamp },
        { ex: Math.ceil((current.timestamp + window * 1000 - now) / 1000) }
      )
      return {
        success: true,
        remaining: limit - current.count - 1,
        reset: current.timestamp + window * 1000,
      }
    }

    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: current.timestamp + window * 1000,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open
    return {
      success: true,
      remaining: limit - 1,
      reset: now + window * 1000,
    }
  }
}

// Process batch with caching
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    prefix: keyof typeof CACHE_KEYS
    keyFn: (item: T) => string
    ttl?: number
    concurrency?: number
  }
): Promise<{
  results: R[]
  cached: number
  processed: number
  failed: number
}> => {
  const {
    prefix,
    keyFn,
    ttl = CACHE_TTL[options.prefix],
    concurrency = 5,
  } = options

  const results: R[] = []
  let cached = 0
  let processed = 0
  let failed = 0

  // Process items in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const promises = batch.map(async (item) => {
      try {
        const key = keyFn(item)
        const cachedResult = await getCached<R>(prefix, key)

        if (cachedResult !== null) {
          cached++
          return cachedResult
        }

        const result = await processor(item)
        await setCached(prefix, key, result, ttl)
        processed++
        return result
      } catch (error) {
        console.error('Batch processing error:', error)
        failed++
        return null
      }
    })

    const batchResults = await Promise.all(promises)
    results.push(...batchResults.filter((r): r is R => r !== null))
  }

  return {
    results,
    cached,
    processed,
    failed,
  }
} 
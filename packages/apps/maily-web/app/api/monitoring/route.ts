import { NextRequest } from 'next/server'
import { createAPIHandler } from '@/lib/api'
import { MetricsService } from '@/lib/monitoring'
import { SecurityService } from '@/lib/security'
import { db, cache, search } from '@/lib/db'
import { z } from 'zod'

const metrics = MetricsService as any;
const security = SecurityService;

// API Metrics Handler
export const GET = createAPIHandler({
  handler: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'api':
        return await getApiMetrics()
      case 'db':
        return await getDbMetrics()
      case 'cache':
        return await getCacheMetrics()
      case 'search':
        return await getSearchMetrics()
      default:
        return await getAllMetrics()
    }
  },
})

async function getApiMetrics() {
  const startTime = Date.now()
  try {
    // Get system health
    const systemHealth = await metrics.getSystemHealth()
    
    // Get error rates
    const errorRate = await metrics.getErrorRate('5m')
    
    // Get response time metrics
    const responseTimeHistory = await metrics.getResponseTimeHistory('1h')
    
    // Get request rate
    const requestRate = await metrics.getRequestRate('5m')
    
    // Get endpoint metrics
    const endpointMetrics = await metrics.getEndpointMetrics()
    
    // Get rate limiting data
    const rateLimiting = await metrics.getRateLimitingMetrics('1h')
    
    // Get request volume
    const requestVolume = await metrics.getRequestVolume('1h')

    metrics.recordLatency('monitoring_api_metrics', Date.now() - startTime)
    
    return {
      systemHealth,
      errorRate,
      responseTimeHistory,
      requestRate,
      endpointMetrics,
      rateLimiting,
      requestVolume,
    }
  } catch (error) {
    metrics.recordError('monitoring_api_metrics_error', error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function getDbMetrics() {
  const startTime = Date.now()

  try {
    // Get slow queries
    const slowQueries = await (db as any).getSlowQueries()
    
    // Get connection pool stats
    const connectionPool = await (db as any).getConnectionPoolStats('1h')
    
    // Get transaction metrics
    const transactions = await (db as any).getTransactionMetrics('1h')

    metrics.recordLatency('monitoring_db_metrics', Date.now() - startTime)
    
    return {
      slowQueries,
      connectionPool,
      transactions,
    }
  } catch (error) {
    metrics.recordError('monitoring_db_metrics_error', error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function getCacheMetrics() {
  const startTime = Date.now()
  try {
    // Get hit rate
    const hitRate = await (cache as any).getHitRate('1h')
    
    // Get memory usage
    const memoryUsage = await (cache as any).getMemoryUsage('1h')
    
    // Get eviction stats
    const evictions = await (cache as any).getEvictionStats('1h')

    metrics.recordLatency('monitoring_cache_metrics', Date.now() - startTime)
    
    return {
      hitRate,
      memoryUsage,
      evictions,
    }
  } catch (error) {
    metrics.recordError('monitoring_cache_metrics_error', error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function getSearchMetrics() {
  const startTime = Date.now()
  try {
    // Get search latency
    const latency = await (search as any).getLatencyMetrics('1h')
    
    // Get query volume
    const queryVolume = await (search as any).getQueryVolume('1h')
    
    // Get index stats
    const indexStats = await (search as any).getIndexStats()

    metrics.recordLatency('monitoring_search_metrics', Date.now() - startTime)
    
    return {
      latency,
      queryVolume,
      indexStats,
    }
  } catch (error) {
    metrics.recordError('monitoring_search_metrics_error', error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function getAllMetrics() {
  const startTime = Date.now()
  try {
    const [api, db, cache, search] = await Promise.all([
      getApiMetrics(),
      getDbMetrics(),
      getCacheMetrics(),
      getSearchMetrics(),
    ])

    metrics.recordLatency('monitoring_all_metrics', Date.now() - startTime)
    
    return {
      api,
      db,
      cache,
      search,
    }
  } catch (error) {
    metrics.recordError('monitoring_all_metrics_error', error instanceof Error ? error.message : String(error))
    throw error
  }
} 
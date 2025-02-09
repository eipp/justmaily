export interface SystemStatus {
  healthy: boolean
  uptime: number
  version: string
  nodeEnv: string
}

export interface ErrorMetrics {
  total: number
  rate: number
  byType: Record<string, number>
  trend: Array<{timestamp: string, count: number}>
}

export interface ResponseTimeMetrics {
  average: number
  p95: number
  p99: number
  distribution: Array<{bucket: string, count: number}>
  trend: Array<{timestamp: string, value: number}>
}

export interface RequestMetrics {
  total: number
  rate: number
  byEndpoint: Array<{
    endpoint: string
    count: number
    avgResponseTime: number
    errorRate: number
  }>
  trend: Array<{timestamp: string, count: number}>
}

export interface DatabaseMetrics {
  poolSize: number
  activeConnections: number
  waitingConnections: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: string
  }>
  queryStats: Array<{
    type: string
    count: number
    avgDuration: number
  }>
}

export interface CacheMetrics {
  hitRate: number
  missRate: number
  size: number
  evictions: number
  byKey: Array<{
    key: string
    hits: number
    misses: number
    size: number
  }>
}

export interface SearchMetrics {
  averageLatency: number
  queryVolume: number
  indexSize: number
  indexStats: {
    documents: number
    fields: number
    lastUpdate: string
  }
  queryStats: Array<{
    type: string
    count: number
    avgLatency: number
  }>
}

export interface MonitoringMetrics {
  timestamp: string
  system: SystemStatus
  errors: ErrorMetrics
  responseTime: ResponseTimeMetrics
  requests: RequestMetrics
  database: DatabaseMetrics
  cache: CacheMetrics
  search: SearchMetrics
} 
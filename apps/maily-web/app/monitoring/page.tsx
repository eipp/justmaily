'use client'

import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api/client'
import { MetricsCard } from '@/components/monitoring/metrics-card'
import { MetricsChart } from '@/components/monitoring/metrics-chart'
import { MetricsTable } from '@/components/monitoring/metrics-table'
import { formatNumber, formatDuration, formatBytes, formatDate } from '@/lib/utils'

export default function PerformanceDashboard() {
  const { data: apiMetrics, isLoading: apiLoading } = useQuery({
    queryKey: ['metrics', 'api'],
    queryFn: () => api.monitoring.getApiMetrics(),
    refetchInterval: 30000,
  })

  const { data: dbMetrics, isLoading: dbLoading } = useQuery({
    queryKey: ['metrics', 'db'],
    queryFn: () => api.monitoring.getDbMetrics(),
    refetchInterval: 30000,
  })

  const { data: cacheMetrics, isLoading: cacheLoading } = useQuery({
    queryKey: ['metrics', 'cache'],
    queryFn: () => api.monitoring.getCacheMetrics(),
    refetchInterval: 30000,
  })

  const { data: searchMetrics, isLoading: searchLoading } = useQuery({
    queryKey: ['metrics', 'search'],
    queryFn: () => api.monitoring.getSearchMetrics(),
    refetchInterval: 30000,
  })

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="System Status"
              value={apiMetrics?.system.healthy ? 'Healthy' : 'Unhealthy'}
              description={`Uptime: ${formatDuration(apiMetrics?.system.uptime)}`}
              loading={apiLoading}
            />
            <MetricsCard
              title="Error Rate"
              value={`${formatNumber(apiMetrics?.errors.rate)}%`}
              trend={-2.5}
              loading={apiLoading}
            />
            <MetricsCard
              title="Avg Response Time"
              value={formatDuration(apiMetrics?.responseTime.average)}
              trend={1.8}
              loading={apiLoading}
            />
            <MetricsCard
              title="Request Rate"
              value={`${formatNumber(apiMetrics?.requests.rate)}/s`}
              trend={5.2}
              loading={apiLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricsChart
              title="Response Time Distribution"
              data={apiMetrics?.responseTime.distribution || []}
              type="bar"
              dataKey="count"
              xAxisKey="bucket"
              loading={apiLoading}
            />
            <MetricsChart
              title="Error Rate Trend"
              data={apiMetrics?.errors.trend || []}
              dataKey="count"
              loading={apiLoading}
              color="#ef4444"
            />
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <MetricsTable
            title="Endpoint Performance"
            columns={[
              { key: 'endpoint', title: 'Endpoint' },
              { key: 'count', title: 'Requests', format: formatNumber },
              { key: 'avgResponseTime', title: 'Avg Response Time', format: formatDuration },
              { key: 'errorRate', title: 'Error Rate', format: (v) => `${formatNumber(v)}%` },
            ]}
            data={apiMetrics?.requests.byEndpoint || []}
            loading={apiLoading}
          />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsCard
              title="Active Connections"
              value={formatNumber(dbMetrics?.activeConnections)}
              description={`Pool Size: ${formatNumber(dbMetrics?.poolSize)}`}
              loading={dbLoading}
            />
            <MetricsCard
              title="Waiting Connections"
              value={formatNumber(dbMetrics?.waitingConnections)}
              loading={dbLoading}
            />
          </div>

          <MetricsTable
            title="Slow Queries"
            columns={[
              { key: 'query', title: 'Query' },
              { key: 'duration', title: 'Duration', format: formatDuration },
              { key: 'timestamp', title: 'Timestamp', format: formatDate },
            ]}
            data={dbMetrics?.slowQueries || []}
            loading={dbLoading}
          />
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsCard
              title="Hit Rate"
              value={`${formatNumber(cacheMetrics?.hitRate)}%`}
              loading={cacheLoading}
            />
            <MetricsCard
              title="Cache Size"
              value={formatBytes(cacheMetrics?.size)}
              loading={cacheLoading}
            />
            <MetricsCard
              title="Evictions"
              value={formatNumber(cacheMetrics?.evictions)}
              loading={cacheLoading}
            />
          </div>

          <MetricsTable
            title="Cache Keys"
            columns={[
              { key: 'key', title: 'Key' },
              { key: 'hits', title: 'Hits', format: formatNumber },
              { key: 'misses', title: 'Misses', format: formatNumber },
              { key: 'size', title: 'Size', format: formatBytes },
            ]}
            data={cacheMetrics?.byKey || []}
            loading={cacheLoading}
          />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsCard
              title="Average Latency"
              value={formatDuration(searchMetrics?.averageLatency)}
              loading={searchLoading}
            />
            <MetricsCard
              title="Query Volume"
              value={`${formatNumber(searchMetrics?.queryVolume)}/s`}
              loading={searchLoading}
            />
            <MetricsCard
              title="Index Size"
              value={formatBytes(searchMetrics?.indexSize)}
              loading={searchLoading}
            />
          </div>

          <MetricsTable
            title="Query Stats"
            columns={[
              { key: 'type', title: 'Query Type' },
              { key: 'count', title: 'Count', format: formatNumber },
              { key: 'avgLatency', title: 'Avg Latency', format: formatDuration },
            ]}
            data={searchMetrics?.queryStats || []}
            loading={searchLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
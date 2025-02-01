import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/atoms/card'
import { Separator } from '@/components/ui/atoms/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/atoms/tabs'
import { AreaChart, BarChart } from '@/components/ui/molecules/charts'
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { Badge } from '@/components/ui/atoms/badge'
import { 
  Activity, 
  Database, 
  Server, 
  Search,
  Zap,
  AlertCircle,
  Clock,
  BarChart2
} from 'lucide-react'

export default function PerformanceDashboard() {
  // Fetch performance metrics
  const { data: apiMetrics } = useQuery({
    queryKey: ['performance-api'],
    queryFn: () => api.monitoring.getApiMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: dbMetrics } = useQuery({
    queryKey: ['performance-db'],
    queryFn: () => api.monitoring.getDbMetrics(),
    refetchInterval: 30000,
  })

  const { data: cacheMetrics } = useQuery({
    queryKey: ['performance-cache'],
    queryFn: () => api.monitoring.getCacheMetrics(),
    refetchInterval: 30000,
  })

  const { data: searchMetrics } = useQuery({
    queryKey: ['performance-search'],
    queryFn: () => api.monitoring.getSearchMetrics(),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Performance Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Real-time performance metrics and system health monitoring.
        </p>
      </div>
      <Separator />
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Health Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {apiMetrics?.systemHealth.status}
                  </div>
                  <Badge variant={apiMetrics?.systemHealth.status === 'Healthy' ? 'success' : 'destructive'}>
                    {apiMetrics?.systemHealth.uptime}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics?.errorRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics?.avgResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Request Rate</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics?.requestRate.toFixed(1)}/s
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Response Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>
                Distribution of API response times over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={apiMetrics?.responseTimeHistory || []}
                categories={['p50', 'p90', 'p99']}
                index="timestamp"
                colors={['blue', 'green', 'red']}
                valueFormatter={(value) => `${value.toFixed(0)}ms`}
                yAxisWidth={60}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Error Rate Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Error Rate Trends</CardTitle>
              <CardDescription>
                Error rates across different services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={apiMetrics?.errorRates || []}
                categories={['api', 'database', 'cache', 'search']}
                index="timestamp"
                colors={['red', 'orange', 'yellow', 'purple']}
                valueFormatter={(value) => `${value.toFixed(2)}%`}
                yAxisWidth={60}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          {/* API Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Performance</CardTitle>
                <CardDescription>Response times by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    { accessorKey: 'endpoint', header: 'Endpoint' },
                    { accessorKey: 'avgResponseTime', header: 'Avg Response Time' },
                    { accessorKey: 'errorRate', header: 'Error Rate' },
                  ]}
                  data={apiMetrics?.endpointMetrics || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>Rate limit hits and throttling</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={apiMetrics?.rateLimiting || []}
                  categories={['hits', 'throttled']}
                  index="timestamp"
                  colors={['orange', 'red']}
                  valueFormatter={(value) => value.toString()}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>Requests per second over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={apiMetrics?.requestVolume || []}
                  categories={['requests']}
                  index="timestamp"
                  colors={['blue']}
                  valueFormatter={(value) => `${value.toFixed(1)}/s`}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          {/* Database Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>Slow query analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    { accessorKey: 'query', header: 'Query' },
                    { accessorKey: 'avgDuration', header: 'Avg Duration' },
                    { accessorKey: 'calls', header: 'Calls' },
                  ]}
                  data={dbMetrics?.slowQueries || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
                <CardDescription>Connection pool utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={dbMetrics?.connectionPool || []}
                  categories={['active', 'idle', 'waiting']}
                  index="timestamp"
                  colors={['green', 'blue', 'orange']}
                  valueFormatter={(value) => value.toString()}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Metrics</CardTitle>
                <CardDescription>Transaction throughput and latency</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={dbMetrics?.transactions || []}
                  categories={['committed', 'rolled_back']}
                  index="timestamp"
                  colors={['green', 'red']}
                  valueFormatter={(value) => value.toString()}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {/* Cache Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Cache effectiveness over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={cacheMetrics?.hitRate || []}
                  categories={['rate']}
                  index="timestamp"
                  colors={['green']}
                  valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Cache memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={cacheMetrics?.memoryUsage || []}
                  categories={['used', 'available']}
                  index="timestamp"
                  colors={['blue', 'green']}
                  valueFormatter={(value) => `${(value / 1024 / 1024).toFixed(1)}MB`}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eviction Rate</CardTitle>
                <CardDescription>Cache eviction frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={cacheMetrics?.evictions || []}
                  categories={['count']}
                  index="timestamp"
                  colors={['red']}
                  valueFormatter={(value) => value.toString()}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          {/* Search Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Search Latency</CardTitle>
                <CardDescription>Query response times</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={searchMetrics?.latency || []}
                  categories={['p50', 'p90', 'p99']}
                  index="timestamp"
                  colors={['blue', 'green', 'red']}
                  valueFormatter={(value) => `${value.toFixed(0)}ms`}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Volume</CardTitle>
                <CardDescription>Search queries per second</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={searchMetrics?.queryVolume || []}
                  categories={['queries']}
                  index="timestamp"
                  colors={['purple']}
                  valueFormatter={(value) => `${value.toFixed(1)}/s`}
                  yAxisWidth={60}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Index Stats</CardTitle>
                <CardDescription>Index size and document count</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    { accessorKey: 'index', header: 'Index' },
                    { accessorKey: 'documents', header: 'Documents' },
                    { accessorKey: 'size', header: 'Size' },
                  ]}
                  data={searchMetrics?.indexStats || []}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceDashboard;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@/lib/api/client");
const card_1 = require("@/components/ui/atoms/card");
const separator_1 = require("@/components/ui/atoms/separator");
const tabs_1 = require("@/components/ui/atoms/tabs");
const charts_1 = require("@/components/ui/molecules/charts");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const badge_1 = require("@/components/ui/atoms/badge");
const lucide_react_1 = require("lucide-react");
function PerformanceDashboard() {
    // Fetch performance metrics
    const { data: apiMetrics } = (0, react_query_1.useQuery)({
        queryKey: ['performance-api'],
        queryFn: () => client_1.api.monitoring.getApiMetrics(),
        refetchInterval: 30000, // Refresh every 30 seconds
    });
    const { data: dbMetrics } = (0, react_query_1.useQuery)({
        queryKey: ['performance-db'],
        queryFn: () => client_1.api.monitoring.getDbMetrics(),
        refetchInterval: 30000,
    });
    const { data: cacheMetrics } = (0, react_query_1.useQuery)({
        queryKey: ['performance-cache'],
        queryFn: () => client_1.api.monitoring.getCacheMetrics(),
        refetchInterval: 30000,
    });
    const { data: searchMetrics } = (0, react_query_1.useQuery)({
        queryKey: ['performance-search'],
        queryFn: () => client_1.api.monitoring.getSearchMetrics(),
        refetchInterval: 30000,
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Performance Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Real-time performance metrics and system health monitoring.
        </p>
      </div>
      <separator_1.Separator />
      
      <tabs_1.Tabs defaultValue="overview">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="api">API</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="database">Database</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="cache">Cache</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="search">Search</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          {/* System Health Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">System Status</card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.systemHealth.status}
                  </div>
                  <badge_1.Badge variant={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.systemHealth.status) === 'Healthy' ? 'success' : 'destructive'}>
                    {apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.systemHealth.uptime}
                  </badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Error Rate</card_1.CardTitle>
                <lucide_react_1.AlertCircle className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.errorRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Avg Response Time</card_1.CardTitle>
                <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.avgResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Request Rate</card_1.CardTitle>
                <lucide_react_1.BarChart2 className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.requestRate.toFixed(1)}/s
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 5 minutes
                </p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Response Time Distribution */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Response Time Distribution</card_1.CardTitle>
              <card_1.CardDescription>
                Distribution of API response times over time
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <charts_1.AreaChart data={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.responseTimeHistory) || []} categories={['p50', 'p90', 'p99']} index="timestamp" colors={['blue', 'green', 'red']} valueFormatter={(value) => `${value.toFixed(0)}ms`} yAxisWidth={60} height={300}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* Error Rate Trends */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Error Rate Trends</card_1.CardTitle>
              <card_1.CardDescription>
                Error rates across different services
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <charts_1.BarChart data={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.errorRates) || []} categories={['api', 'database', 'cache', 'search']} index="timestamp" colors={['red', 'orange', 'yellow', 'purple']} valueFormatter={(value) => `${value.toFixed(2)}%`} yAxisWidth={60} height={300}/>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="api" className="space-y-4">
          {/* API Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Endpoint Performance</card_1.CardTitle>
                <card_1.CardDescription>Response times by endpoint</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <data_table_1.DataTable columns={[
            { accessorKey: 'endpoint', header: 'Endpoint' },
            { accessorKey: 'avgResponseTime', header: 'Avg Response Time' },
            { accessorKey: 'errorRate', header: 'Error Rate' },
        ]} data={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.endpointMetrics) || []}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Rate Limiting</card_1.CardTitle>
                <card_1.CardDescription>Rate limit hits and throttling</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.BarChart data={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.rateLimiting) || []} categories={['hits', 'throttled']} index="timestamp" colors={['orange', 'red']} valueFormatter={(value) => value.toString()} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Request Volume</card_1.CardTitle>
                <card_1.CardDescription>Requests per second over time</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(apiMetrics === null || apiMetrics === void 0 ? void 0 : apiMetrics.requestVolume) || []} categories={['requests']} index="timestamp" colors={['blue']} valueFormatter={(value) => `${value.toFixed(1)}/s`} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="database" className="space-y-4">
          {/* Database Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Query Performance</card_1.CardTitle>
                <card_1.CardDescription>Slow query analysis</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <data_table_1.DataTable columns={[
            { accessorKey: 'query', header: 'Query' },
            { accessorKey: 'avgDuration', header: 'Avg Duration' },
            { accessorKey: 'calls', header: 'Calls' },
        ]} data={(dbMetrics === null || dbMetrics === void 0 ? void 0 : dbMetrics.slowQueries) || []}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Connection Pool</card_1.CardTitle>
                <card_1.CardDescription>Connection pool utilization</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(dbMetrics === null || dbMetrics === void 0 ? void 0 : dbMetrics.connectionPool) || []} categories={['active', 'idle', 'waiting']} index="timestamp" colors={['green', 'blue', 'orange']} valueFormatter={(value) => value.toString()} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Transaction Metrics</card_1.CardTitle>
                <card_1.CardDescription>Transaction throughput and latency</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.BarChart data={(dbMetrics === null || dbMetrics === void 0 ? void 0 : dbMetrics.transactions) || []} categories={['committed', 'rolled_back']} index="timestamp" colors={['green', 'red']} valueFormatter={(value) => value.toString()} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="cache" className="space-y-4">
          {/* Cache Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cache Hit Rate</card_1.CardTitle>
                <card_1.CardDescription>Cache effectiveness over time</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(cacheMetrics === null || cacheMetrics === void 0 ? void 0 : cacheMetrics.hitRate) || []} categories={['rate']} index="timestamp" colors={['green']} valueFormatter={(value) => `${(value * 100).toFixed(1)}%`} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Memory Usage</card_1.CardTitle>
                <card_1.CardDescription>Cache memory utilization</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(cacheMetrics === null || cacheMetrics === void 0 ? void 0 : cacheMetrics.memoryUsage) || []} categories={['used', 'available']} index="timestamp" colors={['blue', 'green']} valueFormatter={(value) => `${(value / 1024 / 1024).toFixed(1)}MB`} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Eviction Rate</card_1.CardTitle>
                <card_1.CardDescription>Cache eviction frequency</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.BarChart data={(cacheMetrics === null || cacheMetrics === void 0 ? void 0 : cacheMetrics.evictions) || []} categories={['count']} index="timestamp" colors={['red']} valueFormatter={(value) => value.toString()} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="search" className="space-y-4">
          {/* Search Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Search Latency</card_1.CardTitle>
                <card_1.CardDescription>Query response times</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(searchMetrics === null || searchMetrics === void 0 ? void 0 : searchMetrics.latency) || []} categories={['p50', 'p90', 'p99']} index="timestamp" colors={['blue', 'green', 'red']} valueFormatter={(value) => `${value.toFixed(0)}ms`} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Query Volume</card_1.CardTitle>
                <card_1.CardDescription>Search queries per second</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <charts_1.AreaChart data={(searchMetrics === null || searchMetrics === void 0 ? void 0 : searchMetrics.queryVolume) || []} categories={['queries']} index="timestamp" colors={['purple']} valueFormatter={(value) => `${value.toFixed(1)}/s`} yAxisWidth={60} height={300}/>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Index Stats</card_1.CardTitle>
                <card_1.CardDescription>Index size and document count</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <data_table_1.DataTable columns={[
            { accessorKey: 'index', header: 'Index' },
            { accessorKey: 'documents', header: 'Documents' },
            { accessorKey: 'size', header: 'Size' },
        ]} data={(searchMetrics === null || searchMetrics === void 0 ? void 0 : searchMetrics.indexStats) || []}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}

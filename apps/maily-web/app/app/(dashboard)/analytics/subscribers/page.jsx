"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubscriberAnalyticsPage;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@/lib/api/client");
const card_1 = require("@/components/ui/atoms/card");
const separator_1 = require("@/components/ui/atoms/separator");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const charts_1 = require("@/components/ui/molecules/charts");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/atoms/badge");
const date_fns_1 = require("date-fns");
const columns = [
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
            const subscriber = row.original;
            return (<div>
          <div className="font-medium">{subscriber.email}</div>
          <div className="text-sm text-muted-foreground">
            Joined {(0, date_fns_1.formatDistanceToNow)(new Date(subscriber.subscribedAt), {
                    addSuffix: true,
                })}
          </div>
        </div>);
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status');
            return (<badge_1.Badge variant={status === 'active'
                    ? 'default'
                    : status === 'inactive'
                        ? 'secondary'
                        : status === 'bounced'
                            ? 'destructive'
                            : 'outline'}>
          {status}
        </badge_1.Badge>);
        },
    },
    {
        accessorKey: 'engagementScore',
        header: 'Engagement',
        cell: ({ row }) => {
            const score = row.getValue('engagementScore');
            const formattedValue = `${score.toFixed(1)}`;
            const isGood = score > 7;
            return (<div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (<lucide_react_1.ArrowUpRight className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.ArrowDownRight className="h-4 w-4 text-red-500"/>)}
        </div>);
        },
    },
    {
        accessorKey: 'openRate',
        header: 'Open Rate',
        cell: ({ row }) => {
            const value = row.getValue('openRate');
            const formattedValue = `${value.toFixed(1)}%`;
            const isGood = value > 20;
            return (<div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (<lucide_react_1.ArrowUpRight className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.ArrowDownRight className="h-4 w-4 text-red-500"/>)}
        </div>);
        },
    },
    {
        accessorKey: 'clickRate',
        header: 'Click Rate',
        cell: ({ row }) => {
            const value = row.getValue('clickRate');
            const formattedValue = `${value.toFixed(1)}%`;
            const isGood = value > 2.5;
            return (<div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (<lucide_react_1.ArrowUpRight className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.ArrowDownRight className="h-4 w-4 text-red-500"/>)}
        </div>);
        },
    },
    {
        accessorKey: 'source',
        header: 'Source',
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.getValue('tags');
            return (<div className="flex flex-wrap gap-1">
          {tags.map((tag) => (<badge_1.Badge key={tag} variant="outline">
              {tag}
            </badge_1.Badge>))}
        </div>);
        },
    },
];
function SubscriberAnalyticsPage() {
    const { data: subscribers, isLoading: isLoadingSubscribers } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-subscribers'],
        queryFn: () => client_1.api.analytics.getSubscribers(),
    });
    const { data: growth, isLoading: isLoadingGrowth } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-subscriber-growth-detailed'],
        queryFn: () => client_1.api.analytics.getSubscriberGrowthDetailed(),
    });
    const { data: engagement, isLoading: isLoadingEngagement } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-subscriber-engagement'],
        queryFn: () => client_1.api.analytics.getSubscriberEngagement(),
    });
    const { data: sources, isLoading: isLoadingSources } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-subscriber-sources'],
        queryFn: () => client_1.api.analytics.getSubscriberSources(),
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscriber Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Analyze your subscriber base and engagement patterns.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total Subscribers
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.total.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.growthRate}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Active Subscribers
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.active.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {(((subscribers === null || subscribers === void 0 ? void 0 : subscribers.active) / (subscribers === null || subscribers === void 0 ? void 0 : subscribers.total)) * 100).toFixed(1)}% of total
              </div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Average Engagement
              </card_1.CardTitle>
              <lucide_react_1.MousePointerClick className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.averageEngagement.toFixed(1)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.engagementGrowth}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Churn Rate
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.churnRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowDownRight className="mr-1 h-4 w-4 text-green-500"/>
                {subscribers === null || subscribers === void 0 ? void 0 : subscribers.churnRateChange}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Growth Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Subscriber Growth</card_1.CardTitle>
            <card_1.CardDescription>
              Track subscriber growth and churn over time.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.AreaChart data={(growth === null || growth === void 0 ? void 0 : growth.data) || []} categories={['new', 'churned', 'net']} index="date" colors={['green', 'red', 'blue']} valueFormatter={(value) => value.toLocaleString()} yAxisWidth={80} height={350} showLegend/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Engagement Distribution */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Engagement Distribution</card_1.CardTitle>
            <card_1.CardDescription>
              Distribution of subscriber engagement scores.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.BarChart data={(engagement === null || engagement === void 0 ? void 0 : engagement.data) || []} categories={['count']} index="score" colors={['blue']} valueFormatter={(value) => value.toLocaleString()} yAxisWidth={60} height={350}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Source Distribution */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Subscriber Sources</card_1.CardTitle>
            <card_1.CardDescription>
              Distribution of subscriber acquisition sources.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.BarChart data={(sources === null || sources === void 0 ? void 0 : sources.data) || []} categories={['count']} index="source" colors={['blue']} valueFormatter={(value) => value.toLocaleString()} yAxisWidth={60} height={350}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Subscriber List */}
        <div>
          <h4 className="text-sm font-medium mb-4">All Subscribers</h4>
          <data_table_1.DataTable columns={columns} data={(subscribers === null || subscribers === void 0 ? void 0 : subscribers.items) || []} isLoading={isLoadingSubscribers} searchableColumns={[
            {
                id: 'email',
                title: 'Email',
            },
        ]} filterableColumns={[
            {
                id: 'status',
                title: 'Status',
                options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Bounced', value: 'bounced' },
                    { label: 'Unsubscribed', value: 'unsubscribed' },
                ],
            },
            {
                id: 'source',
                title: 'Source',
                options: [
                    { label: 'Website', value: 'website' },
                    { label: 'Import', value: 'import' },
                    { label: 'API', value: 'api' },
                    { label: 'Manual', value: 'manual' },
                ],
            },
        ]}/>
        </div>
      </div>
    </div>);
}

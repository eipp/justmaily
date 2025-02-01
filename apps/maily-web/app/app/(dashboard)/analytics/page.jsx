"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnalyticsPage;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@/lib/api/client");
const card_1 = require("@/components/ui/atoms/card");
const separator_1 = require("@/components/ui/atoms/separator");
const lucide_react_1 = require("lucide-react");
const charts_1 = require("@/components/ui/molecules/charts");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const date_fns_1 = require("date-fns");
const columns = [
    {
        accessorKey: 'name',
        header: 'Campaign',
    },
    {
        accessorKey: 'sentAt',
        header: 'Sent',
        cell: ({ row }) => {
            return (0, date_fns_1.formatDistanceToNow)(new Date(row.getValue('sentAt')), {
                addSuffix: true,
            });
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
];
function AnalyticsPage() {
    const { data: overview, isLoading: isLoadingOverview } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-overview'],
        queryFn: () => client_1.api.analytics.getOverview(),
    });
    const { data: campaigns, isLoading: isLoadingCampaigns } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-campaigns'],
        queryFn: () => client_1.api.analytics.getCampaigns(),
    });
    const { data: subscriberGrowth, isLoading: isLoadingGrowth } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-subscriber-growth'],
        queryFn: () => client_1.api.analytics.getSubscriberGrowth(),
    });
    const { data: engagement, isLoading: isLoadingEngagement } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-engagement'],
        queryFn: () => client_1.api.analytics.getEngagement(),
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          View your key metrics and campaign performance.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total Subscribers
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {overview === null || overview === void 0 ? void 0 : overview.totalSubscribers.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                {overview === null || overview === void 0 ? void 0 : overview.subscriberGrowth}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Average Open Rate
              </card_1.CardTitle>
              <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {overview === null || overview === void 0 ? void 0 : overview.averageOpenRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                {overview === null || overview === void 0 ? void 0 : overview.openRateGrowth}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Average Click Rate
              </card_1.CardTitle>
              <lucide_react_1.MousePointerClick className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {overview === null || overview === void 0 ? void 0 : overview.averageClickRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <lucide_react_1.ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                {overview === null || overview === void 0 ? void 0 : overview.clickRateGrowth}% from last month
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Subscriber Growth Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Subscriber Growth</card_1.CardTitle>
            <card_1.CardDescription>
              Track your subscriber growth over time.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.AreaChart data={(subscriberGrowth === null || subscriberGrowth === void 0 ? void 0 : subscriberGrowth.data) || []} categories={['total']} index="date" colors={['blue']} valueFormatter={(value) => `${value.toLocaleString()} subscribers`} yAxisWidth={80} height={350}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Engagement Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Engagement Metrics</card_1.CardTitle>
            <card_1.CardDescription>
              Compare open rates and click rates across campaigns.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.BarChart data={(engagement === null || engagement === void 0 ? void 0 : engagement.data) || []} categories={['openRate', 'clickRate']} index="name" colors={['blue', 'green']} valueFormatter={(value) => `${value.toFixed(1)}%`} yAxisWidth={60} height={350}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Recent Campaigns */}
        <div>
          <h4 className="text-sm font-medium mb-4">Recent Campaigns</h4>
          <data_table_1.DataTable columns={columns} data={(campaigns === null || campaigns === void 0 ? void 0 : campaigns.items) || []} isLoading={isLoadingCampaigns}/>
        </div>
      </div>
    </div>);
}

"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CampaignAnalyticsPage;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@/lib/api/client");
const card_1 = require("@/components/ui/atoms/card");
const separator_1 = require("@/components/ui/atoms/separator");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const charts_1 = require("@/components/ui/molecules/charts");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const columns = [
    {
        accessorKey: 'name',
        header: 'Campaign',
        cell: ({ row }) => {
            const campaign = row.original;
            return (<div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-sm text-muted-foreground">
            {campaign.subject}
          </div>
        </div>);
        },
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
        accessorKey: 'totalRecipients',
        header: 'Recipients',
        cell: ({ row }) => {
            return row.getValue('totalRecipients').toLocaleString();
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
        accessorKey: 'bounceRate',
        header: 'Bounce Rate',
        cell: ({ row }) => {
            const value = row.getValue('bounceRate');
            const formattedValue = `${value.toFixed(1)}%`;
            const isGood = value < 2;
            return (<div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (<lucide_react_1.ArrowUpRight className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.ArrowDownRight className="h-4 w-4 text-red-500"/>)}
        </div>);
        },
    },
    {
        accessorKey: 'unsubscribeRate',
        header: 'Unsub Rate',
        cell: ({ row }) => {
            const value = row.getValue('unsubscribeRate');
            const formattedValue = `${value.toFixed(1)}%`;
            const isGood = value < 0.5;
            return (<div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (<lucide_react_1.ArrowUpRight className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.ArrowDownRight className="h-4 w-4 text-red-500"/>)}
        </div>);
        },
    },
];
function CampaignAnalyticsPage() {
    const { data: campaigns, isLoading: isLoadingCampaigns } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-campaigns-detailed'],
        queryFn: () => client_1.api.analytics.getCampaignsDetailed(),
    });
    const { data: performance, isLoading: isLoadingPerformance } = (0, react_query_1.useQuery)({
        queryKey: ['analytics-campaigns-performance'],
        queryFn: () => client_1.api.analytics.getCampaignsPerformance(),
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Campaign Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Analyze the performance of your email campaigns.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-8">
        {/* Performance Overview */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Campaign Performance</card_1.CardTitle>
            <card_1.CardDescription>
              Compare key metrics across your recent campaigns.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <charts_1.BarChart data={(performance === null || performance === void 0 ? void 0 : performance.data) || []} categories={[
            'openRate',
            'clickRate',
            'bounceRate',
            'unsubscribeRate',
        ]} index="name" colors={['blue', 'green', 'red', 'yellow']} valueFormatter={(value) => `${value.toFixed(1)}%`} yAxisWidth={60} height={350} showLegend/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Campaign List */}
        <div>
          <h4 className="text-sm font-medium mb-4">All Campaigns</h4>
          <data_table_1.DataTable columns={columns} data={(campaigns === null || campaigns === void 0 ? void 0 : campaigns.items) || []} isLoading={isLoadingCampaigns} searchableColumns={[
            {
                id: 'name',
                title: 'Name',
            },
            {
                id: 'subject',
                title: 'Subject',
            },
        ]} filterableColumns={[
            {
                id: 'openRate',
                title: 'Open Rate',
                options: [
                    { label: 'Above 30%', value: 'above-30' },
                    { label: '20-30%', value: '20-30' },
                    { label: 'Below 20%', value: 'below-20' },
                ],
            },
            {
                id: 'clickRate',
                title: 'Click Rate',
                options: [
                    { label: 'Above 5%', value: 'above-5' },
                    { label: '2.5-5%', value: '2.5-5' },
                    { label: 'Below 2.5%', value: 'below-2.5' },
                ],
            },
        ]}/>
        </div>
      </div>
    </div>);
}

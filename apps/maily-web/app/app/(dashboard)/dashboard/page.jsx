"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/atoms/card");
const main_layout_1 = require("@/components/layouts/main-layout");
const client_1 = require("@/lib/api/client");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const button_1 = require("@/components/ui/atoms/button");
const navigation_1 = require("next/navigation");
const skeleton_1 = require("@/components/ui/atoms/skeleton");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const columns = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
    {
        accessorKey: 'sentAt',
        header: 'Sent',
        cell: ({ row }) => {
            return (0, date_fns_1.formatDistanceToNow)(new Date(row.original.sentAt), {
                addSuffix: true,
            });
        },
    },
    {
        accessorKey: 'openRate',
        header: 'Open Rate',
        cell: ({ row }) => {
            return `${row.original.openRate}%`;
        },
    },
    {
        accessorKey: 'clickRate',
        header: 'Click Rate',
        cell: ({ row }) => {
            return `${row.original.clickRate}%`;
        },
    },
];
function DashboardPage() {
    const router = (0, navigation_1.useRouter)();
    const { data: stats, isLoading: isLoadingStats } = (0, react_query_1.useQuery)({
        queryKey: ['dashboard-stats'],
        queryFn: () => client_1.api.analytics.getDashboardStats(),
    });
    const { data: campaigns, isLoading: isLoadingCampaigns } = (0, react_query_1.useQuery)({
        queryKey: ['recent-campaigns'],
        queryFn: () => client_1.api.campaigns.list({ limit: 5 }),
    });
    const { data: activities, isLoading: isLoadingActivities } = (0, react_query_1.useQuery)({
        queryKey: ['recent-activities'],
        queryFn: () => client_1.api.analytics.getRecentActivities(),
    });
    return (<main_layout_1.MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <button_1.Button onClick={() => router.push('/campaigns/new')}>
              Create Campaign
            </button_1.Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total Subscribers
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingStats ? (<skeleton_1.Skeleton className="h-7 w-20"/>) : (<div className="text-2xl font-bold">
                  {stats === null || stats === void 0 ? void 0 : stats.totalSubscribers.toLocaleString()}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total Campaigns
              </card_1.CardTitle>
              <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingStats ? (<skeleton_1.Skeleton className="h-7 w-20"/>) : (<div className="text-2xl font-bold">
                  {stats === null || stats === void 0 ? void 0 : stats.totalCampaigns.toLocaleString()}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Average Open Rate
              </card_1.CardTitle>
              <lucide_react_1.MousePointerClick className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingStats ? (<skeleton_1.Skeleton className="h-7 w-20"/>) : (<div className="text-2xl font-bold">
                  {stats === null || stats === void 0 ? void 0 : stats.averageOpenRate.toFixed(1)}%
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Average Click Rate
              </card_1.CardTitle>
              <lucide_react_1.ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingStats ? (<skeleton_1.Skeleton className="h-7 w-20"/>) : (<div className="text-2xl font-bold">
                  {stats === null || stats === void 0 ? void 0 : stats.averageClickRate.toFixed(1)}%
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <card_1.Card className="col-span-4">
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Campaigns</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingCampaigns ? (<div className="space-y-2">
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                  <skeleton_1.Skeleton className="h-10 w-full"/>
                </div>) : (<data_table_1.DataTable columns={columns} data={(campaigns === null || campaigns === void 0 ? void 0 : campaigns.items) || []}/>)}
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card className="col-span-3">
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Activity</card_1.CardTitle>
              <card_1.CardDescription>
                You had {(activities === null || activities === void 0 ? void 0 : activities.length) || 0} activities this month
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {isLoadingActivities ? (<div className="space-y-4">
                  <skeleton_1.Skeleton className="h-14 w-full"/>
                  <skeleton_1.Skeleton className="h-14 w-full"/>
                  <skeleton_1.Skeleton className="h-14 w-full"/>
                </div>) : (<div className="space-y-8">
                  {activities === null || activities === void 0 ? void 0 : activities.map((activity) => (<div key={activity.id} className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-secondary">
                        <lucide_react_1.Activity className="h-4 w-4"/>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(0, date_fns_1.formatDistanceToNow)(new Date(activity.timestamp), {
                    addSuffix: true,
                })}
                        </p>
                      </div>
                      <button_1.Button variant="ghost" size="icon">
                        <lucide_react_1.ArrowRight className="h-4 w-4"/>
                      </button_1.Button>
                    </div>))}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </main_layout_1.MainLayout>);
}

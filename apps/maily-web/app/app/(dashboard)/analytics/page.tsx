'use client'

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
import { Badge } from '@/components/ui/atoms/badge'
import { ArrowUpRight, ArrowDownRight, Users, Mail, MousePointerClick } from 'lucide-react'
import { AreaChart, BarChart } from '@/components/ui/molecules/charts'
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow, format } from 'date-fns'

interface Campaign {
  id: string
  name: string
  sentAt: string
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
}

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: 'name',
    header: 'Campaign',
  },
  {
    accessorKey: 'sentAt',
    header: 'Sent',
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue('sentAt')), {
        addSuffix: true,
      })
    },
  },
  {
    accessorKey: 'openRate',
    header: 'Open Rate',
    cell: ({ row }) => {
      const value = row.getValue('openRate') as number
      const formattedValue = `${value.toFixed(1)}%`
      const isGood = value > 20

      return (
        <div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'clickRate',
    header: 'Click Rate',
    cell: ({ row }) => {
      const value = row.getValue('clickRate') as number
      const formattedValue = `${value.toFixed(1)}%`
      const isGood = value > 2.5

      return (
        <div className="flex items-center gap-x-2">
          {formattedValue}
          {isGood ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
        </div>
      )
    },
  },
]

export default function AnalyticsPage() {
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(),
  })

  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['analytics-campaigns'],
    queryFn: () => api.analytics.getCampaigns(),
  })

  const { data: subscriberGrowth, isLoading: isLoadingGrowth } = useQuery({
    queryKey: ['analytics-subscriber-growth'],
    queryFn: () => api.analytics.getSubscriberGrowth(),
  })

  const { data: engagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ['analytics-engagement'],
    queryFn: () => api.analytics.getEngagement(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          View your key metrics and campaign performance.
        </p>
      </div>
      <Separator />
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.totalSubscribers.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {overview?.subscriberGrowth}% from last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Open Rate
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.averageOpenRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {overview?.openRateGrowth}% from last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Click Rate
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.averageClickRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {overview?.clickRateGrowth}% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriber Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>
              Track your subscriber growth over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={subscriberGrowth?.data || []}
              categories={['total']}
              index="date"
              colors={['blue']}
              valueFormatter={(value) =>
                `${value.toLocaleString()} subscribers`
              }
              yAxisWidth={80}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>
              Compare open rates and click rates across campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={engagement?.data || []}
              categories={['openRate', 'clickRate']}
              index="name"
              colors={['blue', 'green']}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              yAxisWidth={60}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <div>
          <h4 className="text-sm font-medium mb-4">Recent Campaigns</h4>
          <DataTable
            columns={columns}
            data={campaigns?.items || []}
            isLoading={isLoadingCampaigns}
          />
        </div>
      </div>
    </div>
  )
} 
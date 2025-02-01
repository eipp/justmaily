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
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { AreaChart, BarChart } from '@/components/ui/molecules/charts'
import { ArrowUpRight, ArrowDownRight, Users, Mail, MousePointerClick } from 'lucide-react'
import { Badge } from '@/components/ui/atoms/badge'
import { formatDistanceToNow } from 'date-fns'

interface Subscriber {
  id: string
  email: string
  status: 'active' | 'inactive' | 'bounced' | 'unsubscribed'
  subscribedAt: string
  lastEngagedAt: string | null
  engagementScore: number
  openRate: number
  clickRate: number
  source: string
  tags: string[]
}

const columns: ColumnDef<Subscriber>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const subscriber = row.original
      return (
        <div>
          <div className="font-medium">{subscriber.email}</div>
          <div className="text-sm text-muted-foreground">
            Joined {formatDistanceToNow(new Date(subscriber.subscribedAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'inactive'
              ? 'secondary'
              : status === 'bounced'
              ? 'destructive'
              : 'outline'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'engagementScore',
    header: 'Engagement',
    cell: ({ row }) => {
      const score = row.getValue('engagementScore') as number
      const formattedValue = `${score.toFixed(1)}`
      const isGood = score > 7

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
  {
    accessorKey: 'source',
    header: 'Source',
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
  },
]

export default function SubscriberAnalyticsPage() {
  const { data: subscribers, isLoading: isLoadingSubscribers } = useQuery({
    queryKey: ['analytics-subscribers'],
    queryFn: () => api.analytics.getSubscribers(),
  })

  const { data: growth, isLoading: isLoadingGrowth } = useQuery({
    queryKey: ['analytics-subscriber-growth-detailed'],
    queryFn: () => api.analytics.getSubscriberGrowthDetailed(),
  })

  const { data: engagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ['analytics-subscriber-engagement'],
    queryFn: () => api.analytics.getSubscriberEngagement(),
  })

  const { data: sources, isLoading: isLoadingSources } = useQuery({
    queryKey: ['analytics-subscriber-sources'],
    queryFn: () => api.analytics.getSubscriberSources(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscriber Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Analyze your subscriber base and engagement patterns.
        </p>
      </div>
      <Separator />
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers?.total.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {subscribers?.growthRate}% from last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers?.active.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {((subscribers?.active / subscribers?.total) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Engagement
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers?.averageEngagement.toFixed(1)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {subscribers?.engagementGrowth}% from last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Churn Rate
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers?.churnRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
                {subscribers?.churnRateChange}% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>
              Track subscriber growth and churn over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={growth?.data || []}
              categories={['new', 'churned', 'net']}
              index="date"
              colors={['green', 'red', 'blue']}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={80}
              height={350}
              showLegend
            />
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>
              Distribution of subscriber engagement scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={engagement?.data || []}
              categories={['count']}
              index="score"
              colors={['blue']}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={60}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Sources</CardTitle>
            <CardDescription>
              Distribution of subscriber acquisition sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={sources?.data || []}
              categories={['count']}
              index="source"
              colors={['blue']}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={60}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Subscriber List */}
        <div>
          <h4 className="text-sm font-medium mb-4">All Subscribers</h4>
          <DataTable
            columns={columns}
            data={subscribers?.items || []}
            isLoading={isLoadingSubscribers}
            searchableColumns={[
              {
                id: 'email',
                title: 'Email',
              },
            ]}
            filterableColumns={[
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
            ]}
          />
        </div>
      </div>
    </div>
  )
} 
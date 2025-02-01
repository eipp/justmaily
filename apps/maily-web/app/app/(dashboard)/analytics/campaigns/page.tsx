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
import { BarChart } from '@/components/ui/molecules/charts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Campaign {
  id: string
  name: string
  subject: string
  sentAt: string
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
}

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: 'name',
    header: 'Campaign',
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-sm text-muted-foreground">
            {campaign.subject}
          </div>
        </div>
      )
    },
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
    accessorKey: 'totalRecipients',
    header: 'Recipients',
    cell: ({ row }) => {
      return row.getValue('totalRecipients').toLocaleString()
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
    accessorKey: 'bounceRate',
    header: 'Bounce Rate',
    cell: ({ row }) => {
      const value = row.getValue('bounceRate') as number
      const formattedValue = `${value.toFixed(1)}%`
      const isGood = value < 2

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
    accessorKey: 'unsubscribeRate',
    header: 'Unsub Rate',
    cell: ({ row }) => {
      const value = row.getValue('unsubscribeRate') as number
      const formattedValue = `${value.toFixed(1)}%`
      const isGood = value < 0.5

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

export default function CampaignAnalyticsPage() {
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['analytics-campaigns-detailed'],
    queryFn: () => api.analytics.getCampaignsDetailed(),
  })

  const { data: performance, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['analytics-campaigns-performance'],
    queryFn: () => api.analytics.getCampaignsPerformance(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Campaign Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Analyze the performance of your email campaigns.
        </p>
      </div>
      <Separator />
      <div className="space-y-8">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Compare key metrics across your recent campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={performance?.data || []}
              categories={[
                'openRate',
                'clickRate',
                'bounceRate',
                'unsubscribeRate',
              ]}
              index="name"
              colors={['blue', 'green', 'red', 'yellow']}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              yAxisWidth={60}
              height={350}
              showLegend
            />
          </CardContent>
        </Card>

        {/* Campaign List */}
        <div>
          <h4 className="text-sm font-medium mb-4">All Campaigns</h4>
          <DataTable
            columns={columns}
            data={campaigns?.items || []}
            isLoading={isLoadingCampaigns}
            searchableColumns={[
              {
                id: 'name',
                title: 'Name',
              },
              {
                id: 'subject',
                title: 'Subject',
              },
            ]}
            filterableColumns={[
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
            ]}
          />
        </div>
      </div>
    </div>
  )
} 
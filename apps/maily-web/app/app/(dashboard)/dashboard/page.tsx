'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/atoms/card'
import { MainLayout } from '@/components/layouts/main-layout'
import { api } from '@/lib/api/client'
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/atoms/button'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/atoms/skeleton'
import { formatDistanceToNow } from 'date-fns'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Users,
  Mail,
  MousePointerClick,
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  status: string
  sentAt: string
  openRate: number
  clickRate: number
}

const columns: ColumnDef<Campaign>[] = [
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
      return formatDistanceToNow(new Date(row.original.sentAt), {
        addSuffix: true,
      })
    },
  },
  {
    accessorKey: 'openRate',
    header: 'Open Rate',
    cell: ({ row }) => {
      return `${row.original.openRate}%`
    },
  },
  {
    accessorKey: 'clickRate',
    header: 'Click Rate',
    cell: ({ row }) => {
      return `${row.original.clickRate}%`
    },
  },
]

export default function DashboardPage() {
  const router = useRouter()

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.analytics.getDashboardStats(),
  })

  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: () => api.campaigns.list({ limit: 5 }),
  })

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => api.analytics.getRecentActivities(),
  })

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push('/campaigns/new')}>
              Create Campaign
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalSubscribers.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaigns
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalCampaigns.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Open Rate
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.averageOpenRate.toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Click Rate
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.averageClickRate.toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={campaigns?.items || []}
                />
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                You had {activities?.length || 0} activities this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (
                <div className="space-y-8">
                  {activities?.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4"
                    >
                      <div className="rounded-full p-2 bg-secondary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 
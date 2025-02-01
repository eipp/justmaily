'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseProvider } from '@/lib/providers/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  MousePointerClick,
  AlertTriangle,
  Calendar,
  Clock,
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalEmails: number
    deliveryRate: number
    openRate: number
    clickRate: number
    bounceRate: number
  }
  engagement: {
    dailyOpens: { date: string; count: number }[]
    dailyClicks: { date: string; count: number }[]
    topLinks: { url: string; clicks: number }[]
  }
  deliverability: {
    bounces: { type: string; count: number }[]
    complaints: number
    blocks: number
  }
  timing: {
    bestSendTimes: { hour: number; engagementRate: number }[]
    bestDays: { day: string; engagementRate: number }[]
  }
}

export default function ProjectAnalytics({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadAnalytics()
  }, [params.id, dateRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch project to verify ownership
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('owner_id, settings')
        .eq('id', params.id)
        .single()

      if (projectError) throw projectError

      if (project.owner_id !== user?.id) {
        router.push('/dashboard')
        return
      }

      if (!project.settings.enableAnalytics) {
        setError('Analytics are not enabled for this project')
        setIsLoading(false)
        return
      }

      // Fetch analytics data from Vespa
      const analyticsData = await fetchAnalyticsData(params.id, dateRange)
      setAnalytics(analyticsData)
    } catch (error: any) {
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalyticsData = async (projectId: string, range: string): Promise<AnalyticsData> => {
    // This would be replaced with actual Vespa queries
    // For now, returning mock data
    return {
      overview: {
        totalEmails: 15000,
        deliveryRate: 98.5,
        openRate: 45.2,
        clickRate: 12.8,
        bounceRate: 1.5,
      },
      engagement: {
        dailyOpens: [
          { date: '2024-01-01', count: 250 },
          { date: '2024-01-02', count: 300 },
          // ... more data
        ],
        dailyClicks: [
          { date: '2024-01-01', count: 75 },
          { date: '2024-01-02', count: 90 },
          // ... more data
        ],
        topLinks: [
          { url: 'https://example.com/product', clicks: 450 },
          { url: 'https://example.com/pricing', clicks: 320 },
          // ... more data
        ],
      },
      deliverability: {
        bounces: [
          { type: 'hard', count: 150 },
          { type: 'soft', count: 75 },
        ],
        complaints: 25,
        blocks: 50,
      },
      timing: {
        bestSendTimes: [
          { hour: 9, engagementRate: 25.5 },
          { hour: 14, engagementRate: 22.8 },
          // ... more data
        ],
        bestDays: [
          { day: 'Tuesday', engagementRate: 24.5 },
          { day: 'Wednesday', engagementRate: 23.2 },
          // ... more data
        ],
      },
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Analytics</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your project's performance and engagement metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={loadAnalytics}>Refresh</Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalEmails.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sent during selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.deliveryRate}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.openRate}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Of delivered emails
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.clickRate}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Of opened emails
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="engagement" className="space-y-4">
          <TabsList>
            <TabsTrigger value="engagement" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="deliverability" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Deliverability
            </TabsTrigger>
            <TabsTrigger value="timing" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Timing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Opens</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chart component would go here */}
                  <div className="h-[200px] w-full bg-gray-100 dark:bg-gray-800">
                    {/* Placeholder for chart */}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Daily Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chart component would go here */}
                  <div className="h-[200px] w-full bg-gray-100 dark:bg-gray-800">
                    {/* Placeholder for chart */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliverability" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bounce Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.deliverability.bounces.map((bounce) => (
                      <div key={bounce.type} className="flex items-center justify-between">
                        <span className="capitalize">{bounce.type} Bounces</span>
                        <span className="font-medium">{bounce.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Complaints</span>
                      <span className="font-medium">{analytics.deliverability.complaints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Blocks</span>
                      <span className="font-medium">{analytics.deliverability.blocks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Best Send Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.timing.bestSendTimes.map((time) => (
                      <div key={time.hour} className="flex items-center justify-between">
                        <span>{time.hour}:00</span>
                        <span className="font-medium">{time.engagementRate}% engagement</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Best Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.timing.bestDays.map((day) => (
                      <div key={day.day} className="flex items-center justify-between">
                        <span>{day.day}</span>
                        <span className="font-medium">{day.engagementRate}% engagement</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
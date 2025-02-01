import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Users, BarChart3, ArrowUpRight } from 'lucide-react'

const stats = [
  {
    name: 'Total Campaigns',
    value: '12',
    change: '+2.1%',
    icon: Mail,
  },
  {
    name: 'Active Subscribers',
    value: '2,350',
    change: '+18.1%',
    icon: Users,
  },
  {
    name: 'Avg. Open Rate',
    value: '58.16%',
    change: '+5.4%',
    icon: BarChart3,
  },
]

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your email marketing analytics at a glance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-sm text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 rounded-md border p-4"
                >
                  <Mail className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Campaign "Summer Sale" was sent
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2,000 recipients • 58% open rate
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 
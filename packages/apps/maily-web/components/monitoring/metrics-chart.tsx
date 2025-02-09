import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MetricsChartProps {
  title: string
  data: Array<{[key: string]: string | number}>
  type?: 'area' | 'bar'
  dataKey: string
  xAxisKey?: string
  className?: string
  loading?: boolean
  height?: number
  color?: string
}

export function MetricsChart({
  title,
  data,
  type = 'area',
  dataKey,
  xAxisKey = 'timestamp',
  className,
  loading = false,
  height = 350,
  color = '#0ea5e9',
}: MetricsChartProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div 
            className="w-full animate-pulse rounded bg-gray-200"
            style={{ height: `${height}px` }}
          />
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {type === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey={xAxisKey}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  fillOpacity={1}
                  fill={`url(#gradient-${title})`}
                />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
} 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  className?: string
  loading?: boolean
}

export function MetricsCard({
  title,
  value,
  description,
  trend,
  className,
  loading = false,
}: MetricsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend !== undefined && (
          <span
            className={cn(
              'text-xs font-medium',
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
            )}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 
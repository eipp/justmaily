import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Column {
  key: string
  title: string
  format?: (value: any) => string | number
}

interface MetricsTableProps {
  title: string
  columns: Column[]
  data: Array<{[key: string]: any}>
  className?: string
  loading?: boolean
}

export function MetricsTable({
  title,
  columns,
  data,
  className,
  loading = false,
}: MetricsTableProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-full animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.format
                          ? column.format(row[column.key])
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
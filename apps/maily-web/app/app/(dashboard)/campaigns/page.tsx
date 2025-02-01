'use client'

import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/components/layouts/main-layout'
import { api } from '@/lib/api/client'
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/atoms/button'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/atoms/badge'
import { Checkbox } from '@/components/ui/atoms/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/atoms/dropdown-menu'
import { MoreHorizontal, Trash } from 'lucide-react'
import { toast } from '@/components/ui/atoms/use-toast'

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  subject: string
  sentAt: string | null
  scheduledFor: string | null
  openRate: number
  clickRate: number
}

const columns: ColumnDef<Campaign>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'sent'
              ? 'success'
              : status === 'failed'
              ? 'destructive'
              : 'secondary'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'sentAt',
    header: 'Sent',
    cell: ({ row }) => {
      const sentAt = row.getValue('sentAt') as string
      return sentAt
        ? formatDistanceToNow(new Date(sentAt), { addSuffix: true })
        : '-'
    },
  },
  {
    accessorKey: 'scheduledFor',
    header: 'Scheduled For',
    cell: ({ row }) => {
      const scheduledFor = row.getValue('scheduledFor') as string
      return scheduledFor
        ? formatDistanceToNow(new Date(scheduledFor), { addSuffix: true })
        : '-'
    },
  },
  {
    accessorKey: 'openRate',
    header: 'Open Rate',
    cell: ({ row }) => {
      const openRate = row.getValue('openRate') as number
      return openRate ? `${openRate.toFixed(1)}%` : '-'
    },
  },
  {
    accessorKey: 'clickRate',
    header: 'Click Rate',
    cell: ({ row }) => {
      const clickRate = row.getValue('clickRate') as number
      return clickRate ? `${clickRate.toFixed(1)}%` : '-'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const campaign = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(campaign.id)}
            >
              Copy campaign ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View analytics</DropdownMenuItem>
            {campaign.status === 'draft' && (
              <DropdownMenuItem>Edit campaign</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              Delete campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function CampaignsPage() {
  const router = useRouter()

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.campaigns.list(),
  })

  const handleDelete = async (selectedRows: string[]) => {
    try {
      await Promise.all(
        selectedRows.map((id) => api.campaigns.delete(id))
      )
      toast({
        title: 'Success',
        description: 'Selected campaigns have been deleted.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete selected campaigns.',
        variant: 'destructive',
      })
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push('/campaigns/new')}>
              Create Campaign
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={campaigns?.items || []}
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
                id: 'status',
                title: 'Status',
                options: [
                  { label: 'Draft', value: 'draft' },
                  { label: 'Scheduled', value: 'scheduled' },
                  { label: 'Sending', value: 'sending' },
                  { label: 'Sent', value: 'sent' },
                  { label: 'Failed', value: 'failed' },
                ],
              },
            ]}
            deleteRowsAction={(event) => {
              const selectedRowIds = Object.keys(
                event.currentTarget.form?.elements || {}
              ).filter(
                (key) =>
                  key.startsWith('row-select-') &&
                  (event.currentTarget.form?.elements[key] as HTMLInputElement)
                    ?.checked
              )
              handleDelete(selectedRowIds)
            }}
          />
        </div>
      </div>
    </MainLayout>
  )
} 
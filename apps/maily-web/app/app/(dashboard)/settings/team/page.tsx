'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Form } from '@/components/ui/molecules/form/form'
import { Input } from '@/components/ui/atoms/input'
import { Button } from '@/components/ui/atoms/button'
import { Separator } from '@/components/ui/atoms/separator'
import { DataTable } from '@/components/ui/molecules/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/atoms/avatar'
import { Badge } from '@/components/ui/atoms/badge'
import { api } from '@/lib/api/client'
import { toast } from '@/components/ui/atoms/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/atoms/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TeamMember {
  id: string
  fullName: string
  email: string
  role: 'owner' | 'admin' | 'member'
  avatarUrl?: string
  joinedAt: string
  lastActive: string
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']),
})

type InviteFormData = z.infer<typeof inviteSchema>

const columns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-x-3">
          <Avatar>
            <AvatarImage src={member.avatarUrl} alt={member.fullName} />
            <AvatarFallback>
              {member.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.fullName}</div>
            <div className="text-sm text-muted-foreground">
              {member.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Badge
          variant={
            role === 'owner'
              ? 'default'
              : role === 'admin'
              ? 'secondary'
              : 'outline'
          }
        >
          {role}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'joinedAt',
    header: 'Joined',
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue('joinedAt')), {
        addSuffix: true,
      })
    },
  },
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue('lastActive')), {
        addSuffix: true,
      })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original

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
            <DropdownMenuItem>View profile</DropdownMenuItem>
            {member.role !== 'owner' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Change role</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Remove member
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function TeamSettingsPage() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => api.team.listMembers(),
  })

  const { mutate: inviteMember, isLoading: isInviting } = useMutation({
    mutationFn: (data: InviteFormData) => api.team.invite(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invitation has been sent.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send invitation.',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-4">Invite Team Member</h4>
          <Form
            schema={inviteSchema}
            onSubmit={(data) => inviteMember(data)}
            defaultValues={{
              role: 'member',
            }}
          >
            {(form) => (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    error={form.formState.errors.email?.message}
                    {...form.register('email')}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isInviting}
                  loading={isInviting}
                >
                  Send Invite
                </Button>
              </div>
            )}
          </Form>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4">Team Members</h4>
          <DataTable
            columns={columns}
            data={members?.items || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
} 
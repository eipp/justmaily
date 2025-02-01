"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeamSettingsPage;
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const form_1 = require("@/components/ui/molecules/form/form");
const input_1 = require("@/components/ui/atoms/input");
const button_1 = require("@/components/ui/atoms/button");
const separator_1 = require("@/components/ui/atoms/separator");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const avatar_1 = require("@/components/ui/atoms/avatar");
const badge_1 = require("@/components/ui/atoms/badge");
const client_1 = require("@/lib/api/client");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const dropdown_menu_1 = require("@/components/ui/atoms/dropdown-menu");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const inviteSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    role: zod_1.z.enum(['admin', 'member']),
});
const columns = [
    {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => {
            const member = row.original;
            return (<div className="flex items-center gap-x-3">
          <avatar_1.Avatar>
            <avatar_1.AvatarImage src={member.avatarUrl} alt={member.fullName}/>
            <avatar_1.AvatarFallback>
              {member.fullName.charAt(0).toUpperCase()}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          <div>
            <div className="font-medium">{member.fullName}</div>
            <div className="text-sm text-muted-foreground">
              {member.email}
            </div>
          </div>
        </div>);
        },
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role');
            return (<badge_1.Badge variant={role === 'owner'
                    ? 'default'
                    : role === 'admin'
                        ? 'secondary'
                        : 'outline'}>
          {role}
        </badge_1.Badge>);
        },
    },
    {
        accessorKey: 'joinedAt',
        header: 'Joined',
        cell: ({ row }) => {
            return (0, date_fns_1.formatDistanceToNow)(new Date(row.getValue('joinedAt')), {
                addSuffix: true,
            });
        },
    },
    {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: ({ row }) => {
            return (0, date_fns_1.formatDistanceToNow)(new Date(row.getValue('lastActive')), {
                addSuffix: true,
            });
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const member = row.original;
            return (<dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
            </button_1.Button>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end">
            <dropdown_menu_1.DropdownMenuLabel>Actions</dropdown_menu_1.DropdownMenuLabel>
            <dropdown_menu_1.DropdownMenuItem>View profile</dropdown_menu_1.DropdownMenuItem>
            {member.role !== 'owner' && (<>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem>Change role</dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem className="text-destructive">
                  Remove member
                </dropdown_menu_1.DropdownMenuItem>
              </>)}
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
        },
    },
];
function TeamSettingsPage() {
    const { data: members, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['team-members'],
        queryFn: () => client_1.api.team.listMembers(),
    });
    const { mutate: inviteMember, isLoading: isInviting } = (0, react_query_1.useMutation)({
        mutationFn: (data) => client_1.api.team.invite(data),
        onSuccess: () => {
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Invitation has been sent.',
            });
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to send invitation.',
                variant: 'destructive',
            });
        },
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-4">Invite Team Member</h4>
          <form_1.Form schema={inviteSchema} onSubmit={(data) => inviteMember(data)} defaultValues={{
            role: 'member',
        }}>
            {(form) => {
            var _a;
            return (<div className="flex gap-4">
                <div className="flex-1">
                  <input_1.Input placeholder="Enter email address" error={(_a = form.formState.errors.email) === null || _a === void 0 ? void 0 : _a.message} {...form.register('email')}/>
                </div>
                <button_1.Button type="submit" disabled={isInviting} loading={isInviting}>
                  Send Invite
                </button_1.Button>
              </div>);
        }}
          </form_1.Form>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4">Team Members</h4>
          <data_table_1.DataTable columns={columns} data={(members === null || members === void 0 ? void 0 : members.items) || []} isLoading={isLoading}/>
        </div>
      </div>
    </div>);
}

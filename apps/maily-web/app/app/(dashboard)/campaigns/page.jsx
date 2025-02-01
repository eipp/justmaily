"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CampaignsPage;
const react_query_1 = require("@tanstack/react-query");
const main_layout_1 = require("@/components/layouts/main-layout");
const client_1 = require("@/lib/api/client");
const data_table_1 = require("@/components/ui/molecules/data-table/data-table");
const button_1 = require("@/components/ui/atoms/button");
const navigation_1 = require("next/navigation");
const date_fns_1 = require("date-fns");
const badge_1 = require("@/components/ui/atoms/badge");
const checkbox_1 = require("@/components/ui/atoms/checkbox");
const dropdown_menu_1 = require("@/components/ui/atoms/dropdown-menu");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const columns = [
    {
        id: 'select',
        header: ({ table }) => (<checkbox_1.Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all"/>),
        cell: ({ row }) => (<checkbox_1.Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row"/>),
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
            const status = row.getValue('status');
            return (<badge_1.Badge variant={status === 'sent'
                    ? 'success'
                    : status === 'failed'
                        ? 'destructive'
                        : 'secondary'}>
          {status}
        </badge_1.Badge>);
        },
    },
    {
        accessorKey: 'sentAt',
        header: 'Sent',
        cell: ({ row }) => {
            const sentAt = row.getValue('sentAt');
            return sentAt
                ? (0, date_fns_1.formatDistanceToNow)(new Date(sentAt), { addSuffix: true })
                : '-';
        },
    },
    {
        accessorKey: 'scheduledFor',
        header: 'Scheduled For',
        cell: ({ row }) => {
            const scheduledFor = row.getValue('scheduledFor');
            return scheduledFor
                ? (0, date_fns_1.formatDistanceToNow)(new Date(scheduledFor), { addSuffix: true })
                : '-';
        },
    },
    {
        accessorKey: 'openRate',
        header: 'Open Rate',
        cell: ({ row }) => {
            const openRate = row.getValue('openRate');
            return openRate ? `${openRate.toFixed(1)}%` : '-';
        },
    },
    {
        accessorKey: 'clickRate',
        header: 'Click Rate',
        cell: ({ row }) => {
            const clickRate = row.getValue('clickRate');
            return clickRate ? `${clickRate.toFixed(1)}%` : '-';
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const campaign = row.original;
            return (<dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
            </button_1.Button>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end">
            <dropdown_menu_1.DropdownMenuLabel>Actions</dropdown_menu_1.DropdownMenuLabel>
            <dropdown_menu_1.DropdownMenuItem onClick={() => navigator.clipboard.writeText(campaign.id)}>
              Copy campaign ID
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuItem>View details</dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem>View analytics</dropdown_menu_1.DropdownMenuItem>
            {campaign.status === 'draft' && (<dropdown_menu_1.DropdownMenuItem>Edit campaign</dropdown_menu_1.DropdownMenuItem>)}
            <dropdown_menu_1.DropdownMenuItem className="text-destructive">
              Delete campaign
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
        },
    },
];
function CampaignsPage() {
    const router = (0, navigation_1.useRouter)();
    const { data: campaigns, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['campaigns'],
        queryFn: () => client_1.api.campaigns.list(),
    });
    const handleDelete = async (selectedRows) => {
        try {
            await Promise.all(selectedRows.map((id) => client_1.api.campaigns.delete(id)));
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Selected campaigns have been deleted.',
            });
        }
        catch (error) {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to delete selected campaigns.',
                variant: 'destructive',
            });
        }
    };
    return (<main_layout_1.MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <div className="flex items-center space-x-2">
            <button_1.Button onClick={() => router.push('/campaigns/new')}>
              Create Campaign
            </button_1.Button>
          </div>
        </div>
        <div className="space-y-4">
          <data_table_1.DataTable columns={columns} data={(campaigns === null || campaigns === void 0 ? void 0 : campaigns.items) || []} searchableColumns={[
            {
                id: 'name',
                title: 'Name',
            },
            {
                id: 'subject',
                title: 'Subject',
            },
        ]} filterableColumns={[
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
        ]} deleteRowsAction={(event) => {
            var _a;
            const selectedRowIds = Object.keys(((_a = event.currentTarget.form) === null || _a === void 0 ? void 0 : _a.elements) || {}).filter((key) => {
                var _a, _b;
                return key.startsWith('row-select-') &&
                    ((_b = (_a = event.currentTarget.form) === null || _a === void 0 ? void 0 : _a.elements[key]) === null || _b === void 0 ? void 0 : _b.checked);
            });
            handleDelete(selectedRowIds);
        }}/>
        </div>
      </div>
    </main_layout_1.MainLayout>);
}

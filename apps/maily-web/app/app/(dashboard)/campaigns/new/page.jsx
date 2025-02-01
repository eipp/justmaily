"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewCampaignPage;
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const main_layout_1 = require("@/components/layouts/main-layout");
const form_1 = require("@/components/ui/molecules/form/form");
const button_1 = require("@/components/ui/atoms/button");
const input_1 = require("@/components/ui/atoms/input");
const select_1 = require("@/components/ui/atoms/select");
const tabs_1 = require("@/components/ui/atoms/tabs");
const client_1 = require("@/lib/api/client");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const editor_1 = require("@/components/ui/molecules/editor/editor");
const campaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    fromName: zod_1.z.string().min(1, 'From name is required'),
    fromEmail: zod_1.z.string().email('Invalid email address'),
    replyTo: zod_1.z.string().email('Invalid email address'),
    content: zod_1.z.object({
        html: zod_1.z.string().min(1, 'Content is required'),
        text: zod_1.z.string(),
    }),
    list: zod_1.z.string().min(1, 'List is required'),
    schedule: zod_1.z.enum(['now', 'later']),
    scheduledFor: zod_1.z.string().optional(),
});
function NewCampaignPage() {
    const router = (0, navigation_1.useRouter)();
    const { mutate: createCampaign, isLoading } = (0, react_query_1.useMutation)({
        mutationFn: (data) => client_1.api.campaigns.create(data),
        onSuccess: () => {
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Campaign has been created.',
            });
            router.push('/campaigns');
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to create campaign.',
                variant: 'destructive',
            });
        },
    });
    return (<main_layout_1.MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Create Campaign
          </h2>
        </div>
        <div className="space-y-4">
          <form_1.Form schema={campaignSchema} onSubmit={(data) => createCampaign(data)} defaultValues={{
            schedule: 'now',
            content: {
                html: '',
                text: '',
            },
        }}>
            {(form) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return (<div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <input_1.Input label="Campaign Name" placeholder="Enter campaign name" error={(_a = form.formState.errors.name) === null || _a === void 0 ? void 0 : _a.message} {...form.register('name')}/>
                    </div>
                    <div>
                      <input_1.Input label="Subject Line" placeholder="Enter subject line" error={(_b = form.formState.errors.subject) === null || _b === void 0 ? void 0 : _b.message} {...form.register('subject')}/>
                    </div>
                    <div>
                      <input_1.Input label="From Name" placeholder="Enter from name" error={(_c = form.formState.errors.fromName) === null || _c === void 0 ? void 0 : _c.message} {...form.register('fromName')}/>
                    </div>
                    <div>
                      <input_1.Input label="From Email" placeholder="Enter from email" error={(_d = form.formState.errors.fromEmail) === null || _d === void 0 ? void 0 : _d.message} {...form.register('fromEmail')}/>
                    </div>
                    <div>
                      <input_1.Input label="Reply-To Email" placeholder="Enter reply-to email" error={(_e = form.formState.errors.replyTo) === null || _e === void 0 ? void 0 : _e.message} {...form.register('replyTo')}/>
                    </div>
                    <div>
                      <select_1.Select label="Subscriber List" error={(_f = form.formState.errors.list) === null || _f === void 0 ? void 0 : _f.message} onValueChange={(value) => form.setValue('list', value)}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select a list"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="all">All Subscribers</select_1.SelectItem>
                          <select_1.SelectItem value="active">
                            Active Subscribers
                          </select_1.SelectItem>
                          <select_1.SelectItem value="inactive">
                            Inactive Subscribers
                          </select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                    <div>
                      <select_1.Select label="Schedule" onValueChange={(value) => form.setValue('schedule', value)} defaultValue="now">
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="now">Send Now</select_1.SelectItem>
                          <select_1.SelectItem value="later">Schedule</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                    {form.watch('schedule') === 'later' && (<div>
                        <input_1.Input type="datetime-local" label="Schedule Date" error={(_g = form.formState.errors.scheduledFor) === null || _g === void 0 ? void 0 : _g.message} {...form.register('scheduledFor')}/>
                      </div>)}
                  </div>
                  <div className="space-y-4">
                    <tabs_1.Tabs defaultValue="design">
                      <tabs_1.TabsList>
                        <tabs_1.TabsTrigger value="design">Design</tabs_1.TabsTrigger>
                        <tabs_1.TabsTrigger value="code">Code</tabs_1.TabsTrigger>
                        <tabs_1.TabsTrigger value="preview">Preview</tabs_1.TabsTrigger>
                      </tabs_1.TabsList>
                      <tabs_1.TabsContent value="design">
                        <editor_1.Editor value={form.watch('content.html')} onChange={(value) => form.setValue('content.html', value)}/>
                      </tabs_1.TabsContent>
                      <tabs_1.TabsContent value="code">
                        <textarea className="w-full h-[500px] font-mono p-4" value={form.watch('content.html')} onChange={(e) => form.setValue('content.html', e.target.value)}/>
                      </tabs_1.TabsContent>
                      <tabs_1.TabsContent value="preview">
                        <div className="w-full h-[500px] border p-4" dangerouslySetInnerHTML={{
                    __html: form.watch('content.html'),
                }}/>
                      </tabs_1.TabsContent>
                    </tabs_1.Tabs>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button_1.Button variant="outline" onClick={() => router.push('/campaigns')}>
                    Cancel
                  </button_1.Button>
                  <button_1.Button type="submit" disabled={isLoading} loading={isLoading}>
                    Create Campaign
                  </button_1.Button>
                </div>
              </div>);
        }}
          </form_1.Form>
        </div>
      </div>
    </main_layout_1.MainLayout>);
}

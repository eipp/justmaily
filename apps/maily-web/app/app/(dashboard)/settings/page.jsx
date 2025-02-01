"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const form_1 = require("@/components/ui/molecules/form/form");
const input_1 = require("@/components/ui/atoms/input");
const button_1 = require("@/components/ui/atoms/button");
const separator_1 = require("@/components/ui/atoms/separator");
const client_1 = require("@/lib/api/client");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const store_1 = require("@/store");
const generalSettingsSchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(1, 'Organization name is required'),
    website: zod_1.z.string().url('Invalid website URL'),
    defaultFromName: zod_1.z.string().min(1, 'Default from name is required'),
    defaultFromEmail: zod_1.z.string().email('Invalid email address'),
    defaultReplyTo: zod_1.z.string().email('Invalid email address'),
});
function SettingsPage() {
    const { organization, setOrganization } = (0, store_1.useStore)();
    const { mutate: updateSettings, isLoading } = (0, react_query_1.useMutation)({
        mutationFn: (data) => client_1.api.organizations.update(data),
        onSuccess: (data) => {
            setOrganization(data);
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Settings have been updated.',
            });
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to update settings.',
                variant: 'destructive',
            });
        },
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your organization settings and email defaults.
        </p>
      </div>
      <separator_1.Separator />
      <form_1.Form schema={generalSettingsSchema} onSubmit={(data) => updateSettings(data)} defaultValues={{
            organizationName: organization === null || organization === void 0 ? void 0 : organization.name,
            website: organization === null || organization === void 0 ? void 0 : organization.website,
            defaultFromName: organization === null || organization === void 0 ? void 0 : organization.defaultFromName,
            defaultFromEmail: organization === null || organization === void 0 ? void 0 : organization.defaultFromEmail,
            defaultReplyTo: organization === null || organization === void 0 ? void 0 : organization.defaultReplyTo,
        }}>
        {(form) => {
            var _a, _b, _c, _d, _e;
            return (<div className="space-y-8">
            <div className="grid gap-4">
              <div>
                <input_1.Input label="Organization Name" placeholder="Enter organization name" error={(_a = form.formState.errors.organizationName) === null || _a === void 0 ? void 0 : _a.message} {...form.register('organizationName')}/>
              </div>
              <div>
                <input_1.Input label="Website" placeholder="Enter website URL" error={(_b = form.formState.errors.website) === null || _b === void 0 ? void 0 : _b.message} {...form.register('website')}/>
              </div>
              <div>
                <input_1.Input label="Default From Name" placeholder="Enter default from name" error={(_c = form.formState.errors.defaultFromName) === null || _c === void 0 ? void 0 : _c.message} {...form.register('defaultFromName')}/>
              </div>
              <div>
                <input_1.Input label="Default From Email" placeholder="Enter default from email" error={(_d = form.formState.errors.defaultFromEmail) === null || _d === void 0 ? void 0 : _d.message} {...form.register('defaultFromEmail')}/>
              </div>
              <div>
                <input_1.Input label="Default Reply-To Email" placeholder="Enter default reply-to email" error={(_e = form.formState.errors.defaultReplyTo) === null || _e === void 0 ? void 0 : _e.message} {...form.register('defaultReplyTo')}/>
              </div>
            </div>
            <button_1.Button type="submit" disabled={isLoading} loading={isLoading}>
              Save Changes
            </button_1.Button>
          </div>);
        }}
      </form_1.Form>
    </div>);
}

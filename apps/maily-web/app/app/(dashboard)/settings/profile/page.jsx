"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileSettingsPage;
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const form_1 = require("@/components/ui/molecules/form/form");
const input_1 = require("@/components/ui/atoms/input");
const button_1 = require("@/components/ui/atoms/button");
const separator_1 = require("@/components/ui/atoms/separator");
const avatar_1 = require("@/components/ui/atoms/avatar");
const client_1 = require("@/lib/api/client");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const store_1 = require("@/store");
const profileSettingsSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'Full name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    avatarUrl: zod_1.z.string().url('Invalid avatar URL').optional(),
    title: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
});
function ProfileSettingsPage() {
    const { user, setUser } = (0, store_1.useStore)();
    const { mutate: updateProfile, isLoading } = (0, react_query_1.useMutation)({
        mutationFn: (data) => client_1.api.users.updateProfile(data),
        onSuccess: (data) => {
            setUser(data);
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Profile has been updated.',
            });
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to update profile.',
                variant: 'destructive',
            });
        },
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile information and preferences.
        </p>
      </div>
      <separator_1.Separator />
      <form_1.Form schema={profileSettingsSchema} onSubmit={(data) => updateProfile(data)} defaultValues={{
            fullName: user === null || user === void 0 ? void 0 : user.fullName,
            email: user === null || user === void 0 ? void 0 : user.email,
            avatarUrl: user === null || user === void 0 ? void 0 : user.avatarUrl,
            title: user === null || user === void 0 ? void 0 : user.title,
            bio: user === null || user === void 0 ? void 0 : user.bio,
        }}>
        {(form) => {
            var _a, _b, _c, _d, _e;
            return (<div className="space-y-8">
            <div className="flex items-center gap-x-6">
              <avatar_1.Avatar className="h-24 w-24">
                <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.avatarUrl} alt={user === null || user === void 0 ? void 0 : user.fullName}/>
                <avatar_1.AvatarFallback>
                  {(_a = user === null || user === void 0 ? void 0 : user.fullName) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div>
                <button_1.Button variant="outline" type="button">
                  Change Avatar
                </button_1.Button>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <input_1.Input label="Full Name" placeholder="Enter your full name" error={(_b = form.formState.errors.fullName) === null || _b === void 0 ? void 0 : _b.message} {...form.register('fullName')}/>
              </div>
              <div>
                <input_1.Input label="Email" placeholder="Enter your email" error={(_c = form.formState.errors.email) === null || _c === void 0 ? void 0 : _c.message} {...form.register('email')}/>
              </div>
              <div>
                <input_1.Input label="Title" placeholder="Enter your title" error={(_d = form.formState.errors.title) === null || _d === void 0 ? void 0 : _d.message} {...form.register('title')}/>
              </div>
              <div>
                <input_1.Input label="Bio" placeholder="Enter your bio" error={(_e = form.formState.errors.bio) === null || _e === void 0 ? void 0 : _e.message} {...form.register('bio')}/>
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

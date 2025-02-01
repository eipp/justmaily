'use client'

import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { Form } from '@/components/ui/molecules/form/form'
import { Input } from '@/components/ui/atoms/input'
import { Button } from '@/components/ui/atoms/button'
import { Separator } from '@/components/ui/atoms/separator'
import { api } from '@/lib/api/client'
import { toast } from '@/components/ui/atoms/use-toast'
import { useStore } from '@/store'

const generalSettingsSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  website: z.string().url('Invalid website URL'),
  defaultFromName: z.string().min(1, 'Default from name is required'),
  defaultFromEmail: z.string().email('Invalid email address'),
  defaultReplyTo: z.string().email('Invalid email address'),
})

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

export default function SettingsPage() {
  const { organization, setOrganization } = useStore()

  const { mutate: updateSettings, isLoading } = useMutation({
    mutationFn: (data: GeneralSettingsFormData) =>
      api.organizations.update(data),
    onSuccess: (data) => {
      setOrganization(data)
      toast({
        title: 'Success',
        description: 'Settings have been updated.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your organization settings and email defaults.
        </p>
      </div>
      <Separator />
      <Form
        schema={generalSettingsSchema}
        onSubmit={(data) => updateSettings(data)}
        defaultValues={{
          organizationName: organization?.name,
          website: organization?.website,
          defaultFromName: organization?.defaultFromName,
          defaultFromEmail: organization?.defaultFromEmail,
          defaultReplyTo: organization?.defaultReplyTo,
        }}
      >
        {(form) => (
          <div className="space-y-8">
            <div className="grid gap-4">
              <div>
                <Input
                  label="Organization Name"
                  placeholder="Enter organization name"
                  error={form.formState.errors.organizationName?.message}
                  {...form.register('organizationName')}
                />
              </div>
              <div>
                <Input
                  label="Website"
                  placeholder="Enter website URL"
                  error={form.formState.errors.website?.message}
                  {...form.register('website')}
                />
              </div>
              <div>
                <Input
                  label="Default From Name"
                  placeholder="Enter default from name"
                  error={form.formState.errors.defaultFromName?.message}
                  {...form.register('defaultFromName')}
                />
              </div>
              <div>
                <Input
                  label="Default From Email"
                  placeholder="Enter default from email"
                  error={form.formState.errors.defaultFromEmail?.message}
                  {...form.register('defaultFromEmail')}
                />
              </div>
              <div>
                <Input
                  label="Default Reply-To Email"
                  placeholder="Enter default reply-to email"
                  error={form.formState.errors.defaultReplyTo?.message}
                  {...form.register('defaultReplyTo')}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              Save Changes
            </Button>
          </div>
        )}
      </Form>
    </div>
  )
} 
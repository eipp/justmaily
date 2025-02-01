'use client'

import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { Form } from '@/components/ui/molecules/form/form'
import { Input } from '@/components/ui/atoms/input'
import { Button } from '@/components/ui/atoms/button'
import { Separator } from '@/components/ui/atoms/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/atoms/avatar'
import { api } from '@/lib/api/client'
import { toast } from '@/components/ui/atoms/use-toast'
import { useStore } from '@/store'

const profileSettingsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>

export default function ProfileSettingsPage() {
  const { user, setUser } = useStore()

  const { mutate: updateProfile, isLoading } = useMutation({
    mutationFn: (data: ProfileSettingsFormData) => api.users.updateProfile(data),
    onSuccess: (data) => {
      setUser(data)
      toast({
        title: 'Success',
        description: 'Profile has been updated.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile information and preferences.
        </p>
      </div>
      <Separator />
      <Form
        schema={profileSettingsSchema}
        onSubmit={(data) => updateProfile(data)}
        defaultValues={{
          fullName: user?.fullName,
          email: user?.email,
          avatarUrl: user?.avatarUrl,
          title: user?.title,
          bio: user?.bio,
        }}
      >
        {(form) => (
          <div className="space-y-8">
            <div className="flex items-center gap-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" type="button">
                  Change Avatar
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={form.formState.errors.fullName?.message}
                  {...form.register('fullName')}
                />
              </div>
              <div>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  error={form.formState.errors.email?.message}
                  {...form.register('email')}
                />
              </div>
              <div>
                <Input
                  label="Title"
                  placeholder="Enter your title"
                  error={form.formState.errors.title?.message}
                  {...form.register('title')}
                />
              </div>
              <div>
                <Input
                  label="Bio"
                  placeholder="Enter your bio"
                  error={form.formState.errors.bio?.message}
                  {...form.register('bio')}
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
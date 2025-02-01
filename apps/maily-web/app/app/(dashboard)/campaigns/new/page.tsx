'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { MainLayout } from '@/components/layouts/main-layout'
import { Form } from '@/components/ui/molecules/form/form'
import { Button } from '@/components/ui/atoms/button'
import { Input } from '@/components/ui/atoms/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/atoms/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/atoms/tabs'
import { api } from '@/lib/api/client'
import { toast } from '@/components/ui/atoms/use-toast'
import { Editor } from '@/components/ui/molecules/editor/editor'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  fromName: z.string().min(1, 'From name is required'),
  fromEmail: z.string().email('Invalid email address'),
  replyTo: z.string().email('Invalid email address'),
  content: z.object({
    html: z.string().min(1, 'Content is required'),
    text: z.string(),
  }),
  list: z.string().min(1, 'List is required'),
  schedule: z.enum(['now', 'later']),
  scheduledFor: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

export default function NewCampaignPage() {
  const router = useRouter()

  const { mutate: createCampaign, isLoading } = useMutation({
    mutationFn: (data: CampaignFormData) => api.campaigns.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Campaign has been created.',
      })
      router.push('/campaigns')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create campaign.',
        variant: 'destructive',
      })
    },
  })

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Create Campaign
          </h2>
        </div>
        <div className="space-y-4">
          <Form
            schema={campaignSchema}
            onSubmit={(data) => createCampaign(data)}
            defaultValues={{
              schedule: 'now',
              content: {
                html: '',
                text: '',
              },
            }}
          >
            {(form) => (
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Campaign Name"
                        placeholder="Enter campaign name"
                        error={form.formState.errors.name?.message}
                        {...form.register('name')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Subject Line"
                        placeholder="Enter subject line"
                        error={form.formState.errors.subject?.message}
                        {...form.register('subject')}
                      />
                    </div>
                    <div>
                      <Input
                        label="From Name"
                        placeholder="Enter from name"
                        error={form.formState.errors.fromName?.message}
                        {...form.register('fromName')}
                      />
                    </div>
                    <div>
                      <Input
                        label="From Email"
                        placeholder="Enter from email"
                        error={form.formState.errors.fromEmail?.message}
                        {...form.register('fromEmail')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Reply-To Email"
                        placeholder="Enter reply-to email"
                        error={form.formState.errors.replyTo?.message}
                        {...form.register('replyTo')}
                      />
                    </div>
                    <div>
                      <Select
                        label="Subscriber List"
                        error={form.formState.errors.list?.message}
                        onValueChange={(value) =>
                          form.setValue('list', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subscribers</SelectItem>
                          <SelectItem value="active">
                            Active Subscribers
                          </SelectItem>
                          <SelectItem value="inactive">
                            Inactive Subscribers
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        label="Schedule"
                        onValueChange={(value) =>
                          form.setValue('schedule', value as 'now' | 'later')
                        }
                        defaultValue="now"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Send Now</SelectItem>
                          <SelectItem value="later">Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.watch('schedule') === 'later' && (
                      <div>
                        <Input
                          type="datetime-local"
                          label="Schedule Date"
                          error={form.formState.errors.scheduledFor?.message}
                          {...form.register('scheduledFor')}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Tabs defaultValue="design">
                      <TabsList>
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="design">
                        <Editor
                          value={form.watch('content.html')}
                          onChange={(value) =>
                            form.setValue('content.html', value)
                          }
                        />
                      </TabsContent>
                      <TabsContent value="code">
                        <textarea
                          className="w-full h-[500px] font-mono p-4"
                          value={form.watch('content.html')}
                          onChange={(e) =>
                            form.setValue('content.html', e.target.value)
                          }
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div
                          className="w-full h-[500px] border p-4"
                          dangerouslySetInnerHTML={{
                            __html: form.watch('content.html'),
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/campaigns')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Create Campaign
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </MainLayout>
  )
} 
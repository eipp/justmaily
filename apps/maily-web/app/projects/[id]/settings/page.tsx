'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseProvider } from '@/lib/providers/supabase'
import { useSupabase } from '@/lib/providers/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertTriangle, Settings, BarChart3, Users, Trash2 } from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  description: string
  settings: {
    enableAI: boolean
    enableAnalytics: boolean
    enableCollaboration: boolean
    defaultLanguage: string
    timezone: string
  }
  integrations: {
    matrixRoom: string
    aiModel: string
    analyticsProvider: string
  }
  owner_id: string
  created_at: string
  updated_at: string
}

export default function ProjectSettings({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [project, setProject] = useState<ProjectData | null>(null)

  useEffect(() => {
    loadProject()
  }, [params.id])

  const loadProject = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data.owner_id !== user?.id) {
        router.push('/dashboard')
        return
      }

      setProject(data)
    } catch (error: any) {
      setError('Failed to load project settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: 'settings' | 'integrations',
    field?: string
  ) => {
    if (!project) return

    if (section && field) {
      setProject((prev) => ({
        ...prev!,
        [section]: {
          ...prev![section],
          [field]: e.target.value,
        },
      }))
    } else {
      setProject((prev) => ({
        ...prev!,
        [e.target.name]: e.target.value,
      }))
    }
  }

  const handleToggleSetting = (setting: keyof ProjectData['settings']) => {
    if (!project) return

    setProject((prev) => ({
      ...prev!,
      settings: {
        ...prev!.settings,
        [setting]: !prev!.settings[setting],
      },
    }))
  }

  const handleSave = async () => {
    if (!project) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          settings: project.settings,
          integrations: project.integrations,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError('Failed to save project settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError('Failed to delete project')
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading project settings...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Project not found</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your project settings, integrations, and analytics
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm text-green-800 dark:text-green-200">
              Project settings saved successfully
            </p>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={project.name}
                onChange={handleInputChange}
                required
                className="mt-1"
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={project.description}
                onChange={handleInputChange}
                className="mt-1"
                disabled={isSaving}
              />
            </div>
          </div>

          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Project Settings</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableAI">Enable AI Features</Label>
                    <input
                      type="checkbox"
                      id="enableAI"
                      checked={project.settings.enableAI}
                      onChange={() => handleToggleSetting('enableAI')}
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                    <input
                      type="checkbox"
                      id="enableAnalytics"
                      checked={project.settings.enableAnalytics}
                      onChange={() => handleToggleSetting('enableAnalytics')}
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCollaboration">Enable Collaboration</Label>
                    <input
                      type="checkbox"
                      id="enableCollaboration"
                      checked={project.settings.enableCollaboration}
                      onChange={() => handleToggleSetting('enableCollaboration')}
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <select
                      id="defaultLanguage"
                      value={project.settings.defaultLanguage}
                      onChange={(e) =>
                        handleInputChange(e as any, 'settings', 'defaultLanguage')
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      disabled={isSaving}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={project.settings.timezone}
                      onChange={(e) =>
                        handleInputChange(e as any, 'settings', 'timezone')
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      disabled={isSaving}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Integrations</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="matrixRoom">Matrix Room ID</Label>
                    <Input
                      id="matrixRoom"
                      value={project.integrations.matrixRoom}
                      onChange={(e) =>
                        handleInputChange(e, 'integrations', 'matrixRoom')
                      }
                      className="mt-1"
                      placeholder="!roomid:matrix.org"
                      disabled={isSaving || !project.settings.enableCollaboration}
                    />
                  </div>

                  <div>
                    <Label htmlFor="aiModel">AI Model</Label>
                    <select
                      id="aiModel"
                      value={project.integrations.aiModel}
                      onChange={(e) =>
                        handleInputChange(e as any, 'integrations', 'aiModel')
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      disabled={isSaving || !project.settings.enableAI}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Analytics Configuration</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="analyticsProvider">Analytics Provider</Label>
                    <select
                      id="analyticsProvider"
                      value={project.integrations.analyticsProvider}
                      onChange={(e) =>
                        handleInputChange(e as any, 'integrations', 'analyticsProvider')
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      disabled={isSaving || !project.settings.enableAnalytics}
                    >
                      <option value="vespa">Vespa</option>
                      <option value="elasticsearch">Elasticsearch</option>
                      <option value="clickhouse">ClickHouse</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
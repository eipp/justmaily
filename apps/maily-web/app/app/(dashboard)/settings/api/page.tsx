'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/button'
import { Separator } from '@/components/ui/atoms/separator'
import { api } from '@/lib/api/client'
import { toast } from '@/components/ui/atoms/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/atoms/card'
import { Badge } from '@/components/ui/atoms/badge'
import { Input } from '@/components/ui/atoms/input'
import { Copy, Key, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string | null
  createdAt: string
}

export default function ApiSettingsPage() {
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.apiKeys.list(),
  })

  const { mutate: createApiKey, isLoading: isCreating } = useMutation({
    mutationFn: (name: string) => api.apiKeys.create({ name }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'API key has been created.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create API key.',
        variant: 'destructive',
      })
    },
  })

  const { mutate: revokeApiKey, isLoading: isRevoking } = useMutation({
    mutationFn: (id: string) => api.apiKeys.revoke(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'API key has been revoked.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key.',
        variant: 'destructive',
      })
    },
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'API key has been copied to clipboard.',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys and access the API documentation.
        </p>
      </div>
      <Separator />
      <div className="space-y-8">
        {/* API Documentation */}
        <div>
          <h4 className="text-sm font-medium mb-4">API Documentation</h4>
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn how to integrate Maily with your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Base URL</h5>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  https://api.maily.app/v1
                </code>
              </div>
              <div>
                <h5 className="font-medium mb-2">Authentication</h5>
                <p className="text-sm text-muted-foreground">
                  All API requests must include your API key in the
                  Authorization header:
                </p>
                <pre className="mt-2 rounded bg-muted p-4 overflow-x-auto">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Full Documentation
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* API Keys */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">API Keys</h4>
            <Button
              onClick={() => createApiKey('Default')}
              disabled={isCreating}
              loading={isCreating}
            >
              <Key className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
          <div className="space-y-4">
            {apiKeys?.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{apiKey.name}</CardTitle>
                      <CardDescription>
                        Created{' '}
                        {formatDistanceToNow(new Date(apiKey.createdAt), {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    {apiKey.lastUsed && (
                      <Badge variant="secondary">
                        Last used{' '}
                        {formatDistanceToNow(new Date(apiKey.lastUsed), {
                          addSuffix: true,
                        })}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-x-2">
                    <Input
                      value={apiKey.key}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    onClick={() => revokeApiKey(apiKey.id)}
                    disabled={isRevoking}
                    loading={isRevoking}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revoke Key
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
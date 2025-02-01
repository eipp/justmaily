import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkspaceCard } from '@/components/workspace/workspace-card'
import { AssistantChat } from '@/components/ai/assistant-chat'

// Mock data - replace with actual API calls
const workspaces = [
  {
    id: '1',
    name: 'Q1 Marketing Campaigns',
    description: 'All marketing campaigns for Q1 2024, including product launches and customer retention initiatives.',
    stats: {
      members: 8,
      campaigns: 12,
      activeAgents: 3,
      nextScheduled: 'Tomorrow',
      openRate: 45,
    },
  },
  {
    id: '2',
    name: 'Customer Onboarding',
    description: 'Email sequences and campaigns for new customer onboarding and product education.',
    stats: {
      members: 5,
      campaigns: 8,
      activeAgents: 2,
      nextScheduled: 'Today',
      openRate: 62,
    },
  },
]

export default function WorkspacesPage() {
  const handleOpenWorkspace = (id: string) => {
    // Add navigation logic here
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground mt-2">
            Manage your email marketing projects and collaborate with your team.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              {...workspace}
              onOpen={handleOpenWorkspace}
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-6">
          <AssistantChat />
        </div>
      </div>
    </div>
  )
} 
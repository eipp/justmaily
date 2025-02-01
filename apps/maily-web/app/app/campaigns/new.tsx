import React from 'react'
import { useRouter } from 'next/router'
import { CampaignWizard } from '@/components/campaigns/campaign-wizard'
import { AssistantChat } from '@/components/ai/assistant-chat'

export default function NewCampaignPage() {
  const router = useRouter()

  const handleComplete = async (data: any) => {
    // Add API call to create campaign
    router.push('/campaigns')
  }

  const handleCancel = () => {
    router.push('/campaigns')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground mt-2">
            Create a new email campaign with AI-powered assistance at every step.
          </p>
        </div>

        <CampaignWizard onComplete={handleComplete} onCancel={handleCancel} />
      </div>

      <div className="lg:sticky lg:top-6">
        <AssistantChat />
      </div>
    </div>
  )
} 
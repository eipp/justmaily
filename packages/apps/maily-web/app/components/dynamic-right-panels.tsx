'use client'

import { useState } from 'react'
import { useProjectMemory } from '@/lib/hooks/use-project-memory'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronRightIcon, XIcon } from 'lucide-react'
import { OpenCanvas } from '@opencanvas/react'
import { TLDraw } from '@tldraw/tldraw'
import { cn } from '@/lib/utils'

interface Panel {
  id: string
  type: 'document' | 'preview' | 'analytics' | 'collaboration'
  title: string
  content: any
  metadata?: Record<string, any>
}

export function DynamicRightPanels() {
  const [isOpen, setIsOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const { currentProject, activePanels } = useProjectMemory()

  if (!isOpen || !activePanels.length) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-none"
        onClick={() => setIsOpen(true)}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="flex w-96 flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <h3 className="text-lg font-semibold">{activePanel?.title || 'Panel'}</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <ChevronRightIcon className="h-5 w-5 rotate-180" />
          </Button>
          {activePanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActivePanel(null)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Panel Tabs */}
      <Tabs
        value={activePanel?.id || activePanels[0]?.id}
        onValueChange={(value) => {
          const panel = activePanels.find(p => p.id === value)
          setActivePanel(panel || null)
        }}
      >
        <TabsList className="w-full justify-start px-4 py-2">
          {activePanels.map((panel) => (
            <TabsTrigger
              key={panel.id}
              value={panel.id}
              className="min-w-[100px]"
            >
              {panel.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Panel Content */}
        <ScrollArea className="flex-grow">
          {activePanels.map((panel) => (
            <TabsContent
              key={panel.id}
              value={panel.id}
              className="m-0 p-4"
            >
              {panel.type === 'document' && (
                <div className="h-full">
                  <OpenCanvas
                    documentId={panel.metadata?.documentId}
                    readOnly={false}
                    collaborative={true}
                  />
                </div>
              )}

              {panel.type === 'preview' && (
                <div className="h-full">
                  {/* Document preview with annotations */}
                  <div className="relative h-full">
                    <iframe
                      src={panel.content.url}
                      className="h-full w-full rounded-lg border"
                    />
                    <TLDraw
                      className="absolute inset-0"
                      onMount={() => {/* Initialize drawing */}}
                    />
                  </div>
                </div>
              )}

              {panel.type === 'analytics' && (
                <div className="space-y-4">
                  {/* Analytics content */}
                  <iframe
                    src={`/api/grafana/d/${panel.metadata?.dashboardId}`}
                    className="h-[600px] w-full rounded-lg border"
                  />
                </div>
              )}

              {panel.type === 'collaboration' && (
                <div className="space-y-4">
                  {/* Collaboration tools */}
                  <div className="h-[400px] rounded-lg border">
                    {/* Matrix chat component */}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  )
} 
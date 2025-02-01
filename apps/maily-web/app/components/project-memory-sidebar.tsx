'use client'

import { useProjectMemory } from '@/lib/hooks/use-project-memory'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { PlusIcon, FolderIcon, ChartIcon, UsersIcon, MailIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProjectMemorySidebar() {
  const router = useRouter()
  const { currentProject, projects, createProject, switchProject } = useProjectMemory()

  return (
    <div className="flex h-full flex-col">
      {/* Project Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => createProject()}
          title="Create New Project"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* Projects List */}
      <ScrollArea className="flex-grow px-4 py-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              'group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800',
              project.id === currentProject?.id && 'bg-gray-100 dark:bg-gray-800'
            )}
            role="button"
            onClick={() => switchProject(project.id)}
          >
            <FolderIcon className="h-5 w-5 text-gray-400" />
            <span className="flex-grow truncate">{project.name}</span>
          </div>
        ))}
      </ScrollArea>

      <Separator />

      {/* Project Navigation */}
      {currentProject && (
        <nav className="flex flex-col gap-1 p-4">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => router.push(`/projects/${currentProject.id}/campaigns`)}
          >
            <MailIcon className="mr-2 h-5 w-5" />
            Campaigns
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => router.push(`/projects/${currentProject.id}/contacts`)}
          >
            <UsersIcon className="mr-2 h-5 w-5" />
            Contacts
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => router.push(`/projects/${currentProject.id}/analytics`)}
          >
            <ChartIcon className="mr-2 h-5 w-5" />
            Analytics
          </Button>
        </nav>
      )}
    </div>
  )
} 
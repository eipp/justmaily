'use client'

import { useState } from 'react'
import { useProjectMemory } from '@/lib/hooks/use-project-memory'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  SearchIcon, 
  MessageSquareIcon, 
  ChevronLeftIcon,
  FilterIcon,
  PinIcon,
  BookmarkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  isPinned: boolean
  isBookmarked: boolean
  type: 'text' | 'image' | 'file' | 'action'
  metadata?: Record<string, any>
}

export function ChatHistorySidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { currentProject, chatHistory } = useProjectMemory()
  const [filter, setFilter] = useState<'all' | 'pinned' | 'bookmarked'>('all')

  const filteredHistory = chatHistory.filter((message) => {
    if (searchQuery) {
      if (!message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
    }

    switch (filter) {
      case 'pinned':
        return message.isPinned
      case 'bookmarked':
        return message.isBookmarked
      default:
        return true
    }
  })

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-none"
        onClick={() => setIsOpen(true)}
      >
        <ChevronLeftIcon className="h-5 w-5 rotate-180" />
      </Button>
    )
  }

  return (
    <div className="flex w-80 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <h3 className="text-lg font-semibold">Chat History</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <FilterIcon className="mr-1 h-4 w-4" />
            All
          </Button>
          <Button
            variant={filter === 'pinned' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('pinned')}
          >
            <PinIcon className="mr-1 h-4 w-4" />
            Pinned
          </Button>
          <Button
            variant={filter === 'bookmarked' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('bookmarked')}
          >
            <BookmarkIcon className="mr-1 h-4 w-4" />
            Bookmarked
          </Button>
        </div>
      </div>

      <Separator />

      {/* Messages List */}
      <ScrollArea className="flex-grow">
        <div className="space-y-2 p-4">
          {filteredHistory.map((message) => (
            <div
              key={message.id}
              className={cn(
                'group relative rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700',
                message.isPinned && 'bg-blue-50 dark:bg-blue-900/20',
                message.isBookmarked && 'border-l-2 border-yellow-400'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquareIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {format(message.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {/* Toggle pin */}}
                  >
                    <PinIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {/* Toggle bookmark */}}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-sm">
                {message.content}
              </p>
              {message.type !== 'text' && (
                <div className="mt-2 text-xs text-gray-500">
                  {message.type === 'image' && 'Image'}
                  {message.type === 'file' && 'File'}
                  {message.type === 'action' && 'Action'}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 
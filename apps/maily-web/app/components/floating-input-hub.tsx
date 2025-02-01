'use client'

import { useState, useRef } from 'react'
import { useProjectMemory } from '@/lib/hooks/use-project-memory'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MicIcon,
  PaperclipIcon,
  SendIcon,
  SmileIcon,
  PencilIcon,
  SparklesIcon,
  StopCircleIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TLDraw } from '@tldraw/tldraw'

interface AICommand {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const aiCommands: AICommand[] = [
  {
    id: 'personalize',
    title: 'Personalize Content',
    description: 'Generate personalized content based on recipient data',
    icon: <SparklesIcon className="h-4 w-4" />
  },
  {
    id: 'optimize',
    title: 'Optimize Campaign',
    description: 'Suggest improvements for campaign performance',
    icon: <SparklesIcon className="h-4 w-4" />
  },
  {
    id: 'analyze',
    title: 'Analyze Results',
    description: 'Analyze campaign results and provide insights',
    icon: <SparklesIcon className="h-4 w-4" />
  }
]

export function FloatingInputHub() {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentProject, sendMessage } = useProjectMemory()

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage({
      content: message,
      type: 'text',
      timestamp: new Date()
    })
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    // Handle file upload
    Array.from(files).forEach(file => {
      sendMessage({
        content: file.name,
        type: 'file',
        timestamp: new Date(),
        metadata: {
          file,
          size: file.size,
          type: file.type
        }
      })
    })
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Handle voice recording
  }

  return (
    <div className="relative border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
      <div className="mx-auto max-w-4xl">
        {isDrawing ? (
          <div className="mb-4 rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Drawing Mode</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawing(false)}
              >
                Done
              </Button>
            </div>
            <TLDraw
              className="h-[200px] w-full"
              onMount={() => {/* Initialize drawing */}}
            />
          </div>
        ) : null}

        <div className="flex items-start space-x-4">
          {/* Main Input */}
          <div className="flex-grow">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[60px] resize-none"
              rows={1}
            />
            
            {/* AI Suggestions */}
            {message && (
              <div className="mt-2">
                <ScrollArea className="h-20">
                  <div className="space-y-1">
                    {aiCommands.map((command) => (
                      <Button
                        key={command.id}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {/* Execute AI command */}}
                      >
                        {command.icon}
                        <div className="ml-2">
                          <div className="font-medium">{command.title}</div>
                          <div className="text-xs text-gray-500">{command.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Voice Input */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'transition-colors',
                isRecording && 'text-red-500 hover:text-red-600'
              )}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <StopCircleIcon className="h-5 w-5" />
              ) : (
                <MicIcon className="h-5 w-5" />
              )}
            </Button>

            {/* File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperclipIcon className="h-5 w-5" />
            </Button>

            {/* Drawing Tool */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawing(!isDrawing)}
            >
              <PencilIcon className="h-5 w-5" />
            </Button>

            {/* Emoji Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SmileIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                {/* Emoji picker content */}
              </PopoverContent>
            </Popover>

            {/* Send Button */}
            <Button
              variant="default"
              size="icon"
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
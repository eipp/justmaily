import { createContext, useContext } from 'react'
import { useCompletion, useChat } from 'ai/react'
import { Message } from 'ai'

interface VercelAIContextType {
  completion: ReturnType<typeof useCompletion>
  chat: ReturnType<typeof useChat>
  isLoading: boolean
}

const VercelAIContext = createContext<VercelAIContextType | undefined>(undefined)

export function VercelAIProvider({ children }: { children: React.ReactNode }) {
  const completion = useCompletion({
    api: '/api/completion',
    onError: (error) => {
      console.error('Completion error:', error)
    },
    onFinish: (_prompt, completion) => {
    },
  })

  const chat = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
    onFinish: (message) => {
    },
  })

  const isLoading = completion.isLoading || chat.isLoading

  return (
    <VercelAIContext.Provider value={{ completion, chat, isLoading }}>
      {children}
    </VercelAIContext.Provider>
  )
}

export function useVercelAI() {
  const context = useContext(VercelAIContext)
  if (context === undefined) {
    throw new Error('useVercelAI must be used within a VercelAIProvider')
  }
  return context
}

export function useCompletion() {
  const { completion } = useVercelAI()
  return completion
}

export function useChat() {
  const { chat } = useVercelAI()
  return chat
}

export function useAILoading() {
  const { isLoading } = useVercelAI()
  return isLoading
}

export type { Message } 
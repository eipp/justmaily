// Types
export * from './types'

// Base client
export { type AIClient, BaseAIClient } from './clients/base'

// Provider-specific clients
export { OpenAIClient } from './clients/openai'
export { AnthropicClient } from './clients/anthropic'
export { GoogleAIClient } from './clients/google'

// Factory
export { AIClientFactory } from './clients/factory'

// Re-export Vercel AI SDK components
export type {
  Message,
  CreateMessage
} from 'ai'

// Re-export analytics
export { Analytics } from '@vercel/analytics/react'
export type { AnalyticsProps as AnalyticsConfig } from '@vercel/analytics/react' 
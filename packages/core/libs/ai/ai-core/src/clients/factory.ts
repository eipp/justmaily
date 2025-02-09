import type { ModelProvider } from '../types'
import { OpenAIClient } from './openai'
import { AnthropicClient } from './anthropic'
import { GoogleAIClient } from './google'
import type { AIClient } from './base'

export class AIClientFactory {
  private static clients: Map<string, AIClient> = new Map()

  static createClient(
    provider: ModelProvider,
    apiKey: string,
    apiEndpoint?: string
  ): AIClient {
    const cacheKey = `${provider}:${apiKey}:${apiEndpoint || ''}`
    
    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)!
    }

    let client: AIClient

    switch (provider) {
      case 'openai':
        client = new OpenAIClient(apiKey)
        break
      case 'anthropic':
        client = new AnthropicClient(apiKey)
        break
      case 'google':
        client = new GoogleAIClient(apiKey)
        break
      case 'deepseek':
      case 'custom':
        throw new Error(`Provider ${provider} not implemented yet`)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    this.clients.set(cacheKey, client)
    return client
  }

  static clearClients(): void {
    this.clients.clear()
  }
} 
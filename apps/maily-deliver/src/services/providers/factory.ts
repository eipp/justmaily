import { EmailProvider, EmailProviderConfig, BaseEmailProvider } from './base'
import { SendGridProvider } from './sendgrid'
import { SESProvider } from './ses'
import { createSESConfig } from '../../config/ses'
import { MetricsService } from '../../lib/monitoring'
import { Message, MessageResponse } from '../../types'

export interface ProviderConfig {
  provider: 'ses' | 'sendgrid'
  credentials: EmailProviderConfig
}

export class ProviderFactory {
  private providers: Map<string, EmailProvider> = new Map()
  private metrics: MetricsService
  
  constructor(
    private configs: Record<string, EmailProviderConfig>,
    metrics: MetricsService
  ) {
    this.metrics = metrics
    this.initializeProviders()
  }

  private initializeProviders() {
    for (const [name, config] of Object.entries(this.configs)) {
      try {
        const provider = this.createProvider(name, config)
        if (provider) {
          this.providers.set(name, provider)
          this.metrics.recordProviderInitialized(name)
        }
      } catch (error) {
        console.error(`Failed to initialize provider ${name}:`, error)
        this.metrics.recordProviderError(name, 'initialization_failed')
      }
    }
  }

  private createProvider(name: string, config: EmailProviderConfig): EmailProvider | null {
    switch (name) {
      case 'sendgrid':
        return new SendGridProvider(config)
      case 'ses':
        // Validate and create SES config
        const sesConfig = createSESConfig(config)
        return this.createSESProvider(sesConfig)
      default:
        console.warn(`Unknown provider type: ${name}`)
        return null
    }
  }

  private createSESProvider(config: SESConfig): SESProvider {
    return new SESProvider({
      ...config,
      apiKey: config.apiKey || '',
    });
  }

  async sendEmail(message: Message, preferredProvider?: string): Promise<MessageResponse> {
    const provider = await this.getProvider(preferredProvider)
    if (!provider) {
      throw new Error('No available email providers')
    }

    try {
      const response = await provider.sendEmail(message)
      await this.metrics.recordProviderSuccess(provider.name)
      return {
        ...response,
        timestamp: response.timestamp.toISOString()
      }
    } catch (error) {
      await this.metrics.recordProviderFailure(provider.name)
      
      // Try fallback providers if available
      const fallbackProviders = this.configs[provider.name]?.fallbackProviders || []
      for (const fallbackName of fallbackProviders) {
        const fallbackProvider = this.providers.get(fallbackName)
        if (fallbackProvider) {
          try {
            const response = await fallbackProvider.sendEmail(message)
            await this.metrics.recordProviderSuccess(fallbackProvider.name)
            return {
              ...response,
              timestamp: response.timestamp.toISOString()
            }
          } catch (fallbackError) {
            await this.metrics.recordProviderFailure(fallbackProvider.name)
            continue
          }
        }
      }
      
      throw error
    }
  }

  async sendBatch(messages: Message[], preferredProvider?: string): Promise<MessageResponse[]> {
    const provider = await this.getProvider(preferredProvider)
    if (!provider) {
      throw new Error('No available email providers')
    }

    if (!provider.sendBatch) {
      // Fall back to sending messages individually
      const responses: MessageResponse[] = []
      for (const message of messages) {
        try {
          const response = await this.sendEmail(message, preferredProvider)
          responses.push(response)
        } catch (error) {
          responses.push({
            id: '',
            status: 'failed',
            provider: provider.name,
            timestamp: new Date(),
            error: error.message
          })
        }
      }
      return responses
    }

    try {
      const responses = await provider.sendBatch(messages)
      await this.metrics.recordProviderSuccess(provider.name)
      return responses
    } catch (error) {
      await this.metrics.recordProviderFailure(provider.name)
      
      // Try fallback providers if available
      const fallbackProviders = this.configs[provider.name]?.fallbackProviders || []
      for (const fallbackName of fallbackProviders) {
        const fallbackProvider = this.providers.get(fallbackName)
        if (fallbackProvider && fallbackProvider.sendBatch) {
          try {
            const responses = await fallbackProvider.sendBatch(messages)
            await this.metrics.recordProviderSuccess(fallbackProvider.name)
            return responses
          } catch (fallbackError) {
            await this.metrics.recordProviderFailure(fallbackProvider.name)
            continue
          }
        }
      }
      
      throw error
    }
  }

  private async getProvider(preferredProvider?: string): Promise<EmailProvider | null> {
    if (preferredProvider) {
      const provider = this.providers.get(preferredProvider)
      if (provider && await this.isProviderHealthy(provider)) {
        return provider
      }
    }

    // Find the first healthy provider
    for (const [name, provider] of this.providers.entries()) {
      if (await this.isProviderHealthy(provider)) {
        return provider
      }
    }

    return null
  }

  private async isProviderHealthy(provider: EmailProvider): Promise<boolean> {
    try {
      if (provider.healthCheck) {
        return await provider.healthCheck()
      }
      return true
    } catch (error) {
      await this.metrics.recordProviderFailure(provider.name)
      return false
    }
  }

  async getProviderAnalytics(providerName: string, timeframe: { start: Date; end: Date }) {
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`)
    }

    return await provider.getAnalytics(timeframe)
  }

  async getAllProvidersAnalytics(timeframe: { start: Date; end: Date }) {
    const analytics: Record<string, ProviderAnalytics> = {}
    
    for (const [name, provider] of this.providers.entries()) {
      try {
        analytics[name] = await provider.getAnalytics(timeframe)
      } catch (error) {
        console.error(`Failed to get analytics for provider ${name}:`, error)
        analytics[name] = null
      }
    }
    
    return analytics
  }

  create(type: string, config: EmailProviderConfig): BaseEmailProvider {
    switch (type.toLowerCase()) {
      case 'sendgrid':
        return new SendGridProvider(config as SendGridConfig)
      case 'ses':
        return new SESProvider(config as SESConfig)
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}

export function createEmailProvider(config: ProviderConfig): EmailProvider {
  switch (config.provider) {
    case 'ses':
      return new SESProvider(config.credentials);
    case 'sendgrid':
      return new SendGridProvider(config.credentials);
    default:
      // Recommend adding sentry integration for missing provider errors
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
} 
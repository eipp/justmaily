import { OpenAI } from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { MetricsService } from './metrics-service'
import { SecurityService } from './security-service'
import { Redis } from 'ioredis'

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'local'
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string[]
  apiKey?: string
  apiEndpoint?: string
}

export interface GenerationOptions {
  stream?: boolean
  cacheKey?: string
  cacheTTL?: number
  priority?: 'low' | 'medium' | 'high'
  maxRetries?: number
  timeout?: number
  contextWindow?: number
}

export interface GenerationResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata: {
    model: string
    latency: number
    cached: boolean
    retries: number
  }
}

export class AIService {
  private openai: OpenAI
  private anthropic: Anthropic
  private redis: Redis
  private metrics: MetricsService
  private security: SecurityService
  private rateLimiter: Map<string, { tokens: number; reset: number }>

  constructor(
    private config: {
      openaiApiKey: string
      anthropicApiKey: string
      redisUrl: string
      defaultModel: string
    },
    metrics: MetricsService,
    security: SecurityService
  ) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey })
    this.anthropic = new Anthropic({ apiKey: config.anthropicApiKey })
    this.redis = new Redis(config.redisUrl)
    this.metrics = metrics
    this.security = security
    this.rateLimiter = new Map()
  }

  async generateContent(
    prompt: string,
    modelConfig: AIModelConfig,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now()
    const cacheKey = options.cacheKey ? `ai:generation:${options.cacheKey}` : null

    try {
      // Check cache if enabled
      if (cacheKey) {
        const cached = await this.redis.get(cacheKey)
        if (cached) {
          const parsed = JSON.parse(cached)
          return {
            ...parsed,
            metadata: { ...parsed.metadata, cached: true }
          }
        }
      }

      // Check rate limits
      await this.checkRateLimit(modelConfig.model)

      // Generate content
      const result = await this.generate(prompt, modelConfig, options)

      // Cache result if enabled
      if (cacheKey && options.cacheTTL) {
        await this.redis.setex(
          cacheKey,
          options.cacheTTL,
          JSON.stringify({ ...result, metadata: { ...result.metadata, cached: false } })
        )
      }

      // Record metrics
      this.recordMetrics(modelConfig.model, result, Date.now() - startTime)

      return result
    } catch (error: any) {
      // Record error metrics
      this.metrics.increment('ai.generation.error', {
        model: modelConfig.model,
        error: error.name
      })
      throw error
    }
  }

  async generateWithFunctions(
    prompt: string,
    functions: any[],
    modelConfig: AIModelConfig,
    options: GenerationOptions = {}
  ): Promise<any> {
    // Implementation for function calling
    // This would support OpenAI's function calling feature
    throw new Error('Not implemented')
  }

  private async generate(
    prompt: string,
    config: AIModelConfig,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    switch (config.provider) {
      case 'openai':
        return this.generateWithOpenAI(prompt, config, options)
      case 'anthropic':
        return this.generateWithAnthropic(prompt, config, options)
      case 'local':
        return this.generateWithLocalModel(prompt, config, options)
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }

  private async generateWithOpenAI(
    prompt: string,
    config: AIModelConfig,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    const response = await this.openai.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty,
      stop: config.stop,
      stream: options.stream
    })

    return {
      content: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      metadata: {
        model: config.model,
        latency: 0,
        cached: false,
        retries: 0
      }
    }
  }

  private async generateWithAnthropic(
    prompt: string,
    config: AIModelConfig,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    const response = await this.anthropic.messages.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: options.stream
    })

    return {
      content: response.content[0].text,
      usage: {
        promptTokens: 0, // Anthropic doesn't provide token usage
        completionTokens: 0,
        totalTokens: 0
      },
      metadata: {
        model: config.model,
        latency: 0,
        cached: false,
        retries: 0
      }
    }
  }

  private async generateWithLocalModel(
    prompt: string,
    config: AIModelConfig,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    // Implementation for local models (e.g., using Ollama)
    throw new Error('Local model support not implemented')
  }

  private async checkRateLimit(model: string): Promise<void> {
    const limit = this.rateLimiter.get(model)
    if (limit && Date.now() < limit.reset) {
      if (limit.tokens <= 0) {
        throw new Error(`Rate limit exceeded for model ${model}`)
      }
      limit.tokens--
    } else {
      // Reset rate limit
      this.rateLimiter.set(model, {
        tokens: 1000, // Example limit
        reset: Date.now() + 60000 // Reset after 1 minute
      })
    }
  }

  private recordMetrics(model: string, result: GenerationResult, latency: number): void {
    this.metrics.increment('ai.generation.success', { model })
    this.metrics.histogram('ai.generation.latency', latency, { model })
    this.metrics.histogram('ai.generation.tokens', result.usage.totalTokens, { model })
  }

  // Helper methods for content-specific generation
  async generateEmailContent(
    topic: string,
    tone: string,
    length: 'short' | 'medium' | 'long',
    keywords: string[]
  ): Promise<string> {
    const prompt = `Write an email about ${topic} with a ${tone} tone. Length should be ${length}. Include these keywords: ${keywords.join(', ')}`
    const result = await this.generateContent(prompt, {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7
    })
    return result.content
  }

  async generateSubjectLines(
    topic: string,
    count: number = 3
  ): Promise<string[]> {
    const prompt = `Generate ${count} engaging email subject lines for an email about: ${topic}`
    const result = await this.generateContent(prompt, {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.8
    })
    return result.content.split('\n').filter(line => line.trim())
  }

  async optimizeContent(
    content: string,
    goals: string[]
  ): Promise<string> {
    const prompt = `Optimize this email content for the following goals: ${goals.join(', ')}\n\nContent: ${content}`
    const result = await this.generateContent(prompt, {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.3
    })
    return result.content
  }

  async analyzeContent(
    content: string
  ): Promise<{
    sentiment: string
    readability: number
    suggestions: string[]
  }> {
    const prompt = `Analyze this email content and provide sentiment, readability score (1-100), and improvement suggestions:\n\n${content}`
    const result = await this.generateContent(prompt, {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.1
    })
    
    // Parse the structured response
    const analysis = JSON.parse(result.content)
    return {
      sentiment: analysis.sentiment,
      readability: analysis.readability,
      suggestions: analysis.suggestions
    }
  }
} 
import axios, { AxiosInstance } from 'axios'
import { MetricsService } from '../../monitoring/metrics'

export interface DeepSeekConfig {
  apiKey: string
  apiEndpoint: string
  modelVersion?: string
  maxRetries?: number
  timeout?: number
  cacheEnabled?: boolean
  cacheTTL?: number
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface DeepSeekAnalysis {
  score: number
  label?: string
  grade?: string
  suggestions?: string[]
  improvements?: Array<{
    type: string
    description: string
    impact: number
  }>
}

export interface DeepSeekPrediction {
  optimalTime: string
  confidence: number
  score: number
  factors: Array<{
    name: string
    importance: number
    value: any
  }>
  alternatives: Array<{
    time: string
    expectedEngagement: number
  }>
}

interface PredictionRequest {
  model: string
  input: any
  parameters?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    frequencyPenalty?: number
    presencePenalty?: number
  }
}

interface ModelConfig {
  name: string
  version: string
  capabilities: string[]
  parameters: {
    minTokens: number
    maxTokens: number
    defaultTemperature: number
  }
}

export class DeepSeekClient {
  private client: AxiosInstance
  private models: Map<string, ModelConfig> = new Map()
  private cache: Map<string, { result: any; expires: number }> = new Map()
  private apiKey: string
  private model: string
  private maxTokens: number
  private temperature: number
  
  constructor(
    private config: DeepSeekConfig,
    private metrics: MetricsService
  ) {
    this.client = axios.create({
      baseURL: config.apiEndpoint,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    this.apiKey = config.apiKey
    this.model = config.model || 'deepseek-chat'
    this.maxTokens = config.maxTokens || 2048
    this.temperature = config.temperature || 0.7
    
    void this.initializeModels()
  }

  async predict(
    modelName: string,
    input: any,
    options: {
      cacheKey?: string
      forceFresh?: boolean
      parameters?: PredictionRequest['parameters']
    } = {}
  ): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Check cache if enabled
      if (this.config.cacheEnabled && options.cacheKey && !options.forceFresh) {
        const cached = this.getCachedResult(options.cacheKey)
        if (cached) {
          await this.metrics.recordAiCache('hit', modelName)
          return cached
        }
      }

      // Get model configuration
      const model = this.models.get(modelName)
      if (!model) {
        throw new Error(`Model ${modelName} not found`)
      }

      // Prepare request
      const request: PredictionRequest = {
        model: `${model.name}@${model.version}`,
        input: await this.preprocessInput(input, model),
        parameters: {
          temperature: options.parameters?.temperature ?? model.parameters.defaultTemperature,
          maxTokens: options.parameters?.maxTokens ?? model.parameters.maxTokens,
          topP: options.parameters?.topP ?? 0.9,
          frequencyPenalty: options.parameters?.frequencyPenalty ?? 0.0,
          presencePenalty: options.parameters?.presencePenalty ?? 0.0
        }
      }

      // Make prediction
      const response = await this.makeRequest(request)
      
      // Process result
      const result = await this.processResponse(response, model)
      
      // Cache result if enabled
      if (this.config.cacheEnabled && options.cacheKey) {
        this.cacheResult(options.cacheKey, result)
      }

      // Record metrics
      const duration = Date.now() - startTime
      await this.metrics.recordAiPrediction(modelName, duration)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordAiError(modelName, errorMessage)
      throw error
    }
  }

  // Model-specific prediction methods
  async predictSpamScore(content: string): Promise<number> {
    const result = await this.predict('spam-analyzer', {
      content,
      analysisType: 'spam-detection'
    })
    return result.spamScore
  }

  async optimizeContent(content: string, preferences: any): Promise<{
    optimizedContent: string
    improvements: string[]
    confidence: number
  }> {
    return await this.predict('content-optimizer', {
      content,
      preferences,
      mode: 'comprehensive'
    })
  }

  async predictEngagement(
    campaign: any,
    historicalData: any
  ): Promise<{
    predictedOpenRate: number
    predictedClickRate: number
    confidence: number
  }> {
    return await this.predict('engagement-predictor', {
      campaign,
      historicalData
    })
  }

  async analyzeAudience(
    audienceData: any,
    parameters: any
  ): Promise<{
    segments: any[]
    preferences: any
    recommendations: any[]
  }> {
    return await this.predict('audience-analyzer', {
      audienceData,
      parameters
    })
  }

  async analyze(
    type: 'engagement' | 'readability' | 'spam' | 'sentiment',
    content: string
  ): Promise<DeepSeekAnalysis> {
    // Mock implementation - in production, this would call the DeepSeek API
    switch (type) {
      case 'engagement':
        return {
          score: 0.85,
          improvements: [
            {
              type: 'subject_line',
              description: 'Make subject line more action-oriented',
              impact: 0.2
            },
            {
              type: 'call_to_action',
              description: 'Add more prominent CTA buttons',
              impact: 0.15
            }
          ]
        }
      case 'readability':
        return {
          score: 0.78,
          grade: 'Grade 8',
          suggestions: [
            'Shorten sentences in paragraph 2',
            'Use simpler words in the introduction',
            'Break up long paragraphs'
          ]
        }
      case 'spam':
        return {
          score: 0.12
        }
      case 'sentiment':
        return {
          score: 0.65,
          label: 'positive'
        }
      default:
        throw new Error(`Unsupported analysis type: ${type}`)
    }
  }

  async predict(
    type: 'engagement',
    features: Record<string, any>
  ): Promise<DeepSeekPrediction> {
    // Mock implementation - in production, this would call the DeepSeek API
    return {
      optimalTime: '2024-03-20T10:00:00Z',
      confidence: 0.85,
      score: 0.78,
      factors: [
        {
          name: 'time_of_day',
          importance: 0.4,
          value: '10:00'
        },
        {
          name: 'day_of_week',
          importance: 0.3,
          value: 'Wednesday'
        },
        {
          name: 'recipient_timezone',
          importance: 0.2,
          value: 'UTC'
        },
        {
          name: 'historical_engagement',
          importance: 0.1,
          value: 'high'
        }
      ],
      alternatives: [
        {
          time: '2024-03-20T14:00:00Z',
          expectedEngagement: 0.75
        },
        {
          time: '2024-03-21T09:00:00Z',
          expectedEngagement: 0.72
        }
      ]
    }
  }

  async extractFeatures(content: string): Promise<Record<string, any>> {
    // Mock implementation - in production, this would call the DeepSeek API
    return {
      length: content.length,
      readability_score: 0.85,
      sentiment_score: 0.65,
      topic_relevance: 0.92,
      key_phrases: ['email marketing', 'engagement', 'optimization'],
      language_complexity: 'moderate',
      tone: 'professional',
      urgency: 'medium',
      personalization_level: 'high'
    }
  }

  private async initializeModels(): Promise<void> {
    try {
      const response = await this.client.get('/models')
      const models = response.data.models as ModelConfig[]
      
      for (const model of models) {
        this.models.set(model.name, model)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to initialize models:', errorMessage)
    }
  }

  private async makeRequest(request: PredictionRequest): Promise<any> {
    let retries = 0
    const maxRetries = this.config.maxRetries || 3
    
    while (retries < maxRetries) {
      try {
        const response = await this.client.post('/predict', request)
        return response.data
      } catch (error) {
        retries++
        if (retries === maxRetries) {
          throw error
        }
        await this.sleep(Math.pow(2, retries) * 1000) // Exponential backoff
      }
    }
  }

  private async preprocessInput(input: any, model: ModelConfig): Promise<any> {
    // Implement input preprocessing based on model capabilities
    return input
  }

  private async processResponse(response: any, model: ModelConfig): Promise<any> {
    if (!this.validateResponse(response, model)) {
      throw new Error('Invalid response from model')
    }
    return response.result
  }

  private validateResponse(result: any, model: ModelConfig): boolean {
    return result && result.result !== undefined
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (cached.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return cached.result
  }

  private cacheResult(key: string, result: any): void {
    const ttl = this.config.cacheTTL || 3600000 // Default 1 hour
    this.cache.set(key, {
      result,
      expires: Date.now() + ttl
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 
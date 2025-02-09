import { MetricsService } from '../monitoring/metrics'
import { OpenAI } from 'openai'
import { DeepSeek } from '../lib/ai/deepseek'

export interface AIServiceConfig {
  openai: {
    apiKey: string
    model: string
    maxTokens: number
    temperature: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
  }
  deepseek: {
    apiKey: string
    model: string
    maxTokens: number
    temperature: number
  }
  cacheConfig: {
    ttl: number
    maxSize: number
  }
  retryOptions: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
  }
}

export interface ContentAnalysis {
  engagementScore: number
  suggestedImprovements: Array<{
    type: string
    description: string
    impact: number
  }>
  sentiment: {
    score: number
    label: string
  }
  readability: {
    score: number
    grade: string
    suggestions: string[]
  }
  spamScore: number
}

export interface EngagementPrediction {
  optimalTime: string
  confidence: number
  expectedEngagement: number
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

export class AIService {
  private openai: OpenAI
  private deepseek: DeepSeek
  private cache: Map<string, { value: any; expires: number }> = new Map()

  constructor(
    private config: AIServiceConfig,
    private metrics: MetricsService
  ) {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    })
    this.deepseek = new DeepSeek({
      apiKey: config.deepseek.apiKey
    })
  }

  async analyzeContent(content: string): Promise<ContentAnalysis> {
    const startTime = Date.now()

    try {
      const cacheKey = `analysis_${this.hashString(content)}`
      const cached = this.getFromCache<ContentAnalysis>(cacheKey)
      if (cached) {
        return cached
      }

      let attempts = 0
      let lastError: Error | undefined

      while (attempts < this.config.retryOptions.maxAttempts) {
        try {
          const [engagementAnalysis, readabilityAnalysis, spamAnalysis] =
            await Promise.all([
              this.analyzeEngagement(content),
              this.analyzeReadability(content),
              this.analyzeSpamScore(content)
            ])

          const result: ContentAnalysis = {
            engagementScore: engagementAnalysis.score,
            suggestedImprovements: engagementAnalysis.improvements,
            sentiment: await this.analyzeSentiment(content),
            readability: readabilityAnalysis,
            spamScore: spamAnalysis
          }

          this.setInCache(cacheKey, result)

          const duration = Date.now() - startTime
          await this.metrics.recordLatency('content_analysis', duration)
          await this.metrics.recordEvent('content_analyzed')

          return result
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          attempts++

          if (attempts < this.config.retryOptions.maxAttempts) {
            await this.sleep(
              Math.min(
                this.config.retryOptions.maxDelay,
                this.config.retryOptions.initialDelay * Math.pow(2, attempts)
              )
            )
          }
        }
      }

      throw lastError
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('content_analysis', errorMessage)
      throw error
    }
  }

  async generateContentVariations(
    content: string,
    target: string,
    constraints: Record<string, any>,
    maxVariations: number
  ): Promise<string[]> {
    const startTime = Date.now()

    try {
      const cacheKey = `variations_${this.hashString(
        content + target + JSON.stringify(constraints)
      )}`
      const cached = this.getFromCache<string[]>(cacheKey)
      if (cached) {
        return cached
      }

      const prompt = this.buildVariationPrompt(content, target, constraints)
      const completion = await this.openai.chat.completions.create({
        model: this.config.openai.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content optimizer. Generate variations that maintain the core message while optimizing for engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        n: maxVariations,
        temperature: this.config.openai.temperature,
        max_tokens: this.config.openai.maxTokens,
        top_p: this.config.openai.topP,
        frequency_penalty: this.config.openai.frequencyPenalty,
        presence_penalty: this.config.openai.presencePenalty
      })

      const variations = completion.choices.map(choice =>
        choice.message.content?.trim()
      ).filter((content): content is string => content !== null)

      this.setInCache(cacheKey, variations)

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('content_variation_generation', duration)
      await this.metrics.recordEvent('content_variations_generated', variations.length)

      return variations
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('content_variation_generation', errorMessage)
      throw error
    }
  }

  async predictEngagement(features: Record<string, any>): Promise<EngagementPrediction> {
    const startTime = Date.now()

    try {
      const cacheKey = `engagement_${this.hashString(JSON.stringify(features))}`
      const cached = this.getFromCache<EngagementPrediction>(cacheKey)
      if (cached) {
        return cached
      }

      // Use DeepSeek for engagement prediction
      const prediction = await this.deepseek.predict('engagement', features)

      const result: EngagementPrediction = {
        optimalTime: prediction.optimalTime,
        confidence: prediction.confidence,
        expectedEngagement: prediction.score,
        factors: prediction.factors,
        alternatives: prediction.alternatives
      }

      this.setInCache(cacheKey, result)

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('engagement_prediction', duration)
      await this.metrics.recordEvent('engagement_predicted')

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('engagement_prediction', errorMessage)
      throw error
    }
  }

  async extractContentFeatures(content: string): Promise<Record<string, any>> {
    const startTime = Date.now()

    try {
      const cacheKey = `features_${this.hashString(content)}`
      const cached = this.getFromCache<Record<string, any>>(cacheKey)
      if (cached) {
        return cached
      }

      const features = await this.deepseek.extractFeatures(content)
      this.setInCache(cacheKey, features)

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('feature_extraction', duration)
      await this.metrics.recordEvent('features_extracted')

      return features
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('feature_extraction', errorMessage)
      throw error
    }
  }

  private async analyzeEngagement(
    content: string
  ): Promise<{ score: number; improvements: any[] }> {
    const analysis = await this.deepseek.analyze('engagement', content)
    return {
      score: analysis.score,
      improvements: analysis.improvements
    }
  }

  private async analyzeReadability(content: string): Promise<{
    score: number
    grade: string
    suggestions: string[]
  }> {
    const analysis = await this.deepseek.analyze('readability', content)
    return {
      score: analysis.score,
      grade: analysis.grade,
      suggestions: analysis.suggestions
    }
  }

  private async analyzeSpamScore(content: string): Promise<number> {
    const analysis = await this.deepseek.analyze('spam', content)
    return analysis.score
  }

  private async analyzeSentiment(content: string): Promise<{
    score: number
    label: string
  }> {
    const analysis = await this.deepseek.analyze('sentiment', content)
    return {
      score: analysis.score,
      label: analysis.label
    }
  }

  private buildVariationPrompt(
    content: string,
    target: string,
    constraints: Record<string, any>
  ): string {
    return `
Generate variations of the following content while optimizing for ${target}.

Original content:
${content}

Constraints:
${Object.entries(constraints)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Please generate variations that:
1. Maintain the core message and intent
2. Optimize for the target metric
3. Follow all specified constraints
4. Use different approaches and tones
5. Are natural and engaging
`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.value as T
    }
    this.cache.delete(key)
    return null
  }

  private setInCache<T>(key: string, value: T): void {
    if (this.cache.size >= this.config.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + this.config.cacheConfig.ttl
    })
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 
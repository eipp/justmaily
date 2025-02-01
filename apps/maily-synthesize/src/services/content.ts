import { ModelManager } from '@justmaily/ai-core/services/ModelManager';
import { BaseAIClient } from '@justmaily/ai-core/clients/BaseClient';
import { ModelResponse, ModelProvider } from '@justmaily/ai-core/types/models';
import { Redis } from 'ioredis';
import { MetricsService } from '../lib/monitoring'
import { SecurityService } from '../lib/security'
import { InputSanitizer } from '../lib/sanitizer'
import { PromptTemplateManager } from '../lib/prompt-template'
import { z } from 'zod'

export interface ContentGenerationOptions {
  tone?: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
  industry?: string;
  targetAudience?: string;
  callToAction?: string;
  keywords?: string[];
  personalization?: Record<string, string>;
}

export interface SubjectLineOptions {
  tone?: string;
  maxLength?: number;
  keywords?: string[];
  abTestVariants?: number;
}

export interface ABTestSuggestion {
  variant: string;
  rationale: string;
  predictedImpact: {
    openRate?: number;
    clickRate?: number;
    conversionRate?: number;
  };
}

export interface ServiceConfig {
  fallbackModels: BaseAIClient[];
  fallbackStrategy: 'sequential' | 'random';
  loadBalancing: {
    enabled: boolean;
    strategy: 'weighted' | 'round-robin';
    weights?: Record<ModelProvider, number>;
  };
  retryConfig: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  errorThresholds: {
    failureRate: number;
    latencyMs: number;
  };
}

export class ContentGenerationService {
  private modelManager: ModelManager;
  private redis: Redis;
  private primaryModel: BaseAIClient;
  private config: ServiceConfig;
  private modelStats: Map<ModelProvider, {
    failures: number;
    total: number;
    avgLatency: number;
  }>;
  private lastUsedIndex: number;
  private metrics: MetricsService
  private security: SecurityService
  private sanitizer: InputSanitizer
  private templateManager: PromptTemplateManager

  constructor(
    modelManager: ModelManager,
    redis: Redis,
    primaryModel: BaseAIClient,
    config: ServiceConfig,
    metrics: MetricsService,
    security: SecurityService
  ) {
    this.modelManager = modelManager;
    this.redis = redis;
    this.primaryModel = primaryModel;
    this.config = config;
    this.modelStats = new Map();
    this.lastUsedIndex = 0;
    this.metrics = metrics
    this.security = security
    this.sanitizer = new InputSanitizer({}, metrics, security)
    this.templateManager = new PromptTemplateManager(metrics, security)
    
    // Initialize stats for all models
    [primaryModel, ...config.fallbackModels].forEach(model => {
      this.modelStats.set(model.config.provider, {
        failures: 0,
        total: 0,
        avgLatency: 0
      });
    });

    // Register default templates
    this.registerDefaultTemplates()
  }

  private registerDefaultTemplates(): void {
    // Email content generation template
    this.templateManager.registerTemplate({
      name: 'email_content',
      template: `Generate an email with the following characteristics:
Topic: {{topic}}
Tone: {{tone}}
Target audience: {{audience}}
Key points to cover:
{{points}}

The email should be professional and engaging while maintaining the specified tone.
Include a clear call-to-action if appropriate.
Format the response in markdown.`,
      variables: {
        topic: { type: 'string', required: true, maxLength: 200 },
        tone: { type: 'string', required: true, enum: ['formal', 'casual', 'friendly', 'professional'] },
        audience: { type: 'string', required: true, maxLength: 100 },
        points: { type: 'array', required: true, maxItems: 5, itemMaxLength: 200 }
      }
    })

    // Subject line generation template
    this.templateManager.registerTemplate({
      name: 'subject_line',
      template: `Generate an email subject line that:
- Relates to: {{topic}}
- Appeals to: {{audience}}
- Has a {{tone}} tone
- Optimizes for {{objective}}

The subject line should be concise and compelling.`,
      variables: {
        topic: { type: 'string', required: true, maxLength: 200 },
        audience: { type: 'string', required: true, maxLength: 100 },
        tone: { type: 'string', required: true, enum: ['formal', 'casual', 'friendly', 'professional'] },
        objective: { type: 'string', required: true, enum: ['open_rate', 'click_through', 'conversion'] }
      }
    })

    // A/B test suggestions template
    this.templateManager.registerTemplate({
      name: 'ab_test_suggestions',
      template: `Analyze this email content and suggest A/B test variations:
Original content:
{{content}}

Focus areas:
{{focus_areas}}

Generate 2-3 variations that test different approaches while maintaining the core message.`,
      variables: {
        content: { type: 'string', required: true, maxLength: 5000 },
        focus_areas: { type: 'array', required: true, maxItems: 3, itemMaxLength: 100 }
      }
    })
  }

  private async sanitizeInputs(inputs: Record<string, any>): Promise<Record<string, any>> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'string') {
        sanitized[key] = await this.sanitizer.sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = await this.sanitizer.sanitizeBatch(
          value.map(item => String(item))
        )
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = await this.sanitizeInputs(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  private async selectModel(): Promise<BaseAIClient> {
    if (!this.config.loadBalancing.enabled) {
      return this.primaryModel;
    }

    const availableModels = [this.primaryModel, ...this.config.fallbackModels];

    if (this.config.loadBalancing.strategy === 'weighted') {
      const weights = this.config.loadBalancing.weights || {};
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      const random = Math.random() * totalWeight;
      let sum = 0;

      for (const model of availableModels) {
        sum += weights[model.config.provider] || 0;
        if (random <= sum) return model;
      }
    } else { // round-robin
      this.lastUsedIndex = (this.lastUsedIndex + 1) % availableModels.length;
      return availableModels[this.lastUsedIndex];
    }

    return this.primaryModel;
  }

  private async executeWithFallback<T>(
    operation: (model: BaseAIClient) => Promise<ModelResponse<T>>
  ): Promise<ModelResponse<T>> {
    const models = [this.primaryModel, ...this.config.fallbackModels];
    let lastError: Error | null = null;

    for (const model of models) {
      const stats = this.modelStats.get(model.config.provider)!;
      
      try {
        const startTime = Date.now();
        const result = await this.retryOperation(() => operation(model));
        const latency = Date.now() - startTime;

        // Update stats
        stats.total++;
        stats.avgLatency = (stats.avgLatency * (stats.total - 1) + latency) / stats.total;
        this.modelStats.set(model.config.provider, stats);

        return result;
      } catch (error) {
        stats.failures++;
        this.modelStats.set(model.config.provider, stats);
        lastError = error;

        // Check if we should continue with fallback
        const failureRate = stats.failures / stats.total;
        if (failureRate < this.config.errorThresholds.failureRate &&
            stats.avgLatency < this.config.errorThresholds.latencyMs) {
          break;
        }
      }
    }

    throw lastError || new Error('All models failed');
  }

  private async retryOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let delay = this.config.retryConfig.initialDelayMs;
    let attempt = 0;

    while (attempt < this.config.retryConfig.maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt === this.config.retryConfig.maxAttempts) throw error;

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(
          delay * this.config.retryConfig.backoffMultiplier,
          this.config.retryConfig.maxDelayMs
        );
      }
    }

    throw new Error('Retry attempts exhausted');
  }

  private async generatePrompt(
    template: string,
    options: Record<string, any>
  ): Promise<string> {
    const optionsString = Object.entries(options)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');

    return `${template}\n\nParameters:\n${optionsString}`;
  }

  async generateEmailContent(options: ContentGenerationOptions): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Sanitize inputs
      const sanitizedOptions = await this.sanitizeInputs(options)
      
      // Generate prompt using template
      const prompt = await this.templateManager.renderTemplate('email_content', {
        topic: sanitizedOptions.topic,
        tone: sanitizedOptions.tone,
        audience: sanitizedOptions.audience,
        points: sanitizedOptions.keyPoints
      })
      
      // Generate content
      const content = await this.executeWithFallback(
        async (model) => {
          const response = await model.generateContent(prompt)
          return response.text
        },
        'email_content_generation'
      )
      
      // Record success metrics
      await this.metrics.recordLatency(
        'email_content_generation',
        Date.now() - startTime
      )
      
      return content
    } catch (error) {
      await this.metrics.recordError('email_content_generation', error.message)
      throw error
    }
  }

  async generateSubjectLine(options: SubjectLineOptions): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Sanitize inputs
      const sanitizedOptions = await this.sanitizeInputs(options)
      
      // Generate prompt using template
      const prompt = await this.templateManager.renderTemplate('subject_line', {
        topic: sanitizedOptions.topic,
        audience: sanitizedOptions.audience,
        tone: sanitizedOptions.tone,
        objective: sanitizedOptions.objective
      })
      
      // Generate subject line
      const subjectLine = await this.executeWithFallback(
        async (model) => {
          const response = await model.generateContent(prompt)
          return response.text
        },
        'subject_line_generation'
      )
      
      // Record success metrics
      await this.metrics.recordLatency(
        'subject_line_generation',
        Date.now() - startTime
      )
      
      return subjectLine
    } catch (error) {
      await this.metrics.recordError('subject_line_generation', error.message)
      throw error
    }
  }

  async generateABTestSuggestions(
    content: string,
    focusAreas: string[]
  ): Promise<string[]> {
    const startTime = Date.now()
    
    try {
      // Sanitize inputs
      const sanitizedContent = await this.sanitizer.sanitizeInput(content)
      const sanitizedFocusAreas = await this.sanitizer.sanitizeBatch(focusAreas)
      
      // Generate prompt using template
      const prompt = await this.templateManager.renderTemplate('ab_test_suggestions', {
        content: sanitizedContent,
        focus_areas: sanitizedFocusAreas
      })
      
      // Generate suggestions
      const suggestions = await this.executeWithFallback(
        async (model) => {
          const response = await model.generateContent(prompt)
          return response.text.split('\n\n').filter(Boolean)
        },
        'ab_test_suggestions'
      )
      
      // Record success metrics
      await this.metrics.recordLatency(
        'ab_test_suggestions',
        Date.now() - startTime
      )
      
      return suggestions
    } catch (error) {
      await this.metrics.recordError('ab_test_suggestions', error.message)
      throw error
    }
  }

  public async generateSubjectLines(
    emailContent: string,
    options: SubjectLineOptions
  ): Promise<ModelResponse<string[]>> {
    const prompt = await this.generatePrompt(
      `Generate ${options.abTestVariants || 3} compelling subject lines for the following email content:
      
      ${emailContent}
      
      Each subject line should be unique and optimized for high open rates.
      Focus on creating curiosity, urgency, or value proposition.
      Keep each subject line under ${options.maxLength || 50} characters.
      Respond with only the subject lines, one per line.`,
      options
    );

    const model = await this.selectModel();
    const response = await this.executeWithFallback(client =>
      client.complete(prompt, {
        temperature: 0.8,
        maxTokens: 200
      })
    );

    return {
      ...response,
      data: response.data.split('\n').filter(line => line.trim())
    };
  }

  public async generateABTestSuggestions(
    originalContent: string,
    targetMetric: 'openRate' | 'clickRate' | 'conversionRate'
  ): Promise<ModelResponse<ABTestSuggestion[]>> {
    const prompt = `Analyze the following email content and suggest 3 A/B test variants optimized for ${targetMetric}:

    Original Content:
    ${originalContent}

    For each variant, provide:
    1. The specific change to test
    2. Rationale for the change
    3. Predicted impact on ${targetMetric}

    Format the response as JSON with the following structure:
    {
      "variants": [
        {
          "variant": "description of change",
          "rationale": "explanation",
          "predictedImpact": {
            "${targetMetric}": "predicted percentage increase"
          }
        }
      ]
    }`;

    const model = await this.selectModel();
    const response = await this.executeWithFallback(client =>
      client.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      })
    );

    try {
      const suggestions = JSON.parse(response.data);
      return {
        ...response,
        data: suggestions.variants
      };
    } catch (error) {
      throw new Error('Failed to parse A/B test suggestions');
    }
  }

  public async generatePersonalizationRecommendations(
    emailContent: string,
    audienceData: Record<string, any>[]
  ): Promise<ModelResponse<Record<string, string>[]>> {
    const prompt = `Analyze the following email content and audience data to suggest personalization opportunities:

    Email Content:
    ${emailContent}

    Audience Data Sample:
    ${JSON.stringify(audienceData.slice(0, 3), null, 2)}

    Identify key personalization opportunities and provide specific recommendations for dynamic content.
    Format the response as JSON with personalization variables and their corresponding content variations.`;

    const model = await this.selectModel();
    const response = await this.executeWithFallback(client =>
      client.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      })
    );

    try {
      return {
        ...response,
        data: JSON.parse(response.data)
      };
    } catch (error) {
      throw new Error('Failed to parse personalization recommendations');
    }
  }

  public async optimizeForDeliverability(
    emailContent: string
  ): Promise<ModelResponse<{
    optimizedContent: string;
    improvements: string[];
    spamScore: number;
  }>> {
    const prompt = `Analyze and optimize the following email content for maximum deliverability:

    ${emailContent}

    Provide:
    1. Optimized version of the content
    2. List of specific improvements made
    3. Estimated spam score (0-10, lower is better)

    Format the response as JSON with the following structure:
    {
      "optimizedContent": "...",
      "improvements": ["..."],
      "spamScore": X
    }`;

    const model = await this.selectModel();
    const response = await this.executeWithFallback(client =>
      client.complete(prompt, {
        temperature: 0.3,
        maxTokens: 1500
      })
    );

    try {
      return {
        ...response,
        data: JSON.parse(response.data)
      };
    } catch (error) {
      throw new Error('Failed to parse deliverability optimization results');
    }
  }

  public async getModelStats(): Promise<Record<ModelProvider, {
    failures: number;
    total: number;
    avgLatency: number;
    failureRate: number;
  }>> {
    const stats: Record<string, any> = {};
    
    for (const [provider, data] of this.modelStats.entries()) {
      stats[provider] = {
        ...data,
        failureRate: data.failures / (data.total || 1)
      };
    }

    return stats;
  }

  async executeWithFallback(input: any): Promise<{ data: string; usage: any }> {
    try {
      // Primary content generation logic
      const prompt = this.getPromptTemplate(); // Externalized prompt template from config
      this.sanitizeInput(input);
      const result = await this.generateContent(prompt, input);
      // Record comprehensive metrics
      this.recordMetrics(result.usage);
      // Cache the result
      await this.cacheResult(input, result);
      return result;
    } catch (error) {
      console.error('Error in ContentService.executeWithFallback with input:', input, 'Error:', error);
      // Fallback logic
      const fallbackResult = { data: 'Default response', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, latencyMs: 0 } };
      return fallbackResult;
    }
  }

  async generateChatCompletion(input: any): Promise<{ data: string; usage: any }> {
    try {
      // Use externalized prompt template
      const prompt = this.getPromptTemplate();
      this.sanitizeInput(input);
      const result = await this.generateContent(prompt, input);
      this.recordMetrics(result.usage);
      await this.cacheResult(input, result);
      return result;
    } catch (error) {
      console.error('Error in ContentService.generateChatCompletion with input:', input, 'Error:', error);
      throw error;
    }
  }

  getPromptTemplate(): string {
    // Load prompt template from configuration
    // For demonstration, using process.env or config module
    return process.env.PROMPT_TEMPLATE || 'Default prompt template';
  }

  sanitizeInput(input: any): void {
    // Implement robust sanitization rules. This is a placeholder.
    // For example, trim strings and remove special characters as needed
    for (const key in input) {
      if (typeof input[key] === 'string') {
        input[key] = input[key].trim();
      }
    }
  }

  recordMetrics(usage: any): void {
    // Enhance model statistics tracking; this can delegate to a dedicated MetricsService if available
  }

  async cacheResult(input: any, result: { data: string; usage: any }): Promise<void> {
    // Implement caching logic; for example, using a caching service
    // Here is a dummy implementation
    const cacheKey = `content:${JSON.stringify(input)}`;
    // Assume we have a cache module imported as 'cache'
    try {
      await cache.set(cacheKey, result, 3600); // 1 hour TTL
    } catch (error) {
      console.error('Error caching content result:', error);
    }
  }

  async generateContent(prompt: string, input: any): Promise<{ data: string; usage: any }> {
    // Simulate asynchronous content generation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: `Generated content based on prompt: ${prompt} and input: ${JSON.stringify(input)}`,
          usage: { promptTokens: 50, completionTokens: 150, totalTokens: 200, latencyMs: 120 }
        });
      }, 100);
    });
  }
} 
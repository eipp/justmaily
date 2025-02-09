import OpenAI from 'openai';
import { BaseAIClient } from './BaseClient';
import { ModelConfig, ModelResponse } from '../types/models';
import { ModelManager } from '../services/ModelManager';

export class OpenAIClient extends BaseAIClient {
  private client: OpenAI;

  constructor(
    modelManager: ModelManager,
    config: ModelConfig,
    apiKey: string
  ) {
    super(modelManager, config);
    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 30000
    });
  }

  protected async generateCompletion(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP ?? this.config.topP,
        frequency_penalty: options?.frequencyPenalty ?? this.config.frequencyPenalty,
        presence_penalty: options?.presencePenalty ?? this.config.presencePenalty,
        stop: options?.stopSequences ?? this.config.stopSequences
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.prompt_tokens,
          completion: response.usage?.completion_tokens
        }
      );

      return {
        data: response.choices[0].message.content || '',
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'openai'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  protected async generateEmbedding(
    text: string
  ): Promise<ModelResponse<number[]>> {
    const startTime = Date.now();
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
        encoding_format: 'float'
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage.prompt_tokens,
          completion: 0
        }
      );

      return {
        data: response.data[0].embedding,
        usage: metrics,
        cached: false,
        model: 'text-embedding-3-large',
        provider: 'openai'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  protected async analyzeImage(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        max_tokens: this.config.maxTokens
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.prompt_tokens,
          completion: response.usage?.completion_tokens
        }
      );

      return {
        data: response.choices[0].message.content || '',
        usage: metrics,
        cached: false,
        model: 'gpt-4-vision-preview',
        provider: 'openai'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  protected async classifyContent(
    content: string,
    labels: string[]
  ): Promise<ModelResponse<string>> {
    const startTime = Date.now();
    try {
      const prompt = `
        Please classify the following content into exactly one of these categories: ${labels.join(', ')}
        
        Content: ${content}
        
        Respond with only the category name, nothing else.
      `;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1,
        top_p: 1
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.prompt_tokens,
          completion: response.usage?.completion_tokens
        }
      );

      return {
        data: response.choices[0].message.content?.trim() || '',
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'openai'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
} 
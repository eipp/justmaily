import { Anthropic } from '@anthropic-ai/sdk';
import { BaseAIClient } from './BaseClient';
import { ModelConfig, ModelResponse } from '../types/models';
import { ModelManager } from '../services/ModelManager';

export class AnthropicClient extends BaseAIClient {
  private client: InstanceType<typeof Anthropic>;

  constructor(
    modelManager: ModelManager,
    config: ModelConfig,
    apiKey: string
  ) {
    super(modelManager, config);
    this.client = new Anthropic({
      apiKey
    });
  }

  protected async generateCompletion(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP ?? this.config.topP,
        stop_sequences: options?.stopSequences ?? this.config.stopSequences
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.input_tokens,
          completion: response.usage?.output_tokens
        }
      );

      return {
        data: response.content[0].text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  protected async generateEmbedding(
    text: string
  ): Promise<ModelResponse<number[]>> {
    throw new Error('Embedding generation not supported by Anthropic');
  }

  protected async analyzeImage(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        temperature: this.config.temperature,
        top_p: this.config.topP
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.input_tokens,
          completion: response.usage?.output_tokens
        }
      );

      return {
        data: response.content[0].text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Anthropic API error: ${error.message}`);
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

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        top_p: 1
      });

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: response.usage?.input_tokens,
          completion: response.usage?.output_tokens
        }
      );

      return {
        data: response.content[0].text.trim(),
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
} 
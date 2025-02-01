import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { BaseAIClient } from './BaseClient';
import { ModelConfig, ModelResponse } from '../types/models';
import { ModelManager } from '../services/ModelManager';

export class GeminiClient extends BaseAIClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    modelManager: ModelManager,
    config: ModelConfig,
    apiKey: string
  ) {
    super(modelManager, config);
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: config.model });
  }

  protected async generateCompletion(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? this.config.maxTokens,
          temperature: options?.temperature ?? this.config.temperature,
          topP: options?.topP ?? this.config.topP,
          stopSequences: options?.stopSequences ?? this.config.stopSequences
        }
      });

      const response = await result.response;
      const text = response.text();

      // Gemini doesn't provide token counts, so we estimate
      const estimatedTokens = Math.ceil(
        (prompt.length + text.length) / 4
      );

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: Math.ceil(prompt.length / 4),
          completion: Math.ceil(text.length / 4)
        }
      );

      return {
        data: text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'gemini'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  protected async generateEmbedding(
    text: string
  ): Promise<ModelResponse<number[]>> {
    const startTime = Date.now();
    try {
      const embeddingModel = this.client.getGenerativeModel({ 
        model: 'embedding-001'
      });

      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: Math.ceil(text.length / 4),
          completion: 0
        }
      );

      return {
        data: embedding,
        usage: metrics,
        cached: false,
        model: 'embedding-001',
        provider: 'gemini'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  protected async analyzeImage(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.blob();

      const visionModel = this.client.getGenerativeModel({ 
        model: 'gemini-pro-vision'
      });

      const result = await visionModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: imageData.type,
                  data: await blobToBase64(imageData)
                }
              }
            ]
          }
        ]
      });

      const response = await result.response;
      const text = response.text();

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: Math.ceil((prompt.length + 1000) / 4), // Add 1000 for image tokens
          completion: Math.ceil(text.length / 4)
        }
      );

      return {
        data: text,
        usage: metrics,
        cached: false,
        model: 'gemini-pro-vision',
        provider: 'gemini'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Gemini API error: ${error.message}`);
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

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.1,
          topP: 1
        }
      });

      const response = await result.response;
      const text = response.text().trim();

      const metrics = await this.createMetrics(
        startTime,
        true,
        undefined,
        {
          prompt: Math.ceil(prompt.length / 4),
          completion: Math.ceil(text.length / 4)
        }
      );

      return {
        data: text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'gemini'
      };
    } catch (error) {
      const metrics = await this.createMetrics(
        startTime,
        false,
        error.message
      );
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
} 
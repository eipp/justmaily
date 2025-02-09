import { ModelManager } from '../services/ModelManager';
import { 
  ModelConfig, 
  ModelResponse, 
  ModelUsageMetrics 
} from '../types/models';

export abstract class BaseAIClient {
  protected modelManager: ModelManager;
  protected config: ModelConfig;

  constructor(modelManager: ModelManager, config: ModelConfig) {
    this.modelManager = modelManager;
    this.config = config;
    this.modelManager.registerModel(config);
  }

  protected abstract generateCompletion(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse>;

  protected abstract generateEmbedding(
    text: string
  ): Promise<ModelResponse<number[]>>;

  protected abstract analyzeImage(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse>;

  protected abstract classifyContent(
    content: string,
    labels: string[]
  ): Promise<ModelResponse<string>>;

  protected async createMetrics(
    startTime: number,
    success: boolean,
    errorType?: string,
    tokenCounts?: {
      prompt?: number;
      completion?: number;
    }
  ): Promise<ModelUsageMetrics> {
    const endTime = Date.now();
    return {
      promptTokens: tokenCounts?.prompt || 0,
      completionTokens: tokenCounts?.completion || 0,
      totalTokens: (tokenCounts?.prompt || 0) + (tokenCounts?.completion || 0),
      latencyMs: endTime - startTime,
      timestamp: new Date(),
      success,
      errorType
    };
  }

  public async complete(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse> {
    try {
      const startTime = Date.now();
      const response = await this.generateCompletion(prompt, options);
      const metrics = await this.createMetrics(startTime, true);
      await this.modelManager.recordMetrics(this.config.model, metrics);
      return response;
    } catch (error) {
      const metrics = await this.createMetrics(
        Date.now(),
        false,
        error.message
      );
      await this.modelManager.recordMetrics(this.config.model, metrics);
      throw error;
    }
  }

  public async embed(text: string): Promise<ModelResponse<number[]>> {
    try {
      const startTime = Date.now();
      const response = await this.generateEmbedding(text);
      const metrics = await this.createMetrics(startTime, true);
      await this.modelManager.recordMetrics(this.config.model, metrics);
      return response;
    } catch (error) {
      const metrics = await this.createMetrics(
        Date.now(),
        false,
        error.message
      );
      await this.modelManager.recordMetrics(this.config.model, metrics);
      throw error;
    }
  }

  public async analyze(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse> {
    try {
      const startTime = Date.now();
      const response = await this.analyzeImage(imageUrl, prompt);
      const metrics = await this.createMetrics(startTime, true);
      await this.modelManager.recordMetrics(this.config.model, metrics);
      return response;
    } catch (error) {
      const metrics = await this.createMetrics(
        Date.now(),
        false,
        error.message
      );
      await this.modelManager.recordMetrics(this.config.model, metrics);
      throw error;
    }
  }

  public async classify(
    content: string,
    labels: string[]
  ): Promise<ModelResponse<string>> {
    try {
      const startTime = Date.now();
      const response = await this.classifyContent(content, labels);
      const metrics = await this.createMetrics(startTime, true);
      await this.modelManager.recordMetrics(this.config.model, metrics);
      return response;
    } catch (error) {
      const metrics = await this.createMetrics(
        Date.now(),
        false,
        error.message
      );
      await this.modelManager.recordMetrics(this.config.model, metrics);
      throw error;
    }
  }
} 
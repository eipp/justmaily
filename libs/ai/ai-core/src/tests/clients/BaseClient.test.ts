import { BaseAIClient } from '../../clients/BaseClient';
import { ModelManager } from '../../services/ModelManager';
import { ModelConfig, ModelResponse } from '../../types/models';
import { Redis } from 'ioredis';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Redis
vi.mock('ioredis', () => {
  const MockRedis = vi.fn();
  MockRedis.prototype.get = vi.fn();
  MockRedis.prototype.set = vi.fn();
  MockRedis.prototype.setex = vi.fn();
  MockRedis.prototype.quit = vi.fn();
  return { default: MockRedis };
});

// Test implementation of BaseAIClient
class TestAIClient extends BaseAIClient {
  public testMetrics = vi.fn();

  protected async generateCompletion(
    prompt: string,
    options?: Record<string, any>
  ): Promise<ModelResponse> {
    return {
      data: 'test completion',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
        latencyMs: 100,
        timestamp: new Date(),
        success: true
      },
      cached: false,
      model: this.config.model,
      provider: this.config.provider
    };
  }

  protected async generateEmbedding(
    text: string
  ): Promise<ModelResponse<number[]>> {
    return {
      data: [0.1, 0.2, 0.3],
      usage: {
        promptTokens: 10,
        completionTokens: 0,
        totalTokens: 10,
        latencyMs: 50,
        timestamp: new Date(),
        success: true
      },
      cached: false,
      model: this.config.model,
      provider: this.config.provider
    };
  }

  protected async analyzeImage(
    imageUrl: string,
    prompt: string
  ): Promise<ModelResponse> {
    return {
      data: 'test image analysis',
      usage: {
        promptTokens: 20,
        completionTokens: 30,
        totalTokens: 50,
        latencyMs: 200,
        timestamp: new Date(),
        success: true
      },
      cached: false,
      model: this.config.model,
      provider: this.config.provider
    };
  }

  protected async classifyContent(
    content: string,
    labels: string[]
  ): Promise<ModelResponse<string>> {
    return {
      data: labels[0],
      usage: {
        promptTokens: 15,
        completionTokens: 5,
        totalTokens: 20,
        latencyMs: 75,
        timestamp: new Date(),
        success: true
      },
      cached: false,
      model: this.config.model,
      provider: this.config.provider
    };
  }

  // Expose protected methods for testing
  public async testCreateMetrics(
    startTime: number,
    success: boolean,
    errorType?: string,
    tokenCounts?: {
      prompt?: number;
      completion?: number;
    }
  ) {
    return this.createMetrics(startTime, success, errorType, tokenCounts);
  }
}

describe('BaseAIClient', () => {
  let client: TestAIClient;
  let modelManager: ModelManager;
  let redis: Redis;
  let config: ModelConfig;

  beforeEach(() => {
    redis = new Redis();
    modelManager = new ModelManager(
      'redis://localhost:6379',
      {
        enabled: true,
        ttlSeconds: 3600,
        maxEntries: 1000,
        similarityThreshold: 0.95
      },
      {
        requestsPerMinute: 60,
        tokensPerMinute: 100000,
        concurrentRequests: 10,
        retryAttempts: 3,
        retryDelayMs: 1000
      }
    );

    config = {
      provider: 'test',
      model: 'test-model',
      capabilities: ['text-generation', 'embedding'],
      maxTokens: 1000,
      temperature: 0.7,
      topP: 1
    };

    client = new TestAIClient(modelManager, config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('complete', () => {
    it('should successfully generate completion', async () => {
      const response = await client.complete('test prompt');
      expect(response.data).toBe('test completion');
      expect(response.usage.success).toBe(true);
      expect(response.model).toBe(config.model);
      expect(response.provider).toBe(config.provider);
    });

    it('should handle errors and record metrics', async () => {
      const error = new Error('API error');
      vi.spyOn(client as any, 'generateCompletion').mockRejectedValueOnce(error);
      
      await expect(client.complete('test prompt')).rejects.toThrow('API error');
      expect(client.testMetrics).toHaveBeenCalledWith(
        expect.any(String),
        false,
        'API error'
      );
    });
  });

  describe('embed', () => {
    it('should successfully generate embeddings', async () => {
      const response = await client.embed('test text');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.usage.success).toBe(true);
      expect(response.model).toBe(config.model);
    });

    it('should handle errors in embedding generation', async () => {
      const error = new Error('Embedding error');
      vi.spyOn(client as any, 'generateEmbedding').mockRejectedValueOnce(error);
      
      await expect(client.embed('test text')).rejects.toThrow('Embedding error');
    });
  });

  describe('analyze', () => {
    it('should successfully analyze images', async () => {
      const response = await client.analyze('http://example.com/image.jpg', 'Describe this image');
      expect(response.data).toBe('test image analysis');
      expect(response.usage.success).toBe(true);
    });

    it('should handle errors in image analysis', async () => {
      const error = new Error('Image analysis error');
      vi.spyOn(client as any, 'analyzeImage').mockRejectedValueOnce(error);
      
      await expect(
        client.analyze('http://example.com/image.jpg', 'Describe this image')
      ).rejects.toThrow('Image analysis error');
    });
  });

  describe('classify', () => {
    it('should successfully classify content', async () => {
      const labels = ['positive', 'negative', 'neutral'];
      const response = await client.classify('test content', labels);
      expect(labels).toContain(response.data);
      expect(response.usage.success).toBe(true);
    });

    it('should handle errors in classification', async () => {
      const error = new Error('Classification error');
      vi.spyOn(client as any, 'classifyContent').mockRejectedValueOnce(error);
      
      await expect(
        client.classify('test content', ['label1', 'label2'])
      ).rejects.toThrow('Classification error');
    });
  });

  describe('metrics', () => {
    it('should create correct metrics', async () => {
      const startTime = Date.now() - 100;
      const metrics = await client.testCreateMetrics(
        startTime,
        true,
        undefined,
        { prompt: 10, completion: 20 }
      );

      expect(metrics).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
        latencyMs: expect.any(Number),
        timestamp: expect.any(Date),
        success: true,
        errorType: undefined
      });
    });

    it('should handle error metrics', async () => {
      const startTime = Date.now() - 100;
      const metrics = await client.testCreateMetrics(
        startTime,
        false,
        'test error'
      );

      expect(metrics).toEqual({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs: expect.any(Number),
        timestamp: expect.any(Date),
        success: false,
        errorType: 'test error'
      });
    });
  });
}); 
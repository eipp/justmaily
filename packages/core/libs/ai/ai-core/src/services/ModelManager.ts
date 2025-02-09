import { Redis } from 'ioredis';
import { RateLimiter as TokenBucket } from 'limiter';
import { 
  ModelConfig, 
  ModelProvider, 
  ModelResponse, 
  RateLimitConfig,
  CacheConfig,
  ModelUsageMetrics,
  ModelCapability
} from '../types/models';

interface RateLimiter {
  tryRemoveTokens(count: number): Promise<boolean>;
}

class AsyncTokenBucket implements RateLimiter {
  private bucket: TokenBucket;

  constructor(tokensPerInterval: number, interval: number) {
    this.bucket = new TokenBucket({
      tokensPerInterval,
      interval,
    });
  }

  async tryRemoveTokens(count: number): Promise<boolean> {
    return Promise.resolve(this.bucket.tryRemoveTokens(count));
  }
}

export class ModelManager {
  private redis: Redis;
  private rateLimiters: Map<string, RateLimiter>;
  private modelConfigs: Map<string, ModelConfig>;
  private cacheConfig: CacheConfig;
  private rateLimitConfig: RateLimitConfig;

  constructor(
    redisUrl: string,
    cacheConfig: CacheConfig,
    rateLimitConfig: RateLimitConfig
  ) {
    this.redis = new Redis(redisUrl);
    this.rateLimiters = new Map();
    this.modelConfigs = new Map();
    this.cacheConfig = cacheConfig;
    this.rateLimitConfig = rateLimitConfig;
  }

  public registerModel(config: ModelConfig): void {
    this.modelConfigs.set(config.model, config);
    this.rateLimiters.set(
      config.model,
      new AsyncTokenBucket(
        this.rateLimitConfig.requestsPerMinute,
        60000
      )
    );
  }

  public async selectModel(
    capabilities: ModelCapability[],
    preferredProvider?: ModelProvider
  ): Promise<ModelConfig> {
    const availableModels = Array.from(this.modelConfigs.values()).filter(
      config => capabilities.every(cap => config.capabilities.includes(cap))
    );

    if (availableModels.length === 0) {
      throw new Error('No models found matching the required capabilities');
    }

    if (preferredProvider) {
      const preferredModel = availableModels.find(
        model => model.provider === preferredProvider
      );
      if (preferredModel) return preferredModel;
    }

    // Default to most capable model
    return availableModels[0];
  }

  private async checkRateLimit(model: string): Promise<boolean> {
    const limiter = this.rateLimiters.get(model);
    if (!limiter) throw new Error(`Rate limiter not found for model: ${model}`);
    return limiter.tryRemoveTokens(1);
  }

  private async getCachedResponse<T>(
    model: string,
    prompt: string
  ): Promise<ModelResponse<T> | null> {
    if (!this.cacheConfig.enabled) return null;

    const cacheKey = `ai:cache:${model}:${Buffer.from(prompt).toString('base64')}`;
    const cached = await this.redis.get(cacheKey);
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached) as ModelResponse<T>;
    } catch (error) {
      console.error('Error parsing cached response:', error);
      return null;
    }
  }

  private async cacheResponse<T>(
    model: string,
    prompt: string,
    response: ModelResponse<T>
  ): Promise<void> {
    if (!this.cacheConfig.enabled) return;

    const cacheKey = `ai:cache:${model}:${Buffer.from(prompt).toString('base64')}`;
    try {
      await this.redis.setex(
        cacheKey,
        this.cacheConfig.ttlSeconds,
        JSON.stringify(response)
      );
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  public async recordMetrics(
    model: string,
    metrics: ModelUsageMetrics
  ): Promise<void> {
    const key = `ai:metrics:${model}:${metrics.timestamp.toISOString().split('T')[0]}`;
    try {
      await this.redis.lpush(key, JSON.stringify(metrics));
      await this.redis.expire(key, 60 * 60 * 24 * 30); // 30 days retention
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  }

  public async getMetrics(
    model: string,
    startDate: Date,
    endDate: Date
  ): Promise<ModelUsageMetrics[]> {
    const metrics: ModelUsageMetrics[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const key = `ai:metrics:${model}:${currentDate.toISOString().split('T')[0]}`;
      try {
        const dayMetrics = await this.redis.lrange(key, 0, -1);
        metrics.push(...dayMetrics.map(m => JSON.parse(m) as ModelUsageMetrics));
      } catch (error) {
        console.error('Error retrieving metrics:', error);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }

  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
} 
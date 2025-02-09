'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ModelManager = void 0;
const ioredis_1 = require('ioredis');
const limiter_1 = require('limiter');
class ModelManager {
  constructor(redisUrl, cacheConfig, rateLimitConfig) {
    this.redis = new ioredis_1.Redis(redisUrl);
    this.rateLimiters = new Map();
    this.modelConfigs = new Map();
    this.cacheConfig = cacheConfig;
    this.rateLimitConfig = rateLimitConfig;
  }
  registerModel(config) {
    this.modelConfigs.set(config.model, config);
    this.rateLimiters.set(
      config.model,
      new limiter_1.RateLimiter({
        tokensPerInterval: this.rateLimitConfig.requestsPerMinute,
        interval: 60000,
      }),
    );
  }
  async selectModel(capabilities, preferredProvider) {
    const availableModels = Array.from(this.modelConfigs.values()).filter(
      (config) =>
        capabilities.every((cap) => config.capabilities.includes(cap)),
    );
    if (preferredProvider) {
      const preferredModel = availableModels.find(
        (model) => model.provider === preferredProvider,
      );
      if (preferredModel) return preferredModel;
    }
    // Default to most capable model
    return availableModels[0];
  }
  async checkRateLimit(model) {
    const limiter = this.rateLimiters.get(model);
    if (!limiter) throw new Error(`Rate limiter not found for model: ${model}`);
    return limiter.tryRemoveTokens(1);
  }
  async getCachedResponse(model, prompt) {
    if (!this.cacheConfig.enabled) return null;
    const cacheKey = `ai:cache:${model}:${Buffer.from(prompt).toString('base64')}`;
    const cached = await this.redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }
  async cacheResponse(model, prompt, response) {
    if (!this.cacheConfig.enabled) return;
    const cacheKey = `ai:cache:${model}:${Buffer.from(prompt).toString('base64')}`;
    await this.redis.setex(
      cacheKey,
      this.cacheConfig.ttlSeconds,
      JSON.stringify(response),
    );
  }
  async recordMetrics(model, metrics) {
    const key = `ai:metrics:${model}:${metrics.timestamp.toISOString().split('T')[0]}`;
    await this.redis.lpush(key, JSON.stringify(metrics));
    await this.redis.expire(key, 60 * 60 * 24 * 30); // 30 days retention
  }
  async getMetrics(model, startDate, endDate) {
    const metrics = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = `ai:metrics:${model}:${currentDate.toISOString().split('T')[0]}`;
      const dayMetrics = await this.redis.lrange(key, 0, -1);
      metrics.push(...dayMetrics.map((m) => JSON.parse(m)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return metrics;
  }
  async cleanup() {
    await this.redis.quit();
  }
}
exports.ModelManager = ModelManager;

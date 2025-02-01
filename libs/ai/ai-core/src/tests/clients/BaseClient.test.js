"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClient_1 = require("../../clients/BaseClient");
const ModelManager_1 = require("../../services/ModelManager");
const ioredis_1 = require("ioredis");
const vitest_1 = require("vitest");
// Mock Redis
vitest_1.vi.mock('ioredis', () => {
    const MockRedis = vitest_1.vi.fn();
    MockRedis.prototype.get = vitest_1.vi.fn();
    MockRedis.prototype.set = vitest_1.vi.fn();
    MockRedis.prototype.setex = vitest_1.vi.fn();
    MockRedis.prototype.quit = vitest_1.vi.fn();
    return { default: MockRedis };
});
// Test implementation of BaseAIClient
class TestAIClient extends BaseClient_1.BaseAIClient {
    constructor() {
        super(...arguments);
        this.testMetrics = vitest_1.vi.fn();
    }
    async generateCompletion(prompt, options) {
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
    async generateEmbedding(text) {
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
    async analyzeImage(imageUrl, prompt) {
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
    async classifyContent(content, labels) {
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
    async testCreateMetrics(startTime, success, errorType, tokenCounts) {
        return this.createMetrics(startTime, success, errorType, tokenCounts);
    }
}
(0, vitest_1.describe)('BaseAIClient', () => {
    let client;
    let modelManager;
    let redis;
    let config;
    (0, vitest_1.beforeEach)(() => {
        redis = new ioredis_1.Redis();
        modelManager = new ModelManager_1.ModelManager('redis://localhost:6379', {
            enabled: true,
            ttlSeconds: 3600,
            maxEntries: 1000,
            similarityThreshold: 0.95
        }, {
            requestsPerMinute: 60,
            tokensPerMinute: 100000,
            concurrentRequests: 10,
            retryAttempts: 3,
            retryDelayMs: 1000
        });
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
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('complete', () => {
        (0, vitest_1.it)('should successfully generate completion', async () => {
            const response = await client.complete('test prompt');
            (0, vitest_1.expect)(response.data).toBe('test completion');
            (0, vitest_1.expect)(response.usage.success).toBe(true);
            (0, vitest_1.expect)(response.model).toBe(config.model);
            (0, vitest_1.expect)(response.provider).toBe(config.provider);
        });
        (0, vitest_1.it)('should handle errors and record metrics', async () => {
            const error = new Error('API error');
            vitest_1.vi.spyOn(client, 'generateCompletion').mockRejectedValueOnce(error);
            await (0, vitest_1.expect)(client.complete('test prompt')).rejects.toThrow('API error');
            (0, vitest_1.expect)(client.testMetrics).toHaveBeenCalledWith(vitest_1.expect.any(String), false, 'API error');
        });
    });
    (0, vitest_1.describe)('embed', () => {
        (0, vitest_1.it)('should successfully generate embeddings', async () => {
            const response = await client.embed('test text');
            (0, vitest_1.expect)(Array.isArray(response.data)).toBe(true);
            (0, vitest_1.expect)(response.usage.success).toBe(true);
            (0, vitest_1.expect)(response.model).toBe(config.model);
        });
        (0, vitest_1.it)('should handle errors in embedding generation', async () => {
            const error = new Error('Embedding error');
            vitest_1.vi.spyOn(client, 'generateEmbedding').mockRejectedValueOnce(error);
            await (0, vitest_1.expect)(client.embed('test text')).rejects.toThrow('Embedding error');
        });
    });
    (0, vitest_1.describe)('analyze', () => {
        (0, vitest_1.it)('should successfully analyze images', async () => {
            const response = await client.analyze('http://example.com/image.jpg', 'Describe this image');
            (0, vitest_1.expect)(response.data).toBe('test image analysis');
            (0, vitest_1.expect)(response.usage.success).toBe(true);
        });
        (0, vitest_1.it)('should handle errors in image analysis', async () => {
            const error = new Error('Image analysis error');
            vitest_1.vi.spyOn(client, 'analyzeImage').mockRejectedValueOnce(error);
            await (0, vitest_1.expect)(client.analyze('http://example.com/image.jpg', 'Describe this image')).rejects.toThrow('Image analysis error');
        });
    });
    (0, vitest_1.describe)('classify', () => {
        (0, vitest_1.it)('should successfully classify content', async () => {
            const labels = ['positive', 'negative', 'neutral'];
            const response = await client.classify('test content', labels);
            (0, vitest_1.expect)(labels).toContain(response.data);
            (0, vitest_1.expect)(response.usage.success).toBe(true);
        });
        (0, vitest_1.it)('should handle errors in classification', async () => {
            const error = new Error('Classification error');
            vitest_1.vi.spyOn(client, 'classifyContent').mockRejectedValueOnce(error);
            await (0, vitest_1.expect)(client.classify('test content', ['label1', 'label2'])).rejects.toThrow('Classification error');
        });
    });
    (0, vitest_1.describe)('metrics', () => {
        (0, vitest_1.it)('should create correct metrics', async () => {
            const startTime = Date.now() - 100;
            const metrics = await client.testCreateMetrics(startTime, true, undefined, { prompt: 10, completion: 20 });
            (0, vitest_1.expect)(metrics).toEqual({
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30,
                latencyMs: vitest_1.expect.any(Number),
                timestamp: vitest_1.expect.any(Date),
                success: true,
                errorType: undefined
            });
        });
        (0, vitest_1.it)('should handle error metrics', async () => {
            const startTime = Date.now() - 100;
            const metrics = await client.testCreateMetrics(startTime, false, 'test error');
            (0, vitest_1.expect)(metrics).toEqual({
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                latencyMs: vitest_1.expect.any(Number),
                timestamp: vitest_1.expect.any(Date),
                success: false,
                errorType: 'test error'
            });
        });
    });
});

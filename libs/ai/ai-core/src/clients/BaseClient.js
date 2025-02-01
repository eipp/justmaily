"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIClient = void 0;
class BaseAIClient {
    constructor(modelManager, config) {
        this.modelManager = modelManager;
        this.config = config;
        this.modelManager.registerModel(config);
    }
    async createMetrics(startTime, success, errorType, tokenCounts) {
        const endTime = Date.now();
        return {
            promptTokens: (tokenCounts === null || tokenCounts === void 0 ? void 0 : tokenCounts.prompt) || 0,
            completionTokens: (tokenCounts === null || tokenCounts === void 0 ? void 0 : tokenCounts.completion) || 0,
            totalTokens: ((tokenCounts === null || tokenCounts === void 0 ? void 0 : tokenCounts.prompt) || 0) + ((tokenCounts === null || tokenCounts === void 0 ? void 0 : tokenCounts.completion) || 0),
            latencyMs: endTime - startTime,
            timestamp: new Date(),
            success,
            errorType
        };
    }
    async complete(prompt, options) {
        try {
            const startTime = Date.now();
            const response = await this.generateCompletion(prompt, options);
            const metrics = await this.createMetrics(startTime, true);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            return response;
        }
        catch (error) {
            const metrics = await this.createMetrics(Date.now(), false, error.message);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            throw error;
        }
    }
    async embed(text) {
        try {
            const startTime = Date.now();
            const response = await this.generateEmbedding(text);
            const metrics = await this.createMetrics(startTime, true);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            return response;
        }
        catch (error) {
            const metrics = await this.createMetrics(Date.now(), false, error.message);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            throw error;
        }
    }
    async analyze(imageUrl, prompt) {
        try {
            const startTime = Date.now();
            const response = await this.analyzeImage(imageUrl, prompt);
            const metrics = await this.createMetrics(startTime, true);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            return response;
        }
        catch (error) {
            const metrics = await this.createMetrics(Date.now(), false, error.message);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            throw error;
        }
    }
    async classify(content, labels) {
        try {
            const startTime = Date.now();
            const response = await this.classifyContent(content, labels);
            const metrics = await this.createMetrics(startTime, true);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            return response;
        }
        catch (error) {
            const metrics = await this.createMetrics(Date.now(), false, error.message);
            await this.modelManager.recordMetrics(this.config.model, metrics);
            throw error;
        }
    }
}
exports.BaseAIClient = BaseAIClient;

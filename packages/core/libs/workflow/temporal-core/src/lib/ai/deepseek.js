'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DeepSeekClient = void 0;
const axios_1 = __importDefault(require('axios'));
class DeepSeekClient {
  constructor(config, metrics) {
    this.config = config;
    this.metrics = metrics;
    this.models = new Map();
    this.cache = new Map();
    this.client = axios_1.default.create({
      baseURL: config.apiEndpoint,
      timeout: config.timeout || 30000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-chat';
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature || 0.7;
    void this.initializeModels();
  }
  async predict(modelName, input, options = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const startTime = Date.now();
    try {
      // Check cache if enabled
      if (this.config.cacheEnabled && options.cacheKey && !options.forceFresh) {
        const cached = this.getCachedResult(options.cacheKey);
        if (cached) {
          await this.metrics.recordAiCache('hit', modelName);
          return cached;
        }
      }
      // Get model configuration
      const model = this.models.get(modelName);
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }
      // Prepare request
      const request = {
        model: `${model.name}@${model.version}`,
        input: await this.preprocessInput(input, model),
        parameters: {
          temperature:
            (_b =
              (_a = options.parameters) === null || _a === void 0
                ? void 0
                : _a.temperature) !== null && _b !== void 0
              ? _b
              : model.parameters.defaultTemperature,
          maxTokens:
            (_d =
              (_c = options.parameters) === null || _c === void 0
                ? void 0
                : _c.maxTokens) !== null && _d !== void 0
              ? _d
              : model.parameters.maxTokens,
          topP:
            (_f =
              (_e = options.parameters) === null || _e === void 0
                ? void 0
                : _e.topP) !== null && _f !== void 0
              ? _f
              : 0.9,
          frequencyPenalty:
            (_h =
              (_g = options.parameters) === null || _g === void 0
                ? void 0
                : _g.frequencyPenalty) !== null && _h !== void 0
              ? _h
              : 0.0,
          presencePenalty:
            (_k =
              (_j = options.parameters) === null || _j === void 0
                ? void 0
                : _j.presencePenalty) !== null && _k !== void 0
              ? _k
              : 0.0,
        },
      };
      // Make prediction
      const response = await this.makeRequest(request);
      // Process result
      const result = await this.processResponse(response, model);
      // Cache result if enabled
      if (this.config.cacheEnabled && options.cacheKey) {
        this.cacheResult(options.cacheKey, result);
      }
      // Record metrics
      const duration = Date.now() - startTime;
      await this.metrics.recordAiPrediction(modelName, duration);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordAiError(modelName, errorMessage);
      throw error;
    }
  }
  // Model-specific prediction methods
  async predictSpamScore(content) {
    const result = await this.predict('spam-analyzer', {
      content,
      analysisType: 'spam-detection',
    });
    return result.spamScore;
  }
  async optimizeContent(content, preferences) {
    return await this.predict('content-optimizer', {
      content,
      preferences,
      mode: 'comprehensive',
    });
  }
  async predictEngagement(campaign, historicalData) {
    return await this.predict('engagement-predictor', {
      campaign,
      historicalData,
    });
  }
  async analyzeAudience(audienceData, parameters) {
    return await this.predict('audience-analyzer', {
      audienceData,
      parameters,
    });
  }
  async analyze(type, content) {
    // Mock implementation - in production, this would call the DeepSeek API
    switch (type) {
      case 'engagement':
        return {
          score: 0.85,
          improvements: [
            {
              type: 'subject_line',
              description: 'Make subject line more action-oriented',
              impact: 0.2,
            },
            {
              type: 'call_to_action',
              description: 'Add more prominent CTA buttons',
              impact: 0.15,
            },
          ],
        };
      case 'readability':
        return {
          score: 0.78,
          grade: 'Grade 8',
          suggestions: [
            'Shorten sentences in paragraph 2',
            'Use simpler words in the introduction',
            'Break up long paragraphs',
          ],
        };
      case 'spam':
        return {
          score: 0.12,
        };
      case 'sentiment':
        return {
          score: 0.65,
          label: 'positive',
        };
      default:
        throw new Error(`Unsupported analysis type: ${type}`);
    }
  }
  async predict(type, features) {
    // Mock implementation - in production, this would call the DeepSeek API
    return {
      optimalTime: '2024-03-20T10:00:00Z',
      confidence: 0.85,
      score: 0.78,
      factors: [
        {
          name: 'time_of_day',
          importance: 0.4,
          value: '10:00',
        },
        {
          name: 'day_of_week',
          importance: 0.3,
          value: 'Wednesday',
        },
        {
          name: 'recipient_timezone',
          importance: 0.2,
          value: 'UTC',
        },
        {
          name: 'historical_engagement',
          importance: 0.1,
          value: 'high',
        },
      ],
      alternatives: [
        {
          time: '2024-03-20T14:00:00Z',
          expectedEngagement: 0.75,
        },
        {
          time: '2024-03-21T09:00:00Z',
          expectedEngagement: 0.72,
        },
      ],
    };
  }
  async extractFeatures(content) {
    // Mock implementation - in production, this would call the DeepSeek API
    return {
      length: content.length,
      readability_score: 0.85,
      sentiment_score: 0.65,
      topic_relevance: 0.92,
      key_phrases: ['email marketing', 'engagement', 'optimization'],
      language_complexity: 'moderate',
      tone: 'professional',
      urgency: 'medium',
      personalization_level: 'high',
    };
  }
  async initializeModels() {
    try {
      const response = await this.client.get('/models');
      const models = response.data.models;
      for (const model of models) {
        this.models.set(model.name, model);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize models:', errorMessage);
    }
  }
  async makeRequest(request) {
    let retries = 0;
    const maxRetries = this.config.maxRetries || 3;
    while (retries < maxRetries) {
      try {
        const response = await this.client.post('/predict', request);
        return response.data;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        await this.sleep(Math.pow(2, retries) * 1000); // Exponential backoff
      }
    }
  }
  async preprocessInput(input, model) {
    // Implement input preprocessing based on model capabilities
    return input;
  }
  async processResponse(response, model) {
    if (!this.validateResponse(response, model)) {
      throw new Error('Invalid response from model');
    }
    return response.result;
  }
  validateResponse(result, model) {
    return result && result.result !== undefined;
  }
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.result;
  }
  cacheResult(key, result) {
    const ttl = this.config.cacheTTL || 3600000; // Default 1 hour
    this.cache.set(key, {
      result,
      expires: Date.now() + ttl,
    });
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
exports.DeepSeekClient = DeepSeekClient;

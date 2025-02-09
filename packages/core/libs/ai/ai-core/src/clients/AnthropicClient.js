'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AnthropicClient = void 0;
const sdk_1 = __importDefault(require('@anthropic-ai/sdk'));
const BaseClient_1 = require('./BaseClient');
class AnthropicClient extends BaseClient_1.BaseAIClient {
  constructor(modelManager, config, apiKey) {
    super(modelManager, config);
    this.client = new sdk_1.default({
      apiKey,
    });
  }
  async generateCompletion(prompt, options) {
    var _a, _b, _c, _d, _e;
    const startTime = Date.now();
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature:
          (_a =
            options === null || options === void 0
              ? void 0
              : options.temperature) !== null && _a !== void 0
            ? _a
            : this.config.temperature,
        top_p:
          (_b =
            options === null || options === void 0 ? void 0 : options.topP) !==
            null && _b !== void 0
            ? _b
            : this.config.topP,
        stop_sequences:
          (_c =
            options === null || options === void 0
              ? void 0
              : options.stopSequences) !== null && _c !== void 0
            ? _c
            : this.config.stopSequences,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_d = response.usage) === null || _d === void 0
            ? void 0
            : _d.input_tokens,
        completion:
          (_e = response.usage) === null || _e === void 0
            ? void 0
            : _e.output_tokens,
      });
      return {
        data: response.content[0].text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
  async generateEmbedding(text) {
    throw new Error('Embedding generation not supported by Anthropic');
  }
  async analyzeImage(imageUrl, prompt) {
    var _a, _b;
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
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        temperature: this.config.temperature,
        top_p: this.config.topP,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_a = response.usage) === null || _a === void 0
            ? void 0
            : _a.input_tokens,
        completion:
          (_b = response.usage) === null || _b === void 0
            ? void 0
            : _b.output_tokens,
      });
      return {
        data: response.content[0].text,
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
  async classifyContent(content, labels) {
    var _a, _b;
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
        top_p: 1,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_a = response.usage) === null || _a === void 0
            ? void 0
            : _a.input_tokens,
        completion:
          (_b = response.usage) === null || _b === void 0
            ? void 0
            : _b.output_tokens,
      });
      return {
        data: response.content[0].text.trim(),
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}
exports.AnthropicClient = AnthropicClient;

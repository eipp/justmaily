'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OpenAIClient = void 0;
const openai_1 = __importDefault(require('openai'));
const BaseClient_1 = require('./BaseClient');
class OpenAIClient extends BaseClient_1.BaseAIClient {
  constructor(modelManager, config, apiKey) {
    super(modelManager, config);
    this.client = new openai_1.default({
      apiKey,
      maxRetries: 3,
      timeout: 30000,
    });
  }
  async generateCompletion(prompt, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const startTime = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens:
          (_a =
            options === null || options === void 0
              ? void 0
              : options.maxTokens) !== null && _a !== void 0
            ? _a
            : this.config.maxTokens,
        temperature:
          (_b =
            options === null || options === void 0
              ? void 0
              : options.temperature) !== null && _b !== void 0
            ? _b
            : this.config.temperature,
        top_p:
          (_c =
            options === null || options === void 0 ? void 0 : options.topP) !==
            null && _c !== void 0
            ? _c
            : this.config.topP,
        frequency_penalty:
          (_d =
            options === null || options === void 0
              ? void 0
              : options.frequencyPenalty) !== null && _d !== void 0
            ? _d
            : this.config.frequencyPenalty,
        presence_penalty:
          (_e =
            options === null || options === void 0
              ? void 0
              : options.presencePenalty) !== null && _e !== void 0
            ? _e
            : this.config.presencePenalty,
        stop:
          (_f =
            options === null || options === void 0
              ? void 0
              : options.stopSequences) !== null && _f !== void 0
            ? _f
            : this.config.stopSequences,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_g = response.usage) === null || _g === void 0
            ? void 0
            : _g.prompt_tokens,
        completion:
          (_h = response.usage) === null || _h === void 0
            ? void 0
            : _h.completion_tokens,
      });
      return {
        data: response.choices[0].message.content || '',
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'openai',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  async generateEmbedding(text) {
    const startTime = Date.now();
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
        encoding_format: 'float',
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt: response.usage.prompt_tokens,
        completion: 0,
      });
      return {
        data: response.data[0].embedding,
        usage: metrics,
        cached: false,
        model: 'text-embedding-3-large',
        provider: 'openai',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  async analyzeImage(imageUrl, prompt) {
    var _a, _b;
    const startTime = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: this.config.maxTokens,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_a = response.usage) === null || _a === void 0
            ? void 0
            : _a.prompt_tokens,
        completion:
          (_b = response.usage) === null || _b === void 0
            ? void 0
            : _b.completion_tokens,
      });
      return {
        data: response.choices[0].message.content || '',
        usage: metrics,
        cached: false,
        model: 'gpt-4-vision-preview',
        provider: 'openai',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  async classifyContent(content, labels) {
    var _a, _b, _c;
    const startTime = Date.now();
    try {
      const prompt = `
        Please classify the following content into exactly one of these categories: ${labels.join(', ')}
        
        Content: ${content}
        
        Respond with only the category name, nothing else.
      `;
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1,
        top_p: 1,
      });
      const metrics = await this.createMetrics(startTime, true, undefined, {
        prompt:
          (_a = response.usage) === null || _a === void 0
            ? void 0
            : _a.prompt_tokens,
        completion:
          (_b = response.usage) === null || _b === void 0
            ? void 0
            : _b.completion_tokens,
      });
      return {
        data:
          ((_c = response.choices[0].message.content) === null || _c === void 0
            ? void 0
            : _c.trim()) || '',
        usage: metrics,
        cached: false,
        model: this.config.model,
        provider: 'openai',
      };
    } catch (error) {
      const metrics = await this.createMetrics(startTime, false, error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
exports.OpenAIClient = OpenAIClient;

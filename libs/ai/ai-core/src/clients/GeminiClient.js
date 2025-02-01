"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
const BaseClient_1 = require("./BaseClient");
class GeminiClient extends BaseClient_1.BaseAIClient {
    constructor(modelManager, config, apiKey) {
        super(modelManager, config);
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.client.getGenerativeModel({ model: config.model });
    }
    async generateCompletion(prompt, options) {
        var _a, _b, _c, _d;
        const startTime = Date.now();
        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: (_a = options === null || options === void 0 ? void 0 : options.maxTokens) !== null && _a !== void 0 ? _a : this.config.maxTokens,
                    temperature: (_b = options === null || options === void 0 ? void 0 : options.temperature) !== null && _b !== void 0 ? _b : this.config.temperature,
                    topP: (_c = options === null || options === void 0 ? void 0 : options.topP) !== null && _c !== void 0 ? _c : this.config.topP,
                    stopSequences: (_d = options === null || options === void 0 ? void 0 : options.stopSequences) !== null && _d !== void 0 ? _d : this.config.stopSequences
                }
            });
            const response = await result.response;
            const text = response.text();
            // Gemini doesn't provide token counts, so we estimate
            const estimatedTokens = Math.ceil((prompt.length + text.length) / 4);
            const metrics = await this.createMetrics(startTime, true, undefined, {
                prompt: Math.ceil(prompt.length / 4),
                completion: Math.ceil(text.length / 4)
            });
            return {
                data: text,
                usage: metrics,
                cached: false,
                model: this.config.model,
                provider: 'gemini'
            };
        }
        catch (error) {
            const metrics = await this.createMetrics(startTime, false, error.message);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
    async generateEmbedding(text) {
        const startTime = Date.now();
        try {
            const embeddingModel = this.client.getGenerativeModel({
                model: 'embedding-001'
            });
            const result = await embeddingModel.embedContent(text);
            const embedding = result.embedding.values;
            const metrics = await this.createMetrics(startTime, true, undefined, {
                prompt: Math.ceil(text.length / 4),
                completion: 0
            });
            return {
                data: embedding,
                usage: metrics,
                cached: false,
                model: 'embedding-001',
                provider: 'gemini'
            };
        }
        catch (error) {
            const metrics = await this.createMetrics(startTime, false, error.message);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
    async analyzeImage(imageUrl, prompt) {
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
            const metrics = await this.createMetrics(startTime, true, undefined, {
                prompt: Math.ceil((prompt.length + 1000) / 4), // Add 1000 for image tokens
                completion: Math.ceil(text.length / 4)
            });
            return {
                data: text,
                usage: metrics,
                cached: false,
                model: 'gemini-pro-vision',
                provider: 'gemini'
            };
        }
        catch (error) {
            const metrics = await this.createMetrics(startTime, false, error.message);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
    async classifyContent(content, labels) {
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
            const metrics = await this.createMetrics(startTime, true, undefined, {
                prompt: Math.ceil(prompt.length / 4),
                completion: Math.ceil(text.length / 4)
            });
            return {
                data: text,
                usage: metrics,
                cached: false,
                model: this.config.model,
                provider: 'gemini'
            };
        }
        catch (error) {
            const metrics = await this.createMetrics(startTime, false, error.message);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
}
exports.GeminiClient = GeminiClient;
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
            else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

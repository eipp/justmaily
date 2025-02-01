"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIClientFactory = void 0;
const openai_1 = require("./openai");
const anthropic_1 = require("./anthropic");
const google_1 = require("./google");
class AIClientFactory {
    static createClient(provider, apiKey, apiEndpoint) {
        const cacheKey = `${provider}:${apiKey}:${apiEndpoint || ''}`;
        if (this.clients.has(cacheKey)) {
            return this.clients.get(cacheKey);
        }
        let client;
        switch (provider) {
            case 'openai':
                client = new openai_1.OpenAIClient(apiKey, apiEndpoint);
                break;
            case 'anthropic':
                client = new anthropic_1.AnthropicClient(apiKey);
                break;
            case 'google':
                client = new google_1.GoogleAIClient(apiKey);
                break;
            case 'deepseek':
            case 'custom':
                throw new Error(`Provider ${provider} not implemented yet`);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
        this.clients.set(cacheKey, client);
        return client;
    }
    static clearClients() {
        this.clients.clear();
    }
}
exports.AIClientFactory = AIClientFactory;
AIClientFactory.clients = new Map();

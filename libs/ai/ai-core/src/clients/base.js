"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIClient = void 0;
class BaseAIClient {
    constructor(apiKey, apiEndpoint) {
        this.apiKey = apiKey;
        this.apiEndpoint = apiEndpoint;
    }
    validateRequest(request) {
        var _a;
        if (!request.messages.length) {
            throw new Error('Messages array cannot be empty');
        }
        if (((_a = request.functions) === null || _a === void 0 ? void 0 : _a.length) && !request.modelConfig.model.includes('gpt')) {
            throw new Error('Function calling is only supported with GPT models');
        }
    }
}
exports.BaseAIClient = BaseAIClient;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAnalytics = exports.AnalyticsConfig = exports.Analytics = exports.experimental_StreamingReactResponse = exports.useAssistant = exports.useCompletion = exports.useChat = exports.AIClientFactory = exports.GoogleAIClient = exports.AnthropicClient = exports.OpenAIClient = exports.BaseAIClient = void 0;
// Types
__exportStar(require("./types"), exports);
// Base client
var base_1 = require("./clients/base");
Object.defineProperty(exports, "BaseAIClient", { enumerable: true, get: function () { return base_1.BaseAIClient; } });
// Provider-specific clients
var openai_1 = require("./clients/openai");
Object.defineProperty(exports, "OpenAIClient", { enumerable: true, get: function () { return openai_1.OpenAIClient; } });
var anthropic_1 = require("./clients/anthropic");
Object.defineProperty(exports, "AnthropicClient", { enumerable: true, get: function () { return anthropic_1.AnthropicClient; } });
var google_1 = require("./clients/google");
Object.defineProperty(exports, "GoogleAIClient", { enumerable: true, get: function () { return google_1.GoogleAIClient; } });
// Factory
var factory_1 = require("./clients/factory");
Object.defineProperty(exports, "AIClientFactory", { enumerable: true, get: function () { return factory_1.AIClientFactory; } });
// Re-export Vercel AI SDK components
var ai_1 = require("ai");
Object.defineProperty(exports, "useChat", { enumerable: true, get: function () { return ai_1.useChat; } });
Object.defineProperty(exports, "useCompletion", { enumerable: true, get: function () { return ai_1.useCompletion; } });
Object.defineProperty(exports, "useAssistant", { enumerable: true, get: function () { return ai_1.useAssistant; } });
Object.defineProperty(exports, "experimental_StreamingReactResponse", { enumerable: true, get: function () { return ai_1.experimental_StreamingReactResponse; } });
// Re-export analytics
var analytics_1 = require("@vercel/analytics");
Object.defineProperty(exports, "Analytics", { enumerable: true, get: function () { return analytics_1.Analytics; } });
Object.defineProperty(exports, "AnalyticsConfig", { enumerable: true, get: function () { return analytics_1.AnalyticsConfig; } });
Object.defineProperty(exports, "initAnalytics", { enumerable: true, get: function () { return analytics_1.init; } });

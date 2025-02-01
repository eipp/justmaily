"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAIClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
const p_timeout_1 = __importDefault(require("p-timeout"));
const p_retry_1 = __importDefault(require("p-retry"));
const base_1 = require("./base");
class GoogleAIClient extends base_1.BaseAIClient {
    constructor(apiKey) {
        super(apiKey);
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async complete(request) {
        this.validateRequest(request);
        const completion = await (0, p_retry_1.default)(async () => {
            const model = this.client.getGenerativeModel({
                model: request.modelConfig.model,
            });
            const response = await (0, p_timeout_1.default)(model.generateContent({
                contents: this.convertMessages(request.messages),
                generationConfig: {
                    temperature: request.modelConfig.temperature,
                    maxOutputTokens: request.modelConfig.maxTokens,
                    topP: request.modelConfig.topP,
                    stopSequences: request.modelConfig.stop,
                },
            }), { milliseconds: 30000 });
            const result = response.response;
            return {
                id: result.promptFeedback.blockReason || 'response',
                model: request.modelConfig.model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: result.text(),
                        },
                        finishReason: result.promptFeedback.blockReason || 'stop',
                    },
                ],
                usage: {
                    promptTokens: 0, // Not provided by Google AI
                    completionTokens: 0,
                    totalTokens: 0,
                },
            };
        }, {
            retries: 3,
            onFailedAttempt: (error) => {
                console.error(`Google AI API request failed (attempt ${error.attemptNumber}): ${error.message}`);
            },
        });
        return completion;
    }
    streamComplete(request) {
        return __asyncGenerator(this, arguments, function* streamComplete_1() {
            var _a, e_1, _b, _c;
            var _d, _e;
            this.validateRequest(request);
            const model = this.client.getGenerativeModel({
                model: request.modelConfig.model,
            });
            const response = yield __await(model.generateContentStream({
                contents: this.convertMessages(request.messages),
                generationConfig: {
                    temperature: request.modelConfig.temperature,
                    maxOutputTokens: request.modelConfig.maxTokens,
                    topP: request.modelConfig.topP,
                    stopSequences: request.modelConfig.stop,
                },
            }));
            try {
                for (var _f = true, _g = __asyncValues(response.stream), _h; _h = yield __await(_g.next()), _a = _h.done, !_a; _f = true) {
                    _c = _h.value;
                    _f = false;
                    const chunk = _c;
                    yield yield __await({
                        id: ((_d = chunk.promptFeedback) === null || _d === void 0 ? void 0 : _d.blockReason) || 'chunk',
                        model: request.modelConfig.model,
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    role: 'assistant',
                                    content: chunk.text(),
                                },
                                finishReason: ((_e = chunk.promptFeedback) === null || _e === void 0 ? void 0 : _e.blockReason) || null,
                            },
                        ],
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_a && (_b = _g.return)) yield __await(_b.call(_g));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    convertMessages(messages) {
        return messages.map((message) => ({
            role: this.convertRole(message.role),
            parts: [{ text: message.content }],
        }));
    }
    convertRole(role) {
        switch (role) {
            case 'system':
                return 'system';
            case 'user':
                return 'user';
            case 'assistant':
                return 'model';
            case 'function':
                return 'user';
            default:
                return 'user';
        }
    }
}
exports.GoogleAIClient = GoogleAIClient;

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
exports.AnthropicClient = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const p_timeout_1 = __importDefault(require("p-timeout"));
const p_retry_1 = __importDefault(require("p-retry"));
const base_1 = require("./base");
class AnthropicClient extends base_1.BaseAIClient {
    constructor(apiKey) {
        super(apiKey);
        this.client = new sdk_1.default({
            apiKey,
        });
    }
    async complete(request) {
        this.validateRequest(request);
        const completion = await (0, p_retry_1.default)(async () => {
            const response = await (0, p_timeout_1.default)(this.client.messages.create({
                model: request.modelConfig.model,
                messages: this.convertMessages(request.messages),
                max_tokens: request.modelConfig.maxTokens,
                temperature: request.modelConfig.temperature,
                top_p: request.modelConfig.topP,
                stop_sequences: request.modelConfig.stop,
            }), { milliseconds: 30000 });
            return {
                id: response.id,
                model: response.model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: response.content[0].text,
                        },
                        finishReason: response.stop_reason,
                    },
                ],
                usage: {
                    promptTokens: response.usage.input_tokens,
                    completionTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens,
                },
            };
        }, {
            retries: 3,
            onFailedAttempt: (error) => {
                console.error(`Anthropic API request failed (attempt ${error.attemptNumber}): ${error.message}`);
            },
        });
        return completion;
    }
    streamComplete(request) {
        return __asyncGenerator(this, arguments, function* streamComplete_1() {
            var _a, e_1, _b, _c;
            this.validateRequest(request);
            const stream = yield __await(this.client.messages.create({
                model: request.modelConfig.model,
                messages: this.convertMessages(request.messages),
                max_tokens: request.modelConfig.maxTokens,
                temperature: request.modelConfig.temperature,
                top_p: request.modelConfig.topP,
                stop_sequences: request.modelConfig.stop,
                stream: true,
            }));
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    if (chunk.type === 'message_delta') {
                        yield yield __await({
                            id: chunk.message.id,
                            model: chunk.message.model,
                            choices: [
                                {
                                    index: 0,
                                    delta: {
                                        role: 'assistant',
                                        content: chunk.delta.text || undefined,
                                    },
                                    finishReason: null,
                                },
                            ],
                        });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) yield __await(_b.call(stream_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    convertMessages(messages) {
        return messages.map((message) => ({
            role: this.convertRole(message.role),
            content: message.content,
        }));
    }
    convertRole(role) {
        switch (role) {
            case 'system':
            case 'user':
                return 'user';
            case 'assistant':
            case 'function':
                return 'assistant';
            default:
                return 'user';
        }
    }
}
exports.AnthropicClient = AnthropicClient;

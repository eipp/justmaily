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
exports.OpenAIClient = void 0;
const openai_1 = __importDefault(require("openai"));
const p_timeout_1 = __importDefault(require("p-timeout"));
const p_retry_1 = __importDefault(require("p-retry"));
const base_1 = require("./base");
class OpenAIClient extends base_1.BaseAIClient {
    constructor(apiKey, apiEndpoint) {
        super(apiKey, apiEndpoint);
        this.client = new openai_1.default({
            apiKey,
            baseURL: apiEndpoint,
        });
    }
    async complete(request) {
        this.validateRequest(request);
        const completion = await (0, p_retry_1.default)(async () => {
            const response = await (0, p_timeout_1.default)(this.client.chat.completions.create({
                model: request.modelConfig.model,
                messages: this.convertMessages(request.messages),
                functions: request.functions,
                temperature: request.modelConfig.temperature,
                max_tokens: request.modelConfig.maxTokens,
                top_p: request.modelConfig.topP,
                frequency_penalty: request.modelConfig.frequencyPenalty,
                presence_penalty: request.modelConfig.presencePenalty,
                stop: request.modelConfig.stop,
                stream: false,
            }), { milliseconds: 30000 });
            return {
                id: response.id,
                model: response.model,
                choices: response.choices.map((choice) => ({
                    index: choice.index,
                    message: {
                        role: choice.message.role,
                        content: choice.message.content || '',
                        name: choice.message.name,
                        functionCall: choice.message.function_call
                            ? {
                                name: choice.message.function_call.name,
                                arguments: choice.message.function_call.arguments,
                            }
                            : undefined,
                    },
                    finishReason: choice.finish_reason,
                })),
                usage: response.usage
                    ? {
                        promptTokens: response.usage.prompt_tokens,
                        completionTokens: response.usage.completion_tokens,
                        totalTokens: response.usage.total_tokens,
                    }
                    : undefined,
            };
        }, {
            retries: 3,
            onFailedAttempt: (error) => {
                console.error(`OpenAI API request failed (attempt ${error.attemptNumber}): ${error.message}`);
            },
        });
        return completion;
    }
    streamComplete(request) {
        return __asyncGenerator(this, arguments, function* streamComplete_1() {
            var _a, e_1, _b, _c;
            this.validateRequest(request);
            const stream = yield __await(this.client.chat.completions.create({
                model: request.modelConfig.model,
                messages: this.convertMessages(request.messages),
                functions: request.functions,
                temperature: request.modelConfig.temperature,
                max_tokens: request.modelConfig.maxTokens,
                top_p: request.modelConfig.topP,
                frequency_penalty: request.modelConfig.frequencyPenalty,
                presence_penalty: request.modelConfig.presencePenalty,
                stop: request.modelConfig.stop,
                stream: true,
            }));
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    yield yield __await({
                        id: chunk.id,
                        model: chunk.model,
                        choices: chunk.choices.map((choice) => ({
                            index: choice.index,
                            delta: {
                                role: choice.delta.role,
                                content: choice.delta.content || undefined,
                                functionCall: choice.delta.function_call
                                    ? {
                                        name: choice.delta.function_call.name,
                                        arguments: choice.delta.function_call.arguments,
                                    }
                                    : undefined,
                            },
                            finishReason: choice.finish_reason,
                        })),
                    });
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
            role: message.role,
            content: message.content,
            name: message.name,
            function_call: message.functionCall
                ? {
                    name: message.functionCall.name,
                    arguments: message.functionCall.arguments,
                }
                : undefined,
        }));
    }
}
exports.OpenAIClient = OpenAIClient;

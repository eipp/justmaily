import type { CompletionRequest, CompletionResponse, StreamResponseChunk } from '../types';
import { BaseAIClient } from './base';
export declare class AnthropicClient extends BaseAIClient {
    private client;
    constructor(apiKey: string);
    complete(request: CompletionRequest): Promise<CompletionResponse>;
    streamComplete(request: CompletionRequest): AsyncGenerator<StreamResponseChunk, void, unknown>;
    private convertMessages;
    private convertRole;
}

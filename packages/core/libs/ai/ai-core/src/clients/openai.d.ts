import type { CompletionRequest, CompletionResponse, StreamResponseChunk } from '../types';
import { BaseAIClient } from './base';
export declare class OpenAIClient extends BaseAIClient {
    private client;
    constructor(apiKey: string, apiEndpoint?: string);
    complete(request: CompletionRequest): Promise<CompletionResponse>;
    streamComplete(request: CompletionRequest): AsyncGenerator<StreamResponseChunk, void, unknown>;
    private convertMessages;
}

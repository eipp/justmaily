import type { CompletionRequest, CompletionResponse, StreamResponseChunk } from '../types';
export interface AIClient {
    /**
     * Performs a completion request and returns the full response
     */
    complete(request: CompletionRequest): Promise<CompletionResponse>;
    /**
     * Performs a streaming completion request and yields chunks of the response
     */
    streamComplete(request: CompletionRequest): AsyncGenerator<StreamResponseChunk, void, unknown>;
}
export declare abstract class BaseAIClient implements AIClient {
    protected readonly apiKey: string;
    protected readonly apiEndpoint?: string | undefined;
    protected constructor(apiKey: string, apiEndpoint?: string | undefined);
    abstract complete(request: CompletionRequest): Promise<CompletionResponse>;
    abstract streamComplete(request: CompletionRequest): AsyncGenerator<StreamResponseChunk, void, unknown>;
    protected validateRequest(request: CompletionRequest): void;
}

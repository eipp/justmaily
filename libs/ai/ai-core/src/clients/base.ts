import type {
  CompletionRequest,
  CompletionResponse,
  StreamResponseChunk,
} from '../types'

export interface AIClient {
  /**
   * Performs a completion request and returns the full response
   */
  complete(request: CompletionRequest): Promise<CompletionResponse>

  /**
   * Performs a streaming completion request and yields chunks of the response
   */
  streamComplete(
    request: CompletionRequest
  ): AsyncGenerator<StreamResponseChunk, void, unknown>
}

export abstract class BaseAIClient implements AIClient {
  protected constructor(
    protected readonly apiKey: string,
    protected readonly apiEndpoint?: string
  ) {}

  abstract complete(request: CompletionRequest): Promise<CompletionResponse>
  abstract streamComplete(
    request: CompletionRequest
  ): AsyncGenerator<StreamResponseChunk, void, unknown>

  protected validateRequest(request: CompletionRequest): void {
    if (!request.messages.length) {
      throw new Error('Messages array cannot be empty')
    }

    if (request.functions?.length && !request.modelConfig.model.includes('gpt')) {
      throw new Error('Function calling is only supported with GPT models')
    }
  }
} 
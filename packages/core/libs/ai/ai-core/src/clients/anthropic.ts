import { Anthropic, Message } from '@anthropic-ai/sdk'
import pTimeout from 'p-timeout'
import pRetry from 'p-retry'
import type {
  CompletionRequest,
  CompletionResponse,
  StreamResponseChunk,
  Message as AIMessage,
  MessageRole
} from '../types'
import { BaseAIClient } from './base'
import type { Anthropic as AnthropicType } from '@anthropic-ai/sdk'

export class AnthropicClient extends BaseAIClient {
  private client: AnthropicType

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new Anthropic({
      apiKey,
    })
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.validateRequest(request)

    const completion = await pRetry(
      async () => {
        const response = await pTimeout(
          this.client.messages.create({
            model: request.modelConfig.model,
            messages: this.convertMessages(request.messages),
            max_tokens: request.modelConfig.maxTokens,
            temperature: request.modelConfig.temperature,
            top_p: request.modelConfig.topP,
            stop_sequences: request.modelConfig.stop,
          }) as Promise<Message>,
          30000
        )

        return {
          id: response.id,
          model: response.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant' as MessageRole,
                content: response.content[0].text,
              },
              finishReason: response.stop_reason || null,
            },
          ],
          usage: {
            promptTokens: response.usage?.input_tokens || 0,
            completionTokens: response.usage?.output_tokens || 0,
            totalTokens:
              (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          },
        } satisfies CompletionResponse
      },
      {
        retries: 3,
        onFailedAttempt: (error: Error) => {
          console.error(
            `Anthropic API request failed (attempt ${(error as any).attemptNumber}): ${error.message}`
          )
        },
      }
    )

    return completion
  }

  async *streamComplete(
    request: CompletionRequest
  ): AsyncGenerator<StreamResponseChunk, void, unknown> {
    this.validateRequest(request)

    const stream = await this.client.messages.create({
      model: request.modelConfig.model,
      messages: this.convertMessages(request.messages),
      max_tokens: request.modelConfig.maxTokens,
      temperature: request.modelConfig.temperature,
      top_p: request.modelConfig.topP,
      stop_sequences: request.modelConfig.stop,
      stream: true,
    })

    for await (const chunk of stream) {
      if (chunk.type === 'message_delta') {
        yield {
          id: chunk.message.id,
          model: chunk.message.model,
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant' as MessageRole,
                content: chunk.delta.text || undefined,
              },
              finishReason: null,
            },
          ],
        } satisfies StreamResponseChunk
      }
    }
  }

  private convertMessages(messages: AIMessage[]): Array<{
    role: 'user' | 'assistant';
    content: string;
  }> {
    return messages.map((message) => ({
      role: this.convertRole(message.role),
      content: message.content,
    }))
  }

  private convertRole(role: AIMessage['role']): 'user' | 'assistant' {
    switch (role) {
      case 'system':
      case 'user':
        return 'user'
      case 'assistant':
      case 'function':
        return 'assistant'
      default:
        return 'user'
    }
  }
} 
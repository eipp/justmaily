import OpenAI from 'openai'
import pTimeout from 'p-timeout'
import pRetry from 'p-retry'
import type {
  CompletionRequest,
  CompletionResponse,
  StreamResponseChunk,
  Message,
  MessageRole,
} from '../types'
import { BaseAIClient } from './base'

export class OpenAIClient extends BaseAIClient {
  private client: OpenAI

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new OpenAI({
      apiKey,
    })
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.validateRequest(request)

    const completion = await pRetry(
      async () => {
        const response = await pTimeout(
          this.client.chat.completions.create({
            model: request.modelConfig.model,
            messages: this.convertMessages(request.messages),
            functions: request.functions as any,
            temperature: request.modelConfig.temperature,
            max_tokens: request.modelConfig.maxTokens,
            top_p: request.modelConfig.topP,
            frequency_penalty: request.modelConfig.frequencyPenalty,
            presence_penalty: request.modelConfig.presencePenalty,
            stop: request.modelConfig.stop,
            stream: false,
          }),
          30000
        )

        return {
          id: response.id,
          model: response.model,
          choices: response.choices.map((choice) => ({
            index: choice.index,
            message: {
              role: choice.message.role as MessageRole,
              content: choice.message.content || '',
              ...(choice.message.function_call && {
                functionCall: {
                  name: choice.message.function_call.name,
                  arguments: choice.message.function_call.arguments || '',
                },
              }),
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
        } satisfies CompletionResponse
      },
      {
        retries: 3,
        onFailedAttempt: (error: Error) => {
          console.error(
            `OpenAI API request failed (attempt ${(error as any).attemptNumber}): ${error.message}`
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

    const stream = await this.client.chat.completions.create({
      model: request.modelConfig.model,
      messages: this.convertMessages(request.messages),
      functions: request.functions as any,
      temperature: request.modelConfig.temperature,
      max_tokens: request.modelConfig.maxTokens,
      top_p: request.modelConfig.topP,
      frequency_penalty: request.modelConfig.frequencyPenalty,
      presence_penalty: request.modelConfig.presencePenalty,
      stop: request.modelConfig.stop,
      stream: true,
    })

    for await (const chunk of stream) {
      yield {
        id: chunk.id,
        model: chunk.model,
        choices: chunk.choices.map((choice) => ({
          index: choice.index,
          delta: {
            role: choice.delta.role as MessageRole | undefined,
            content: choice.delta.content || undefined,
            ...(choice.delta.function_call && {
              functionCall: {
                name: choice.delta.function_call.name || '',
                arguments: choice.delta.function_call.arguments || '',
              },
            }),
          },
          finishReason: choice.finish_reason,
        })),
      } satisfies StreamResponseChunk
    }
  }

  private convertMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((message) => {
      if (message.role === 'function') {
        return {
          role: message.role,
          content: message.content,
          name: message.name || 'function'
        } as OpenAI.Chat.ChatCompletionFunctionMessageParam;
      } else {
        return {
          role: message.role,
          content: message.content,
        };
      }
    })
  }
} 
import { GoogleGenerativeAI } from '@google/generative-ai'
import pTimeout from 'p-timeout'
import pRetry from 'p-retry'
import type {
  CompletionRequest,
  CompletionResponse,
  StreamResponseChunk,
  Message,
  MessageRole
} from '../types'
import { BaseAIClient } from './base'

export class GoogleAIClient extends BaseAIClient {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.validateRequest(request)

    const completion = await pRetry(
      async () => {
        const model = this.client.getGenerativeModel({
          model: request.modelConfig.model,
        })

        const response = await pTimeout(
          model.generateContent({
            contents: this.convertMessages(request.messages),
            generationConfig: {
              temperature: request.modelConfig.temperature,
              maxOutputTokens: request.modelConfig.maxTokens,
              topP: request.modelConfig.topP,
              stopSequences: request.modelConfig.stop,
            },
          }),
          30000
        )

        const result = response.response

        return {
          id: result.promptFeedback?.blockReason || 'response',
          model: request.modelConfig.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant' as MessageRole,
                content: result.text(),
              },
              finishReason: result.promptFeedback?.blockReason || null,
            },
          ],
          usage: {
            promptTokens: 0, // Not provided by Google AI
            completionTokens: 0,
            totalTokens: 0,
          },
        } satisfies CompletionResponse
      },
      {
        retries: 3,
        onFailedAttempt: (err: unknown) => {
          const error = err as Error
          console.error(
            `Google AI API request failed (attempt ${(err as any).attemptNumber}): ${error.message}`
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

    const model = this.client.getGenerativeModel({
      model: request.modelConfig.model,
    })

    const response = await model.generateContentStream({
      contents: this.convertMessages(request.messages),
      generationConfig: {
        temperature: request.modelConfig.temperature,
        maxOutputTokens: request.modelConfig.maxTokens,
        topP: request.modelConfig.topP,
        stopSequences: request.modelConfig.stop,
      },
    })

    for await (const chunk of response.stream) {
      yield {
        id: chunk.promptFeedback?.blockReason || 'chunk',
        model: request.modelConfig.model,
        choices: [
          {
            index: 0,
            delta: {
              role: 'assistant' as MessageRole,
              content: chunk.text(),
            },
            finishReason: chunk.promptFeedback?.blockReason || null,
          },
        ],
      } satisfies StreamResponseChunk
    }
  }

  private convertMessages(
    messages: Message[]
  ): { role: string; parts: { text: string }[] }[] {
    return messages.map((message) => ({
      role: this.convertRole(message.role),
      parts: [{ text: message.content }],
    }))
  }

  private convertRole(role: Message['role']): string {
    switch (role) {
      case 'system':
        return 'system'
      case 'user':
        return 'user'
      case 'assistant':
        return 'model'
      case 'function':
        return 'user'
      default:
        return 'user'
    }
  }
} 
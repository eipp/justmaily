import { z } from 'zod'
// import type { Message as OpenAIMessage } from 'openai/resources/chat/completions'

export const ModelProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'deepseek',
  'custom',
])

export const ModelConfigSchema = z.object({
  provider: ModelProviderSchema,
  model: z.string(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional().default(1),
  frequencyPenalty: z.number().min(-2).max(2).optional().default(0),
  presencePenalty: z.number().min(-2).max(2).optional().default(0),
  stop: z.array(z.string()).optional(),
  apiKey: z.string().optional(),
  apiEndpoint: z.string().url().optional(),
})

export const PromptTemplateSchema = z.object({
  name: z.string(),
  template: z.string(),
  variables: z.array(z.string()),
  modelConfig: ModelConfigSchema.optional(),
})

export const MessageRoleSchema = z.enum(['system', 'user', 'assistant', 'function'])

export const FunctionCallSchema = z.object({
  name: z.string(),
  arguments: z.string(),
})

export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string(),
  name: z.string().optional(),
  functionCall: FunctionCallSchema.optional(),
})

export const FunctionDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
})

export const CompletionRequestSchema = z.object({
  messages: z.array(MessageSchema),
  functions: z.array(FunctionDefinitionSchema).optional(),
  modelConfig: ModelConfigSchema,
  stream: z.boolean().optional().default(false),
})

export const CompletionChoiceSchema = z.object({
  index: z.number(),
  message: MessageSchema,
  finishReason: z.string().nullable(),
})

export const TokenUsageSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
})

export const CompletionResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(CompletionChoiceSchema),
  usage: TokenUsageSchema.optional(),
})

export const StreamResponseChunkSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: MessageRoleSchema.optional(),
        content: z.string().optional(),
        functionCall: FunctionCallSchema.optional(),
      }),
      finishReason: z.string().nullable(),
    })
  ),
})

export type ModelProvider = z.infer<typeof ModelProviderSchema>
export type ModelConfig = z.infer<typeof ModelConfigSchema>
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>
export type MessageRole = z.infer<typeof MessageRoleSchema>
export type Message = z.infer<typeof MessageSchema>
export type FunctionDefinition = z.infer<typeof FunctionDefinitionSchema>
export type CompletionRequest = z.infer<typeof CompletionRequestSchema>
export type CompletionResponse = z.infer<typeof CompletionResponseSchema>
export type StreamResponseChunk = z.infer<typeof StreamResponseChunkSchema>
export type TokenUsage = z.infer<typeof TokenUsageSchema>
export type FunctionCall = z.infer<typeof FunctionCallSchema>

export interface AIClientConfig {
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string[]
} 
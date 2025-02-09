'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.StreamResponseChunkSchema =
  exports.CompletionResponseSchema =
  exports.TokenUsageSchema =
  exports.CompletionChoiceSchema =
  exports.CompletionRequestSchema =
  exports.FunctionDefinitionSchema =
  exports.MessageSchema =
  exports.FunctionCallSchema =
  exports.MessageRoleSchema =
  exports.PromptTemplateSchema =
  exports.ModelConfigSchema =
  exports.ModelProviderSchema =
    void 0;
const zod_1 = require('zod');
exports.ModelProviderSchema = zod_1.z.enum([
  'openai',
  'anthropic',
  'google',
  'deepseek',
  'custom',
]);
exports.ModelConfigSchema = zod_1.z.object({
  provider: exports.ModelProviderSchema,
  model: zod_1.z.string(),
  temperature: zod_1.z.number().min(0).max(2).optional().default(0.7),
  maxTokens: zod_1.z.number().positive().optional(),
  topP: zod_1.z.number().min(0).max(1).optional().default(1),
  frequencyPenalty: zod_1.z.number().min(-2).max(2).optional().default(0),
  presencePenalty: zod_1.z.number().min(-2).max(2).optional().default(0),
  stop: zod_1.z.array(zod_1.z.string()).optional(),
  apiKey: zod_1.z.string().optional(),
  apiEndpoint: zod_1.z.string().url().optional(),
});
exports.PromptTemplateSchema = zod_1.z.object({
  name: zod_1.z.string(),
  template: zod_1.z.string(),
  variables: zod_1.z.array(zod_1.z.string()),
  modelConfig: exports.ModelConfigSchema.optional(),
});
exports.MessageRoleSchema = zod_1.z.enum([
  'system',
  'user',
  'assistant',
  'function',
]);
exports.FunctionCallSchema = zod_1.z.object({
  name: zod_1.z.string(),
  arguments: zod_1.z.string(),
});
exports.MessageSchema = zod_1.z.object({
  role: exports.MessageRoleSchema,
  content: zod_1.z.string(),
  name: zod_1.z.string().optional(),
  functionCall: exports.FunctionCallSchema.optional(),
});
exports.FunctionDefinitionSchema = zod_1.z.object({
  name: zod_1.z.string(),
  description: zod_1.z.string(),
  parameters: zod_1.z.record(zod_1.z.any()),
});
exports.CompletionRequestSchema = zod_1.z.object({
  messages: zod_1.z.array(exports.MessageSchema),
  functions: zod_1.z.array(exports.FunctionDefinitionSchema).optional(),
  modelConfig: exports.ModelConfigSchema,
  stream: zod_1.z.boolean().optional().default(false),
});
exports.CompletionChoiceSchema = zod_1.z.object({
  index: zod_1.z.number(),
  message: exports.MessageSchema,
  finishReason: zod_1.z.string().nullable(),
});
exports.TokenUsageSchema = zod_1.z.object({
  promptTokens: zod_1.z.number(),
  completionTokens: zod_1.z.number(),
  totalTokens: zod_1.z.number(),
});
exports.CompletionResponseSchema = zod_1.z.object({
  id: zod_1.z.string(),
  model: zod_1.z.string(),
  choices: zod_1.z.array(exports.CompletionChoiceSchema),
  usage: exports.TokenUsageSchema.optional(),
});
exports.StreamResponseChunkSchema = zod_1.z.object({
  id: zod_1.z.string(),
  model: zod_1.z.string(),
  choices: zod_1.z.array(
    zod_1.z.object({
      index: zod_1.z.number(),
      delta: zod_1.z.object({
        role: exports.MessageRoleSchema.optional(),
        content: zod_1.z.string().optional(),
        functionCall: exports.FunctionCallSchema.optional(),
      }),
      finishReason: zod_1.z.string().nullable(),
    }),
  ),
});

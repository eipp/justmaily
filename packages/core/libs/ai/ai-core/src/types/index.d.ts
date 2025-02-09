import { z } from 'zod';
export declare const ModelProviderSchema: z.ZodEnum<["openai", "anthropic", "google", "deepseek", "custom"]>;
export declare const ModelConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["openai", "anthropic", "google", "deepseek", "custom"]>;
    model: z.ZodString;
    temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    frequencyPenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    presencePenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    stop: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    apiKey: z.ZodOptional<z.ZodString>;
    apiEndpoint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
    model: string;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    apiKey?: string | undefined;
    maxTokens?: number | undefined;
    stop?: string[] | undefined;
    apiEndpoint?: string | undefined;
}, {
    provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
    model: string;
    apiKey?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
    stop?: string[] | undefined;
    apiEndpoint?: string | undefined;
}>;
export declare const PromptTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    template: z.ZodString;
    variables: z.ZodArray<z.ZodString, "many">;
    modelConfig: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<["openai", "anthropic", "google", "deepseek", "custom"]>;
        model: z.ZodString;
        temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        frequencyPenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        presencePenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        stop: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        apiKey: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        temperature: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    }, {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        apiKey?: string | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
        frequencyPenalty?: number | undefined;
        presencePenalty?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    variables: string[];
    template: string;
    modelConfig?: {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        temperature: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    } | undefined;
}, {
    name: string;
    variables: string[];
    template: string;
    modelConfig?: {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        apiKey?: string | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
        frequencyPenalty?: number | undefined;
        presencePenalty?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    } | undefined;
}>;
export declare const MessageRoleSchema: z.ZodEnum<["system", "user", "assistant", "function"]>;
export declare const FunctionCallSchema: z.ZodObject<{
    name: z.ZodString;
    arguments: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    arguments: string;
}, {
    name: string;
    arguments: string;
}>;
export declare const MessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant", "function"]>;
    content: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    functionCall: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        arguments: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        arguments: string;
    }, {
        name: string;
        arguments: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    role: "function" | "system" | "user" | "assistant";
    name?: string | undefined;
    functionCall?: {
        name: string;
        arguments: string;
    } | undefined;
}, {
    content: string;
    role: "function" | "system" | "user" | "assistant";
    name?: string | undefined;
    functionCall?: {
        name: string;
        arguments: string;
    } | undefined;
}>;
export declare const FunctionDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    parameters: Record<string, any>;
}, {
    name: string;
    description: string;
    parameters: Record<string, any>;
}>;
export declare const CompletionRequestSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "function"]>;
        content: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        functionCall: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            arguments: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            arguments: string;
        }, {
            name: string;
            arguments: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }, {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }>, "many">;
    functions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters: Record<string, any>;
    }, {
        name: string;
        description: string;
        parameters: Record<string, any>;
    }>, "many">>;
    modelConfig: z.ZodObject<{
        provider: z.ZodEnum<["openai", "anthropic", "google", "deepseek", "custom"]>;
        model: z.ZodString;
        temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        frequencyPenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        presencePenalty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        stop: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        apiKey: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        temperature: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    }, {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        apiKey?: string | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
        frequencyPenalty?: number | undefined;
        presencePenalty?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    }>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    modelConfig: {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        temperature: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    };
    messages: {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }[];
    stream: boolean;
    functions?: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    }[] | undefined;
}, {
    modelConfig: {
        provider: "custom" | "openai" | "anthropic" | "google" | "deepseek";
        model: string;
        apiKey?: string | undefined;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
        frequencyPenalty?: number | undefined;
        presencePenalty?: number | undefined;
        stop?: string[] | undefined;
        apiEndpoint?: string | undefined;
    };
    messages: {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }[];
    functions?: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    }[] | undefined;
    stream?: boolean | undefined;
}>;
export declare const CompletionChoiceSchema: z.ZodObject<{
    index: z.ZodNumber;
    message: z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "function"]>;
        content: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        functionCall: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            arguments: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            arguments: string;
        }, {
            name: string;
            arguments: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }, {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    }>;
    finishReason: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    };
    index: number;
    finishReason: string | null;
}, {
    message: {
        content: string;
        role: "function" | "system" | "user" | "assistant";
        name?: string | undefined;
        functionCall?: {
            name: string;
            arguments: string;
        } | undefined;
    };
    index: number;
    finishReason: string | null;
}>;
export declare const TokenUsageSchema: z.ZodObject<{
    promptTokens: z.ZodNumber;
    completionTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}, {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}>;
export declare const CompletionResponseSchema: z.ZodObject<{
    id: z.ZodString;
    model: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        message: z.ZodObject<{
            role: z.ZodEnum<["system", "user", "assistant", "function"]>;
            content: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            functionCall: z.ZodOptional<z.ZodObject<{
                name: z.ZodString;
                arguments: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                arguments: string;
            }, {
                name: string;
                arguments: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        }, {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        }>;
        finishReason: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
        index: number;
        finishReason: string | null;
    }, {
        message: {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
        index: number;
        finishReason: string | null;
    }>, "many">;
    usage: z.ZodOptional<z.ZodObject<{
        promptTokens: z.ZodNumber;
        completionTokens: z.ZodNumber;
        totalTokens: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    }, {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    model: string;
    choices: {
        message: {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
        index: number;
        finishReason: string | null;
    }[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    } | undefined;
}, {
    id: string;
    model: string;
    choices: {
        message: {
            content: string;
            role: "function" | "system" | "user" | "assistant";
            name?: string | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
        index: number;
        finishReason: string | null;
    }[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    } | undefined;
}>;
export declare const StreamResponseChunkSchema: z.ZodObject<{
    id: z.ZodString;
    model: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        delta: z.ZodObject<{
            role: z.ZodOptional<z.ZodEnum<["system", "user", "assistant", "function"]>>;
            content: z.ZodOptional<z.ZodString>;
            functionCall: z.ZodOptional<z.ZodObject<{
                name: z.ZodString;
                arguments: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                arguments: string;
            }, {
                name: string;
                arguments: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        }, {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        }>;
        finishReason: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        index: number;
        finishReason: string | null;
        delta: {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
    }, {
        index: number;
        finishReason: string | null;
        delta: {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    model: string;
    choices: {
        index: number;
        finishReason: string | null;
        delta: {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
    }[];
}, {
    id: string;
    model: string;
    choices: {
        index: number;
        finishReason: string | null;
        delta: {
            content?: string | undefined;
            role?: "function" | "system" | "user" | "assistant" | undefined;
            functionCall?: {
                name: string;
                arguments: string;
            } | undefined;
        };
    }[];
}>;
export type ModelProvider = z.infer<typeof ModelProviderSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type FunctionDefinition = z.infer<typeof FunctionDefinitionSchema>;
export type CompletionRequest = z.infer<typeof CompletionRequestSchema>;
export type CompletionResponse = z.infer<typeof CompletionResponseSchema>;
export type StreamResponseChunk = z.infer<typeof StreamResponseChunkSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type FunctionCall = z.infer<typeof FunctionCallSchema>;

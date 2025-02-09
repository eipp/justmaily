export type ModelProvider = 'deepseek' | 'openai' | 'anthropic' | 'gemini';

export type ModelCapability = 
  | 'text-generation'
  | 'code-generation'
  | 'image-analysis'
  | 'embedding'
  | 'classification'
  | 'summarization';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  capabilities: ModelCapability[];
  maxTokens: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface ModelUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  concurrentRequests: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxEntries: number;
  similarityThreshold: number;
}

export interface ModelResponse<T = string> {
  data: T;
  usage: ModelUsageMetrics;
  cached: boolean;
  model: string;
  provider: ModelProvider;
} 
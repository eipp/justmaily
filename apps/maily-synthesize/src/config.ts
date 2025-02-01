import { ModelManager } from '@justmaily/ai-core/services/ModelManager';
import { AnthropicClient } from '@justmaily/ai-core/clients/AnthropicClient';
import { OpenAIClient } from '@justmaily/ai-core/clients/OpenAIClient';
import { GeminiClient } from '@justmaily/ai-core/clients/GeminiClient';
import { ContentGenerationService } from './services/content';
import { AIMetrics } from '@justmaily/ai-core/monitoring/metrics';
import { Redis } from 'ioredis';

// Environment variables validation
const requiredEnvVars = [
  'REDIS_URL',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Redis configuration
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  }
});

// Initialize metrics
const metrics = new AIMetrics();

// AI Model configuration
const modelManager = new ModelManager(
  process.env.REDIS_URL,
  {
    enabled: true,
    ttlSeconds: 60 * 60 * 24, // 24 hours
    maxEntries: 10000,
    similarityThreshold: 0.95
  },
  {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
    concurrentRequests: 10,
    retryAttempts: 3,
    retryDelayMs: 1000
  }
);

// Initialize AI clients
const anthropicClient = new AnthropicClient(
  modelManager,
  {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    capabilities: [
      'text-generation',
      'code-generation',
      'image-analysis',
      'classification',
      'summarization'
    ],
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1
  },
  process.env.ANTHROPIC_API_KEY
);

const openaiClient = new OpenAIClient(
  modelManager,
  {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    capabilities: [
      'text-generation',
      'code-generation',
      'image-analysis',
      'classification',
      'summarization',
      'embedding'
    ],
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  process.env.OPENAI_API_KEY
);

const geminiClient = new GeminiClient(
  modelManager,
  {
    provider: 'gemini',
    model: 'gemini-pro',
    capabilities: [
      'text-generation',
      'code-generation',
      'image-analysis',
      'classification',
      'summarization',
      'embedding'
    ],
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1
  },
  process.env.GEMINI_API_KEY
);

// Initialize services with fallback strategy
const contentService = new ContentGenerationService(
  modelManager,
  redis,
  anthropicClient, // Primary model
  {
    fallbackModels: [openaiClient, geminiClient],
    fallbackStrategy: 'sequential', // Try each model in sequence
    loadBalancing: {
      enabled: true,
      strategy: 'weighted',
      weights: {
        anthropic: 0.5, // 50% of traffic
        openai: 0.3,    // 30% of traffic
        gemini: 0.2     // 20% of traffic
      }
    },
    retryConfig: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2
    },
    errorThresholds: {
      failureRate: 0.1, // 10% failure rate triggers fallback
      latencyMs: 5000   // 5s latency triggers fallback
    }
  }
);

// Set up metrics collection for model usage
const updateModelMetrics = () => {
  const stats = contentService.getModelStats();
  
  for (const [provider, providerStats] of Object.entries(stats)) {
    metrics.updateModelUsage(
      provider as ModelProvider,
      provider === 'anthropic' ? 'claude-3-sonnet-20240229' :
      provider === 'openai' ? 'gpt-4-turbo-preview' : 'gemini-pro',
      'requests_per_minute',
      providerStats.total / (process.uptime() / 60)
    );

    metrics.updateModelUsage(
      provider as ModelProvider,
      provider === 'anthropic' ? 'claude-3-sonnet-20240229' :
      provider === 'openai' ? 'gpt-4-turbo-preview' : 'gemini-pro',
      'error_rate',
      providerStats.failureRate
    );
  }
};

// Update metrics every minute
setInterval(updateModelMetrics, 60000);

// Export configuration
export const config = {
  redis,
  modelManager,
  contentService,
  metrics,
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  }
} as const;

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  await Promise.all([
    redis.quit(),
    modelManager.cleanup()
  ]);
} 
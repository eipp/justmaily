import { z } from 'zod'

const envSchema = z.object({
  // API Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  VERCEL_URL: z.string().optional(),
  
  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  
  // Search & Enrichment
  FIRECRAWL_API_KEY: z.string().min(1),
  EXA_API_KEY: z.string().min(1),
  VESPA_ENDPOINT: z.string().url(),
  VESPA_API_KEY: z.string().min(1),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  
  // Monitoring
  SENTRY_DSN: z.string().url(),
  PROMETHEUS_URL: z.string().url(),
  
  // Feature Flags
  FLAGSMITH_API_KEY: z.string().min(1),
  
  // Analytics
  UMAMI_WEBSITE_ID: z.string().min(1),
  UMAMI_API_KEY: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join('.'))
        .join(', ')
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}`
      )
    }
    throw error
  }
}

export const env = validateEnv()

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  vercelEnv: env.VERCEL_ENV,
  baseUrl: env.VERCEL_URL
    ? `https://${env.VERCEL_URL}`
    : 'http://localhost:3001',
  
  // API Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: env.NODE_ENV === 'production' ? 60 : 0, // 60 requests per minute in production
  },
  
  // API Timeouts
  timeouts: {
    default: 30000, // 30 seconds
    search: 60000, // 1 minute
    enrichment: 120000, // 2 minutes
  },
  
  // Cache Configuration
  cache: {
    ttl: {
      search: 60 * 60, // 1 hour
      enrichment: 24 * 60 * 60, // 24 hours
      profile: 12 * 60 * 60, // 12 hours
    },
  },
  
  // Batch Processing
  batch: {
    maxSize: 100,
    concurrency: 5,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Security
  security: {
    maxPayloadSize: '10mb',
    corsOrigins: ['https://justmaily.com'],
    rateLimitBypass: new Set(['127.0.0.1']),
  },
  
  // Monitoring
  monitoring: {
    sampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    errorReporting: {
      sampleRate: env.NODE_ENV === 'production' ? 0.5 : 1.0,
      ignoreErrors: [
        'AbortError',
        'TimeoutError',
        'RateLimitError',
      ],
    },
  },
} as const

export type Config = typeof config 
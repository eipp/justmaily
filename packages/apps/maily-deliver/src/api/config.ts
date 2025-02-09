import { z } from 'zod'

import { SecurityConfigSchema } from '../lib/security'
import { apiKeyConfig } from './config/api-keys'

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // API configuration
  PORT: z.coerce.number().default(3002),
  API_URL: z.string().url(),
  
  // Database configuration
  DATABASE_URL: z.string().url(),
  
  // Redis configuration
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string(),
  
  // Monitoring configuration
  SENTRY_DSN: z.string().url().optional(),
  PROMETHEUS_PORT: z.coerce.number().default(9464),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Security configuration
  API_KEY_HEADER: z.string().default('X-API-Key'),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',')),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),
  
  // Batch processing
  BATCH_SIZE: z.coerce.number().default(100),
  MAX_CONCURRENT_BATCHES: z.coerce.number().default(5),
  
  // Timeouts
  REQUEST_TIMEOUT: z.coerce.number().default(30000), // 30 seconds
  SMTP_TIMEOUT: z.coerce.number().default(10000), // 10 seconds
  
  // Feature flags
  ENABLE_WEBHOOKS: z.coerce.boolean().default(true),
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
})

export type Config = z.infer<typeof envSchema>

export function validateEnv(): Config {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.errors)
    } else {
      console.error('❌ Failed to validate environment variables:', error)
    }
    process.exit(1)
  }
}

const env = validateEnv()

export const config = {
  env: env.NODE_ENV,
  api: {
    port: env.PORT,
    url: env.API_URL,
    timeout: env.REQUEST_TIMEOUT,
    keyHeader: env.API_KEY_HEADER,
    allowedOrigins: env.ALLOWED_ORIGINS,
    version: '1.0.0',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  db: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
    token: env.REDIS_TOKEN,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    prometheusPort: env.PROMETHEUS_PORT,
    logLevel: env.LOG_LEVEL,
    sentry: {
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    },
    prometheus: {
      enabled: process.env.ENABLE_PROMETHEUS !== 'false',
      port: parseInt(process.env.PROMETHEUS_PORT || '9090'),
    },
  },
  rateLimit: {
    window: env.RATE_LIMIT_WINDOW,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  batch: {
    size: env.BATCH_SIZE,
    maxConcurrent: env.MAX_CONCURRENT_BATCHES,
  },
  features: {
    webhooks: env.ENABLE_WEBHOOKS,
    analytics: env.ENABLE_ANALYTICS,
    rateLimiting: env.ENABLE_RATE_LIMITING,
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    auditLogRetention: parseInt(process.env.AUDIT_LOG_RETENTION || '90'),
    gdprEnabled: process.env.GDPR_ENABLED === 'true',
    ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
  },
  apiKeys: {
    ...apiKeyConfig,
    // Override defaults with environment variables if provided
    prefix: process.env.API_KEY_PREFIX || apiKeyConfig.prefix,
    minLength: parseInt(process.env.API_KEY_MIN_LENGTH || apiKeyConfig.minLength.toString()),
    expirationDays: parseInt(process.env.API_KEY_EXPIRATION_DAYS || apiKeyConfig.expirationDays.toString()),
    rateLimit: {
      maxRequests: parseInt(process.env.API_KEY_RATE_LIMIT_MAX || apiKeyConfig.rateLimit.maxRequests.toString()),
      window: parseInt(process.env.API_KEY_RATE_LIMIT_WINDOW || apiKeyConfig.rateLimit.window.toString()),
    },
  },
} as const 

export function getConfig(): Config {
  return envSchema.parse(config)
} 
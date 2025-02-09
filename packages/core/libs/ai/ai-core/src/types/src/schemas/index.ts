import { z } from 'zod';

// Database schema types
export const DatabaseConfigSchema = z.object({
  type: z.enum(['postgres', 'mysql', 'mongodb']),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().optional(),
  poolSize: z.number().optional(),
  timeout: z.number().optional()
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Redis schema types
export const RedisConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  password: z.string().optional(),
  db: z.number().optional(),
  tls: z.boolean().optional(),
  keyPrefix: z.string().optional(),
  maxRetries: z.number().optional(),
  enableOfflineQueue: z.boolean().optional()
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// API schema types
export const ApiConfigSchema = z.object({
  port: z.number(),
  host: z.string().optional(),
  basePath: z.string().optional(),
  cors: z.object({
    origin: z.union([z.string(), z.array(z.string())]),
    methods: z.array(z.string()).optional(),
    allowedHeaders: z.array(z.string()).optional(),
    exposedHeaders: z.array(z.string()).optional(),
    credentials: z.boolean().optional(),
    maxAge: z.number().optional()
  }).optional(),
  rateLimit: z.object({
    windowMs: z.number(),
    max: z.number(),
    message: z.string().optional()
  }).optional(),
  timeout: z.number().optional()
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

// Service schema types
export const ServiceConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  metrics: z.object({
    enabled: z.boolean(),
    port: z.number().optional(),
    path: z.string().optional()
  }).optional(),
  tracing: z.object({
    enabled: z.boolean(),
    serviceName: z.string(),
    endpoint: z.string().optional()
  }).optional()
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;

// Queue schema types
export const QueueConfigSchema = z.object({
  type: z.enum(['redis', 'rabbitmq', 'sqs']),
  connection: z.object({
    url: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional()
  }),
  options: z.object({
    prefix: z.string().optional(),
    defaultJobOptions: z.object({
      attempts: z.number().optional(),
      backoff: z.object({
        type: z.enum(['fixed', 'exponential']),
        delay: z.number()
      }).optional(),
      removeOnComplete: z.boolean().optional(),
      removeOnFail: z.boolean().optional()
    }).optional(),
    limiter: z.object({
      max: z.number(),
      duration: z.number()
    }).optional()
  }).optional()
});

export type QueueConfig = z.infer<typeof QueueConfigSchema>;

// Storage schema types
export const StorageConfigSchema = z.object({
  type: z.enum(['s3', 'gcs', 'local']),
  credentials: z.object({
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    region: z.string().optional(),
    projectId: z.string().optional(),
    keyFilename: z.string().optional()
  }).optional(),
  bucket: z.string(),
  prefix: z.string().optional(),
  endpoint: z.string().optional(),
  forcePathStyle: z.boolean().optional(),
  uploadOptions: z.object({
    acl: z.string().optional(),
    cacheControl: z.string().optional(),
    contentType: z.string().optional(),
    metadata: z.record(z.string()).optional()
  }).optional()
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

// Email provider schema types
export const EmailProviderConfigSchema = z.object({
  type: z.enum(['smtp', 'ses', 'sendgrid', 'postmark']),
  credentials: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional(),
    region: z.string().optional()
  }),
  defaults: z.object({
    from: z.string(),
    replyTo: z.string().optional(),
    subject: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  options: z.object({
    pool: z.boolean().optional(),
    maxConnections: z.number().optional(),
    rateLimits: z.object({
      maxPerSecond: z.number(),
      maxPerDay: z.number()
    }).optional(),
    retryOptions: z.object({
      attempts: z.number(),
      delay: z.number()
    }).optional()
  }).optional()
});

export type EmailProviderConfig = z.infer<typeof EmailProviderConfigSchema>; 
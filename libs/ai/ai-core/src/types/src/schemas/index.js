"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProviderConfigSchema = exports.StorageConfigSchema = exports.QueueConfigSchema = exports.ServiceConfigSchema = exports.ApiConfigSchema = exports.RedisConfigSchema = exports.DatabaseConfigSchema = void 0;
const zod_1 = require("zod");
// Database schema types
exports.DatabaseConfigSchema = zod_1.z.object({
    type: zod_1.z.enum(['postgres', 'mysql', 'mongodb']),
    host: zod_1.z.string(),
    port: zod_1.z.number(),
    database: zod_1.z.string(),
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    ssl: zod_1.z.boolean().optional(),
    poolSize: zod_1.z.number().optional(),
    timeout: zod_1.z.number().optional()
});
// Redis schema types
exports.RedisConfigSchema = zod_1.z.object({
    host: zod_1.z.string(),
    port: zod_1.z.number(),
    password: zod_1.z.string().optional(),
    db: zod_1.z.number().optional(),
    tls: zod_1.z.boolean().optional(),
    keyPrefix: zod_1.z.string().optional(),
    maxRetries: zod_1.z.number().optional(),
    enableOfflineQueue: zod_1.z.boolean().optional()
});
// API schema types
exports.ApiConfigSchema = zod_1.z.object({
    port: zod_1.z.number(),
    host: zod_1.z.string().optional(),
    basePath: zod_1.z.string().optional(),
    cors: zod_1.z.object({
        origin: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
        methods: zod_1.z.array(zod_1.z.string()).optional(),
        allowedHeaders: zod_1.z.array(zod_1.z.string()).optional(),
        exposedHeaders: zod_1.z.array(zod_1.z.string()).optional(),
        credentials: zod_1.z.boolean().optional(),
        maxAge: zod_1.z.number().optional()
    }).optional(),
    rateLimit: zod_1.z.object({
        windowMs: zod_1.z.number(),
        max: zod_1.z.number(),
        message: zod_1.z.string().optional()
    }).optional(),
    timeout: zod_1.z.number().optional()
});
// Service schema types
exports.ServiceConfigSchema = zod_1.z.object({
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    environment: zod_1.z.enum(['development', 'staging', 'production']),
    logLevel: zod_1.z.enum(['error', 'warn', 'info', 'debug']).optional(),
    metrics: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        port: zod_1.z.number().optional(),
        path: zod_1.z.string().optional()
    }).optional(),
    tracing: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        serviceName: zod_1.z.string(),
        endpoint: zod_1.z.string().optional()
    }).optional()
});
// Queue schema types
exports.QueueConfigSchema = zod_1.z.object({
    type: zod_1.z.enum(['redis', 'rabbitmq', 'sqs']),
    connection: zod_1.z.object({
        url: zod_1.z.string().optional(),
        host: zod_1.z.string().optional(),
        port: zod_1.z.number().optional(),
        username: zod_1.z.string().optional(),
        password: zod_1.z.string().optional()
    }),
    options: zod_1.z.object({
        prefix: zod_1.z.string().optional(),
        defaultJobOptions: zod_1.z.object({
            attempts: zod_1.z.number().optional(),
            backoff: zod_1.z.object({
                type: zod_1.z.enum(['fixed', 'exponential']),
                delay: zod_1.z.number()
            }).optional(),
            removeOnComplete: zod_1.z.boolean().optional(),
            removeOnFail: zod_1.z.boolean().optional()
        }).optional(),
        limiter: zod_1.z.object({
            max: zod_1.z.number(),
            duration: zod_1.z.number()
        }).optional()
    }).optional()
});
// Storage schema types
exports.StorageConfigSchema = zod_1.z.object({
    type: zod_1.z.enum(['s3', 'gcs', 'local']),
    credentials: zod_1.z.object({
        accessKeyId: zod_1.z.string().optional(),
        secretAccessKey: zod_1.z.string().optional(),
        region: zod_1.z.string().optional(),
        projectId: zod_1.z.string().optional(),
        keyFilename: zod_1.z.string().optional()
    }).optional(),
    bucket: zod_1.z.string(),
    prefix: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().optional(),
    forcePathStyle: zod_1.z.boolean().optional(),
    uploadOptions: zod_1.z.object({
        acl: zod_1.z.string().optional(),
        cacheControl: zod_1.z.string().optional(),
        contentType: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.string()).optional()
    }).optional()
});
// Email provider schema types
exports.EmailProviderConfigSchema = zod_1.z.object({
    type: zod_1.z.enum(['smtp', 'ses', 'sendgrid', 'postmark']),
    credentials: zod_1.z.object({
        host: zod_1.z.string().optional(),
        port: zod_1.z.number().optional(),
        username: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        apiKey: zod_1.z.string().optional(),
        region: zod_1.z.string().optional()
    }),
    defaults: zod_1.z.object({
        from: zod_1.z.string(),
        replyTo: zod_1.z.string().optional(),
        subject: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    options: zod_1.z.object({
        pool: zod_1.z.boolean().optional(),
        maxConnections: zod_1.z.number().optional(),
        rateLimits: zod_1.z.object({
            maxPerSecond: zod_1.z.number(),
            maxPerDay: zod_1.z.number()
        }).optional(),
        retryOptions: zod_1.z.object({
            attempts: zod_1.z.number(),
            delay: zod_1.z.number()
        }).optional()
    }).optional()
});

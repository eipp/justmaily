import { z } from 'zod'

// Message schemas
export const MessageSchema = z.object({
  id: z.string(),  // Required unique identifier
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  from: z.string().email().optional(),
  sender: z.string().optional(),
  subject: z.string(),
  htmlBody: z.string().optional(),
  plainBody: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    content: z.string(),
    contentType: z.string(),
  })).optional(),
  headers: z.record(z.string()).optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  tag: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const MessageResponseSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  status: z.string(),
  timestamp: z.string(),
})

// Batch schemas
export const BatchRequestSchema = z.object({
  messages: z.array(MessageSchema),
  options: z.object({
    concurrency: z.number().min(1).max(10).default(5),
    retryAttempts: z.number().min(0).max(5).default(3),
    retryDelay: z.number().min(1000).max(60000).default(5000),
  }).optional(),
})

export const BatchResponseSchema = z.object({
  successful: z.array(MessageResponseSchema),
  failed: z.array(z.object({
    message: MessageSchema,
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any(),
    }),
  })),
  metadata: z.object({
    totalCount: z.number(),
    successCount: z.number(),
    failureCount: z.number(),
    duration: z.number(),
    timestamp: z.string(),
  }),
})

// Webhook schemas
export const WebhookEventSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  payload: z.object({
    id: z.string(),
    messageId: z.string(),
    status: z.string(),
    recipient: z.string().email(),
    originalMessage: z.any(),
    metadata: z.record(z.any()),
    timestamp: z.string(),
  }),
  signature: z.string(),
})

// Analytics schemas
export const DeliveryMetricsSchema = z.object({
  sent: z.number(),
  delivered: z.number(),
  failed: z.number(),
  bounced: z.number(),
  complained: z.number(),
  opens: z.number(),
  clicks: z.number(),
  unsubscribes: z.number(),
  rates: z.object({
    delivery: z.number(),
    open: z.number(),
    click: z.number(),
    bounce: z.number(),
    complaint: z.number(),
    unsubscribe: z.number(),
  }),
})

export const TimeRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
})

export const AnalyticsRequestSchema = z.object({
  timeRange: TimeRangeSchema,
  tags: z.array(z.string()).optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
})

export const AnalyticsResponseSchema = z.object({
  metrics: DeliveryMetricsSchema,
  trends: z.array(z.object({
    timestamp: z.string(),
    metrics: DeliveryMetricsSchema,
  })),
  metadata: z.object({
    timeRange: TimeRangeSchema,
    tags: z.array(z.string()).optional(),
    groupBy: z.string(),
  }),
})

// Infer types from schemas
export type Message = z.infer<typeof MessageSchema>
export type MessageResponse = z.infer<typeof MessageResponseSchema>
export type BatchRequest = z.infer<typeof BatchRequestSchema>
export type BatchResponse = z.infer<typeof BatchResponseSchema>
export type WebhookEvent = z.infer<typeof WebhookEventSchema>
export type DeliveryMetrics = z.infer<typeof DeliveryMetricsSchema>
export type TimeRange = z.infer<typeof TimeRangeSchema>
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>

export interface Message {
  id: string;  // Required unique identifier
  to: string[];
  subject: string;
  from?: string;
  sender?: string;
  cc?: string[];
  bcc?: string[];
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface MessageResponse {
  id: string;
  messageId: string;
  status: 'sent' | 'failed' | 'bounced' | 'delivered' | 'rejected';
  timestamp: string;
  error?: string;
  provider?: string;
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  type: string;
  messageId: string;
  timestamp: string;
  provider: string;
  data: Record<string, any>;
  signature?: string;
}

export interface DeliveryMetrics {
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  complained: number;
  opened: number;
  clicked: number;
  timestamp: string;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  errorRate: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface EmailMessage {
  id: string;
  to: string[];
  subject: string;
  content: string;
  textContent?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
  }>;
}

export interface ProviderAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export type ProviderType = 'ses' | 'sendgrid'; 
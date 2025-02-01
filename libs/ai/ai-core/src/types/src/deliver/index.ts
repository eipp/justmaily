import { z } from 'zod';
import { BaseEntitySchema, StatusSchema } from '../common';

// Email template types
export const EmailTemplateSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  subject: z.string(),
  body: z.string(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'date', 'array']),
    required: z.boolean(),
    defaultValue: z.unknown().optional(),
    description: z.string().optional()
  })),
  metadata: z.object({
    category: z.string(),
    tags: z.array(z.string()),
    version: z.string(),
    author: z.string().optional()
  }).optional(),
  settings: z.object({
    format: z.enum(['html', 'text', 'mjml']),
    responsive: z.boolean().default(true),
    preheader: z.string().optional(),
    encoding: z.string().default('UTF-8')
  })
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

// Campaign types
export const CampaignSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  templateId: z.string().uuid(),
  schedule: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    timezone: z.string(),
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    timeOfDay: z.string().optional()
  }),
  audience: z.object({
    segmentIds: z.array(z.string()),
    exclusionSegmentIds: z.array(z.string()).optional(),
    estimatedSize: z.number()
  }),
  content: z.object({
    subject: z.string(),
    preheader: z.string().optional(),
    templateVariables: z.record(z.unknown())
  }),
  settings: z.object({
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    replyTo: z.string().email().optional(),
    fromName: z.string().optional(),
    testMode: z.boolean().default(false)
  }),
  status: StatusSchema,
  stats: z.object({
    sent: z.number().default(0),
    delivered: z.number().default(0),
    opens: z.number().default(0),
    clicks: z.number().default(0),
    bounces: z.number().default(0),
    complaints: z.number().default(0),
    unsubscribes: z.number().default(0)
  }).optional()
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Delivery task types
export const DeliveryTaskSchema = BaseEntitySchema.extend({
  campaignId: z.string().uuid(),
  recipientId: z.string(),
  status: StatusSchema,
  content: z.object({
    subject: z.string(),
    body: z.string(),
    variables: z.record(z.unknown())
  }),
  metadata: z.object({
    messageId: z.string().optional(),
    queueTime: z.string().datetime(),
    sendTime: z.string().datetime().optional(),
    deliveryTime: z.string().datetime().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  }),
  tracking: z.object({
    opens: z.array(z.object({
      timestamp: z.string().datetime(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional()
    })).optional(),
    clicks: z.array(z.object({
      timestamp: z.string().datetime(),
      url: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional()
    })).optional()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional()
  }).optional()
});

export type DeliveryTask = z.infer<typeof DeliveryTaskSchema>;

// Delivery report types
export const DeliveryReportSchema = BaseEntitySchema.extend({
  campaignId: z.string().uuid(),
  status: StatusSchema,
  summary: z.object({
    totalRecipients: z.number(),
    delivered: z.number(),
    failed: z.number(),
    pending: z.number(),
    deliveryRate: z.number(),
    averageDeliveryTime: z.number()
  }),
  errors: z.array(z.object({
    code: z.string(),
    count: z.number(),
    percentage: z.number(),
    examples: z.array(z.object({
      recipientId: z.string(),
      error: z.object({
        message: z.string(),
        details: z.record(z.unknown()).optional()
      })
    }))
  })).optional(),
  recommendations: z.array(z.object({
    type: z.enum(['technical', 'content', 'timing']),
    priority: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    action: z.string()
  }))
});

export type DeliveryReport = z.infer<typeof DeliveryReportSchema>; 
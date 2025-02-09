'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DeliveryReportSchema =
  exports.DeliveryTaskSchema =
  exports.CampaignSchema =
  exports.EmailTemplateSchema =
    void 0;
const zod_1 = require('zod');
const common_1 = require('../common');
// Email template types
exports.EmailTemplateSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  subject: zod_1.z.string(),
  body: zod_1.z.string(),
  variables: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      type: zod_1.z.enum(['string', 'number', 'boolean', 'date', 'array']),
      required: zod_1.z.boolean(),
      defaultValue: zod_1.z.unknown().optional(),
      description: zod_1.z.string().optional(),
    }),
  ),
  metadata: zod_1.z
    .object({
      category: zod_1.z.string(),
      tags: zod_1.z.array(zod_1.z.string()),
      version: zod_1.z.string(),
      author: zod_1.z.string().optional(),
    })
    .optional(),
  settings: zod_1.z.object({
    format: zod_1.z.enum(['html', 'text', 'mjml']),
    responsive: zod_1.z.boolean().default(true),
    preheader: zod_1.z.string().optional(),
    encoding: zod_1.z.string().default('UTF-8'),
  }),
});
// Campaign types
exports.CampaignSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  templateId: zod_1.z.string().uuid(),
  schedule: zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    timezone: zod_1.z.string(),
    frequency: zod_1.z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
    daysOfWeek: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
    timeOfDay: zod_1.z.string().optional(),
  }),
  audience: zod_1.z.object({
    segmentIds: zod_1.z.array(zod_1.z.string()),
    exclusionSegmentIds: zod_1.z.array(zod_1.z.string()).optional(),
    estimatedSize: zod_1.z.number(),
  }),
  content: zod_1.z.object({
    subject: zod_1.z.string(),
    preheader: zod_1.z.string().optional(),
    templateVariables: zod_1.z.record(zod_1.z.unknown()),
  }),
  settings: zod_1.z.object({
    trackOpens: zod_1.z.boolean().default(true),
    trackClicks: zod_1.z.boolean().default(true),
    replyTo: zod_1.z.string().email().optional(),
    fromName: zod_1.z.string().optional(),
    testMode: zod_1.z.boolean().default(false),
  }),
  status: common_1.StatusSchema,
  stats: zod_1.z
    .object({
      sent: zod_1.z.number().default(0),
      delivered: zod_1.z.number().default(0),
      opens: zod_1.z.number().default(0),
      clicks: zod_1.z.number().default(0),
      bounces: zod_1.z.number().default(0),
      complaints: zod_1.z.number().default(0),
      unsubscribes: zod_1.z.number().default(0),
    })
    .optional(),
});
// Delivery task types
exports.DeliveryTaskSchema = common_1.BaseEntitySchema.extend({
  campaignId: zod_1.z.string().uuid(),
  recipientId: zod_1.z.string(),
  status: common_1.StatusSchema,
  content: zod_1.z.object({
    subject: zod_1.z.string(),
    body: zod_1.z.string(),
    variables: zod_1.z.record(zod_1.z.unknown()),
  }),
  metadata: zod_1.z.object({
    messageId: zod_1.z.string().optional(),
    queueTime: zod_1.z.string().datetime(),
    sendTime: zod_1.z.string().datetime().optional(),
    deliveryTime: zod_1.z.string().datetime().optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
  }),
  tracking: zod_1.z
    .object({
      opens: zod_1.z
        .array(
          zod_1.z.object({
            timestamp: zod_1.z.string().datetime(),
            ipAddress: zod_1.z.string().optional(),
            userAgent: zod_1.z.string().optional(),
          }),
        )
        .optional(),
      clicks: zod_1.z
        .array(
          zod_1.z.object({
            timestamp: zod_1.z.string().datetime(),
            url: zod_1.z.string(),
            ipAddress: zod_1.z.string().optional(),
            userAgent: zod_1.z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  error: zod_1.z
    .object({
      code: zod_1.z.string(),
      message: zod_1.z.string(),
      details: zod_1.z.record(zod_1.z.unknown()).optional(),
    })
    .optional(),
});
// Delivery report types
exports.DeliveryReportSchema = common_1.BaseEntitySchema.extend({
  campaignId: zod_1.z.string().uuid(),
  status: common_1.StatusSchema,
  summary: zod_1.z.object({
    totalRecipients: zod_1.z.number(),
    delivered: zod_1.z.number(),
    failed: zod_1.z.number(),
    pending: zod_1.z.number(),
    deliveryRate: zod_1.z.number(),
    averageDeliveryTime: zod_1.z.number(),
  }),
  errors: zod_1.z
    .array(
      zod_1.z.object({
        code: zod_1.z.string(),
        count: zod_1.z.number(),
        percentage: zod_1.z.number(),
        examples: zod_1.z.array(
          zod_1.z.object({
            recipientId: zod_1.z.string(),
            error: zod_1.z.object({
              message: zod_1.z.string(),
              details: zod_1.z.record(zod_1.z.unknown()).optional(),
            }),
          }),
        ),
      }),
    )
    .optional(),
  recommendations: zod_1.z.array(
    zod_1.z.object({
      type: zod_1.z.enum(['technical', 'content', 'timing']),
      priority: zod_1.z.enum(['low', 'medium', 'high']),
      description: zod_1.z.string(),
      action: zod_1.z.string(),
    }),
  ),
});

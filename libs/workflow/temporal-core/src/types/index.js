"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsDataSchema = exports.TestConfigSchema = exports.CampaignConfigSchema = exports.MessageSchema = exports.WorkflowResultSchema = exports.WorkflowStatusSchema = exports.WorkflowTypeSchema = exports.ActivityResultSchema = exports.ActivityStatusSchema = exports.ActivityTypeSchema = exports.CampaignSchema = exports.EmailTemplateSchema = exports.AudienceFilterSchema = exports.CampaignGoalSchema = exports.CampaignStatusSchema = exports.CampaignTypeSchema = void 0;
const zod_1 = require("zod");
// Campaign Types
exports.CampaignTypeSchema = zod_1.z.enum([
    'newsletter',
    'promotional',
    'transactional',
    'onboarding',
    'retention',
    'reactivation',
]);
exports.CampaignStatusSchema = zod_1.z.enum([
    'draft',
    'scheduled',
    'running',
    'paused',
    'completed',
    'failed',
]);
exports.CampaignGoalSchema = zod_1.z.enum([
    'awareness',
    'engagement',
    'conversion',
    'retention',
    'feedback',
]);
exports.AudienceFilterSchema = zod_1.z.object({
    demographics: zod_1.z.object({
        age: zod_1.z.array(zod_1.z.number()).optional(),
        gender: zod_1.z.array(zod_1.z.string()).optional(),
        location: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    behavior: zod_1.z.object({
        lastActive: zod_1.z.string().optional(),
        purchaseHistory: zod_1.z.array(zod_1.z.string()).optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    custom: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.EmailTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    subject: zod_1.z.string(),
    content: zod_1.z.string(),
    variables: zod_1.z.array(zod_1.z.string()),
    version: zod_1.z.number(),
});
exports.CampaignSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.CampaignTypeSchema,
    status: exports.CampaignStatusSchema,
    goal: exports.CampaignGoalSchema,
    audience: exports.AudienceFilterSchema,
    template: exports.EmailTemplateSchema,
    schedule: zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string().optional(),
        timezone: zod_1.z.string(),
        frequency: zod_1.z.string().optional(),
    }),
    settings: zod_1.z.object({
        maxSendsPerDay: zod_1.z.number(),
        retryAttempts: zod_1.z.number(),
        trackOpens: zod_1.z.boolean(),
        trackClicks: zod_1.z.boolean(),
        personalizeContent: zod_1.z.boolean(),
        abTest: zod_1.z.boolean(),
    }),
    metadata: zod_1.z.object({
        createdAt: zod_1.z.string(),
        updatedAt: zod_1.z.string(),
        createdBy: zod_1.z.string(),
        updatedBy: zod_1.z.string(),
        version: zod_1.z.number(),
    }),
});
// Activity Types
exports.ActivityTypeSchema = zod_1.z.enum([
    'analyze_audience',
    'generate_content',
    'personalize_content',
    'optimize_content',
    'send_email',
    'track_engagement',
    'analyze_results',
]);
exports.ActivityStatusSchema = zod_1.z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'retrying',
]);
exports.ActivityResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any(),
    }).optional(),
    metadata: zod_1.z.object({
        duration: zod_1.z.number(),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        attempts: zod_1.z.number(),
    }),
});
// Workflow Types
exports.WorkflowTypeSchema = zod_1.z.enum([
    'campaign_execution',
    'audience_analysis',
    'content_generation',
    'email_delivery',
    'performance_analysis',
]);
exports.WorkflowStatusSchema = zod_1.z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'terminated',
]);
exports.WorkflowResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    activities: zod_1.z.array(zod_1.z.object({
        type: exports.ActivityTypeSchema,
        status: exports.ActivityStatusSchema,
        result: exports.ActivityResultSchema,
    })),
    metadata: zod_1.z.object({
        duration: zod_1.z.number(),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        version: zod_1.z.number(),
    }),
});
// Message Types
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    subject: zod_1.z.string(),
    content: zod_1.z.string(),
    recipient: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Config Types
exports.CampaignConfigSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    template: exports.EmailTemplateSchema,
    audience: exports.AudienceFilterSchema,
    settings: zod_1.z.object({
        maxSendsPerDay: zod_1.z.number(),
        retryAttempts: zod_1.z.number(),
        trackOpens: zod_1.z.boolean(),
        trackClicks: zod_1.z.boolean(),
    }),
});
exports.TestConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        content: zod_1.z.string(),
        weight: zod_1.z.number(),
    })),
    duration: zod_1.z.string(),
});
exports.AnalyticsDataSchema = zod_1.z.object({
    delivery: zod_1.z.object({
        sent: zod_1.z.number(),
        failed: zod_1.z.number(),
        bounces: zod_1.z.number(),
    }),
    engagement: zod_1.z.object({
        opens: zod_1.z.number(),
        clicks: zod_1.z.number(),
        complaints: zod_1.z.number(),
        unsubscribes: zod_1.z.number(),
    }),
    timing: zod_1.z.object({
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        duration: zod_1.z.number(),
    }),
});

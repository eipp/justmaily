import { z } from 'zod'
import { Duration } from '@temporalio/common'

// Campaign Types
export const CampaignTypeSchema = z.enum([
  'newsletter',
  'promotional',
  'transactional',
  'onboarding',
  'retention',
  'reactivation',
])

export const CampaignStatusSchema = z.enum([
  'draft',
  'scheduled',
  'running',
  'paused',
  'completed',
  'failed',
])

export const CampaignGoalSchema = z.enum([
  'awareness',
  'engagement',
  'conversion',
  'retention',
  'feedback',
])

export const AudienceFilterSchema = z.object({
  demographics: z.object({
    age: z.array(z.number()).optional(),
    gender: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
  }).optional(),
  behavior: z.object({
    lastActive: z.string().optional(),
    purchaseHistory: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
  custom: z.record(z.any()).optional(),
})

export const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  content: z.string(),
  variables: z.array(z.string()),
  version: z.number(),
})

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: CampaignTypeSchema,
  status: CampaignStatusSchema,
  goal: CampaignGoalSchema,
  audience: AudienceFilterSchema,
  template: EmailTemplateSchema,
  schedule: z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    timezone: z.string(),
    frequency: z.string().optional(),
  }),
  settings: z.object({
    maxSendsPerDay: z.number(),
    retryAttempts: z.number(),
    trackOpens: z.boolean(),
    trackClicks: z.boolean(),
    personalizeContent: z.boolean(),
    abTest: z.boolean(),
  }),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string(),
    updatedBy: z.string(),
    version: z.number(),
  }),
})

// Activity Types
export const ActivityTypeSchema = z.enum([
  'analyze_audience',
  'generate_content',
  'personalize_content',
  'optimize_content',
  'send_email',
  'track_engagement',
  'analyze_results',
])

export const ActivityStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'retrying',
])

export const ActivityResultSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any(),
  }).optional(),
  metadata: z.object({
    duration: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    attempts: z.number(),
  }),
})

// Workflow Types
export const WorkflowTypeSchema = z.enum([
  'campaign_execution',
  'audience_analysis',
  'content_generation',
  'email_delivery',
  'performance_analysis',
])

export const WorkflowStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'terminated',
])

export const WorkflowResultSchema = z.object({
  success: z.boolean(),
  activities: z.array(z.object({
    type: ActivityTypeSchema,
    status: ActivityStatusSchema,
    result: ActivityResultSchema,
  })),
  metadata: z.object({
    duration: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    version: z.number(),
  }),
})

// Export Types
export type CampaignType = z.infer<typeof CampaignTypeSchema>
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>
export type CampaignGoal = z.infer<typeof CampaignGoalSchema>
export type AudienceFilter = z.infer<typeof AudienceFilterSchema>
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>
export type Campaign = z.infer<typeof CampaignSchema>

export type ActivityType = z.infer<typeof ActivityTypeSchema>
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>
export type ActivityResult = z.infer<typeof ActivityResultSchema>

export type WorkflowType = z.infer<typeof WorkflowTypeSchema>
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>
export type WorkflowResult = z.infer<typeof WorkflowResultSchema>

// Message Types
export const MessageSchema = z.object({
  id: z.string(),
  subject: z.string(),
  content: z.string(),
  recipient: z.string(),
  metadata: z.record(z.any()).optional(),
})

// Config Types
export const CampaignConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: EmailTemplateSchema,
  audience: AudienceFilterSchema,
  settings: z.object({
    maxSendsPerDay: z.number(),
    retryAttempts: z.number(),
    trackOpens: z.boolean(),
    trackClicks: z.boolean(),
  }),
})

export const TestConfigSchema = z.object({
  enabled: z.boolean(),
  variants: z.array(z.object({
    id: z.string(),
    content: z.string(),
    weight: z.number(),
  })),
  duration: z.string(),
})

export const AnalyticsDataSchema = z.object({
  delivery: z.object({
    sent: z.number(),
    failed: z.number(),
    bounces: z.number(),
  }),
  engagement: z.object({
    opens: z.number(),
    clicks: z.number(),
    complaints: z.number(),
    unsubscribes: z.number(),
  }),
  timing: z.object({
    startTime: z.string(),
    endTime: z.string(),
    duration: z.number(),
  }),
})

export type Message = z.infer<typeof MessageSchema>
export type CampaignConfig = z.infer<typeof CampaignConfigSchema>
export type TestConfig = z.infer<typeof TestConfigSchema>
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>

// YSQL Types
export interface YSQLQuery {
  query: string;
  params?: any[];
}

// Vespa Types
export interface VespaResult<T = any> {
  root: {
    fields: T;
    id: string;
    relevance: number;
  };
}

export interface VespaDocument {
  fields: Record<string, any>;
  id: string;
}

export interface IndexConfig {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    indexing?: string[];
    ranking?: string[];
  }>;
}

// Metrics Types
export interface MetricsConfig {
  prefix: string;
  labels: Record<string, string>;
  buckets?: number[];
  version?: string;
  environment?: string;
} 
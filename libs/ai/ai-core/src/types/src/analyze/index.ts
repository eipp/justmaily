import { z } from 'zod';
import { BaseEntitySchema, StatusSchema } from '../common';

// Analysis metrics types
export const MetricsSchema = z.object({
  opens: z.number(),
  clicks: z.number(),
  bounces: z.number(),
  unsubscribes: z.number(),
  complaints: z.number(),
  conversions: z.number().optional(),
  revenue: z.number().optional(),
  deliveryRate: z.number(),
  openRate: z.number(),
  clickRate: z.number(),
  bounceRate: z.number(),
  unsubscribeRate: z.number(),
  complaintRate: z.number(),
  conversionRate: z.number().optional()
});

export type Metrics = z.infer<typeof MetricsSchema>;

// Audience segment types
export const AudienceSegmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  criteria: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan']),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  })),
  size: z.number(),
  engagement: z.object({
    averageOpenRate: z.number(),
    averageClickRate: z.number(),
    averageConversionRate: z.number().optional()
  }).optional()
});

export type AudienceSegment = z.infer<typeof AudienceSegmentSchema>;

// Campaign analysis types
export const CampaignAnalysisSchema = BaseEntitySchema.extend({
  campaignId: z.string().uuid(),
  status: StatusSchema,
  metrics: MetricsSchema,
  segments: z.array(z.object({
    segment: AudienceSegmentSchema,
    metrics: MetricsSchema
  })),
  timeSeriesData: z.array(z.object({
    timestamp: z.string().datetime(),
    metrics: MetricsSchema
  })),
  insights: z.array(z.object({
    type: z.enum(['performance', 'audience', 'content', 'timing']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    recommendations: z.array(z.string())
  }))
});

export type CampaignAnalysis = z.infer<typeof CampaignAnalysisSchema>;

// A/B test analysis types
export const ABTestAnalysisSchema = BaseEntitySchema.extend({
  testId: z.string().uuid(),
  status: StatusSchema,
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    metrics: MetricsSchema,
    sampleSize: z.number(),
    confidence: z.number()
  })),
  winner: z.object({
    variantId: z.string(),
    confidence: z.number(),
    improvement: z.number(),
    metrics: MetricsSchema
  }).optional(),
  insights: z.array(z.object({
    type: z.enum(['statistical', 'behavioral', 'content']),
    title: z.string(),
    description: z.string(),
    significance: z.number(),
    recommendations: z.array(z.string())
  }))
});

export type ABTestAnalysis = z.infer<typeof ABTestAnalysisSchema>;

// Performance report types
export const PerformanceReportSchema = BaseEntitySchema.extend({
  type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  metrics: MetricsSchema,
  trends: z.array(z.object({
    metric: z.string(),
    change: z.number(),
    trend: z.enum(['up', 'down', 'stable']),
    significance: z.number()
  })),
  topPerformers: z.object({
    campaigns: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      metrics: MetricsSchema
    })),
    segments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      metrics: MetricsSchema
    }))
  }),
  recommendations: z.array(z.object({
    category: z.enum(['content', 'timing', 'audience', 'technical']),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    potentialImpact: z.number()
  }))
});

export type PerformanceReport = z.infer<typeof PerformanceReportSchema>; 
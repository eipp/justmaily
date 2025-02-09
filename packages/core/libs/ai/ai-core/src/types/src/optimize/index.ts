import { z } from 'zod';
import { BaseEntitySchema, StatusSchema } from '../common';

// Content optimization types
export const ContentOptimizationSchema = z.object({
  subject: z.object({
    original: z.string(),
    suggestions: z.array(z.object({
      text: z.string(),
      score: z.number(),
      reasoning: z.string()
    }))
  }).optional(),
  body: z.object({
    original: z.string(),
    suggestions: z.array(z.object({
      content: z.string(),
      score: z.number(),
      changes: z.array(z.object({
        type: z.enum(['addition', 'removal', 'modification']),
        description: z.string(),
        impact: z.string()
      }))
    }))
  }).optional(),
  callToAction: z.object({
    original: z.string(),
    suggestions: z.array(z.object({
      text: z.string(),
      score: z.number(),
      reasoning: z.string()
    }))
  }).optional()
});

export type ContentOptimization = z.infer<typeof ContentOptimizationSchema>;

// Timing optimization types
export const TimingOptimizationSchema = z.object({
  bestTimes: z.array(z.object({
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    timeRanges: z.array(z.object({
      start: z.string(),
      end: z.string(),
      score: z.number()
    }))
  })),
  timezone: z.string(),
  confidence: z.number(),
  seasonalFactors: z.array(z.object({
    factor: z.string(),
    impact: z.string(),
    recommendation: z.string()
  })).optional()
});

export type TimingOptimization = z.infer<typeof TimingOptimizationSchema>;

// Audience optimization types
export const AudienceOptimizationSchema = z.object({
  segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    engagementScore: z.number(),
    recommendations: z.array(z.object({
      type: z.enum(['content', 'timing', 'frequency']),
      description: z.string(),
      expectedImpact: z.number()
    }))
  })),
  exclusions: z.array(z.object({
    segmentId: z.string(),
    reason: z.string(),
    alternativeSegments: z.array(z.string())
  })).optional()
});

export type AudienceOptimization = z.infer<typeof AudienceOptimizationSchema>;

// Optimization task types
export const OptimizationTaskSchema = BaseEntitySchema.extend({
  type: z.enum(['content', 'timing', 'audience']),
  status: StatusSchema,
  priority: z.enum(['low', 'medium', 'high']),
  target: z.object({
    campaignId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional(),
    segmentId: z.string().optional()
  }),
  parameters: z.object({
    contentOptimization: ContentOptimizationSchema.optional(),
    timingOptimization: TimingOptimizationSchema.optional(),
    audienceOptimization: AudienceOptimizationSchema.optional()
  }).optional(),
  results: z.object({
    improvements: z.array(z.object({
      category: z.string(),
      description: z.string(),
      expectedImpact: z.number()
    })),
    score: z.number(),
    confidence: z.number()
  }).optional()
});

export type OptimizationTask = z.infer<typeof OptimizationTaskSchema>;

// Optimization report types
export const OptimizationReportSchema = BaseEntitySchema.extend({
  taskId: z.string().uuid(),
  type: z.enum(['content', 'timing', 'audience']),
  status: StatusSchema,
  summary: z.object({
    totalImprovements: z.number(),
    averageImpact: z.number(),
    confidence: z.number()
  }),
  improvements: z.array(z.object({
    category: z.string(),
    description: z.string(),
    impact: z.number(),
    implementation: z.object({
      difficulty: z.enum(['easy', 'medium', 'hard']),
      timeEstimate: z.string(),
      requirements: z.array(z.string())
    })
  })),
  recommendations: z.array(z.object({
    priority: z.enum(['low', 'medium', 'high']),
    action: z.string(),
    reasoning: z.string(),
    expectedOutcome: z.string()
  }))
});

export type OptimizationReport = z.infer<typeof OptimizationReportSchema>; 
import { z } from 'zod';
import { BaseEntitySchema, StatusSchema } from '../common';

// Content generation types
export const ContentGenerationSchema = z.object({
  type: z.enum(['subject', 'body', 'preheader', 'cta']),
  context: z.object({
    audience: z.object({
      demographics: z.record(z.unknown()).optional(),
      interests: z.array(z.string()).optional(),
      behavior: z.record(z.unknown()).optional()
    }).optional(),
    campaign: z.object({
      goal: z.string(),
      type: z.string(),
      tone: z.string().optional(),
      keywords: z.array(z.string()).optional()
    }),
    constraints: z.object({
      maxLength: z.number().optional(),
      minLength: z.number().optional(),
      format: z.enum(['html', 'text', 'mjml']).optional(),
      style: z.object({
        tone: z.string().optional(),
        formality: z.string().optional(),
        language: z.string().optional()
      }).optional()
    }).optional()
  }),
  examples: z.array(z.object({
    content: z.string(),
    performance: z.object({
      openRate: z.number().optional(),
      clickRate: z.number().optional(),
      conversionRate: z.number().optional()
    }).optional()
  })).optional()
});

export type ContentGeneration = z.infer<typeof ContentGenerationSchema>;

// Content variant types
export const ContentVariantSchema = BaseEntitySchema.extend({
  originalContent: z.string(),
  variant: z.string(),
  type: z.enum(['subject', 'body', 'preheader', 'cta']),
  changes: z.array(z.object({
    type: z.enum(['addition', 'removal', 'modification']),
    description: z.string(),
    rationale: z.string()
  })),
  metrics: z.object({
    similarity: z.number(),
    readability: z.number(),
    sentiment: z.object({
      score: z.number(),
      label: z.string()
    }).optional()
  }).optional()
});

export type ContentVariant = z.infer<typeof ContentVariantSchema>;

// Synthesis task types
export const SynthesisTaskSchema = BaseEntitySchema.extend({
  type: z.enum(['generation', 'variation', 'improvement']),
  status: StatusSchema,
  priority: z.enum(['low', 'medium', 'high']),
  input: z.object({
    content: z.string().optional(),
    generation: ContentGenerationSchema.optional(),
    variations: z.number().optional(),
    improvements: z.object({
      target: z.enum(['engagement', 'conversion', 'clarity']),
      constraints: z.record(z.unknown()).optional()
    }).optional()
  }),
  output: z.object({
    content: z.string().optional(),
    variants: z.array(ContentVariantSchema).optional(),
    improvements: z.array(z.object({
      content: z.string(),
      score: z.number(),
      changes: z.array(z.object({
        type: z.string(),
        description: z.string()
      }))
    })).optional()
  }).optional(),
  metadata: z.object({
    modelVersion: z.string(),
    generationParams: z.record(z.unknown()),
    processingTime: z.number(),
    tokensUsed: z.number()
  }).optional()
});

export type SynthesisTask = z.infer<typeof SynthesisTaskSchema>;

// Content evaluation types
export const ContentEvaluationSchema = BaseEntitySchema.extend({
  content: z.string(),
  type: z.enum(['subject', 'body', 'preheader', 'cta']),
  metrics: z.object({
    readability: z.object({
      score: z.number(),
      grade: z.string(),
      issues: z.array(z.object({
        type: z.string(),
        description: z.string(),
        suggestion: z.string()
      }))
    }),
    sentiment: z.object({
      score: z.number(),
      label: z.string(),
      aspects: z.array(z.object({
        aspect: z.string(),
        sentiment: z.string()
      }))
    }),
    engagement: z.object({
      score: z.number(),
      factors: z.array(z.object({
        factor: z.string(),
        impact: z.number(),
        suggestion: z.string()
      }))
    })
  }),
  recommendations: z.array(z.object({
    category: z.enum(['clarity', 'engagement', 'persuasion', 'tone']),
    priority: z.enum(['low', 'medium', 'high']),
    issue: z.string(),
    suggestion: z.string(),
    example: z.string().optional()
  }))
});

export type ContentEvaluation = z.infer<typeof ContentEvaluationSchema>; 
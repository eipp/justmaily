"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEvaluationSchema = exports.SynthesisTaskSchema = exports.ContentVariantSchema = exports.ContentGenerationSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
// Content generation types
exports.ContentGenerationSchema = zod_1.z.object({
    type: zod_1.z.enum(['subject', 'body', 'preheader', 'cta']),
    context: zod_1.z.object({
        audience: zod_1.z.object({
            demographics: zod_1.z.record(zod_1.z.unknown()).optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
            behavior: zod_1.z.record(zod_1.z.unknown()).optional()
        }).optional(),
        campaign: zod_1.z.object({
            goal: zod_1.z.string(),
            type: zod_1.z.string(),
            tone: zod_1.z.string().optional(),
            keywords: zod_1.z.array(zod_1.z.string()).optional()
        }),
        constraints: zod_1.z.object({
            maxLength: zod_1.z.number().optional(),
            minLength: zod_1.z.number().optional(),
            format: zod_1.z.enum(['html', 'text', 'mjml']).optional(),
            style: zod_1.z.object({
                tone: zod_1.z.string().optional(),
                formality: zod_1.z.string().optional(),
                language: zod_1.z.string().optional()
            }).optional()
        }).optional()
    }),
    examples: zod_1.z.array(zod_1.z.object({
        content: zod_1.z.string(),
        performance: zod_1.z.object({
            openRate: zod_1.z.number().optional(),
            clickRate: zod_1.z.number().optional(),
            conversionRate: zod_1.z.number().optional()
        }).optional()
    })).optional()
});
// Content variant types
exports.ContentVariantSchema = common_1.BaseEntitySchema.extend({
    originalContent: zod_1.z.string(),
    variant: zod_1.z.string(),
    type: zod_1.z.enum(['subject', 'body', 'preheader', 'cta']),
    changes: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['addition', 'removal', 'modification']),
        description: zod_1.z.string(),
        rationale: zod_1.z.string()
    })),
    metrics: zod_1.z.object({
        similarity: zod_1.z.number(),
        readability: zod_1.z.number(),
        sentiment: zod_1.z.object({
            score: zod_1.z.number(),
            label: zod_1.z.string()
        }).optional()
    }).optional()
});
// Synthesis task types
exports.SynthesisTaskSchema = common_1.BaseEntitySchema.extend({
    type: zod_1.z.enum(['generation', 'variation', 'improvement']),
    status: common_1.StatusSchema,
    priority: zod_1.z.enum(['low', 'medium', 'high']),
    input: zod_1.z.object({
        content: zod_1.z.string().optional(),
        generation: exports.ContentGenerationSchema.optional(),
        variations: zod_1.z.number().optional(),
        improvements: zod_1.z.object({
            target: zod_1.z.enum(['engagement', 'conversion', 'clarity']),
            constraints: zod_1.z.record(zod_1.z.unknown()).optional()
        }).optional()
    }),
    output: zod_1.z.object({
        content: zod_1.z.string().optional(),
        variants: zod_1.z.array(exports.ContentVariantSchema).optional(),
        improvements: zod_1.z.array(zod_1.z.object({
            content: zod_1.z.string(),
            score: zod_1.z.number(),
            changes: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.string(),
                description: zod_1.z.string()
            }))
        })).optional()
    }).optional(),
    metadata: zod_1.z.object({
        modelVersion: zod_1.z.string(),
        generationParams: zod_1.z.record(zod_1.z.unknown()),
        processingTime: zod_1.z.number(),
        tokensUsed: zod_1.z.number()
    }).optional()
});
// Content evaluation types
exports.ContentEvaluationSchema = common_1.BaseEntitySchema.extend({
    content: zod_1.z.string(),
    type: zod_1.z.enum(['subject', 'body', 'preheader', 'cta']),
    metrics: zod_1.z.object({
        readability: zod_1.z.object({
            score: zod_1.z.number(),
            grade: zod_1.z.string(),
            issues: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.string(),
                description: zod_1.z.string(),
                suggestion: zod_1.z.string()
            }))
        }),
        sentiment: zod_1.z.object({
            score: zod_1.z.number(),
            label: zod_1.z.string(),
            aspects: zod_1.z.array(zod_1.z.object({
                aspect: zod_1.z.string(),
                sentiment: zod_1.z.string()
            }))
        }),
        engagement: zod_1.z.object({
            score: zod_1.z.number(),
            factors: zod_1.z.array(zod_1.z.object({
                factor: zod_1.z.string(),
                impact: zod_1.z.number(),
                suggestion: zod_1.z.string()
            }))
        })
    }),
    recommendations: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.enum(['clarity', 'engagement', 'persuasion', 'tone']),
        priority: zod_1.z.enum(['low', 'medium', 'high']),
        issue: zod_1.z.string(),
        suggestion: zod_1.z.string(),
        example: zod_1.z.string().optional()
    }))
});

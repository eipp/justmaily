"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationReportSchema = exports.OptimizationTaskSchema = exports.AudienceOptimizationSchema = exports.TimingOptimizationSchema = exports.ContentOptimizationSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
// Content optimization types
exports.ContentOptimizationSchema = zod_1.z.object({
    subject: zod_1.z.object({
        original: zod_1.z.string(),
        suggestions: zod_1.z.array(zod_1.z.object({
            text: zod_1.z.string(),
            score: zod_1.z.number(),
            reasoning: zod_1.z.string()
        }))
    }).optional(),
    body: zod_1.z.object({
        original: zod_1.z.string(),
        suggestions: zod_1.z.array(zod_1.z.object({
            content: zod_1.z.string(),
            score: zod_1.z.number(),
            changes: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.enum(['addition', 'removal', 'modification']),
                description: zod_1.z.string(),
                impact: zod_1.z.string()
            }))
        }))
    }).optional(),
    callToAction: zod_1.z.object({
        original: zod_1.z.string(),
        suggestions: zod_1.z.array(zod_1.z.object({
            text: zod_1.z.string(),
            score: zod_1.z.number(),
            reasoning: zod_1.z.string()
        }))
    }).optional()
});
// Timing optimization types
exports.TimingOptimizationSchema = zod_1.z.object({
    bestTimes: zod_1.z.array(zod_1.z.object({
        dayOfWeek: zod_1.z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        timeRanges: zod_1.z.array(zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string(),
            score: zod_1.z.number()
        }))
    })),
    timezone: zod_1.z.string(),
    confidence: zod_1.z.number(),
    seasonalFactors: zod_1.z.array(zod_1.z.object({
        factor: zod_1.z.string(),
        impact: zod_1.z.string(),
        recommendation: zod_1.z.string()
    })).optional()
});
// Audience optimization types
exports.AudienceOptimizationSchema = zod_1.z.object({
    segments: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        size: zod_1.z.number(),
        engagementScore: zod_1.z.number(),
        recommendations: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.enum(['content', 'timing', 'frequency']),
            description: zod_1.z.string(),
            expectedImpact: zod_1.z.number()
        }))
    })),
    exclusions: zod_1.z.array(zod_1.z.object({
        segmentId: zod_1.z.string(),
        reason: zod_1.z.string(),
        alternativeSegments: zod_1.z.array(zod_1.z.string())
    })).optional()
});
// Optimization task types
exports.OptimizationTaskSchema = common_1.BaseEntitySchema.extend({
    type: zod_1.z.enum(['content', 'timing', 'audience']),
    status: common_1.StatusSchema,
    priority: zod_1.z.enum(['low', 'medium', 'high']),
    target: zod_1.z.object({
        campaignId: zod_1.z.string().uuid().optional(),
        templateId: zod_1.z.string().uuid().optional(),
        segmentId: zod_1.z.string().optional()
    }),
    parameters: zod_1.z.object({
        contentOptimization: exports.ContentOptimizationSchema.optional(),
        timingOptimization: exports.TimingOptimizationSchema.optional(),
        audienceOptimization: exports.AudienceOptimizationSchema.optional()
    }).optional(),
    results: zod_1.z.object({
        improvements: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string(),
            description: zod_1.z.string(),
            expectedImpact: zod_1.z.number()
        })),
        score: zod_1.z.number(),
        confidence: zod_1.z.number()
    }).optional()
});
// Optimization report types
exports.OptimizationReportSchema = common_1.BaseEntitySchema.extend({
    taskId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['content', 'timing', 'audience']),
    status: common_1.StatusSchema,
    summary: zod_1.z.object({
        totalImprovements: zod_1.z.number(),
        averageImpact: zod_1.z.number(),
        confidence: zod_1.z.number()
    }),
    improvements: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string(),
        description: zod_1.z.string(),
        impact: zod_1.z.number(),
        implementation: zod_1.z.object({
            difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
            timeEstimate: zod_1.z.string(),
            requirements: zod_1.z.array(zod_1.z.string())
        })
    })),
    recommendations: zod_1.z.array(zod_1.z.object({
        priority: zod_1.z.enum(['low', 'medium', 'high']),
        action: zod_1.z.string(),
        reasoning: zod_1.z.string(),
        expectedOutcome: zod_1.z.string()
    }))
});

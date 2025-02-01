"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReportSchema = exports.ABTestAnalysisSchema = exports.CampaignAnalysisSchema = exports.AudienceSegmentSchema = exports.MetricsSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
// Analysis metrics types
exports.MetricsSchema = zod_1.z.object({
    opens: zod_1.z.number(),
    clicks: zod_1.z.number(),
    bounces: zod_1.z.number(),
    unsubscribes: zod_1.z.number(),
    complaints: zod_1.z.number(),
    conversions: zod_1.z.number().optional(),
    revenue: zod_1.z.number().optional(),
    deliveryRate: zod_1.z.number(),
    openRate: zod_1.z.number(),
    clickRate: zod_1.z.number(),
    bounceRate: zod_1.z.number(),
    unsubscribeRate: zod_1.z.number(),
    complaintRate: zod_1.z.number(),
    conversionRate: zod_1.z.number().optional()
});
// Audience segment types
exports.AudienceSegmentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    criteria: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        operator: zod_1.z.enum(['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan']),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())])
    })),
    size: zod_1.z.number(),
    engagement: zod_1.z.object({
        averageOpenRate: zod_1.z.number(),
        averageClickRate: zod_1.z.number(),
        averageConversionRate: zod_1.z.number().optional()
    }).optional()
});
// Campaign analysis types
exports.CampaignAnalysisSchema = common_1.BaseEntitySchema.extend({
    campaignId: zod_1.z.string().uuid(),
    status: common_1.StatusSchema,
    metrics: exports.MetricsSchema,
    segments: zod_1.z.array(zod_1.z.object({
        segment: exports.AudienceSegmentSchema,
        metrics: exports.MetricsSchema
    })),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        timestamp: zod_1.z.string().datetime(),
        metrics: exports.MetricsSchema
    })),
    insights: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['performance', 'audience', 'content', 'timing']),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        impact: zod_1.z.enum(['low', 'medium', 'high']),
        recommendations: zod_1.z.array(zod_1.z.string())
    }))
});
// A/B test analysis types
exports.ABTestAnalysisSchema = common_1.BaseEntitySchema.extend({
    testId: zod_1.z.string().uuid(),
    status: common_1.StatusSchema,
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        metrics: exports.MetricsSchema,
        sampleSize: zod_1.z.number(),
        confidence: zod_1.z.number()
    })),
    winner: zod_1.z.object({
        variantId: zod_1.z.string(),
        confidence: zod_1.z.number(),
        improvement: zod_1.z.number(),
        metrics: exports.MetricsSchema
    }).optional(),
    insights: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['statistical', 'behavioral', 'content']),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        significance: zod_1.z.number(),
        recommendations: zod_1.z.array(zod_1.z.string())
    }))
});
// Performance report types
exports.PerformanceReportSchema = common_1.BaseEntitySchema.extend({
    type: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    metrics: exports.MetricsSchema,
    trends: zod_1.z.array(zod_1.z.object({
        metric: zod_1.z.string(),
        change: zod_1.z.number(),
        trend: zod_1.z.enum(['up', 'down', 'stable']),
        significance: zod_1.z.number()
    })),
    topPerformers: zod_1.z.object({
        campaigns: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string().uuid(),
            name: zod_1.z.string(),
            metrics: exports.MetricsSchema
        })),
        segments: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            metrics: exports.MetricsSchema
        }))
    }),
    recommendations: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.enum(['content', 'timing', 'audience', 'technical']),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        priority: zod_1.z.enum(['low', 'medium', 'high']),
        potentialImpact: zod_1.z.number()
    }))
});

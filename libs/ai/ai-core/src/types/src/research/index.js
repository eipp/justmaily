"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichedContactSchema = exports.ResearchResultSchema = exports.ResearchBatchSchema = exports.ResearchTaskSchema = exports.ContactInfoSchema = exports.CompanyInfoSchema = exports.SearchResultSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
// Search result schema
exports.SearchResultSchema = zod_1.z.object({
    url: zod_1.z.string(),
    title: zod_1.z.string(),
    snippet: zod_1.z.string(),
    publishedAt: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    score: zod_1.z.number()
});
// Company information types
exports.CompanyInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    domain: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    size: zod_1.z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
    location: zod_1.z.object({
        country: zod_1.z.string(),
        city: zod_1.z.string().optional(),
        region: zod_1.z.string().optional()
    }).optional(),
    socialProfiles: zod_1.z.object({
        linkedin: zod_1.z.string().url().optional(),
        twitter: zod_1.z.string().url().optional(),
        facebook: zod_1.z.string().url().optional(),
        website: zod_1.z.string().url().optional()
    }).optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional()
});
// Contact information types
exports.ContactInfoSchema = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    title: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    socialProfiles: zod_1.z.object({
        linkedin: zod_1.z.string().url().optional(),
        twitter: zod_1.z.string().url().optional()
    }).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Research task types
exports.ResearchTaskSchema = common_1.BaseEntitySchema.extend({
    type: zod_1.z.enum(['company', 'contact', 'market', 'competitor']),
    target: zod_1.z.object({
        url: zod_1.z.string().url(),
        keywords: zod_1.z.array(zod_1.z.string()).optional()
    }),
    status: common_1.StatusSchema,
    priority: zod_1.z.enum(['low', 'medium', 'high']),
    assignedTo: zod_1.z.string().uuid().optional(),
    results: zod_1.z.object({
        company: exports.CompanyInfoSchema.optional(),
        contacts: zod_1.z.array(exports.ContactInfoSchema).optional(),
        insights: zod_1.z.array(zod_1.z.string()).optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional()
    }).optional()
});
// Research batch types
exports.ResearchBatchSchema = common_1.BaseEntitySchema.extend({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    tasks: zod_1.z.array(exports.ResearchTaskSchema),
    status: common_1.StatusSchema,
    progress: zod_1.z.object({
        total: zod_1.z.number(),
        completed: zod_1.z.number(),
        failed: zod_1.z.number()
    }),
    settings: zod_1.z.object({
        concurrency: zod_1.z.number().min(1).max(10).default(5),
        retryCount: zod_1.z.number().min(0).max(3).default(1),
        timeout: zod_1.z.number().min(1000).max(30000).default(5000)
    }).optional()
});
// Research result types
exports.ResearchResultSchema = common_1.BaseEntitySchema.extend({
    taskId: zod_1.z.string().uuid(),
    batchId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(['company', 'contact', 'market', 'competitor']),
    data: zod_1.z.object({
        company: exports.CompanyInfoSchema.optional(),
        contacts: zod_1.z.array(exports.ContactInfoSchema).optional(),
        insights: zod_1.z.array(zod_1.z.string()).optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional()
    }),
    confidence: zod_1.z.number().min(0).max(1),
    source: zod_1.z.object({
        url: zod_1.z.string().url(),
        timestamp: zod_1.z.string().datetime(),
        method: zod_1.z.enum(['scraping', 'api', 'manual'])
    })
});
// Enriched contact schema
exports.EnrichedContactSchema = zod_1.z.object({
    contact: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        company: zod_1.z.string(),
        linkedIn: zod_1.z.string().optional(),
        twitter: zod_1.z.string().optional()
    }),
    company: zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        industry: zod_1.z.string().optional(),
        size: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        socialProfiles: zod_1.z.array(zod_1.z.object({
            platform: zod_1.z.string(),
            url: zod_1.z.string()
        })).optional()
    }),
    insights: zod_1.z.object({
        recentNews: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            url: zod_1.z.string(),
            snippet: zod_1.z.string(),
            publishedAt: zod_1.z.string()
        })).optional(),
        competitors: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            url: zod_1.z.string(),
            description: zod_1.z.string()
        })).optional(),
        industryTrends: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            url: zod_1.z.string(),
            snippet: zod_1.z.string()
        })).optional()
    })
});

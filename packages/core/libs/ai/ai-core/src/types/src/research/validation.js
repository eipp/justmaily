'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TrendsRequestSchema =
  exports.CompetitorsRequestSchema =
  exports.NewsRequestSchema =
  exports.ScrapeOptionsSchema =
  exports.BatchEnrichContactsSchema =
  exports.EnrichContactSchema =
  exports.SearchOptionsSchema =
  exports.DateRangeSchema =
  exports.PaginationSchema =
    void 0;
const zod_1 = require('zod');
// Common validation schemas
exports.PaginationSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.DateRangeSchema = zod_1.z.object({
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
});
exports.SearchOptionsSchema = zod_1.z.object({
  query: zod_1.z.string().min(1),
  limit: zod_1.z.number().int().min(1).max(100).optional(),
  recency: zod_1.z.enum(['day', 'week', 'month', 'year']).optional(),
  sources: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.EnrichContactSchema = zod_1.z.object({
  body: zod_1.z
    .object({
      email: zod_1.z.string().email().optional(),
      name: zod_1.z.string().optional(),
      company: zod_1.z.string().optional(),
      linkedIn: zod_1.z.string().url().optional(),
    })
    .refine(
      (data) => {
        // At least one field must be provided
        return data.email || data.name || data.company || data.linkedIn;
      },
      {
        message:
          'At least one of email, name, company, or linkedIn must be provided',
      },
    ),
});
exports.BatchEnrichContactsSchema = zod_1.z.object({
  body: zod_1.z.object({
    contacts: zod_1.z
      .array(exports.EnrichContactSchema.shape.body)
      .min(1)
      .max(100),
  }),
});
exports.ScrapeOptionsSchema = zod_1.z.object({
  body: zod_1.z.object({
    url: zod_1.z.string().url(),
    options: zod_1.z
      .object({
        limit: zod_1.z.number().int().min(1).max(1000).optional(),
        depth: zod_1.z.number().int().min(1).max(10).optional(),
        includePatterns: zod_1.z.array(zod_1.z.string()).optional(),
        excludePatterns: zod_1.z.array(zod_1.z.string()).optional(),
      })
      .optional(),
  }),
});
exports.NewsRequestSchema = zod_1.z.object({
  body: zod_1.z.object({
    companyName: zod_1.z.string().min(1),
    options: zod_1.z
      .object({
        limit: zod_1.z.number().int().min(1).max(100).optional(),
        recency: zod_1.z.enum(['day', 'week', 'month', 'year']).optional(),
        categories: zod_1.z
          .array(zod_1.z.enum(['news', 'press_release', 'blog']))
          .optional(),
      })
      .optional(),
  }),
});
exports.CompetitorsRequestSchema = zod_1.z.object({
  body: zod_1.z.object({
    companyName: zod_1.z.string().min(1),
    industry: zod_1.z.string().min(1),
  }),
});
exports.TrendsRequestSchema = zod_1.z.object({
  body: zod_1.z.object({
    industry: zod_1.z.string().min(1),
    options: zod_1.z
      .object({
        limit: zod_1.z.number().int().min(1).max(100).optional(),
        recency: zod_1.z.enum(['day', 'week', 'month', 'year']).optional(),
      })
      .optional(),
  }),
});

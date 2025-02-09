import { z } from 'zod';

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const SearchOptionsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
  recency: z.enum(['day', 'week', 'month', 'year']).optional(),
  sources: z.array(z.string()).optional()
});

export const EnrichContactSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
    linkedIn: z.string().url().optional()
  }).refine(data => {
    // At least one field must be provided
    return data.email || data.name || data.company || data.linkedIn;
  }, {
    message: 'At least one of email, name, company, or linkedIn must be provided'
  })
});

export const BatchEnrichContactsSchema = z.object({
  body: z.object({
    contacts: z.array(EnrichContactSchema.shape.body)
      .min(1)
      .max(100)
  })
});

export const ScrapeOptionsSchema = z.object({
  body: z.object({
    url: z.string().url(),
    options: z.object({
      limit: z.number().int().min(1).max(1000).optional(),
      depth: z.number().int().min(1).max(10).optional(),
      includePatterns: z.array(z.string()).optional(),
      excludePatterns: z.array(z.string()).optional()
    }).optional()
  })
});

export const NewsRequestSchema = z.object({
  body: z.object({
    companyName: z.string().min(1),
    options: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      recency: z.enum(['day', 'week', 'month', 'year']).optional(),
      categories: z.array(z.enum(['news', 'press_release', 'blog'])).optional()
    }).optional()
  })
});

export const CompetitorsRequestSchema = z.object({
  body: z.object({
    companyName: z.string().min(1),
    industry: z.string().min(1)
  })
});

export const TrendsRequestSchema = z.object({
  body: z.object({
    industry: z.string().min(1),
    options: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      recency: z.enum(['day', 'week', 'month', 'year']).optional()
    }).optional()
  })
}); 
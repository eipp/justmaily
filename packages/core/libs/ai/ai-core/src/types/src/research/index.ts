import { z } from 'zod';
import { BaseEntitySchema, StatusSchema } from '../common';

// Search result schema
export const SearchResultSchema = z.object({
  url: z.string(),
  title: z.string(),
  snippet: z.string(),
  publishedAt: z.string().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
  score: z.number()
});

// Company information types
export const CompanyInfoSchema = z.object({
  name: z.string(),
  domain: z.string(),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  location: z.object({
    country: z.string(),
    city: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  socialProfiles: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional(),
  technologies: z.array(z.string()).optional()
});

export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;

// Contact information types
export const ContactInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  socialProfiles: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional(),
  interests: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// Research task types
export const ResearchTaskSchema = BaseEntitySchema.extend({
  type: z.enum(['company', 'contact', 'market', 'competitor']),
  target: z.object({
    url: z.string().url(),
    keywords: z.array(z.string()).optional()
  }),
  status: StatusSchema,
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.string().uuid().optional(),
  results: z.object({
    company: CompanyInfoSchema.optional(),
    contacts: z.array(ContactInfoSchema).optional(),
    insights: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional()
  }).optional()
});

export type ResearchTask = z.infer<typeof ResearchTaskSchema>;

// Research batch types
export const ResearchBatchSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  tasks: z.array(ResearchTaskSchema),
  status: StatusSchema,
  progress: z.object({
    total: z.number(),
    completed: z.number(),
    failed: z.number()
  }),
  settings: z.object({
    concurrency: z.number().min(1).max(10).default(5),
    retryCount: z.number().min(0).max(3).default(1),
    timeout: z.number().min(1000).max(30000).default(5000)
  }).optional()
});

export type ResearchBatch = z.infer<typeof ResearchBatchSchema>;

// Research result types
export const ResearchResultSchema = BaseEntitySchema.extend({
  taskId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  type: z.enum(['company', 'contact', 'market', 'competitor']),
  data: z.object({
    company: CompanyInfoSchema.optional(),
    contacts: z.array(ContactInfoSchema).optional(),
    insights: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional()
  }),
  confidence: z.number().min(0).max(1),
  source: z.object({
    url: z.string().url(),
    timestamp: z.string().datetime(),
    method: z.enum(['scraping', 'api', 'manual'])
  })
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;

// Enriched contact schema
export const EnrichedContactSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    company: z.string(),
    linkedIn: z.string().optional(),
    twitter: z.string().optional()
  }),
  company: z.object({
    name: z.string(),
    description: z.string(),
    industry: z.string().optional(),
    size: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    socialProfiles: z.array(z.object({
      platform: z.string(),
      url: z.string()
    })).optional()
  }),
  insights: z.object({
    recentNews: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
      publishedAt: z.string()
    })).optional(),
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string(),
      description: z.string()
    })).optional(),
    industryTrends: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string()
    })).optional()
  })
});

// Export types
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type EnrichedContact = z.infer<typeof EnrichedContactSchema>; 
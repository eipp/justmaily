import { z } from 'zod'

// Base schemas
export const urlSchema = z
  .string()
  .url()
  .transform((url) => new URL(url))
  .catch((ctx) => {
    throw new Error(`Invalid URL: ${ctx.error}`)
  })

export const dateSchema = z
  .string()
  .datetime()
  .transform((date) => new Date(date))
  .catch((ctx) => {
    throw new Error(`Invalid date: ${ctx.error}`)
  })

export const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(10)

export const pageSchema = z
  .number()
  .int()
  .min(1)
  .default(1)

export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const rangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
})

export const timeframeSchema = z.object({
  start: dateSchema,
  end: dateSchema,
})

// Filter schemas
export const searchFiltersSchema = z.object({
  industry: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
  technology: z.array(z.string()).optional(),
  founded: rangeSchema.optional(),
  employees: rangeSchema.optional(),
  revenue: rangeSchema.optional(),
  funding: rangeSchema.optional(),
  lastActive: rangeSchema.optional(),
  confidence: rangeSchema.optional(),
})

export const newsFiltersSchema = z.object({
  source: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
  topic: z.array(z.string()).optional(),
  sentiment: z.array(z.string()).optional(),
  date: rangeSchema.optional(),
  score: rangeSchema.optional(),
})

export const trendsFiltersSchema = z.object({
  source: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
  topic: z.array(z.string()).optional(),
  sentiment: z.array(z.string()).optional(),
})

// Request schemas
export const enrichmentRequestSchema = z.object({
  urls: z.array(urlSchema).min(1).max(100),
})

export const searchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: searchFiltersSchema.optional(),
  sort: sortSchema.default({ field: '_score', order: 'desc' }),
  page: pageSchema,
  limit: limitSchema,
})

export const newsRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: newsFiltersSchema.optional(),
  sort: sortSchema.default({ field: 'date', order: 'desc' }),
  page: pageSchema,
  limit: limitSchema,
})

export const competitorsRequestSchema = z.object({
  companyId: z.string().uuid(),
  filters: searchFiltersSchema.optional(),
  sort: sortSchema.default({ field: '_score', order: 'desc' }),
  page: pageSchema,
  limit: limitSchema,
})

export const trendsRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: trendsFiltersSchema.optional(),
  timeframe: timeframeSchema.default({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }),
  interval: z.enum(['1h', '1d', '1w', '1m']).default('1d'),
})

// Response schemas
export const enrichmentResponseSchema = z.object({
  url: urlSchema,
  company: z.object({
    name: z.string(),
    domain: z.string(),
    description: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    location: z.string().optional(),
    founded: z.number().optional(),
    employees: z.object({
      count: z.number(),
      range: z.string(),
    }).optional(),
    revenue: z.object({
      amount: z.number(),
      currency: z.string(),
      range: z.string(),
    }).optional(),
    funding: z.object({
      total: z.number(),
      rounds: z.array(z.object({
        date: dateSchema,
        amount: z.number(),
        type: z.string(),
        investors: z.array(z.string()),
      })),
    }).optional(),
    technologies: z.array(z.string()).optional(),
    social: z.object({
      linkedin: urlSchema.optional(),
      twitter: urlSchema.optional(),
      facebook: urlSchema.optional(),
      crunchbase: urlSchema.optional(),
    }).optional(),
  }),
  contacts: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    title: z.string().optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    social: z.object({
      linkedin: urlSchema.optional(),
      twitter: urlSchema.optional(),
      github: urlSchema.optional(),
    }).optional(),
  })).optional(),
  metadata: z.object({
    lastEnriched: dateSchema,
    confidence: z.number().min(0).max(100),
    source: z.string(),
    version: z.string(),
  }),
})

export const searchResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    type: z.string(),
    score: z.number(),
    // ... other fields from company/contact schemas
  })),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  facets: z.object({
    industries: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    locations: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    sizes: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    technologies: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
  }).optional(),
  metadata: z.object({
    took: z.number(),
    maxScore: z.number(),
  }),
})

export const newsResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    url: urlSchema,
    source: z.object({
      name: z.string(),
      domain: z.string(),
      favicon: urlSchema.optional(),
    }),
    author: z.string().optional(),
    date: dateSchema,
    image: urlSchema.optional(),
    language: z.string(),
    sentiment: z.number(),
    entities: z.array(z.object({
      name: z.string(),
      type: z.string(),
    })).optional(),
    topics: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    readingTime: z.number().optional(),
    score: z.number(),
  })),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  facets: z.object({
    sources: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    languages: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    topics: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
    sentiments: z.array(z.object({
      key: z.string(),
      doc_count: z.number(),
    })).optional(),
  }).optional(),
  metadata: z.object({
    took: z.number(),
    maxScore: z.number(),
  }),
})

export const trendsResponseSchema = z.object({
  data: z.object({
    timeseries: z.array(z.object({
      date: dateSchema,
      value: z.number(),
      sentiment: z.number(),
      articles: z.array(z.object({
        id: z.string(),
        title: z.string(),
        url: urlSchema,
        source: z.string(),
        date: dateSchema,
        sentiment: z.number(),
      })),
    })),
    topics: z.array(z.object({
      name: z.string(),
      weight: z.number(),
      sentiment: z.number(),
      trend: z.number(),
      related: z.array(z.string()),
    })),
    entities: z.array(z.object({
      name: z.string(),
      type: z.string(),
      mentions: z.number(),
      sentiment: z.number(),
      trend: z.number(),
    })),
    metrics: z.object({
      total: z.number(),
      average: z.number(),
      median: z.number(),
      min: z.number(),
      max: z.number(),
      stdDev: z.number(),
      trend: z.number(),
      momentum: z.number(),
      volatility: z.number(),
    }),
  }),
  metadata: z.object({
    timeframe: timeframeSchema,
    took: z.number(),
    total: z.number(),
  }),
}) 
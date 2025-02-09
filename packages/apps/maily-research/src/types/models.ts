// Base types
export interface Metadata {
  lastEnriched: string
  confidence: number
  source: string
  version: string
  tags?: string[]
}

export interface SocialProfiles {
  linkedin?: string
  twitter?: string
  facebook?: string
  github?: string
  crunchbase?: string
}

// Company types
export interface Company {
  id?: string
  name: string
  domain: string
  description?: string
  industry?: string
  size?: string
  location?: string
  founded?: number
  employees?: {
    count: number
    range: string
  }
  revenue?: {
    amount: number
    currency: string
    range: string
  }
  funding?: {
    total: number
    rounds: Array<{
      date: string
      amount: number
      type: string
      investors: string[]
    }>
  }
  technologies?: string[]
  social?: SocialProfiles
  metadata?: Metadata
}

// Contact types
export interface Contact {
  id?: string
  firstName: string
  lastName: string
  email: string
  title?: string
  department?: string
  company?: string
  location?: string
  phone?: string
  social?: SocialProfiles
  education?: Array<{
    school: string
    degree: string
    field: string
    start: string
    end?: string
  }>
  experience?: Array<{
    company: string
    title: string
    location?: string
    start: string
    end?: string
    description?: string
  }>
  skills?: string[]
  metadata?: Metadata
}

// Enrichment types
export interface EnrichmentData {
  url: string
  company: Company
  contacts?: Contact[]
  metadata: Metadata
}

// Search types
export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  facets?: Record<string, Array<{
    key: string
    doc_count: number
  }>>
  metadata: {
    took: number
    maxScore: number
  }
}

export interface SearchFilters {
  industry?: string[]
  location?: string[]
  size?: string[]
  technology?: string[]
  founded?: {
    min?: number
    max?: number
  }
  employees?: {
    min?: number
    max?: number
  }
  revenue?: {
    min?: number
    max?: number
  }
  funding?: {
    min?: number
    max?: number
  }
  lastActive?: {
    min?: string
    max?: string
  }
  confidence?: {
    min?: number
    max?: number
  }
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface SearchOptions extends PaginationOptions {
  filters?: SearchFilters
  sort?: SortOptions
}

// News types
export interface NewsArticle {
  id: string
  title: string
  description?: string
  url: string
  source: {
    name: string
    domain: string
    favicon?: string
  }
  author?: string
  date: string
  image?: string
  language: string
  sentiment: number
  entities?: Array<{
    name: string
    type: string
  }>
  topics?: string[]
  keywords?: string[]
  readingTime?: number
  score: number
}

export interface NewsFilters {
  source?: string[]
  language?: string[]
  topic?: string[]
  sentiment?: string[]
  date?: {
    min?: string
    max?: string
  }
  score?: {
    min?: number
    max?: number
  }
}

// Trends types
export interface TrendPoint {
  date: string
  value: number
  sentiment: number
  articles: Array<{
    id: string
    title: string
    url: string
    source: string
    date: string
    sentiment: number
  }>
}

export interface TrendTopic {
  name: string
  weight: number
  sentiment: number
  trend: number
  related: string[]
}

export interface TrendEntity {
  name: string
  type: string
  mentions: number
  sentiment: number
  trend: number
}

export interface TrendMetrics {
  total: number
  average: number
  median: number
  min: number
  max: number
  stdDev: number
  trend: number
  momentum: number
  volatility: number
}

export interface TrendData {
  timeseries: TrendPoint[]
  topics: TrendTopic[]
  entities: TrendEntity[]
  metrics: TrendMetrics
}

export interface TrendFilters {
  source?: string[]
  language?: string[]
  topic?: string[]
  sentiment?: string[]
}

// Enrichment options
export interface EnrichmentOptions extends ServiceOptions {
  includeSocial?: boolean
  includeNews?: boolean
  includeContacts?: boolean
  maxContacts?: number
  minConfidence?: number
}

// Batch types
export interface BatchResult<T> {
  results: T[]
  cached: number
  processed: number
  failed: number
}

// Rate limit types
export interface RateLimitInfo {
  success: boolean
  remaining: number
  reset: number
} 
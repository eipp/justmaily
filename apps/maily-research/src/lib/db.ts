import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import { VespaClient } from '@vespa/client'
import { withErrorHandling } from './errors'
import { config } from '@/api/config'
import type { Database } from '@/types/supabase'
import { YQLBuilder } from './yql-builder'
import { z } from 'zod'

// Create database clients
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const vespa = new VespaClient({
  endpoint: process.env.VESPA_ENDPOINT!,
  apiKey: process.env.VESPA_API_KEY!,
})

const yqlBuilder = new YQLBuilder()

// Database operation options
interface DBOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  useCache?: boolean
  cacheTTL?: number
}

// Search options schema
const searchOptionsSchema = z.object({
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'matches']),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])
  })),
  orderBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  groupBy: z.array(z.string()).optional()
})

// Database operation wrapper
export async function withDB<T>(
  operation: () => Promise<T>,
  options: DBOptions = {}
): Promise<T> {
  const {
    timeout = config.timeouts.default,
    retries = config.batch.retryAttempts,
    retryDelay = config.batch.retryDelay,
  } = options

  return withErrorHandling(operation, {
    timeout,
    retries,
    retryDelay,
  })
}

// Supabase operations
export const db = {
  // Companies
  companies: {
    async create(data: Database['public']['Tables']['companies']['Insert']) {
      return withDB(async () => {
        const { data: company, error } = await supabase
          .from('companies')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return company
      })
    },

    async update(
      id: string,
      data: Database['public']['Tables']['companies']['Update']
    ) {
      return withDB(async () => {
        const { data: company, error } = await supabase
          .from('companies')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return company
      })
    },

    async delete(id: string) {
      return withDB(async () => {
        const { error } = await supabase
          .from('companies')
          .delete()
          .eq('id', id)

        if (error) throw error
      })
    },

    async getById(id: string) {
      return withDB(async () => {
        const { data: company, error } = await supabase
          .from('companies')
          .select()
          .eq('id', id)
          .single()

        if (error) throw error
        return company
      })
    },

    async getByDomain(domain: string) {
      return withDB(async () => {
        const { data: company, error } = await supabase
          .from('companies')
          .select()
          .eq('domain', domain)
          .single()

        if (error) throw error
        return company
      })
    },
  },

  // Contacts
  contacts: {
    async create(data: Database['public']['Tables']['contacts']['Insert']) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return contact
      })
    },

    async update(
      id: string,
      data: Database['public']['Tables']['contacts']['Update']
    ) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return contact
      })
    },

    async delete(id: string) {
      return withDB(async () => {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)

        if (error) throw error
      })
    },

    async getById(id: string) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .select()
          .eq('id', id)
          .single()

        if (error) throw error
        return contact
      })
    },

    async getByEmail(email: string) {
      return withDB(async () => {
        const { data: contact, error } = await supabase
          .from('contacts')
          .select()
          .eq('email', email)
          .single()

        if (error) throw error
        return contact
      })
    },
  },

  // Enrichment data
  enrichment: {
    async create(data: Database['public']['Tables']['enrichment']['Insert']) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return enrichment
      })
    },

    async update(
      id: string,
      data: Database['public']['Tables']['enrichment']['Update']
    ) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return enrichment
      })
    },

    async getByUrl(url: string) {
      return withDB(async () => {
        const { data: enrichment, error } = await supabase
          .from('enrichment')
          .select()
          .eq('url', url)
          .single()

        if (error) throw error
        return enrichment
      })
    },
  },
}

// Redis operations
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    return withDB(async () => {
      return redis.get<T>(key)
    })
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return withDB(async () => {
      await redis.set(key, value, {
        ex: ttl,
      })
    })
  },

  async delete(key: string): Promise<void> {
    return withDB(async () => {
      await redis.del(key)
    })
  },

  async increment(key: string): Promise<number> {
    return withDB(async () => {
      return redis.incr(key)
    })
  },
}

// Vespa operations
export const search = {
  async index(
    collection: string,
    document: Record<string, any>
  ): Promise<void> {
    return withDB(async () => {
      await vespa.index(collection, document)
    })
  },

  async search(
    collection: string,
    options: z.infer<typeof searchOptionsSchema>
  ) {
    return withDB(async () => {
      // Validate and build secure YQL query
      const validatedOptions = searchOptionsSchema.parse(options)
      const yql = yqlBuilder.buildQuery(collection, validatedOptions)
      
      // Execute query with built YQL
      return vespa.search(collection, yql)
    })
  },

  async delete(collection: string, id: string): Promise<void> {
    return withDB(async () => {
      await vespa.delete(collection, id)
    })
  },
} 
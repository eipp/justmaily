import { FirecrawlApp } from 'firecrawl'
import { ExaClient } from '@exa/client'
import { withErrorHandling } from './errors'
import { withPerformanceTracking } from './monitoring'
import { db, cache, search } from './db'
import { config } from '@/api/config'
import type { Company, Contact, EnrichmentData } from '@/types/models'

// Create service clients
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
})

const exa = new ExaClient({
  apiKey: process.env.EXA_API_KEY!,
})

// Service operation options
interface ServiceOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  useCache?: boolean
  cacheTTL?: number
}

// Service operation wrapper
export async function withService<T>(
  operation: () => Promise<T>,
  options: ServiceOptions = {}
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

// Research service
export const researchService = {
  // Enrich company data
  async enrichCompany(url: string): Promise<Company> {
    return withPerformanceTracking(
      'enrichCompany',
      async () => {
        // Check cache first
        const cacheKey = `company:${url}`
        const cached = await cache.get<Company>(cacheKey)
        if (cached) return cached

        // Scrape company website
        const { data: websiteData } = await firecrawl.scrape(url, {
          extractors: ['company', 'contact', 'social'],
        })

        // Search for additional company data
        const { data: searchData } = await exa.search(url, {
          type: 'company',
          fields: ['name', 'description', 'industry', 'size', 'location'],
        })

        // Combine and clean data
        const company: Company = {
          name: websiteData.company?.name || searchData.name,
          domain: new URL(url).hostname,
          description: websiteData.company?.description || searchData.description,
          industry: searchData.industry,
          size: searchData.size,
          location: searchData.location,
          social: {
            linkedin: websiteData.social?.linkedin,
            twitter: websiteData.social?.twitter,
            facebook: websiteData.social?.facebook,
          },
          metadata: {
            lastEnriched: new Date().toISOString(),
            confidence: calculateConfidence(websiteData, searchData),
          },
        }

        // Store in database
        const savedCompany = await db.companies.create(company)

        // Index for search
        await search.index('companies', savedCompany)

        // Cache result
        await cache.set(cacheKey, savedCompany, config.cache.ttl.enrichment)

        return savedCompany
      },
      { url }
    )
  },

  // Enrich contact data
  async enrichContact(email: string): Promise<Contact> {
    return withPerformanceTracking(
      'enrichContact',
      async () => {
        // Check cache first
        const cacheKey = `contact:${email}`
        const cached = await cache.get<Contact>(cacheKey)
        if (cached) return cached

        // Search for contact data
        const { data: searchData } = await exa.search(email, {
          type: 'person',
          fields: ['name', 'title', 'company', 'location', 'social'],
        })

        // Get additional data from social profiles
        const socialData = await Promise.all(
          Object.values(searchData.social || {}).map((url) =>
            firecrawl.scrape(url, {
              extractors: ['person', 'social'],
            })
          )
        )

        // Combine and clean data
        const contact: Contact = {
          email,
          firstName: searchData.name?.split(' ')[0],
          lastName: searchData.name?.split(' ').slice(1).join(' '),
          title: searchData.title,
          company: searchData.company,
          location: searchData.location,
          social: {
            linkedin: searchData.social?.linkedin,
            twitter: searchData.social?.twitter,
          },
          metadata: {
            lastEnriched: new Date().toISOString(),
            confidence: calculateConfidence(searchData, ...socialData),
          },
        }

        // Store in database
        const savedContact = await db.contacts.create(contact)

        // Index for search
        await search.index('contacts', savedContact)

        // Cache result
        await cache.set(cacheKey, savedContact, config.cache.ttl.enrichment)

        return savedContact
      },
      { email }
    )
  },

  // Batch enrich multiple URLs
  async batchEnrich(
    urls: string[]
  ): Promise<EnrichmentData[]> {
    return withPerformanceTracking(
      'batchEnrich',
      async () => {
        // Process in batches
        const results: EnrichmentData[] = []
        for (let i = 0; i < urls.length; i += config.batch.maxSize) {
          const batch = urls.slice(i, i + config.batch.maxSize)
          
          // Process batch in parallel
          const batchResults = await Promise.all(
            batch.map(async (url) => {
              try {
                const company = await this.enrichCompany(url)
                const contacts = await this.findContacts(url)
                
                return {
                  url,
                  company,
                  contacts,
                  error: null,
                }
              } catch (error) {
                return {
                  url,
                  company: null,
                  contacts: [],
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              }
            })
          )
          
          results.push(...batchResults)
        }
        
        return results
      },
      { urlCount: urls.length }
    )
  },

  // Find contacts for a company
  async findContacts(url: string): Promise<Contact[]> {
    return withPerformanceTracking(
      'findContacts',
      async () => {
        // Check cache first
        const cacheKey = `contacts:${url}`
        const cached = await cache.get<Contact[]>(cacheKey)
        if (cached) return cached

        // Scrape contact information
        const { data: websiteData } = await firecrawl.scrape(url, {
          extractors: ['contact', 'email', 'social'],
        })

        // Search for additional contacts
        const { data: searchData } = await exa.search(url, {
          type: 'person',
          fields: ['email', 'name', 'title'],
        })

        // Combine and clean data
        const contacts = await Promise.all(
          [...new Set([
            ...websiteData.emails || [],
            ...searchData.map((d) => d.email),
          ])].map((email) => this.enrichContact(email))
        )

        // Cache result
        await cache.set(cacheKey, contacts, config.cache.ttl.enrichment)

        return contacts
      },
      { url }
    )
  },
}

// Helper to calculate confidence score
function calculateConfidence(...dataSources: any[]): number {
  let score = 0
  let total = 0

  for (const data of dataSources) {
    if (!data) continue

    // Count non-null fields
    const fields = Object.values(data)
    const nonNull = fields.filter((f) => f !== null && f !== undefined).length
    
    score += nonNull
    total += fields.length
  }

  return total > 0 ? score / total : 0
} 
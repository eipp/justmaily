import { FirecrawlApp } from 'firecrawl'
import { ExaClient } from '@exa/client'
import { withErrorHandling } from '../errors'
import { withPerformanceTracking } from '../monitoring'
import { db, cache, search } from '../db'
import { config } from '@/api/config'
import type { Company, Contact, EnrichmentData } from '@/types/models'

// Initialize clients
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

// Service wrapper with error handling and retry logic
const withService = async <T>(
  operation: () => Promise<T>,
  options: ServiceOptions = {}
): Promise<T> => {
  return withErrorHandling(operation(), options)
}

// Research service
export const researchService = {
  // Enrich company data
  async enrichCompany(
    url: string,
    options: ServiceOptions = {}
  ): Promise<EnrichmentData> {
    return withService(async () => {
      // Scrape company website
      const scrapeResult = await withPerformanceTracking(
        'scrape_company',
        () => firecrawl.scrape(url, {
          selectors: {
            name: 'title, meta[property="og:title"]',
            description: 'meta[name="description"], meta[property="og:description"]',
            logo: 'link[rel="icon"], link[rel="shortcut icon"]',
            social: {
              linkedin: 'a[href*="linkedin.com"]',
              twitter: 'a[href*="twitter.com"]',
              facebook: 'a[href*="facebook.com"]',
            },
          },
          follow: true,
          maxPages: 10,
        })
      )

      // Search for additional company data
      const searchResult = await withPerformanceTracking(
        'search_company',
        () => exa.searchCompany(url)
      )

      // Combine and clean data
      const companyData: Company = {
        name: scrapeResult.name || searchResult.name,
        domain: new URL(url).hostname,
        description: scrapeResult.description || searchResult.description,
        industry: searchResult.industry,
        size: searchResult.size,
        location: searchResult.location,
        founded: searchResult.founded,
        employees: searchResult.employees,
        revenue: searchResult.revenue,
        funding: searchResult.funding,
        technologies: [
          ...new Set([
            ...(scrapeResult.technologies || []),
            ...(searchResult.technologies || []),
          ]),
        ],
        social: {
          linkedin: scrapeResult.social?.linkedin || searchResult.social?.linkedin,
          twitter: scrapeResult.social?.twitter || searchResult.social?.twitter,
          facebook: scrapeResult.social?.facebook || searchResult.social?.facebook,
          crunchbase: searchResult.social?.crunchbase,
        },
      }

      // Calculate confidence score
      const confidence = calculateConfidence([scrapeResult, searchResult])

      // Store enrichment data
      const enrichmentData: EnrichmentData = {
        url,
        company: companyData,
        metadata: {
          lastEnriched: new Date().toISOString(),
          confidence,
          source: 'firecrawl+exa',
          version: config.app.version,
        },
      }

      await db.enrichment.create(enrichmentData)
      await search.index('companies', companyData.domain, companyData)

      return enrichmentData
    }, options)
  },

  // Enrich contact data
  async enrichContact(
    email: string,
    options: ServiceOptions = {}
  ): Promise<Contact> {
    return withService(async () => {
      // Search for contact data
      const searchResult = await withPerformanceTracking(
        'search_contact',
        () => exa.searchContact(email)
      )

      // Enrich with social profile data
      const profileResult = await withPerformanceTracking(
        'enrich_profile',
        () => firecrawl.enrichProfile(searchResult.social?.linkedin)
      )

      // Combine and clean data
      const contactData: Contact = {
        firstName: searchResult.firstName || profileResult.firstName,
        lastName: searchResult.lastName || profileResult.lastName,
        email,
        title: searchResult.title || profileResult.title,
        department: searchResult.department || profileResult.department,
        location: searchResult.location || profileResult.location,
        phone: searchResult.phone,
        social: {
          linkedin: searchResult.social?.linkedin || profileResult.social?.linkedin,
          twitter: searchResult.social?.twitter || profileResult.social?.twitter,
          github: searchResult.social?.github || profileResult.social?.github,
        },
      }

      // Calculate confidence score
      const confidence = calculateConfidence([searchResult, profileResult])

      // Store contact data
      await db.contacts.create({
        ...contactData,
        metadata: {
          lastEnriched: new Date().toISOString(),
          confidence,
          source: 'exa+firecrawl',
          version: config.app.version,
        },
      })

      await search.index('contacts', email, contactData)

      return contactData
    }, options)
  },

  // Batch enrich multiple URLs
  async batchEnrich(
    urls: string[],
    options: ServiceOptions = {}
  ): Promise<{
    results: EnrichmentData[]
    failed: string[]
  }> {
    return withService(async () => {
      const results: EnrichmentData[] = []
      const failed: string[] = []

      // Process URLs in batches
      for (let i = 0; i < urls.length; i += config.api.batchSize) {
        const batch = urls.slice(i, i + config.api.batchSize)
        const promises = batch.map(async (url) => {
          try {
            const result = await this.enrichCompany(url, options)
            results.push(result)
          } catch (error) {
            console.error(`Failed to enrich ${url}:`, error)
            failed.push(url)
          }
        })

        await Promise.all(promises)
      }

      return { results, failed }
    }, options)
  },

  // Find contacts for a company
  async findContacts(
    url: string,
    options: ServiceOptions = {}
  ): Promise<Contact[]> {
    return withService(async () => {
      // Scrape contact pages
      const scrapeResult = await withPerformanceTracking(
        'scrape_contacts',
        () => firecrawl.scrape(url, {
          selectors: {
            emails: 'a[href^="mailto:"]',
            phones: 'a[href^="tel:"]',
            team: '.team, .employees, .staff',
          },
          follow: true,
          maxPages: 20,
          urlPatterns: [
            '/team',
            '/about',
            '/contact',
            '/people',
            '/leadership',
          ],
        })
      )

      // Search for additional contacts
      const searchResult = await withPerformanceTracking(
        'search_contacts',
        () => exa.searchContacts(url)
      )

      // Combine and clean contacts
      const contacts = new Map<string, Contact>()

      // Add scraped contacts
      for (const email of scrapeResult.emails) {
        contacts.set(email, {
          email,
          firstName: '',
          lastName: '',
        })
      }

      // Add searched contacts
      for (const contact of searchResult.contacts) {
        if (contact.email) {
          contacts.set(contact.email, {
            ...contacts.get(contact.email),
            ...contact,
          })
        }
      }

      // Enrich each contact
      const enrichedContacts: Contact[] = []
      for (const contact of contacts.values()) {
        try {
          const enriched = await this.enrichContact(contact.email, options)
          enrichedContacts.push(enriched)
        } catch (error) {
          console.error(`Failed to enrich contact ${contact.email}:`, error)
          enrichedContacts.push(contact)
        }
      }

      return enrichedContacts
    }, options)
  },
}

// Helper to calculate confidence score
function calculateConfidence(sources: any[]): number {
  let totalFields = 0
  let nonNullFields = 0

  for (const source of sources) {
    for (const value of Object.values(source)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          totalFields += value.length
          nonNullFields += value.filter(v => v !== null && v !== undefined).length
        } else if (typeof value === 'object') {
          const { fields, nonNull } = countFields(value)
          totalFields += fields
          nonNullFields += nonNull
        } else {
          totalFields++
          nonNullFields++
        }
      }
    }
  }

  return Math.round((nonNullFields / totalFields) * 100)
}

// Helper to count non-null fields in an object
function countFields(obj: Record<string, any>): {
  fields: number
  nonNull: number
} {
  let fields = 0
  let nonNull = 0

  for (const value of Object.values(obj)) {
    if (value !== null && value !== undefined) {
      fields++
      if (Array.isArray(value)) {
        nonNull += value.filter(v => v !== null && v !== undefined).length
      } else if (typeof value === 'object') {
        const { fields: f, nonNull: n } = countFields(value)
        fields += f
        nonNull += n
      } else {
        nonNull++
      }
    }
  }

  return { fields, nonNull }
} 
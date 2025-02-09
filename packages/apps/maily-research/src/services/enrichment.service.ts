import { ScrapingService } from './scraping.service';
import { SearchService } from './search.service';
import { HybridMemoryService } from '@justmaily/ai-core';
import { EnrichedContact, EnrichedContactSchema } from '../types';

export class EnrichmentService {
  constructor(
    private readonly scraping: ScrapingService,
    private readonly search: SearchService,
    private readonly memory: HybridMemoryService
  ) {}

  async enrichContact(input: {
    email?: string;
    name?: string;
    company?: string;
    linkedIn?: string;
  }): Promise<EnrichedContact> {
    try {
      // Robust cache key generation using multiple contact properties
      const cacheKey = `enriched:${input.email || input.linkedIn || input.name}:${input.email || input.linkedIn || input.name}:${input.updatedAt || Date.now()}`;
      // Check if the contact already has an embedding; if not, generate one
      if (!input.embedding) {
        input.embedding = await this.generateEmbedding(input);
      }

      // Try to get from cache first
      const cached = await this.memory.retrieve(cacheKey, {
        ttl: 86400, // 24 hours
        namespace: 'contacts',
        collections: ['enriched_contacts'],
        indexName: 'contacts',
        dimensions: 1536,
        metric: 'cosine'
      });

      if (cached) {
        return cached as EnrichedContact;
      }

      // Start with LinkedIn if available
      let contactInfo = {};
      let companyInfo = {};
      
      if (input.linkedIn) {
        const linkedInData = await this.scraping.scrapeLinkedInProfile(input.linkedIn);
        contactInfo = {
          name: linkedInData.profile.name,
          title: linkedInData.profile.title,
          company: linkedInData.profile.company,
          linkedIn: input.linkedIn
        };
        
        // Get company website from LinkedIn
        const companySearchResults = await this.search.searchCompany(
          `${linkedInData.profile.company} official website`,
          { limit: 1 }
        );
        
        if (companySearchResults.length > 0) {
          const companyData = await this.scraping.enrichCompanyData(companySearchResults[0].url);
          companyInfo = companyData.companyInfo;
        }
      } else if (input.company) {
        // Search for company website
        const companySearchResults = await this.search.searchCompany(
          `${input.company} official website`,
          { limit: 1 }
        );
        
        if (companySearchResults.length > 0) {
          const companyData = await this.scraping.enrichCompanyData(companySearchResults[0].url);
          companyInfo = companyData.companyInfo;
        }
      }

      // Get recent news
      const news = await this.search.findNewsAndPressReleases(
        companyInfo.name || input.company,
        {
          limit: 5,
          recency: 'month',
          categories: ['news', 'press_release']
        }
      );

      // Get competitors
      const competitors = await this.search.findCompetitors(
        companyInfo.name || input.company,
        companyInfo.industry || ''
      );

      // Get industry trends
      const trends = await this.search.findIndustryTrends(
        companyInfo.industry || '',
        { limit: 5, recency: 'month' }
      );

      const enrichedContact = EnrichedContactSchema.parse({
        contact: {
          name: input.name || contactInfo.name,
          email: input.email,
          title: contactInfo.title,
          company: companyInfo.name || input.company,
          linkedIn: input.linkedIn
        },
        company: {
          name: companyInfo.name || input.company,
          description: companyInfo.description || '',
          industry: companyInfo.industry,
          size: companyInfo.size,
          location: companyInfo.location,
          website: companyInfo.website,
          socialProfiles: companyInfo.socialProfiles
        },
        insights: {
          recentNews: news.map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            publishedAt: item.publishedAt
          })),
          competitors: competitors.slice(0, 5).map(item => ({
            name: item.title,
            url: item.url,
            description: item.snippet
          })),
          industryTrends: trends.map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet
          }))
        }
      });

      // Cache the enriched contact
      await this.memory.store(
        cacheKey,
        enrichedContact,
        [], // TODO: Generate embeddings
        {
          ttl: 86400,
          namespace: 'contacts',
          collections: ['enriched_contacts'],
          indexName: 'contacts',
          dimensions: 1536,
          metric: 'cosine'
        }
      );

      return enrichedContact;
    } catch (error) {
      console.error('Error in EnrichmentService.enrichContact:', error);
      throw error;
    }
  }

  async batchEnrichContacts(contacts: Array<{
    email?: string;
    name?: string;
    company?: string;
    linkedIn?: string;
  }>): Promise<Array<{
    input: typeof contacts[0];
    result?: EnrichedContact;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      contacts.map(contact => this.enrichContact(contact))
    );

    return results.map((result, index) => ({
      input: contacts[index],
      ...(result.status === 'fulfilled'
        ? { result: result.value }
        : { error: result.reason.message })
    }));
  }

  // New placeholder method for embedding generation
  async generateEmbedding(contact: {
    email?: string;
    name?: string;
    company?: string;
    linkedIn?: string;
  }): Promise<number[]> {
    try {
      // Placeholder: simulate embedding generation (replace with actual AI client integration)
      // For demonstration, we simply return a dummy vector based on the contact's name hash
      const dummyEmbedding = contact.name
        ? contact.name.split('').map(char => char.charCodeAt(0) / 100)
        : [];
      return dummyEmbedding;
    } catch (error) {
      console.error('Error in EnrichmentService.generateEmbedding:', error);
      throw error;
    }
  }
} 
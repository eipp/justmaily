import { FirecrawlApp } from 'firecrawl-js';
import { CompanyInfo, ContactInfo, CompanyInfoSchema, ContactInfoSchema } from '../types';
import { z } from 'zod';
import { config } from '../../api/config';

export class ScrapingService {
  private readonly firecrawl: FirecrawlApp;
  private readonly firecrawlApiKey: string;
  private readonly rateLimit: {
    maxRequests: number;
    windowMs: number;
    requestCount: number;
    windowStart: number;
  };

  constructor() {
    this.firecrawl = new FirecrawlApp({ apiKey: this.firecrawlApiKey });
    // Rate limit configuration: maximum 5 requests per minute
    this.rateLimit = {
      maxRequests: 5,
      windowMs: 60000,
      requestCount: 0,
      windowStart: Date.now()
    };
    // Securely load Firecrawl API key from config/environment
    this.firecrawlApiKey = config.firecrawl.apiKey; // Ensure this key is set in your config file or environment
  }

  async _checkRateLimit() {
    const now = Date.now();
    if (now - this.rateLimit.windowStart > this.rateLimit.windowMs) {
      this.rateLimit.windowStart = now;
      this.rateLimit.requestCount = 0;
    }
    if (this.rateLimit.requestCount >= this.rateLimit.maxRequests) {
      throw new Error('Rate limit exceeded for scraping requests');
    }
    this.rateLimit.requestCount++;
  }

  async enrichCompanyData(url: string): Promise<{
    companyInfo: CompanyInfo;
    contactInfo: ContactInfo;
    rawContent: string;
  }> {
    try {
      await this._checkRateLimit();
      // Scrape the website with both markdown and structured data
      const result = await this.firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'json'],
        jsonOptions: {
          extractionSchema: z.object({
            company: CompanyInfoSchema,
            contact: ContactInfoSchema
          })
        }
      });

      if (!result.data) {
        throw new Error('Failed to scrape website');
      }

      return {
        companyInfo: result.data.json.company,
        contactInfo: result.data.json.contact,
        rawContent: result.data.markdown
      };
    } catch (error) {
      console.error('Error enriching company data:', error);
      throw error;
    }
  }

  async crawlCompanyWebsite(url: string, options: {
    limit?: number;
    depth?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
  } = {}): Promise<{
    pages: Array<{
      url: string;
      content: string;
      metadata: any;
    }>;
  }> {
    try {
      await this._checkRateLimit();
      const result = await this.firecrawl.crawlUrl(url, {
        limit: options.limit || 100,
        depth: options.depth || 3,
        includePatterns: options.includePatterns,
        excludePatterns: options.excludePatterns,
        scrapeOptions: {
          formats: ['markdown', 'json'],
          jsonOptions: {
            extractionSchema: z.object({
              metadata: z.object({
                title: z.string(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional(),
                lastModified: z.string().optional()
              })
            })
          }
        }
      });

      if (!result.pages) {
        throw new Error('Failed to crawl website');
      }

      return {
        pages: result.pages.map(page => ({
          url: page.url,
          content: page.data.markdown,
          metadata: page.data.json.metadata
        }))
      };
    } catch (error) {
      console.error('Error crawling company website:', error);
      throw error;
    }
  }

  async scrapeLinkedInProfile(url: string): Promise<{
    profile: {
      name: string;
      title: string;
      company: string;
      location: string;
      about: string;
      experience: Array<{
        title: string;
        company: string;
        duration: string;
        description: string;
      }>;
    };
  }> {
    try {
      await this._checkRateLimit();
      const result = await this.firecrawl.scrapeUrl(url, {
        formats: ['json'],
        jsonOptions: {
          extractionSchema: z.object({
            profile: z.object({
              name: z.string(),
              title: z.string(),
              company: z.string(),
              location: z.string(),
              about: z.string(),
              experience: z.array(z.object({
                title: z.string(),
                company: z.string(),
                duration: z.string(),
                description: z.string()
              }))
            })
          })
        },
        actions: [
          { type: 'wait', milliseconds: 2000 }, // Wait for dynamic content
          { type: 'scroll', pixels: 1000 }, // Scroll to load more content
          { type: 'wait', milliseconds: 1000 }
        ]
      });

      if (!result.data?.json?.profile) {
        throw new Error('Failed to scrape LinkedIn profile');
      }

      return {
        profile: result.data.json.profile
      };
    } catch (error) {
      console.error('Error scraping LinkedIn profile:', error);
      throw error;
    }
  }

  async batchEnrichContacts(urls: string[]): Promise<Array<{
    url: string;
    companyInfo?: CompanyInfo;
    contactInfo?: ContactInfo;
    error?: string;
  }>> {
    try {
      await this._checkRateLimit();
      const result = await this.firecrawl.batchScrape({
        urls,
        formats: ['json'],
        jsonOptions: {
          extractionSchema: z.object({
            company: CompanyInfoSchema,
            contact: ContactInfoSchema
          })
        }
      });

      return result.results.map(item => ({
        url: item.url,
        companyInfo: item.success ? item.data.json.company : undefined,
        contactInfo: item.success ? item.data.json.contact : undefined,
        error: item.success ? undefined : item.error
      }));
    } catch (error) {
      console.error('Error batch enriching contacts:', error);
      throw error;
    }
  }
} 
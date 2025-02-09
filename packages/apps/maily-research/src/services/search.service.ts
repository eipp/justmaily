import { ExaClient } from '@exa/client';
import { SearchResult, SearchResultSchema } from '../types';
import { search } from '../lib/db';
import { MetricsService } from '../lib/metrics';
import { SecurityService } from '../lib/security';

// At the top of the file, add Vespa configuration documentation
// Note: Ensure that Vespa is configured via environment variables or config files. Refer to the docs for detailed setup.

export class SearchService {
  private readonly exa: ExaClient;
  private readonly metrics: MetricsService;
  private readonly security: SecurityService;

  constructor(config: { exaApiKey: string }) {
    this.exa = new ExaClient({ apiKey: config.exaApiKey });
    this.metrics = new MetricsService();
    this.security = new SecurityService();
  }

  async searchCompany(query: string, options: {
    limit?: number;
    recency?: 'day' | 'week' | 'month' | 'year';
    sources?: string[];
  } = {}): Promise<SearchResult[]> {
    try {
      // First try Vespa for cached results
      const vespaResults = await search.search('companies', {
        conditions: [
          {
            field: 'name',
            operator: 'contains',
            value: query
          }
        ],
        limit: options.limit || 10,
        orderBy: [{ field: 'relevance', direction: 'desc' }]
      });

      if (vespaResults.length > 0) {
        this.metrics.recordLatency(
          'company_search_vespa_duration',
          Date.now() - startTime
        );
        return vespaResults.map(result => SearchResultSchema.parse(result));
      }

      // Fallback to Exa for fresh results
      const results = await this.exa.search({
        query,
        limit: options.limit || 10,
        filters: {
          time: options.recency,
          domains: options.sources
        },
        highlights: true,
        semanticRanker: true
      });

      // Index results in Vespa for future use
      await Promise.all(
        results.hits.map(hit =>
          search.index('companies', {
            url: hit.url,
            title: hit.title,
            snippet: hit.snippet,
            publishedAt: hit.published_at,
            source: hit.source,
            author: hit.author,
            score: hit.score
          })
        )
      );

      this.metrics.recordLatency(
        'company_search_exa_duration',
        Date.now() - startTime
      );

      return results.hits.map(hit => SearchResultSchema.parse({
        url: hit.url,
        title: hit.title,
        snippet: hit.snippet,
        publishedAt: hit.published_at,
        source: hit.source,
        author: hit.author,
        score: hit.score
      }));
    } catch (error) {
      console.error('Error in SearchService.searchCompany:', error);
      this.metrics.recordError('company_search_error', error.message);
      throw error;
    }
  }

  async findNewsAndPressReleases(companyName: string, options: {
    limit?: number;
    recency?: 'day' | 'week' | 'month' | 'year';
    categories?: Array<'news' | 'press_release' | 'blog'>;
  } = {}): Promise<SearchResult[]> {
    try {
      // First try Vespa for cached results
      const vespaResults = await search.search('news', {
        conditions: [
          {
            field: 'company',
            operator: '=',
            value: companyName
          },
          {
            field: 'type',
            operator: 'in',
            value: options.categories || ['news', 'press_release']
          }
        ],
        limit: options.limit || 20,
        orderBy: [{ field: 'publishedAt', direction: 'desc' }]
      });

      if (vespaResults.length > 0) {
        this.metrics.recordLatency(
          'news_search_vespa_duration',
          Date.now() - startTime
        );
        return vespaResults.map(result => SearchResultSchema.parse(result));
      }

      // Fallback to Exa for fresh results
      const results = await this.exa.search({
        query: `${companyName} (news OR "press release")`,
        limit: options.limit || 20,
        filters: {
          time: options.recency,
          type: options.categories
        },
        highlights: true,
        semanticRanker: true,
        sortBy: 'date'
      });

      // Index results in Vespa for future use
      await Promise.all(
        results.hits.map(hit =>
          search.index('news', {
            url: hit.url,
            title: hit.title,
            snippet: hit.snippet,
            publishedAt: hit.published_at,
            source: hit.source,
            author: hit.author,
            score: hit.score,
            company: companyName,
            type: hit.type
          })
        )
      );

      this.metrics.recordLatency(
        'news_search_exa_duration',
        Date.now() - startTime
      );

      return results.hits.map(hit => SearchResultSchema.parse({
        url: hit.url,
        title: hit.title,
        snippet: hit.snippet,
        publishedAt: hit.published_at,
        source: hit.source,
        author: hit.author,
        score: hit.score
      }));
    } catch (error) {
      console.error('Error in SearchService.findNewsAndPressReleases:', error);
      this.metrics.recordError('news_search_error', error.message);
      throw error;
    }
  }

  async findCompetitors(companyName: string, industry: string): Promise<SearchResult[]> {
    try {
      // First try Vespa for cached results
      const vespaResults = await search.search('competitors', {
        conditions: [
          {
            field: 'company',
            operator: '=',
            value: companyName
          },
          {
            field: 'industry',
            operator: '=',
            value: industry
          }
        ],
        limit: 20,
        orderBy: [{ field: 'relevance', direction: 'desc' }]
      });

      if (vespaResults.length > 0) {
        this.metrics.recordLatency(
          'competitors_search_vespa_duration',
          Date.now() - startTime
        );
        return vespaResults.map(result => SearchResultSchema.parse(result));
      }

      // Fallback to Exa for fresh results
      const results = await this.exa.search({
        query: `${companyName} competitors in ${industry}`,
        limit: 20,
        filters: {
          time: 'year'
        },
        highlights: true,
        semanticRanker: true
      });

      // Index results in Vespa for future use
      await Promise.all(
        results.hits.map(hit =>
          search.index('competitors', {
            url: hit.url,
            title: hit.title,
            snippet: hit.snippet,
            publishedAt: hit.published_at,
            source: hit.source,
            author: hit.author,
            score: hit.score,
            company: companyName,
            industry
          })
        )
      );

      this.metrics.recordLatency(
        'competitors_search_exa_duration',
        Date.now() - startTime
      );

      return results.hits.map(hit => SearchResultSchema.parse({
        url: hit.url,
        title: hit.title,
        snippet: hit.snippet,
        publishedAt: hit.published_at,
        source: hit.source,
        author: hit.author,
        score: hit.score
      }));
    } catch (error) {
      console.error('Error in SearchService.findCompetitors:', error);
      this.metrics.recordError('competitors_search_error', error.message);
      throw error;
    }
  }

  async findSocialMediaProfiles(companyName: string): Promise<SearchResult[]> {
    try {
      const socialPlatforms = [
        'linkedin.com',
        'twitter.com',
        'facebook.com',
        'instagram.com',
        'youtube.com'
      ];

      const results = await this.exa.search({
        query: companyName,
        limit: 10,
        filters: {
          domains: socialPlatforms
        },
        highlights: false,
        semanticRanker: true
      });

      return results.hits.map(hit => SearchResultSchema.parse({
        url: hit.url,
        title: hit.title,
        snippet: hit.snippet,
        publishedAt: hit.published_at,
        source: hit.source,
        author: hit.author,
        score: hit.score
      }));
    } catch (error) {
      console.error('Error finding social media profiles:', error);
      throw error;
    }
  }

  async findIndustryTrends(industry: string, options: {
    limit?: number;
    recency?: 'day' | 'week' | 'month' | 'year';
  } = {}): Promise<SearchResult[]> {
    try {
      const results = await this.exa.search({
        query: `${industry} industry trends analysis research report`,
        limit: options.limit || 20,
        filters: {
          time: options.recency || 'month',
          type: ['article', 'research']
        },
        highlights: true,
        semanticRanker: true,
        sortBy: 'relevance'
      });

      return results.hits.map(hit => SearchResultSchema.parse({
        url: hit.url,
        title: hit.title,
        snippet: hit.snippet,
        publishedAt: hit.published_at,
        source: hit.source,
        author: hit.author,
        score: hit.score
      }));
    } catch (error) {
      console.error('Error in SearchService.findIndustryTrends:', error);
      throw error;
    }
  }

  // Dummy helper methods (placeholders)
  async _dummySearch(query, options) {
    return [{ title: 'Dummy Company', url: 'https://dummy.com', snippet: 'Dummy snippet' }];
  }

  async _dummyNews(companyName, options) {
    return [{ title: 'Dummy News', url: 'https://dummynews.com', snippet: 'News snippet', publishedAt: new Date().toISOString() }];
  }

  async _dummyCompetitors(companyName, industry) {
    return [{ title: 'Competitor Co', url: 'https://competitor.com', snippet: 'Competitor snippet' }];
  }

  async _dummyTrends(industry, options) {
    return [{ title: 'Trend Title', url: 'https://trend.com', snippet: 'Trend snippet' }];
  }
} 
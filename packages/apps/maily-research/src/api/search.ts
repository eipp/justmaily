import { NextRequest } from 'next/server';
import { SearchService } from '../services/search.service';
import { SearchOptionsSchema, NewsRequestSchema, CompetitorsRequestSchema, TrendsRequestSchema } from '@justmaily/shared-types';
import { withErrorHandling, withValidation, withRateLimit, withAuth } from '@justmaily/monitoring';
import { MetricsService } from '../lib/metrics';
import { SecurityService } from '../lib/security';

// Initialize services
const searchService = new SearchService({
  exaApiKey: process.env.EXA_API_KEY!
});

const metrics = new MetricsService();
const security = new SecurityService();

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1'], // US East, US West, Asia
};

// Company search
export const POST = withErrorHandling(
  withAuth(
    withRateLimit(
      withValidation(SearchOptionsSchema)(async (req: NextRequest) => {
        const startTime = Date.now();

        try {
          const { query, options } = await req.json();

          // Check for sensitive data in query
          if (security.containsSensitiveData(query)) {
            security.logSecurityEvent({
              type: 'sensitive_data_in_search',
              details: { query }
            });
            throw new Error('Search query contains sensitive data');
          }

          const results = await searchService.searchCompany(query, options);

          metrics.recordLatency(
            'company_search_api_duration',
            Date.now() - startTime
          );

          return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': req.headers.get('x-request-id') || '',
              'Cache-Control': 'private, max-age=300'
            }
          });
        } catch (error) {
          metrics.recordError('company_search_api_error', error.message);
          throw error;
        }
      })
    )
  )
);

// News search
export const GET = withErrorHandling(
  withAuth(
    withRateLimit(
      withValidation(NewsRequestSchema)(async (req: NextRequest) => {
        const startTime = Date.now();

        try {
          const { companyName, options } = await req.json();

          // Check for sensitive data
          if (security.containsSensitiveData(companyName)) {
            security.logSecurityEvent({
              type: 'sensitive_data_in_search',
              details: { companyName }
            });
            throw new Error('Company name contains sensitive data');
          }

          const results = await searchService.findNewsAndPressReleases(companyName, options);

          metrics.recordLatency(
            'news_search_api_duration',
            Date.now() - startTime
          );

          return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': req.headers.get('x-request-id') || '',
              'Cache-Control': 'private, max-age=300'
            }
          });
        } catch (error) {
          metrics.recordError('news_search_api_error', error.message);
          throw error;
        }
      })
    )
  )
);

// Competitors search
export const PUT = withErrorHandling(
  withAuth(
    withRateLimit(
      withValidation(CompetitorsRequestSchema)(async (req: NextRequest) => {
        const startTime = Date.now();

        try {
          const { companyName, industry } = await req.json();

          // Check for sensitive data
          if (security.containsSensitiveData(companyName) || security.containsSensitiveData(industry)) {
            security.logSecurityEvent({
              type: 'sensitive_data_in_search',
              details: { companyName, industry }
            });
            throw new Error('Search parameters contain sensitive data');
          }

          const results = await searchService.findCompetitors(companyName, industry);

          metrics.recordLatency(
            'competitors_search_api_duration',
            Date.now() - startTime
          );

          return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': req.headers.get('x-request-id') || '',
              'Cache-Control': 'private, max-age=300'
            }
          });
        } catch (error) {
          metrics.recordError('competitors_search_api_error', error.message);
          throw error;
        }
      })
    )
  )
);

// Industry trends search
export const PATCH = withErrorHandling(
  withAuth(
    withRateLimit(
      withValidation(TrendsRequestSchema)(async (req: NextRequest) => {
        const startTime = Date.now();

        try {
          const { industry, options } = await req.json();

          // Check for sensitive data
          if (security.containsSensitiveData(industry)) {
            security.logSecurityEvent({
              type: 'sensitive_data_in_search',
              details: { industry }
            });
            throw new Error('Industry contains sensitive data');
          }

          const results = await searchService.findIndustryTrends(industry, options);

          metrics.recordLatency(
            'trends_search_api_duration',
            Date.now() - startTime
          );

          return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': req.headers.get('x-request-id') || '',
              'Cache-Control': 'private, max-age=300'
            }
          });
        } catch (error) {
          metrics.recordError('trends_search_api_error', error.message);
          throw error;
        }
      })
    )
  )
); 
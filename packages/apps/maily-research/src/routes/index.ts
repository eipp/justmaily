import { Router } from 'express';
import { SearchService } from '../services/search.service';
import { ScrapingService } from '../services/scraping.service';
import { EnrichmentService } from '../services/enrichment.service';
import { validateRequest } from '../middleware/validateRequest';
import {
  SearchOptionsSchema,
  EnrichContactSchema,
  BatchEnrichContactsSchema,
  ScrapeOptionsSchema,
  NewsRequestSchema,
  CompetitorsRequestSchema,
  TrendsRequestSchema
} from '../types/validation';

// Initialize services (basic DI container)
const services = {
  searchService: new SearchService(),
  enrichmentService: new EnrichmentService(),
  scrapingService: new ScrapingService(),
  // Add other services as needed
};

// Global error handling middleware
function globalErrorHandler(err, req, res, next) {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}

export function createRouter(services: {
  search: SearchService;
  scraping: ScrapingService;
  enrichment: EnrichmentService;
}) {
  const router = Router();

  // Enrichment routes
  router.post('/enrich', validateRequest(EnrichContactSchema), async (req, res, next) => {
    try {
      const { contacts } = req.body;

      if (!Array.isArray(contacts)) {
        const result = await services.enrichment.enrichContact(req.body);
        return res.json(result);
      }

      const results = await services.enrichment.batchEnrichContacts(contacts);
      return res.json(results);
    } catch (error) {
      next(error);
    }
  });

  router.post('/enrich/batch', validateRequest(BatchEnrichContactsSchema), async (req, res, next) => {
    try {
      const results = await services.enrichment.batchEnrichContacts(req.body.contacts);
      return res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // Search routes
  router.post('/search', validateRequest(SearchOptionsSchema), async (req, res, next) => {
    try {
      const { query, options } = req.body;
      const results = await services.search.searchCompany(query, options);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  router.post('/news', validateRequest(NewsRequestSchema), async (req, res, next) => {
    try {
      const { companyName, options } = req.body;
      const results = await services.search.findNewsAndPressReleases(companyName, options);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  router.post('/competitors', validateRequest(CompetitorsRequestSchema), async (req, res, next) => {
    try {
      const { companyName, industry } = req.body;
      const results = await services.search.findCompetitors(companyName, industry);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  router.post('/trends', validateRequest(TrendsRequestSchema), async (req, res, next) => {
    try {
      const { industry, options } = req.body;
      const results = await services.search.findIndustryTrends(industry, options);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // Scraping routes
  router.post('/scrape', validateRequest(ScrapeOptionsSchema), async (req, res, next) => {
    try {
      const { url, options } = req.body;
      const results = await services.scraping.crawlCompanyWebsite(url, options);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

// Export services for use in routes
export { services, globalErrorHandler }; 
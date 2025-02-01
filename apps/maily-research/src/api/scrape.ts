import { NextRequest } from 'next/server';
import { ScrapingService } from '../services/scraping.service';
import { ScrapeOptionsSchema } from '@justmaily/shared-types';
import { withErrorHandling, withValidation } from '@justmaily/monitoring';

// Initialize service
const scrapingService = new ScrapingService({
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY!
});

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1'], // US East, US West, Asia
};

// Website scraping
export const POST = withErrorHandling(
  withValidation(ScrapeOptionsSchema)(async (req: NextRequest) => {
    const { url, options } = await req.json();
    const results = await scrapingService.crawlCompanyWebsite(url, options);
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  })
); 
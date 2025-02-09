import { NextRequest } from 'next/server';
import { EnrichmentService } from '../services/enrichment.service';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { createVespaClient } from '@justmaily/ai-core';
import { EnrichContactSchema, BatchEnrichContactsSchema } from '@justmaily/shared-types';
import { withErrorHandling, withValidation } from '@justmaily/monitoring';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
});

const vespa = createVespaClient({
  url: process.env.VESPA_URL!
});

// Initialize services
const enrichmentService = new EnrichmentService({
  supabase,
  redis,
  vespa
});

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1'], // US East, US West, Asia
};

// Single contact enrichment
export const POST = withErrorHandling(
  withValidation(EnrichContactSchema)(async (req: NextRequest) => {
    const data = await req.json();
    const result = await enrichmentService.enrichContact(data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  })
);

// Batch contact enrichment
export const PUT = withErrorHandling(
  withValidation(BatchEnrichContactsSchema)(async (req: NextRequest) => {
    const { contacts } = await req.json();
    const results = await enrichmentService.batchEnrichContacts(contacts);
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  })
); 
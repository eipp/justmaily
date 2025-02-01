import { createAPIHandler, json } from '@/lib/api'
import { enrichmentRequestSchema } from '@/lib/validation'
import { researchService } from '@/lib/services'
import { config } from '@/api/config'

// POST /api/enrich - Enrich URLs with company and contact data
export const POST = createAPIHandler(
  async (req, { data }) => {
    const result = await researchService.batchEnrich(data.urls)

    return json(result)
  },
  {
    schema: enrichmentRequestSchema,
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['POST'],
      credentials: true,
    },
  }
)

// GET /api/enrich/:url - Get enrichment data for a specific URL
export const GET = createAPIHandler(
  async (req) => {
    const url = new URL(req.url).searchParams.get('url')
    if (!url) {
      throw new Error('URL parameter is required')
    }

    const company = await researchService.enrichCompany(url)
    const contacts = await researchService.findContacts(url)

    return json({
      url,
      company,
      contacts,
      error: null,
    })
  },
  {
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['GET'],
      credentials: true,
    },
  }
) 
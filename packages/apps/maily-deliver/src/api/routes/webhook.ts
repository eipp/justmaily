import { NextRequest, NextResponse } from 'next/server'

import { createAPIHandler, json } from '../../lib/api'
import { trackWebhook } from '../../lib/monitoring'
import { WebhookEventSchema } from '../../types'
import { config } from '../config'

// POST /api/webhook - Handle Postal webhooks
export const POST = createAPIHandler({
  schema: WebhookEventSchema,
  requireAuth: false,
  rateLimit: false,
  handler: async (req: NextRequest) => {
    // Skip processing if webhooks are disabled
    if (!config.features.webhooks) {
      return json({ status: 'skipped', message: 'Webhooks are disabled' })
    }

    const startTime = Date.now()
    const payload = await req.json()

    // Generic webhook handling
    const event = payload.event || payload.type
    
    // Handle webhook based on provider type
    switch (event) {
      // Add cases for other providers here
      default:
        console.warn(`Unhandled webhook event: ${event}`)
    }

    const duration = Date.now() - startTime
    trackWebhook(event, duration)

    return json({
      status: 'success',
      metadata: {
        event,
        duration,
        timestamp: new Date().toISOString(),
      },
    })
  },
}) 
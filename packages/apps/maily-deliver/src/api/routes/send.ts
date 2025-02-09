import { NextRequest } from 'next/server'

import { createAPIHandler, json } from '../../lib/api'
import { emailService } from '../../services/email'
import { MessageSchema, BatchRequestSchema } from '../../types'
import { config } from '../config'

// POST /api/send - Send a single email
export const POST = createAPIHandler({
  schema: MessageSchema,
  requireAuth: true,
  rateLimit: true,
  handler: async (req: NextRequest) => {
    const data = await req.json()
    const result = await emailService.sendEmail(data)
    return json(result)
  },
})

// PUT /api/send/batch - Send multiple emails
export const PUT = createAPIHandler({
  schema: BatchRequestSchema,
  requireAuth: true,
  rateLimit: true,
  handler: async (req: NextRequest) => {
    const { messages, options } = await req.json()
    
    const startTime = Date.now()
    const results = await Promise.allSettled(
      messages.map((message) => emailService.sendEmail(message))
    )
    
    const successful = results.filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled'
    ).map((result) => result.value)
    
    const failed = results.filter(
      (result): result is PromiseRejectedResult =>
        result.status === 'rejected'
    ).map((result) => ({
      error: result.reason?.message || 'Unknown error',
      stack: config.env === 'development' ? result.reason?.stack : undefined,
    }))
    
    return json({
      successful,
      failed,
      metadata: {
        total: messages.length,
        successful: successful.length,
        failed: failed.length,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    })
  },
}) 
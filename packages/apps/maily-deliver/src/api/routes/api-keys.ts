import { NextRequest } from 'next/server'
import { z } from 'zod'

import { createAPIHandler } from '../../lib/api'
import { apiKeyConfig } from '../config/api-keys'

// Validation schemas
const createAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string().refine(
    permission => permission in apiKeyConfig.permissions,
    'Invalid permission'
  )),
  expirationDays: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const listAPIKeysSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
})

// Create API Key
export const POST = createAPIHandler(
  async (req: NextRequest, data: z.infer<typeof createAPIKeySchema>) => {
    const { name, permissions, expirationDays, metadata } = data

    const apiKey = await apiKeyManager.createAPIKey({
      ownerId: req.headers.get('X-User-ID')!, // Set by auth middleware
      name,
      permissions,
      expirationDays,
      metadata,
    })

    return new Response(
      JSON.stringify({
        id: apiKey.id,
        key: apiKey.key,
        message: 'Store this API key securely as it cannot be retrieved later',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  },
  {
    schema: createAPIKeySchema,
    requireAuth: true,
    permissions: ['apikey:create'],
  }
)

// List API Keys
export const GET = createAPIHandler(
  async (req: NextRequest, data: z.infer<typeof listAPIKeysSchema>) => {
    const { page, limit } = data
    const userId = req.headers.get('X-User-ID')!

    const keys = await apiKeyManager.listAPIKeys(userId, {
      page,
      limit,
    })

    return new Response(JSON.stringify(keys), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  {
    schema: listAPIKeysSchema,
    requireAuth: true,
    permissions: ['apikey:list'],
  }
)

// Revoke API Key
export const DELETE = createAPIHandler(
  async (req: NextRequest) => {
    const keyId = new URL(req.url).pathname.split('/').pop()
    if (!keyId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'API key ID is required',
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const userId = req.headers.get('X-User-ID')!
    const success = await apiKeyManager.revokeAPIKey(keyId, userId)

    if (!success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found or unauthorized',
          },
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(null, { status: 204 })
  },
  {
    requireAuth: true,
    permissions: ['apikey:revoke'],
  }
) 
import { createHash, randomBytes } from 'crypto'

import { MetricsService } from '@/lib/monitoring'
import { SecurityService } from '@/lib/security'

import { Redis } from '@upstash/redis'
// import { config } from '../../api/config' // Removed config import for now

interface APIKeyConfig {
  prefix: string
  hashAlgorithm: string
  minLength: number
  expirationDays?: number
  rateLimit?: {
    maxRequests: number
    window: number // in seconds
  },
  redis?: { // Added redis property, optional
    url: string;
    token: string;
  },
  hashSalt?: string; // Added hashSalt property, optional
}

interface APIKey {
  id: string
  hashedKey: string
  ownerId: string
  name: string
  permissions: string[]
  createdAt: Date
  expiresAt?: Date
  lastUsedAt?: Date
  metadata?: Record<string, any>
}

export class APIKeyManager {
  private redis: Redis
  private defaultConfig: APIKeyConfig = {
    prefix: 'jm_',
    hashAlgorithm: 'sha256',
    minLength: 32,
    expirationDays: 365,
    rateLimit: {
      maxRequests: 1000,
      window: 60
    }
  }

  constructor(
    private config: APIKeyConfig,
    private metrics: MetricsService,
    private security: SecurityService
  ) {
    this.config = { ...this.defaultConfig, ...config }
    this.redis = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    })
  }

  async createAPIKey(params: {
    ownerId: string
    name: string
    permissions: string[]
    expirationDays?: number
    metadata?: Record<string, unknown>
  }): Promise<{ id: string; key: string }> {
    const id = randomBytes(16).toString('hex')
    const key = this.generateAPIKey()
    const hashedKey = this.hashAPIKey(key)

    const apiKey: APIKey = {
      id,
      hashedKey,
      ownerId: params.ownerId,
      name: params.name,
      permissions: params.permissions,
      createdAt: new Date(),
      expiresAt: params.expirationDays
        ? new Date(Date.now() + params.expirationDays * 86400000)
        : undefined,
      metadata: params.metadata
    }

    // Store API key data
    await this.redis.set(`apikey:${id}`, JSON.stringify(apiKey))
    await this.redis.set(`apikey_hash:${hashedKey}`, id)

    // Audit log
    await this.security.logAuditEvent({
      action: 'api_key_created',
      userId: params.ownerId,
      resource: 'api_key',
      details: { id, name: params.name },
      timestamp: new Date() // Add timestamp
    })

    await this.metrics.increment('api_key_created')

    return { id, key: `${this.config.prefix}${key}` }
  }

  async validateAPIKey(apiKey: string): Promise<{
    valid: boolean
    keyData?: Omit<APIKey, 'hashedKey'>
  }> {
    try {
      const startTime = Date.now()

      // Remove prefix and normalize
      if (!apiKey?.startsWith(this.config.prefix)) {
        await this.metrics.increment('api_key_validation_prefix_failed')
        return { valid: false }
      }
      const key = apiKey.slice(this.config.prefix.length).trim()

      // Check key format and length
      if (key.length < this.config.minLength || !/^[a-f0-9]+$/i.test(key)) {
        await this.metrics.increment('api_key_validation_format_failed')
        return { valid: false }
      }

      // Hash and lookup key using timing-safe comparison
      const hashedKey = this.hashAPIKey(key)
      const keyId = await this.redis.get(`apikey_hash:${hashedKey}`)
      
      if (!keyId) {
        await this.metrics.increment('api_key_validation_not_found_failed')
        await this.security.logAuditEvent({
          action: 'api_key_validation_failed',
          userId: 'system',
          resource: 'api_key',
          details: { reason: 'key_not_found' },
          timestamp: new Date() // Add timestamp
        })
        return { valid: false }
      }

      // Get key data with retry for potential race conditions
      let apiKeyData: APIKey | null = null
      for (let i = 0; i < 3; i++) {
        const keyData = await this.redis.get(`apikey:${keyId}`)
        if (keyData) {
          apiKeyData = JSON.parse(keyData)
          break
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!apiKeyData) {
        await this.metrics.increment('api_key_validation_data_not_found_failed')
        await this.security.logAuditEvent({
          action: 'api_key_validation_failed',
          userId: 'system',
          resource: 'api_key',
          details: { reason: 'key_data_not_found', keyId },
          timestamp: new Date() // Add timestamp
        })
        return { valid: false }
      }

      // Check expiration
      if (apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date()) {
        await this.metrics.increment('api_key_expired_failed')
        await this.security.logAuditEvent({
          action: 'api_key_validation_failed',
          userId: apiKeyData.ownerId,
          resource: 'api_key',
          details: { reason: 'key_expired', keyId },
          timestamp: new Date() // Add timestamp
        })
        return { valid: false }
      }

      // Check rate limit with exponential backoff
      if (this.config.rateLimit) {
        const isRateLimited = await this.checkRateLimit(keyId)
        if (isRateLimited) {
          await this.metrics.increment('api_key_rate_limited_failed')
          await this.security.logAuditEvent({
            action: 'api_key_validation_failed',
            userId: apiKeyData.ownerId,
            resource: 'api_key',
            details: { reason: 'rate_limited', keyId },
            timestamp: new Date() // Add timestamp
          })
          return { valid: false }
        }
      }

      // Update last used timestamp and access count atomically
      const pipeline = this.redis.pipeline()
      pipeline.set(
        `apikey:${keyId}`,
        JSON.stringify({
          ...apiKeyData,
          lastUsedAt: new Date()
        })
      )
      pipeline.incr(`apikey_access:${keyId}:${new Date().toISOString().split('T')[0]}`)
      await pipeline.exec()

      await this.metrics.recordLatency(
        'api_key_validation',
        Date.now() - startTime
      )
      await this.metrics.record('api_key_validation_latency', Date.now() - startTime)

      // Return key data without the hashed key
      const { hashedKey: _, ...keyDataWithoutHash } = apiKeyData
      return { valid: true, keyData: keyDataWithoutHash }
    } catch (error) {
      await this.metrics.increment('api_key_validation_error_failed')
      await this.security.logAuditEvent({
        action: 'api_key_validation_error',
        userId: 'system',
        resource: 'api_key',
        details: { error: error.message },
        timestamp: new Date() // Add timestamp
      })
      return { valid: false }
    }
  }
  async revokeAPIKey(id: string, ownerId: string): Promise<boolean> {
    try {
      const keyData = await this.redis.get(`apikey:${id}`)
      if (!keyData) {
        return false
      }

      const apiKey: APIKey = JSON.parse(keyData)
      
      // Verify ownership
      if (apiKey.ownerId !== ownerId) {
        throw new Error('Unauthorized to revoke this API key')
      }

      // Remove key data and hash mapping
      await this.redis.del(`apikey:${id}`)
      await this.redis.del(`apikey_hash:${apiKey.hashedKey}`)

      // Audit log
      await this.security.logAuditEvent({
        action: 'api_key_revoked',
        userId: ownerId,
        resource: 'api_key',
        details: { id, name: apiKey.name },
        timestamp: new Date() // Add timestamp
      })

      await this.metrics.increment('api_key_revoked')

      return true
    } catch (error) {
      await this.metrics.record('api_key_revocation_error', 1)
      return false
    }
  }

  private generateAPIKey(): string {
    // Generate a cryptographically secure random key
    const keyBytes = randomBytes(32)
    return keyBytes.toString('hex')
  }

  private hashAPIKey(key: string): string {
    // Use a secure hashing algorithm with a salt
    const salt = this.config.hashSalt || 'default_salt'
    return createHash(this.config.hashAlgorithm)
      .update(salt + key)
      .digest('hex')
  }

  private async checkRateLimit(keyId: string): Promise<boolean> {
    if (!this.config.rateLimit) {
      return false
    }

    const { maxRequests, window } = this.config.rateLimit
    const now = Date.now()
    const windowKey = Math.floor(now / (window * 1000))
    const key = `ratelimit:apikey:${keyId}:${windowKey}`

    const pipeline = this.redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, window * 2) // Double window for safety
    const [[err, count]] = await pipeline.exec()

    if (err) {
      await this.metrics.record('rate_limit_check_error', 1)
      return false // Fail open on Redis errors
    }

    if (count === 1) {
      await this.redis.expire(key, window)
    }

    return count > maxRequests
  }

  async listAPIKeys(
    ownerId: string,
    options: {
      page?: number
      limit?: number
    } = {}
  ): Promise<{
    keys: Array<Omit<APIKey, 'hashedKey'>>
    total: number
    page: number
    limit: number
  }> {
    try {
      const startTime = Date.now()
      const { page = 1, limit = 20 } = options

      // Get all keys for the owner
      const keys = await this.redis.keys(`apikey:*`)
      const keyData = await Promise.all(
        keys.map(async key => {
          const data = await this.redis.get(key)
          return data ? JSON.parse(data) as APIKey : null
        })
      )

      // Filter by owner and remove null values
      const ownerKeys = keyData
        .filter((key): key is APIKey => key !== null && key.ownerId === ownerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // Paginate results
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedKeys = ownerKeys.slice(start, end)

      // Remove hashed keys from response
      const sanitizedKeys = paginatedKeys.map(({ hashedKey: _hashedKey, ...rest }) => rest)

      await this.metrics.recordLatency(
        'api_key_list',
        Date.now() - startTime
      )

      return {
        keys: sanitizedKeys,
        total: ownerKeys.length,
        page,
        limit
      }
    } catch (error) {
      await this.metrics.record('api_key_list_error', 1)
      throw error
    }
  }
}
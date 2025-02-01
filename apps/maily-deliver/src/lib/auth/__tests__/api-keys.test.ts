import { Redis } from '@upstash/redis'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { APIKeyManager } from '../api-keys'

// Mock Redis
vi.mock('@upstash/redis', () => {
  const MockRedis = vi.fn()
  MockRedis.prototype.get = vi.fn()
  MockRedis.prototype.set = vi.fn()
  MockRedis.prototype.del = vi.fn()
  MockRedis.prototype.keys = vi.fn()
  MockRedis.prototype.pipeline = vi.fn(() => ({
    incr: vi.fn(),
    expire: vi.fn(),
    exec: vi.fn(),
    set: vi.fn()
  }))
  return { Redis: MockRedis }
})

// Mock services
vi.mock('../../monitoring', () => ({
  MetricsService: vi.fn(() => ({
    recordLatency: vi.fn(),
    recordAuthSuccess: vi.fn(),
    recordAuthFailure: vi.fn(),
    recordError: vi.fn(),
    incrementCounter: vi.fn()
  }))
}))

vi.mock('../../security', () => ({
  SecurityService: vi.fn(() => ({
    logAuditEvent: vi.fn(),
    logSecurityEvent: vi.fn()
  }))
}))

describe('APIKeyManager', () => {
  let apiKeyManager: APIKeyManager
  let redis: Redis
  let metrics: MetricsService
  let security: SecurityService
  let config: any

  beforeEach(() => {
    redis = new Redis()
    metrics = new MetricsService()
    security = new SecurityService()
    config = {
      prefix: 'test_',
      hashAlgorithm: 'sha256',
      hashSalt: 'test_salt',
      minLength: 32,
      expirationDays: 365,
      rateLimit: {
        maxRequests: 1000,
        window: 60
      }
    }

    apiKeyManager = new APIKeyManager(config, metrics, security)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createAPIKey', () => {
    it('should create a new API key with valid parameters', async () => {
      const params = {
        ownerId: 'user123',
        name: 'Test Key',
        permissions: ['email:send', 'email:track'],
        metadata: { usage: 'testing' }
      }

      vi.spyOn(redis, 'set').mockResolvedValue('OK')

      const result = await apiKeyManager.createAPIKey(params)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('key')
      expect(result.key).toMatch(new RegExp(`^${config.prefix}`))
      expect(redis.set).toHaveBeenCalledTimes(2)
      expect(security.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_created',
          userId: params.ownerId
        })
      )
      expect(metrics.incrementCounter).toHaveBeenCalledWith('api_key_created')
    })

    it('should handle Redis errors during creation', async () => {
      const params = {
        ownerId: 'user123',
        name: 'Test Key',
        permissions: ['email:send']
      }

      vi.spyOn(redis, 'set').mockRejectedValue(new Error('Redis error'))

      await expect(apiKeyManager.createAPIKey(params)).rejects.toThrow()
      expect(metrics.recordError).toHaveBeenCalled()
    })
  })

  describe('validateAPIKey', () => {
    it('should validate a valid API key', async () => {
      const mockKeyId = 'key123'
      const mockKeyData = {
        id: mockKeyId,
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(mockKeyId)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))

      const result = await apiKeyManager.validateAPIKey('test_validkey')

      expect(result.valid).toBe(true)
      expect(result.keyData).toMatchObject({
        id: mockKeyId,
        ownerId: 'user123'
      })
      expect(metrics.recordAuthSuccess).toHaveBeenCalledWith('api_key_validation')
    })

    it('should reject invalid API key format', async () => {
      const result = await apiKeyManager.validateAPIKey('invalid')

      expect(result.valid).toBe(false)
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('api_key_validation_format')
    })

    it('should reject expired API keys', async () => {
      const mockKeyId = 'key123'
      const mockKeyData = {
        id: mockKeyId,
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 86400000) // Expired 1 day ago
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(mockKeyId)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))

      const result = await apiKeyManager.validateAPIKey('test_validkey')

      expect(result.valid).toBe(false)
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('api_key_expired')
    })

    it('should handle rate limiting', async () => {
      const mockKeyId = 'key123'
      const mockKeyData = {
        id: mockKeyId,
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(mockKeyId)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))
      
      vi.spyOn(redis.pipeline(), 'exec').mockResolvedValueOnce([[null, 1001]]) // Over rate limit

      const result = await apiKeyManager.validateAPIKey('test_validkey')

      expect(result.valid).toBe(false)
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('api_key_rate_limited')
    })
  })

  describe('revokeAPIKey', () => {
    it('should successfully revoke an existing API key', async () => {
      const mockKeyData = {
        id: 'key123',
        hashedKey: 'hashed123',
        ownerId: 'user123',
        name: 'Test Key'
      }

      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(mockKeyData))
      vi.spyOn(redis, 'del').mockResolvedValue(1)

      const result = await apiKeyManager.revokeAPIKey('key123', 'user123')

      expect(result).toBe(true)
      expect(redis.del).toHaveBeenCalledTimes(2)
      expect(security.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_revoked',
          userId: 'user123'
        })
      )
      expect(metrics.incrementCounter).toHaveBeenCalledWith('api_key_revoked')
    })

    it('should fail to revoke non-existent API key', async () => {
      vi.spyOn(redis, 'get').mockResolvedValueOnce(null)

      const result = await apiKeyManager.revokeAPIKey('nonexistent', 'user123')

      expect(result).toBe(false)
    })

    it('should fail to revoke API key with wrong owner', async () => {
      const mockKeyData = {
        id: 'key123',
        hashedKey: 'hashed123',
        ownerId: 'otheruser',
        name: 'Test Key'
      }

      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(mockKeyData))

      await expect(apiKeyManager.revokeAPIKey('key123', 'user123'))
        .rejects.toThrow('Unauthorized to revoke this API key')
    })
  })

  describe('listAPIKeys', () => {
    it('should list API keys for a user', async () => {
      const mockKeys = [
        'apikey:key1',
        'apikey:key2',
        'apikey:key3'
      ]

      const mockKeyData = [
        { id: 'key1', ownerId: 'user123', createdAt: new Date() },
        { id: 'key2', ownerId: 'user123', createdAt: new Date() },
        { id: 'key3', ownerId: 'otheruser', createdAt: new Date() }
      ]

      vi.spyOn(redis, 'keys').mockResolvedValueOnce(mockKeys)
      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(JSON.stringify(mockKeyData[0]))
        .mockResolvedValueOnce(JSON.stringify(mockKeyData[1]))
        .mockResolvedValueOnce(JSON.stringify(mockKeyData[2]))

      const result = await apiKeyManager.listAPIKeys('user123', { page: 1, limit: 10 })

      expect(result.keys).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.keys[0].id).toBe('key1')
      expect(result.keys[1].id).toBe('key2')
      expect(metrics.recordLatency).toHaveBeenCalledWith(
        'api_key_list',
        expect.any(Number)
      )
    })

    it('should handle empty results', async () => {
      vi.spyOn(redis, 'keys').mockResolvedValueOnce([])

      const result = await apiKeyManager.listAPIKeys('user123')

      expect(result.keys).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should handle Redis errors', async () => {
      vi.spyOn(redis, 'keys').mockRejectedValue(new Error('Redis error'))

      await expect(apiKeyManager.listAPIKeys('user123'))
        .rejects.toThrow('Redis error')
      expect(metrics.recordError).toHaveBeenCalled()
    })
  })
}) 
import { Redis } from '@upstash/redis'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { APIKeyManager } from '../api-keys'

describe('API Key Integration Tests', () => {
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

  describe('Full API Key Lifecycle', () => {
    it('should handle complete API key lifecycle', async () => {
      // 1. Create API key
      const createParams = {
        ownerId: 'user123',
        name: 'Integration Test Key',
        permissions: ['email:send', 'email:track'],
        metadata: { usage: 'integration-test' }
      }

      vi.spyOn(redis, 'set').mockResolvedValue('OK')
      
      const { id, key } = await apiKeyManager.createAPIKey(createParams)
      expect(id).toBeDefined()
      expect(key).toMatch(new RegExp(`^${config.prefix}`))
      expect(security.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_created',
          userId: createParams.ownerId
        })
      )

      // 2. Validate the created key
      const mockKeyData = {
        id,
        ownerId: createParams.ownerId,
        permissions: createParams.permissions,
        metadata: createParams.metadata,
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(id)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))
      
      vi.spyOn(redis.pipeline(), 'exec').mockResolvedValueOnce([[null, 1]])

      const validationResult = await apiKeyManager.validateAPIKey(key)
      expect(validationResult.valid).toBe(true)
      expect(validationResult.keyData).toMatchObject({
        id,
        ownerId: createParams.ownerId,
        permissions: createParams.permissions
      })
      expect(metrics.recordAuthSuccess).toHaveBeenCalledWith('api_key_validation')

      // 3. List API keys
      const mockKeys = [`apikey:${id}`]
      vi.spyOn(redis, 'keys').mockResolvedValueOnce(mockKeys)
      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(mockKeyData))

      const listResult = await apiKeyManager.listAPIKeys(createParams.ownerId)
      expect(listResult.keys).toHaveLength(1)
      expect(listResult.keys[0]).toMatchObject({
        id,
        name: createParams.name,
        permissions: createParams.permissions
      })

      // 4. Revoke API key
      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(mockKeyData))
      vi.spyOn(redis, 'del').mockResolvedValue(1)

      const revokeResult = await apiKeyManager.revokeAPIKey(id, createParams.ownerId)
      expect(revokeResult).toBe(true)
      expect(security.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_revoked',
          userId: createParams.ownerId
        })
      )

      // 5. Verify key is no longer valid
      vi.spyOn(redis, 'get').mockResolvedValueOnce(null)

      const finalValidation = await apiKeyManager.validateAPIKey(key)
      expect(finalValidation.valid).toBe(false)
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('api_key_not_found')
    })

    it('should handle rate limiting across multiple validations', async () => {
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
      
      // First validation - under limit
      vi.spyOn(redis.pipeline(), 'exec').mockResolvedValueOnce([[null, 999]])
      
      const firstValidation = await apiKeyManager.validateAPIKey('test_validkey')
      expect(firstValidation.valid).toBe(true)
      expect(metrics.recordAuthSuccess).toHaveBeenCalledWith('api_key_validation')

      // Second validation - at limit
      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(mockKeyId)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))
      vi.spyOn(redis.pipeline(), 'exec').mockResolvedValueOnce([[null, 1000]])

      const secondValidation = await apiKeyManager.validateAPIKey('test_validkey')
      expect(secondValidation.valid).toBe(true)
      expect(metrics.recordAuthSuccess).toHaveBeenCalledWith('api_key_validation')

      // Third validation - over limit
      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce(mockKeyId)
        .mockResolvedValueOnce(JSON.stringify(mockKeyData))
      vi.spyOn(redis.pipeline(), 'exec').mockResolvedValueOnce([[null, 1001]])

      const thirdValidation = await apiKeyManager.validateAPIKey('test_validkey')
      expect(thirdValidation.valid).toBe(false)
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('api_key_rate_limited')
    })

    it('should handle concurrent operations', async () => {
      const ownerId = 'user123'
      const mockKeys = Array.from({ length: 5 }, (_, i) => ({
        id: `key${i}`,
        ownerId,
        name: `Test Key ${i}`,
        permissions: ['email:send'],
        createdAt: new Date()
      }))

      // Setup Redis mocks for concurrent operations
      vi.spyOn(redis, 'set').mockResolvedValue('OK')
      vi.spyOn(redis, 'keys').mockResolvedValue(mockKeys.map(k => `apikey:${k.id}`))
      vi.spyOn(redis, 'get').mockImplementation(async (key: string) => {
        const keyId = key.split(':')[1]
        const mockKey = mockKeys.find(k => k.id === keyId)
        return mockKey ? JSON.stringify(mockKey) : null
      })

      // Concurrent key creation
      const createPromises = mockKeys.map(k => apiKeyManager.createAPIKey({
        ownerId,
        name: k.name,
        permissions: k.permissions
      }))

      const createdKeys = await Promise.all(createPromises)
      expect(createdKeys).toHaveLength(mockKeys.length)
      expect(metrics.incrementCounter).toHaveBeenCalledTimes(mockKeys.length)

      // Concurrent validation
      const validatePromises = createdKeys.map(k => apiKeyManager.validateAPIKey(k.key))
      const validationResults = await Promise.all(validatePromises)
      
      expect(validationResults.every(r => r.valid)).toBe(true)
      expect(metrics.recordAuthSuccess).toHaveBeenCalledTimes(mockKeys.length)

      // Concurrent listing
      const [listResult1, listResult2] = await Promise.all([
        apiKeyManager.listAPIKeys(ownerId, { page: 1, limit: 3 }),
        apiKeyManager.listAPIKeys(ownerId, { page: 2, limit: 2 })
      ])

      expect(listResult1.keys).toHaveLength(3)
      expect(listResult2.keys).toHaveLength(2)
      expect(metrics.recordLatency).toHaveBeenCalledTimes(2)

      // Concurrent revocation
      const revokePromises = createdKeys.map(k => apiKeyManager.revokeAPIKey(k.id, ownerId))
      const revocationResults = await Promise.all(revokePromises)

      expect(revocationResults.every(r => r === true)).toBe(true)
      expect(security.logAuditEvent).toHaveBeenCalledTimes(mockKeys.length * 2) // Create + Revoke
    })
  })
}) 
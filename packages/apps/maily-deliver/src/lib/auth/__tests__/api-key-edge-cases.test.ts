import { Redis } from '@upstash/redis'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { MetricsService } from '../../monitoring'
import { SecurityService } from '../../security'
import { APIKeyManager } from '../api-keys'

describe('API Key Edge Cases', () => {
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
      prefix: 'mk_',
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

  describe('Malformed Keys', () => {
    it('should handle keys with invalid prefix', async () => {
      const invalidPrefixes = ['invalid_', '', 'mk', 'MK_', 'mk_test_']
      
      for (const prefix of invalidPrefixes) {
        const result = await apiKeyManager.validateAPIKey(`${prefix}somekey`)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('invalid_key_format')
        expect(metrics.recordAuthFailure).toHaveBeenCalledWith('invalid_key_format')
      }
    })

    it('should handle keys with invalid characters', async () => {
      const invalidKeys = [
        'mk_key with spaces',
        'mk_key\nwith\nnewlines',
        'mk_key\twith\ttabs',
        'mk_key/with/slashes',
        'mk_key\\with\\backslashes',
        'mk_key<with>xml_chars',
        'mk_key"with"quotes'
      ]

      for (const key of invalidKeys) {
        const result = await apiKeyManager.validateAPIKey(key)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('invalid_key_format')
        expect(security.logSecurityEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'invalid_key_format',
            details: expect.any(String)
          })
        )
      }
    })

    it('should handle extremely long keys', async () => {
      const longKey = 'mk_' + 'a'.repeat(1000)
      const result = await apiKeyManager.validateAPIKey(longKey)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('key_too_long')
      expect(metrics.recordAuthFailure).toHaveBeenCalledWith('key_too_long')
    })
  })

  describe('Unicode Handling', () => {
    it('should handle keys with unicode characters', async () => {
      const unicodeKeys = [
        'mk_key_with_emoji_🔑',
        'mk_key_with_accents_éèêë',
        'mk_key_with_chinese_密钥',
        'mk_key_with_arabic_مفتاح',
        'mk_key_with_russian_ключ'
      ]

      for (const key of unicodeKeys) {
        const result = await apiKeyManager.validateAPIKey(key)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('invalid_key_format')
        expect(security.logSecurityEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'invalid_key_format',
            details: 'unicode_characters_detected'
          })
        )
      }
    })

    it('should handle keys with zero-width spaces and other invisible characters', async () => {
      const invisibleChars = [
        'mk_key\u200Bwith\u200Bzwsp',
        'mk_key\u200Cwith\u200Czwj',
        'mk_key\uFEFFwith\uFEFFbom',
        'mk_key\u00A0with\u00A0nbsp'
      ]

      for (const key of invisibleChars) {
        const result = await apiKeyManager.validateAPIKey(key)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('invalid_key_format')
        expect(security.logSecurityEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'invalid_key_format',
            details: 'invisible_characters_detected'
          })
        )
      }
    })
  })

  describe('Key Generation Edge Cases', () => {
    it('should handle crypto API failures', async () => {
      vi.spyOn(window.crypto, 'getRandomValues').mockImplementationOnce(() => {
        throw new Error('Crypto API unavailable')
      })

      const createParams = {
        ownerId: 'user123',
        name: 'Test Key',
        permissions: ['email:send']
      }

      await expect(apiKeyManager.createAPIKey(createParams)).rejects.toThrow('Failed to generate secure key')
      expect(metrics.recordError).toHaveBeenCalledWith(
        'api_key_generation_failed',
        expect.any(Error)
      )
    })

    it('should handle hash collisions', async () => {
      // Mock Redis to simulate a hash collision
      vi.spyOn(redis, 'get')
        .mockResolvedValueOnce('existing_key') // First attempt collides
        .mockResolvedValueOnce(null) // Second attempt succeeds

      const createParams = {
        ownerId: 'user123',
        name: 'Test Key',
        permissions: ['email:send']
      }

      const { key } = await apiKeyManager.createAPIKey(createParams)
      expect(key).toBeDefined()
      expect(metrics.recordLatency).toHaveBeenCalledTimes(2)
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'key_hash_collision',
          details: 'retried_key_generation'
        })
      )
    })
  })

  describe('Concurrent Access Patterns', () => {
    it('should handle rapid key validation attempts', async () => {
      const key = 'mk_validkey'
      const mockKeyData = {
        id: 'key123',
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValue(JSON.stringify(mockKeyData))
      
      // Simulate 100 concurrent validation attempts
      const attempts = Array(100).fill(null).map(() => 
        apiKeyManager.validateAPIKey(key)
      )

      const results = await Promise.all(attempts)
      const validResults = results.filter(r => r.valid)
      const invalidResults = results.filter(r => !r.valid)

      // Should respect rate limiting
      expect(validResults.length).toBeLessThanOrEqual(config.rateLimit.maxRequests)
      expect(invalidResults.length).toBeGreaterThan(0)
      expect(metrics.recordLatency).toHaveBeenCalledTimes(100)
    })

    it('should handle concurrent key revocations', async () => {
      const keyId = 'key123'
      const ownerId = 'user123'
      const mockKeyData = {
        id: keyId,
        ownerId,
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValue(JSON.stringify(mockKeyData))
      vi.spyOn(redis, 'del')
        .mockResolvedValue(1)

      // Attempt to revoke the same key concurrently
      const attempts = Array(5).fill(null).map(() =>
        apiKeyManager.revokeAPIKey(keyId, ownerId)
      )

      const results = await Promise.all(attempts)
      // Only first revocation should succeed
      expect(results.filter(r => r === true)).toHaveLength(1)
      expect(results.filter(r => r === false)).toHaveLength(4)
      expect(security.logAuditEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('Rate Limiting Edge Cases', () => {
    it('should handle rate limit counter overflow', async () => {
      const key = 'mk_validkey'
      const mockKeyData = {
        id: 'key123',
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValue(JSON.stringify(mockKeyData))
      
      // Mock Redis to simulate counter overflow
      vi.spyOn(redis.pipeline(), 'exec')
        .mockResolvedValue([[null, Number.MAX_SAFE_INTEGER + 1]])

      const result = await apiKeyManager.validateAPIKey(key)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('rate_limit_error')
      expect(security.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rate_limit_counter_overflow',
          details: expect.any(String)
        })
      )
    })

    it('should handle rate limit window transitions', async () => {
      const key = 'mk_validkey'
      const mockKeyData = {
        id: 'key123',
        ownerId: 'user123',
        permissions: ['email:send'],
        createdAt: new Date()
      }

      vi.spyOn(redis, 'get')
        .mockResolvedValue(JSON.stringify(mockKeyData))
      
      // Simulate requests across window boundary
      const now = Date.now()
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + config.rateLimit.window * 1000 - 1)
        .mockReturnValueOnce(now + config.rateLimit.window * 1000 + 1)

      // First window
      await apiKeyManager.validateAPIKey(key)
      await apiKeyManager.validateAPIKey(key)
      
      // New window should reset counter
      const result = await apiKeyManager.validateAPIKey(key)
      expect(result.valid).toBe(true)
      expect(metrics.recordLatency).toHaveBeenCalledTimes(3)
    })
  })
}) 
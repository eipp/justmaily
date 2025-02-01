import { Redis } from 'ioredis'
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'
import { MetricsService } from './metrics-service'

export interface SecurityConfig {
  encryptionKey: string
  redisUrl: string
  rateLimitWindow: number
  rateLimitMax: number
  scannerApiKey?: string
  scannerEndpoint?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

export interface ScanResult {
  safe: boolean
  threats: string[]
  score: number
  metadata: Record<string, any>
}

export class SecurityService {
  private redis: Redis
  private metrics: MetricsService
  private algorithm = 'aes-256-gcm'

  constructor(
    private config: SecurityConfig,
    metrics: MetricsService
  ) {
    this.redis = new Redis(config.redisUrl)
    this.metrics = metrics
  }

  // Encryption methods
  async encrypt(data: string): Promise<string> {
    try {
      const iv = randomBytes(16)
      const cipher = createCipheriv(
        this.algorithm,
        Buffer.from(this.config.encryptionKey, 'hex'),
        iv
      )
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const authTag = cipher.getAuthTag()

      const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
      
      this.metrics.increment('security.encryption.success')
      return result
    } catch (error) {
      this.metrics.increment('security.encryption.error')
      throw new Error('Encryption failed')
    }
  }

  async decrypt(data: string): Promise<string> {
    try {
      const [ivHex, authTagHex, encrypted] = data.split(':')
      
      const decipher = createDecipheriv(
        this.algorithm,
        Buffer.from(this.config.encryptionKey, 'hex'),
        Buffer.from(ivHex, 'hex')
      )
      
      decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      this.metrics.increment('security.decryption.success')
      return decrypted
    } catch (error) {
      this.metrics.increment('security.decryption.error')
      throw new Error('Decryption failed')
    }
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    window: number = this.config.rateLimitWindow,
    max: number = this.config.rateLimitMax
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const windowKey = `ratelimit:${key}:${Math.floor(now / window)}`

    try {
      const multi = this.redis.multi()
      multi.incr(windowKey)
      multi.pttl(windowKey)
      
      const [count, ttl] = await multi
        .expire(windowKey, Math.ceil(window / 1000))
        .exec()
        .then(results => results!.map(r => r[1]))

      const remaining = Math.max(0, max - (count as number))
      const reset = now + (ttl as number)
      const allowed = (count as number) <= max

      this.metrics.increment('security.ratelimit.check', {
        allowed: allowed.toString()
      })

      return { allowed, remaining, reset }
    } catch (error) {
      this.metrics.increment('security.ratelimit.error')
      // Default to allowing the request in case of Redis failure
      return { allowed: true, remaining: max, reset: now + window }
    }
  }

  // Content scanning
  async scanContent(content: string): Promise<ScanResult> {
    if (!this.config.scannerApiKey || !this.config.scannerEndpoint) {
      return { safe: true, threats: [], score: 0, metadata: {} }
    }

    try {
      // Here you would integrate with your content scanning service
      // For example, using a service like Google Cloud Content Safety API
      
      // Mock implementation
      const threats = this.mockScanContent(content)
      const safe = threats.length === 0
      const score = safe ? 0 : 0.8

      this.metrics.increment('security.scan.success', {
        safe: safe.toString()
      })

      return {
        safe,
        threats,
        score,
        metadata: {
          timestamp: Date.now(),
          contentLength: content.length
        }
      }
    } catch (error) {
      this.metrics.increment('security.scan.error')
      // Default to blocking suspicious content in case of scanner failure
      return {
        safe: false,
        threats: ['scanner_error'],
        score: 1,
        metadata: {
          error: 'Scanner service unavailable'
        }
      }
    }
  }

  // Hash generation
  async generateHash(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): Promise<string> {
    try {
      const hash = createHash(algorithm)
      hash.update(data)
      return hash.digest('hex')
    } catch (error) {
      this.metrics.increment('security.hash.error')
      throw new Error('Hash generation failed')
    }
  }

  // Token validation
  async validateToken(token: string): Promise<boolean> {
    try {
      const [timestamp, hash] = token.split('.')
      const expectedHash = await this.generateHash(
        `${timestamp}${this.config.encryptionKey}`
      )
      
      const valid = hash === expectedHash && 
        parseInt(timestamp) > Date.now() - 3600000 // 1 hour expiry

      this.metrics.increment('security.token.validation', {
        valid: valid.toString()
      })

      return valid
    } catch (error) {
      this.metrics.increment('security.token.error')
      return false
    }
  }

  // Generate secure token
  async generateToken(): Promise<string> {
    try {
      const timestamp = Date.now().toString()
      const hash = await this.generateHash(
        `${timestamp}${this.config.encryptionKey}`
      )
      
      this.metrics.increment('security.token.generation.success')
      return `${timestamp}.${hash}`
    } catch (error) {
      this.metrics.increment('security.token.generation.error')
      throw new Error('Token generation failed')
    }
  }

  // Private helper methods
  private mockScanContent(content: string): string[] {
    const threats: string[] = []
    const suspiciousPatterns = [
      { pattern: /\b(password|credit.?card|ssn)\b/i, threat: 'sensitive_data' },
      { pattern: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/, threat: 'suspicious_url' },
      { pattern: /\b(viagra|casino|lottery|prize)\b/i, threat: 'spam_keywords' },
      { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, threat: 'malicious_script' }
    ]

    for (const { pattern, threat } of suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push(threat)
      }
    }

    return threats
  }
} 
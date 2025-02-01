import { pgAudit } from '@justmaily/pg-audit'
import { VespaClient } from '@justmaily/temporal-core'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { z } from 'zod'

// Zod schema for config validation
export const SecurityConfigSchema = z.object({
  encryptionKey: z.string(),
  encryptionAlgorithm: z.string().optional().default('aes-256-gcm'),
  auditLogRetention: z.number().optional().default(90),
  gdprEnabled: z.boolean().optional().default(false),
  ipWhitelist: z.array(z.string()).optional().default([]),
  rateLimits: z.object({
    defaultRPS: z.number(),
    burstSize: z.number(),
    whitelistedIPs: z.array(z.string()).optional().default([])
  }).optional()
})

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>

export interface EncryptedData {
  encryptedData: string
  iv: string
  tag: string
}

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details: Record<string, unknown>
  ip?: string
}

export class SecurityService {
  private algorithm: string
  private auditLogger: typeof pgAudit
  
  constructor(
    private readonly config: SecurityConfig,
    private readonly vespa: VespaClient
  ) {
    const validatedConfig = SecurityConfigSchema.parse(config)
    this.algorithm = validatedConfig.encryptionAlgorithm
    this.auditLogger = pgAudit.configure({
      retention: validatedConfig.auditLogRetention,
      schema: 'audit',
      excludedTables: ['metrics', 'logs']
    })
  }

  async encrypt(data: Record<string, unknown>): Promise<EncryptedData> {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.algorithm, this.config.encryptionKey, iv)
    
    let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encryptedData += cipher.final('hex')
    
    return {
      encryptedData,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    }
  }

  async decrypt(encrypted: {
    encryptedData: string
    iv: string
    tag: string
  }): Promise<any> {
    const decipher = createDecipheriv(
      this.algorithm,
      this.config.encryptionKey,
      Buffer.from(encrypted.iv, 'hex')
    )
    
    ;(decipher as any).setAuthTag(Buffer.from(encrypted.tag, 'hex'))
    
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  }

  // Audit Logging
  async logAuditEvent(event: {
    action: string
    userId: string
    resource: string
    details: any
    ip?: string
  }): Promise<void> {
    await this.auditLogger.log({
      timestamp: new Date(),
      action: event.action,
      user_id: event.userId,
      resource: event.resource,
      details: event.details,
      ip_address: event.ip,
      success: true
    })

    await this.metrics.recordAuditEvent(event.action)
  }

  // GDPR Compliance
  async handleDataRequest(
    userId: string,
    requestType: 'export' | 'delete'
  ): Promise<void> {
    if (!this.config.gdprEnabled) {
      throw new Error('GDPR features are not enabled')
    }

    await this.logAuditEvent({
      action: `gdpr_${requestType}_request`,
      userId,
      resource: 'user_data',
      details: { requestType }
    })

    if (requestType === 'export') {
      const userData = await this.collectUserData(userId)
      await this.exportUserData(userId, userData)
    } else {
      await this.deleteUserData(userId)
    }
  }

  async validatePersonalData(data: any): Promise<{
    valid: boolean
    issues: string[]
  }> {
    const issues: string[] = []
    
    // Check for sensitive data patterns
    if (this.containsSensitiveData(data)) {
      issues.push('Contains unencrypted sensitive data')
    }
    
    // Validate consent
    if (!this.hasValidConsent(data)) {
      issues.push('Missing valid consent')
    }
    
    // Check retention periods
    if (this.exceedsRetentionPeriod(data)) {
      issues.push('Exceeds data retention period')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  // Rate Limiting
  async checkRateLimit(
    ip: string,
    action: string
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: Date
  }> {
    const key = `ratelimit:${ip}:${action}`
    const limit = this.getRateLimit(ip)
    
    const current = await this.metrics.getRateLimitMetrics(key)
    
    if (current.count >= limit) {
      await this.metrics.recordRateLimitExceeded(ip, action)
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    await this.metrics.incrementRateLimit(key)
    
    return {
      allowed: true,
      remaining: limit - current.count - 1,
      resetTime: current.resetTime
    }
  }

  // IP Whitelisting
  isIpWhitelisted(ip: string): boolean {
    return this.config.ipWhitelist?.includes(ip) || false
  }

  // Helper Methods
  private async collectUserData(userId: string): Promise<any> {
    const query = {
      yql: `select * from user_data where user_id = "${userId}"`,
      ranking: 'user-data-ranking'
    }
    
    return await this.vespa.query(query)
  }

  private async exportUserData(userId: string, data: any): Promise<void> {
    // Implementation for exporting user data in GDPR-compliant format
  }

  private async deleteUserData(userId: string): Promise<void> {
    // Implementation for secure data deletion
    const tables = ['user_data', 'analytics', 'messages']
    
    for (const table of tables) {
      await this.vespa.deleteDocument(table, userId)
    }
  }

  private containsSensitiveData(data: any): boolean {
    // Implementation for checking sensitive data patterns
    return false
  }

  private hasValidConsent(data: any): boolean {
    // Implementation for validating consent
    return true
  }

  private exceedsRetentionPeriod(data: any): boolean {
    // Implementation for checking retention periods
    return false
  }

  private getRateLimit(ip: string): number {
    if (this.config.rateLimits?.whitelistedIPs?.includes(ip)) {
      return Infinity
    }
    return this.config.rateLimits?.defaultRPS || 10
  }
} 
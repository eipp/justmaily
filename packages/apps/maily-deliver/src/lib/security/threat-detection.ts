import { MatrixMessaging } from '@justmaily/temporal-core'
import { Redis } from 'ioredis'

import { MetricsService } from '../monitoring'
import { SecurityService } from './security'

interface ThreatConfig {
  enabled: boolean
  rules: {
    rateLimit: {
      maxRequests: number
      windowSeconds: number
      blockDuration: number
    }
    bruteForce: {
      maxAttempts: number
      windowSeconds: number
      blockDuration: number
    }
    ipReputation: {
      checkEnabled: boolean
      blockThreshold: number
      providers: string[]
    }
    anomalyDetection: {
      enabled: boolean
      sensitivityLevel: number
      learningPeriod: number
    }
    malwareScanning: {
      enabled: boolean
      maxFileSize: number
      scanTimeout: number
    }
  }
  notifications: {
    enabled: boolean
    channels: ('matrix' | 'email' | 'webhook')[]
    severity: ('info' | 'warning' | 'critical')[]
  }
  autoResponse: {
    enabled: boolean
    actions: ('block' | 'throttle' | 'notify')[]
  }
}

interface ThreatEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: {
    ip?: string
    userId?: string
    userAgent?: string
    location?: string
  }
  details: Record<string, any>
  timestamp: Date
}

interface BlockedEntity {
  id: string
  type: 'ip' | 'user' | 'session'
  reason: string
  expiresAt: Date
  details: Record<string, any>
}

export class ThreatDetection {
  private redis: Redis
  private blockedEntities: Map<string, BlockedEntity> = new Map()
  private anomalyBaselines: Map<string, number[]> = new Map()
  
  constructor(
    private config: ThreatConfig,
    private metrics: MetricsService,
    private security: SecurityService,
    private matrix: MatrixMessaging,
    redisUrl: string
  ) {
    this.redis = new Redis(redisUrl)
    this.initializeService()
  }

  // Threat Detection
  async detectThreats(
    context: {
      ip?: string
      userId?: string
      action: string
      userAgent?: string
      payload?: any
    }
  ): Promise<ThreatEvent[]> {
    if (!this.config.enabled) return []

    try {
      const startTime = Date.now()
      const threats: ThreatEvent[] = []
      
      // Run all enabled detection methods in parallel
      const [
        rateLimitThreats,
        bruteForceThreats,
        reputationThreats,
        anomalyThreats,
        malwareThreats
      ] = await Promise.all([
        this.checkRateLimit(context),
        this.checkBruteForce(context),
        this.checkIpReputation(context.ip),
        this.detectAnomalies(context),
        this.scanForMalware(context.payload)
      ])

      threats.push(...rateLimitThreats)
      threats.push(...bruteForceThreats)
      threats.push(...reputationThreats)
      threats.push(...anomalyThreats)
      threats.push(...malwareThreats)

      // Record metrics
      await this.metrics.recordLatency(
        'threat_detection',
        Date.now() - startTime
      )
      
      if (threats.length > 0) {
        await this.handleThreats(threats)
      }

      return threats
    } catch (error) {
      await this.metrics.recordError('threat_detection', error.message)
      throw error
    }
  }

  // Threat Response
  async handleThreats(threats: ThreatEvent[]): Promise<void> {
    try {
      const startTime = Date.now()
      
      for (const threat of threats) {
        // Record threat
        await this.recordThreat(threat)
        
        // Apply automatic responses
        if (this.config.autoResponse.enabled) {
          await this.applyAutoResponse(threat)
        }
        
        // Send notifications
        if (this.config.notifications.enabled) {
          await this.notifyThreat(threat)
        }
      }

      await this.metrics.recordLatency(
        'threat_response',
        Date.now() - startTime
      )
    } catch (error) {
      await this.metrics.recordError('threat_response', error.message)
      throw error
    }
  }

  // Blocking Management
  async blockEntity(
    entity: {
      id: string
      type: BlockedEntity['type']
      reason: string
      duration: number
    }
  ): Promise<void> {
    try {
      const blockedEntity: BlockedEntity = {
        id: entity.id,
        type: entity.type,
        reason: entity.reason,
        expiresAt: new Date(Date.now() + entity.duration),
        details: {
          blockedAt: new Date(),
          blockedBy: 'threat-detection'
        }
      }

      // Store in memory and Redis
      this.blockedEntities.set(entity.id, blockedEntity)
      await this.redis.setex(
        `blocked:${entity.type}:${entity.id}`,
        Math.floor(entity.duration / 1000),
        JSON.stringify(blockedEntity)
      )

      // Record metrics
      await this.metrics.incrementCounter('entities_blocked')
      
      // Audit log
      await this.security.logAuditEvent({
        action: 'entity_blocked',
        userId: entity.type === 'user' ? entity.id : undefined,
        resource: 'security',
        details: blockedEntity
      })
    } catch (error) {
      await this.metrics.recordError('block_entity', error.message)
      throw error
    }
  }

  async isBlocked(
    id: string,
    type: BlockedEntity['type']
  ): Promise<boolean> {
    try {
      // Check memory cache first
      if (this.blockedEntities.has(id)) {
        const entity = this.blockedEntities.get(id)!
        if (entity.expiresAt > new Date()) {
          return true
        }
        this.blockedEntities.delete(id)
      }

      // Check Redis
      const blocked = await this.redis.get(`blocked:${type}:${id}`)
      if (blocked) {
        const entity: BlockedEntity = JSON.parse(blocked)
        if (new Date(entity.expiresAt) > new Date()) {
          this.blockedEntities.set(id, entity)
          return true
        }
        await this.redis.del(`blocked:${type}:${id}`)
      }

      return false
    } catch (error) {
      await this.metrics.recordError('check_blocked', error.message)
      return false
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      // Load blocked entities from Redis
      const keys = await this.redis.keys('blocked:*')
      for (const key of keys) {
        const blocked = await this.redis.get(key)
        if (blocked) {
          const entity: BlockedEntity = JSON.parse(blocked)
          if (new Date(entity.expiresAt) > new Date()) {
            this.blockedEntities.set(entity.id, entity)
          } else {
            await this.redis.del(key)
          }
        }
      }

      // Initialize anomaly detection baselines
      if (this.config.rules.anomalyDetection.enabled) {
        await this.initializeAnomalyBaselines()
      }

      // Setup metrics
      this.setupMetrics()
    } catch (error) {
      console.error('Failed to initialize threat detection:', error)
    }
  }

  private async checkRateLimit(context: any): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = []
    const { maxRequests, windowSeconds } = this.config.rules.rateLimit
    
    if (context.ip) {
      const requests = await this.redis.incr(`ratelimit:${context.ip}`)
      await this.redis.expire(`ratelimit:${context.ip}`, windowSeconds)
      
      if (requests > maxRequests) {
        threats.push({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          source: { ip: context.ip },
          details: { requests, threshold: maxRequests },
          timestamp: new Date()
        })
      }
    }
    
    return threats
  }

  private async checkBruteForce(context: any): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = []
    const { maxAttempts, windowSeconds } = this.config.rules.bruteForce
    
    if (context.action === 'login' && context.userId) {
      const attempts = await this.redis.incr(`bruteforce:${context.userId}`)
      await this.redis.expire(`bruteforce:${context.userId}`, windowSeconds)
      
      if (attempts > maxAttempts) {
        threats.push({
          type: 'brute_force_attempt',
          severity: 'high',
          source: { 
            userId: context.userId,
            ip: context.ip
          },
          details: { attempts, threshold: maxAttempts },
          timestamp: new Date()
        })
      }
    }
    
    return threats
  }

  private async checkIpReputation(ip?: string): Promise<ThreatEvent[]> {
    if (!ip || !this.config.rules.ipReputation.checkEnabled) {
      return []
    }

    const threats: ThreatEvent[] = []
    const { blockThreshold, providers } = this.config.rules.ipReputation
    
    // Check IP reputation across configured providers
    for (const provider of providers) {
      const score = await this.checkIpReputationProvider(provider, ip)
      if (score > blockThreshold) {
        threats.push({
          type: 'bad_ip_reputation',
          severity: 'high',
          source: { ip },
          details: { provider, score, threshold: blockThreshold },
          timestamp: new Date()
        })
      }
    }
    
    return threats
  }

  private async detectAnomalies(context: any): Promise<ThreatEvent[]> {
    if (!this.config.rules.anomalyDetection.enabled) {
      return []
    }

    const threats: ThreatEvent[] = []
    const { sensitivityLevel } = this.config.rules.anomalyDetection
    
    // Check for behavioral anomalies
    const anomalyScore = await this.calculateAnomalyScore(context)
    if (anomalyScore > sensitivityLevel) {
      threats.push({
        type: 'behavioral_anomaly',
        severity: 'medium',
        source: {
          userId: context.userId,
          ip: context.ip
        },
        details: { 
          score: anomalyScore,
          threshold: sensitivityLevel
        },
        timestamp: new Date()
      })
    }
    
    return threats
  }

  private async scanForMalware(payload: any): Promise<ThreatEvent[]> {
    if (!payload || !this.config.rules.malwareScanning.enabled) {
      return []
    }

    const threats: ThreatEvent[] = []
    
    // Scan payload for malware signatures
    const scanResult = await this.performMalwareScan(payload)
    if (scanResult.detected) {
      threats.push({
        type: 'malware_detected',
        severity: 'critical',
        source: {},
        details: scanResult,
        timestamp: new Date()
      })
    }
    
    return threats
  }

  private async recordThreat(threat: ThreatEvent): Promise<void> {
    // Store threat event in Redis
    const key = `threat:${threat.type}:${Date.now()}`
    await this.redis.setex(
      key,
      86400 * 30, // 30 days retention
      JSON.stringify(threat)
    )

    // Update threat statistics
    await this.redis.hincrby(
      'threat_stats',
      threat.type,
      1
    )

    // Record metrics
    await this.metrics.incrementCounter(`threats_detected_${threat.type}`)
  }

  private async applyAutoResponse(threat: ThreatEvent): Promise<void> {
    const { actions } = this.config.autoResponse
    
    for (const action of actions) {
      switch (action) {
        case 'block':
          if (threat.source.ip) {
            await this.blockEntity({
              id: threat.source.ip,
              type: 'ip',
              reason: threat.type,
              duration: this.config.rules.rateLimit.blockDuration
            })
          }
          break
          
        case 'throttle':
          // Implement throttling logic
          break
          
        case 'notify':
          await this.notifyThreat(threat)
          break
      }
    }
  }

  private async notifyThreat(threat: ThreatEvent): Promise<void> {
    const { channels, severity } = this.config.notifications
    
    if (severity.includes(threat.severity as any)) {
      for (const channel of channels) {
        switch (channel) {
          case 'matrix':
            await this.matrix.sendNotification(
              'Security Threat Detected',
              JSON.stringify(threat, null, 2),
              { priority: 'high' }
            )
            break
            
          case 'email':
            // Implement email notification
            break
            
          case 'webhook':
            // Implement webhook notification
            break
        }
      }
    }
  }

  private async checkIpReputationProvider(
    provider: string,
    ip: string
  ): Promise<number> {
    // Implementation for checking IP reputation
    return 0
  }

  private async calculateAnomalyScore(context: any): Promise<number> {
    // Implementation for anomaly detection
    return 0
  }

  private async performMalwareScan(payload: any): Promise<{
    detected: boolean
    details?: any
  }> {
    // Implementation for malware scanning
    return { detected: false }
  }

  private async initializeAnomalyBaselines(): Promise<void> {
    // Implementation for initializing anomaly detection baselines
  }

  private setupMetrics(): void {
    this.metrics.registerCounter(
      'threats_detected_total',
      'Total number of threats detected'
    )
    this.metrics.registerCounter(
      'entities_blocked',
      'Total number of entities blocked'
    )
    this.metrics.registerHistogram(
      'threat_detection_latency',
      'Threat detection latency in seconds',
      [0.1, 0.5, 1, 2, 5]
    )
  }
} 
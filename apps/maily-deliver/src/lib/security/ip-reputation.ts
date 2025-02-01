import axios from 'axios'
import { Redis } from 'ioredis'

import { MetricsService } from '../monitoring'
import { SecurityService } from './security'

interface IPReputationConfig {
  providers: {
    abuseIPDB?: {
      apiKey: string
      scoreThreshold: number
      maxAge: number
    }
    ipQualityScore?: {
      apiKey: string
      scoreThreshold: number
      strictMode: boolean
    }
    ipRegistry?: {
      apiKey: string
      riskThreshold: number
      includeThreatTypes: boolean
    }
  }
  caching: {
    enabled: boolean
    ttl: number
  }
}

interface ReputationScore {
  score: number
  provider: string
  confidence: number
  categories: string[]
  lastChecked: Date
  details: Record<string, any>
}

export class IPReputationService {
  private redis: Redis
  private cache: Map<string, ReputationScore> = new Map()
  
  constructor(
    private config: IPReputationConfig,
    private metrics: MetricsService,
    private security: SecurityService,
    redisUrl: string
  ) {
    this.redis = new Redis(redisUrl)
    this.initializeService()
  }

  async checkReputation(ip: string): Promise<ReputationScore[]> {
    try {
      const startTime = Date.now()
      
      // Check cache first
      if (this.config.caching.enabled) {
        const cached = await this.getCachedScore(ip)
        if (cached) {
          await this.metrics.recordLatency(
            'ip_reputation_cache_hit',
            Date.now() - startTime
          )
          return cached
        }
      }

      // Query all configured providers in parallel
      const scores = await Promise.all([
        this.config.providers.abuseIPDB && this.checkAbuseIPDB(ip),
        this.config.providers.ipQualityScore && this.checkIPQualityScore(ip),
        this.config.providers.ipRegistry && this.checkIPRegistry(ip)
      ].filter(Boolean))

      const validScores = scores.filter(Boolean) as ReputationScore[]
      
      // Cache results
      if (this.config.caching.enabled && validScores.length > 0) {
        await this.cacheScores(ip, validScores)
      }

      await this.metrics.recordLatency(
        'ip_reputation_check',
        Date.now() - startTime
      )
      
      return validScores
    } catch (error) {
      await this.metrics.recordError('ip_reputation_check', error.message)
      throw error
    }
  }

  async getReputationStats(): Promise<{
    totalChecks: number
    averageScore: number
    highRiskCount: number
    providerStats: Record<string, {
      checks: number
      averageScore: number
    }>
  }> {
    try {
      const stats = await this.redis.hgetall('ip_reputation_stats')
      return {
        totalChecks: parseInt(stats.total_checks || '0'),
        averageScore: parseFloat(stats.average_score || '0'),
        highRiskCount: parseInt(stats.high_risk_count || '0'),
        providerStats: JSON.parse(stats.provider_stats || '{}')
      }
    } catch (error) {
      await this.metrics.recordError('ip_reputation_stats', error.message)
      throw error
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      // Setup metrics
      this.setupMetrics()
      
      // Load cache from Redis if enabled
      if (this.config.caching.enabled) {
        await this.loadCache()
      }
    } catch (error) {
      console.error('Failed to initialize IP reputation service:', error)
    }
  }

  private async checkAbuseIPDB(ip: string): Promise<ReputationScore | null> {
    try {
      const { apiKey, scoreThreshold, maxAge } = this.config.providers.abuseIPDB!
      
      const response = await axios.get(
        'https://api.abuseipdb.com/api/v2/check',
        {
          params: {
            ipAddress: ip,
            maxAgeInDays: maxAge,
            verbose: true
          },
          headers: {
            'Key': apiKey,
            'Accept': 'application/json'
          }
        }
      )

      const data = response.data.data
      
      return {
        score: data.abuseConfidenceScore,
        provider: 'abuseipdb',
        confidence: data.abuseConfidenceScore / 100,
        categories: data.reports?.map((r: any) => r.category) || [],
        lastChecked: new Date(),
        details: {
          totalReports: data.totalReports,
          lastReportedAt: data.lastReportedAt,
          countryCode: data.countryCode,
          usageType: data.usageType
        }
      }
    } catch (error) {
      await this.metrics.recordError('abuseipdb_check', error.message)
      return null
    }
  }

  private async checkIPQualityScore(ip: string): Promise<ReputationScore | null> {
    try {
      const { apiKey, scoreThreshold, strictMode } = this.config.providers.ipQualityScore!
      
      const response = await axios.get(
        `https://ipqualityscore.com/api/json/ip/${apiKey}/${ip}`,
        {
          params: {
            strictness: strictMode ? 2 : 1,
            fast: false,
            lighter_penalties: false
          }
        }
      )

      const data = response.data
      
      return {
        score: data.fraud_score,
        provider: 'ipqualityscore',
        confidence: data.fraud_score / 100,
        categories: [
          ...(data.proxy ? ['proxy'] : []),
          ...(data.vpn ? ['vpn'] : []),
          ...(data.tor ? ['tor'] : []),
          ...(data.bot_status ? ['bot'] : [])
        ],
        lastChecked: new Date(),
        details: {
          isp: data.ISP,
          organization: data.organization,
          asn: data.ASN,
          countryCode: data.country_code,
          recentAbuse: data.recent_abuse,
          botStatus: data.bot_status,
          mobile: data.mobile
        }
      }
    } catch (error) {
      await this.metrics.recordError('ipqualityscore_check', error.message)
      return null
    }
  }

  private async checkIPRegistry(ip: string): Promise<ReputationScore | null> {
    try {
      const { apiKey, riskThreshold, includeThreatTypes } = this.config.providers.ipRegistry!
      
      const response = await axios.get(
        `https://api.ipregistry.co/${ip}`,
        {
          params: {
            key: apiKey
          }
        }
      )

      const data = response.data
      const security = data.security || {}
      
      return {
        score: security.risk_score || 0,
        provider: 'ipregistry',
        confidence: (security.risk_score || 0) / 100,
        categories: Object.entries(security)
          .filter(([key, value]) => value === true)
          .map(([key]) => key),
        lastChecked: new Date(),
        details: {
          company: data.company,
          carrier: data.carrier,
          connection: data.connection,
          currency: data.currency,
          timezone: data.time_zone,
          threats: includeThreatTypes ? security : undefined
        }
      }
    } catch (error) {
      await this.metrics.recordError('ipregistry_check', error.message)
      return null
    }
  }

  private async getCachedScore(ip: string): Promise<ReputationScore[] | null> {
    // Check memory cache first
    if (this.cache.has(ip)) {
      return [this.cache.get(ip)!]
    }

    // Check Redis cache
    const cached = await this.redis.get(`ip_reputation:${ip}`)
    if (cached) {
      const scores = JSON.parse(cached)
      scores.forEach((score: ReputationScore) => {
        this.cache.set(ip, score)
      })
      return scores
    }

    return null
  }

  private async cacheScores(
    ip: string,
    scores: ReputationScore[]
  ): Promise<void> {
    // Update memory cache
    scores.forEach(score => {
      this.cache.set(ip, score)
    })

    // Update Redis cache
    await this.redis.setex(
      `ip_reputation:${ip}`,
      this.config.caching.ttl,
      JSON.stringify(scores)
    )
  }

  private async loadCache(): Promise<void> {
    const keys = await this.redis.keys('ip_reputation:*')
    for (const key of keys) {
      const cached = await this.redis.get(key)
      if (cached) {
        const scores = JSON.parse(cached)
        const ip = key.split(':')[1]
        scores.forEach((score: ReputationScore) => {
          this.cache.set(ip, score)
        })
      }
    }
  }

  private setupMetrics(): void {
    this.metrics.registerCounter(
      'ip_reputation_checks_total',
      'Total number of IP reputation checks'
    )
    this.metrics.registerCounter(
      'ip_reputation_cache_hits',
      'Number of IP reputation cache hits'
    )
    this.metrics.registerHistogram(
      'ip_reputation_check_latency',
      'IP reputation check latency in seconds',
      [0.1, 0.5, 1, 2, 5]
    )
    this.metrics.registerGauge(
      'ip_reputation_cache_size',
      'Current size of IP reputation cache'
    )
  }
} 
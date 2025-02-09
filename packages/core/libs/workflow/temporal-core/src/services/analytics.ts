import { MetricsService } from '../monitoring/metrics'

export interface AnalyticsServiceConfig {
  provider: string
  apiKey: string
  apiEndpoint: string
  batchSize: number
  flushInterval: number
  retryOptions: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
  }
}

export interface AnalyticsEvent {
  type: string
  userId?: string
  properties: Record<string, any>
  timestamp?: string
  context?: {
    ip?: string
    userAgent?: string
    locale?: string
    timezone?: string
    campaign?: string
    source?: string
    medium?: string
  }
}

export interface AnalyticsResult {
  eventId: string
  status: string
  timestamp: string
  provider: string
  metadata: {
    duration: number
    attempts: number
    error?: string
  }
}

export class AnalyticsService {
  private eventQueue: AnalyticsEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor(
    private config: AnalyticsServiceConfig,
    private metrics: MetricsService
  ) {
    this.startFlushTimer()
  }

  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    const startTime = Date.now()

    try {
      // Enrich event with timestamp if not provided
      const enrichedEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      }

      // Add to queue
      this.eventQueue.push(enrichedEvent)

      // Flush if queue size exceeds batch size
      if (this.eventQueue.length >= this.config.batchSize) {
        await this.flush()
      }

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('analytics_track', duration)
      await this.metrics.recordEvent('analytics_event_tracked')

      return {
        eventId: `evt_${Date.now()}`,
        status: 'queued',
        timestamp: enrichedEvent.timestamp,
        provider: this.config.provider,
        metadata: {
          duration,
          attempts: 1
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('analytics_track', errorMessage)
      throw error
    }
  }

  private async flush(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true
    const startTime = Date.now()
    let attempts = 0

    try {
      const events = this.eventQueue.splice(0, this.config.batchSize)
      let error: Error | undefined

      while (attempts < this.config.retryOptions.maxAttempts) {
        try {
          await this.sendEvents(events)
          
          const duration = Date.now() - startTime
          await this.metrics.recordLatency('analytics_flush', duration)
          await this.metrics.recordEvent('analytics_events_flushed', events.length)
          break
        } catch (e) {
          error = e instanceof Error ? e : new Error(String(e))
          attempts++
          
          if (attempts < this.config.retryOptions.maxAttempts) {
            await this.sleep(
              Math.min(
                this.config.retryOptions.maxDelay,
                this.config.retryOptions.initialDelay * Math.pow(2, attempts)
              )
            )
          } else {
            // Put events back in queue on final failure
            this.eventQueue.unshift(...events)
            await this.metrics.recordError('analytics_flush', error.message)
            throw error
          }
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // Mock implementation
    await this.sleep(100)
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(
      () => this.flush(),
      this.config.flushInterval
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // Flush remaining events
    if (this.eventQueue.length > 0) {
      await this.flush()
    }
  }

  async getUserFeatures(userId: string): Promise<Record<string, any>> {
    const startTime = Date.now()

    try {
      // Mock implementation - in production, this would fetch real user data
      const features = {
        timezone: 'UTC',
        locale: 'en-US',
        engagement_level: 'high',
        preferred_time: '10:00',
        active_days: ['Monday', 'Wednesday', 'Friday'],
        interests: ['marketing', 'technology', 'business'],
        email_client: 'gmail',
        device_type: 'desktop',
        subscription_status: 'active',
        last_interaction: new Date().toISOString()
      }

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('get_user_features', duration)
      await this.metrics.recordEvent('user_features_retrieved')

      return features
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('get_user_features', errorMessage)
      throw error
    }
  }
} 
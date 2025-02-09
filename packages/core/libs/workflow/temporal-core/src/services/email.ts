import { MetricsService } from '../monitoring/metrics'

export interface EmailServiceConfig {
  provider: string
  apiKey: string
  apiEndpoint: string
  defaultSender: string
  rateLimits: {
    maxPerSecond: number
    maxPerMinute: number
    maxPerHour: number
  }
  retryOptions: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
  }
}

export interface EmailOptions {
  sender?: string
  replyTo?: string
  subject: string
  template?: string
  variables?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
  trackOpens?: boolean
  trackClicks?: boolean
  metadata?: Record<string, any>
}

export interface EmailResult {
  messageId: string
  status: string
  timestamp: string
  provider: string
  metadata: {
    duration: number
    attempts: number
    error?: string
  }
}

export class EmailService {
  private rateLimitTokens: {
    perSecond: number
    perMinute: number
    perHour: number
  }
  private lastRefill: {
    perSecond: number
    perMinute: number
    perHour: number
  }

  constructor(
    private config: EmailServiceConfig,
    private metrics: MetricsService
  ) {
    this.rateLimitTokens = {
      perSecond: config.rateLimits.maxPerSecond,
      perMinute: config.rateLimits.maxPerMinute,
      perHour: config.rateLimits.maxPerHour
    }
    this.lastRefill = {
      perSecond: Date.now(),
      perMinute: Date.now(),
      perHour: Date.now()
    }
  }

  async send(
    recipient: string,
    content: string,
    options: EmailOptions
  ): Promise<EmailResult> {
    const startTime = Date.now()
    let attempts = 0

    try {
      // Check rate limits
      await this.checkRateLimits()

      // Prepare email
      const email = {
        from: options.sender || this.config.defaultSender,
        to: recipient,
        replyTo: options.replyTo,
        subject: options.subject,
        html: content,
        template: options.template,
        variables: options.variables,
        attachments: options.attachments,
        trackOpens: options.trackOpens ?? true,
        trackClicks: options.trackClicks ?? true,
        metadata: {
          ...options.metadata,
          provider: this.config.provider
        }
      }

      // Send email with retries
      let error: Error | undefined
      while (attempts < this.config.retryOptions.maxAttempts) {
        try {
          const result = await this.sendWithProvider(email)
          
          // Record metrics
          const duration = Date.now() - startTime
          await this.metrics.recordLatency('email_send', duration)
          await this.metrics.recordEvent('email_sent')
          await this.metrics.recordEmailSent(
            this.config.provider,
            options.template || 'default',
            'success'
          )

          return {
            messageId: result.id,
            status: 'sent',
            timestamp: new Date().toISOString(),
            provider: this.config.provider,
            metadata: {
              duration,
              attempts: attempts + 1
            }
          }
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
          }
        }
      }

      // Record failure metrics
      await this.metrics.recordError('email_send', error?.message || 'Unknown error')
      await this.metrics.recordEmailSent(
        this.config.provider,
        options.template || 'default',
        'failed'
      )

      throw error
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('email_send', errorMessage)
      throw error
    }
  }

  private async sendWithProvider(email: any): Promise<any> {
    // Mock provider implementation
    return {
      id: `msg_${Date.now()}`,
      status: 'sent'
    }
  }

  private async checkRateLimits(): Promise<void> {
    const now = Date.now()

    // Refill tokens
    this.refillTokens('perSecond', now, 1000)
    this.refillTokens('perMinute', now, 60000)
    this.refillTokens('perHour', now, 3600000)

    // Check if we have enough tokens
    if (
      this.rateLimitTokens.perSecond <= 0 ||
      this.rateLimitTokens.perMinute <= 0 ||
      this.rateLimitTokens.perHour <= 0
    ) {
      throw new Error('Rate limit exceeded')
    }

    // Consume tokens
    this.rateLimitTokens.perSecond--
    this.rateLimitTokens.perMinute--
    this.rateLimitTokens.perHour--
  }

  private refillTokens(
    type: 'perSecond' | 'perMinute' | 'perHour',
    now: number,
    interval: number
  ): void {
    const timeSinceLastRefill = now - this.lastRefill[type]
    const tokensToAdd = Math.floor(timeSinceLastRefill / interval)

    if (tokensToAdd > 0) {
      this.rateLimitTokens[type] = Math.min(
        this.config.rateLimits[type],
        this.rateLimitTokens[type] + tokensToAdd
      )
      this.lastRefill[type] = now
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 
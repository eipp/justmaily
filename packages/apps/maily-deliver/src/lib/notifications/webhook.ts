import axios from 'axios'
import { createHmac } from 'crypto'
import { Redis } from 'ioredis'

import { MetricsService } from '../monitoring'
import { SecurityService } from '../security'

interface WebhookConfig {
  enabled: boolean
  endpoints: WebhookEndpoint[]
  retries: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
    backoffFactor: number
  }
  timeout: number
  batchSize: number
  signatureHeader: string
  secretKey: string
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  headers?: Record<string, string>
  enabled: boolean
  retryConfig?: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
  }
  timeout?: number
  format?: 'json' | 'form' | 'xml'
  version?: string
}

interface WebhookEvent {
  id: string
  type: string
  timestamp: Date
  data: any
  metadata?: Record<string, any>
}

interface WebhookDelivery {
  id: string
  endpoint: string
  event: WebhookEvent
  attempts: number
  status: 'pending' | 'success' | 'failed'
  lastAttempt?: {
    timestamp: Date
    statusCode?: number
    error?: string
    response?: any
  }
  nextRetry?: Date
}

export class WebhookNotifier {
  private redis: Redis
  private deliveryQueue: Map<string, WebhookDelivery> = new Map()
  private processingInterval: NodeJS.Timeout
  
  constructor(
    private config: WebhookConfig,
    private metrics: MetricsService,
    private security: SecurityService,
    redisUrl: string
  ) {
    this.redis = new Redis(redisUrl)
    this.initializeService()
  }

  async notify(event: WebhookEvent): Promise<void> {
    try {
      const startTime = Date.now()
      
      // Find matching endpoints
      const endpoints = this.config.endpoints.filter(endpoint =>
        endpoint.enabled && endpoint.events.includes(event.type)
      )

      if (endpoints.length === 0) {
        return
      }

      // Create delivery records
      const deliveries = endpoints.map(endpoint => ({
        id: `${event.id}-${endpoint.id}`,
        endpoint: endpoint.id,
        event,
        attempts: 0,
        status: 'pending' as const,
        nextRetry: new Date()
      }))

      // Store deliveries
      await Promise.all(
        deliveries.map(delivery =>
          this.storeDelivery(delivery)
        )
      )

      await this.metrics.recordLatency(
        'webhook_notify',
        Date.now() - startTime
      )
    } catch (error) {
      await this.metrics.recordError('webhook_notify', error.message)
      throw error
    }
  }

  async getDeliveryStatus(deliveryId: string): Promise<WebhookDelivery | null> {
    try {
      // Check memory cache first
      if (this.deliveryQueue.has(deliveryId)) {
        return this.deliveryQueue.get(deliveryId)!
      }

      // Check Redis
      const delivery = await this.redis.get(`webhook_delivery:${deliveryId}`)
      if (delivery) {
        const parsed = JSON.parse(delivery)
        this.deliveryQueue.set(deliveryId, parsed)
        return parsed
      }

      return null
    } catch (error) {
      await this.metrics.recordError('webhook_status', error.message)
      throw error
    }
  }

  async retryDelivery(deliveryId: string): Promise<void> {
    try {
      const delivery = await this.getDeliveryStatus(deliveryId)
      if (!delivery) {
        throw new Error('Delivery not found')
      }

      if (delivery.status !== 'failed') {
        throw new Error('Only failed deliveries can be retried')
      }

      // Reset delivery status
      delivery.status = 'pending'
      delivery.attempts = 0
      delivery.nextRetry = new Date()

      // Store updated delivery
      await this.storeDelivery(delivery)
    } catch (error) {
      await this.metrics.recordError('webhook_retry', error.message)
      throw error
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      // Load pending deliveries from Redis
      await this.loadPendingDeliveries()
      
      // Start processing queue
      this.startProcessing()
      
      // Setup metrics
      this.setupMetrics()
    } catch (error) {
      console.error('Failed to initialize webhook notifier:', error)
    }
  }

  private async loadPendingDeliveries(): Promise<void> {
    const keys = await this.redis.keys('webhook_delivery:*')
    for (const key of keys) {
      const delivery = await this.redis.get(key)
      if (delivery) {
        const parsed = JSON.parse(delivery)
        if (parsed.status === 'pending') {
          this.deliveryQueue.set(parsed.id, parsed)
        }
      }
    }
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(
      async () => {
        try {
          await this.processQueue()
        } catch (error) {
          console.error('Webhook processing error:', error)
        }
      },
      1000
    )
  }

  private async processQueue(): Promise<void> {
    const now = new Date()
    const pending = Array.from(this.deliveryQueue.values())
      .filter(d => 
        d.status === 'pending' && 
        (!d.nextRetry || d.nextRetry <= now)
      )
      .slice(0, this.config.batchSize)

    if (pending.length === 0) {
      return
    }

    await Promise.all(
      pending.map(delivery =>
        this.processDelivery(delivery)
      )
    )
  }

  private async processDelivery(delivery: WebhookDelivery): Promise<void> {
    const endpoint = this.config.endpoints.find(e => e.id === delivery.endpoint)
    if (!endpoint) {
      delivery.status = 'failed'
      delivery.lastAttempt = {
        timestamp: new Date(),
        error: 'Endpoint not found'
      }
      await this.storeDelivery(delivery)
      return
    }

    try {
      const payload = this.formatPayload(delivery.event, endpoint)
      const signature = this.signPayload(payload)
      
      const response = await axios.post(
        endpoint.url,
        payload,
        {
          headers: {
            'Content-Type': this.getContentType(endpoint),
            [this.config.signatureHeader]: signature,
            ...endpoint.headers
          },
          timeout: endpoint.timeout || this.config.timeout
        }
      )

      delivery.status = 'success'
      delivery.lastAttempt = {
        timestamp: new Date(),
        statusCode: response.status,
        response: response.data
      }

      await this.metrics.incrementCounter('webhook_delivery_success')
    } catch (error) {
      delivery.attempts++
      delivery.lastAttempt = {
        timestamp: new Date(),
        error: error.message,
        statusCode: error.response?.status
      }

      const retryConfig = {
        ...this.config.retries,
        ...endpoint.retryConfig
      }

      if (delivery.attempts >= retryConfig.maxAttempts) {
        delivery.status = 'failed'
        await this.metrics.incrementCounter('webhook_delivery_failed')
      } else {
        delivery.status = 'pending'
        delivery.nextRetry = this.calculateNextRetry(
          delivery.attempts,
          retryConfig
        )
        await this.metrics.incrementCounter('webhook_delivery_retry')
      }
    }

    await this.storeDelivery(delivery)
  }

  private async storeDelivery(delivery: WebhookDelivery): Promise<void> {
    // Update memory queue
    if (delivery.status === 'pending') {
      this.deliveryQueue.set(delivery.id, delivery)
    } else {
      this.deliveryQueue.delete(delivery.id)
    }

    // Store in Redis
    await this.redis.set(
      `webhook_delivery:${delivery.id}`,
      JSON.stringify(delivery),
      'EX',
      86400 * 30 // 30 days retention
    )
  }

  private formatPayload(
    event: WebhookEvent,
    endpoint: WebhookEndpoint
  ): any {
    const base = {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      data: event.data,
      metadata: {
        ...event.metadata,
        version: endpoint.version || '1.0'
      }
    }

    switch (endpoint.format) {
      case 'form':
        return new URLSearchParams(this.flattenObject(base)).toString()
      case 'xml':
        return this.convertToXML(base)
      default:
        return base
    }
  }

  private flattenObject(
    obj: any,
    prefix = ''
  ): Record<string, string> {
    return Object.keys(obj).reduce((acc: any, key) => {
      const value = obj[key]
      const newKey = prefix ? `${prefix}[${key}]` : key
      
      if (typeof value === 'object' && value !== null) {
        Object.assign(acc, this.flattenObject(value, newKey))
      } else {
        acc[newKey] = String(value)
      }
      
      return acc
    }, {})
  }

  private convertToXML(obj: any): string {
    // Simple XML conversion
    const convert = (data: any): string => {
      if (Array.isArray(data)) {
        return data.map(item => convert(item)).join('')
      }
      
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data)
          .map(([key, value]) => 
            `<${key}>${convert(value)}</${key}>`
          )
          .join('')
      }
      
      return String(data)
    }

    return `<?xml version="1.0" encoding="UTF-8"?><webhook>${convert(obj)}</webhook>`
  }

  private signPayload(payload: any): string {
    const content = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload)
    
    return createHmac('sha256', this.config.secretKey)
      .update(content)
      .digest('hex')
  }

  private getContentType(endpoint: WebhookEndpoint): string {
    switch (endpoint.format) {
      case 'form':
        return 'application/x-www-form-urlencoded'
      case 'xml':
        return 'application/xml'
      default:
        return 'application/json'
    }
  }

  private calculateNextRetry(
    attempts: number,
    config: WebhookConfig['retries']
  ): Date {
    const delay = Math.min(
      config.initialDelay * Math.pow(config.backoffFactor, attempts - 1),
      config.maxDelay
    )
    
    return new Date(Date.now() + delay)
  }

  private setupMetrics(): void {
    this.metrics.registerCounter(
      'webhook_notifications_total',
      'Total number of webhook notifications'
    )
    this.metrics.registerCounter(
      'webhook_delivery_success',
      'Number of successful webhook deliveries'
    )
    this.metrics.registerCounter(
      'webhook_delivery_failed',
      'Number of failed webhook deliveries'
    )
    this.metrics.registerCounter(
      'webhook_delivery_retry',
      'Number of webhook delivery retries'
    )
    this.metrics.registerHistogram(
      'webhook_delivery_latency',
      'Webhook delivery latency in seconds',
      [0.1, 0.5, 1, 2, 5]
    )
    this.metrics.registerGauge(
      'webhook_queue_size',
      'Current size of webhook delivery queue'
    )
  }
} 
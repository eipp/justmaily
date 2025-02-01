import { Client as SendGridClient } from '@sendgrid/client'
import { MailService } from '@sendgrid/mail'
import { createHmac } from 'crypto'
import Bottleneck from 'bottleneck'

import { BaseEmailProvider, EmailProviderConfig } from './base'
import { Message, MessageResponse, WebhookEvent } from '../../types'
import { MetricsService } from '../../services/monitoring'
import { EmailDeliveryError } from '../../errors'

interface SendGridConfig extends EmailProviderConfig {
  ipPool?: string
  sandboxMode?: boolean
  trackingSettings?: {
    clickTracking?: { enable?: boolean; enableText?: boolean }
    openTracking?: { enable?: boolean; substitutionTag?: string }
    subscriptionTracking?: { enable?: boolean }
  }
}

const RATE_LIMIT = {
  MAX_RPS: 10,
  BURST_CAPACITY: 50,
};

interface SendGridProviderConfig {
  apiKey: string;
  defaultFrom: string;
  rateLimit?: number;
}

export class SendGridProvider extends BaseEmailProvider {
  private client: SendGridClient
  private mailService: MailService
  readonly name = 'sendgrid'
  
  readonly features = {
    webhooks: true,
    batchSending: true,
    templateSupport: true,
    attachments: true,
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true
    },
    customHeaders: true,
    scheduling: true,
    analytics: {
      realtime: true,
      historical: true,
      customMetrics: true
    },
    security: {
      encryption: true,
      signedWebhooks: true,
      ipWhitelisting: true
    },
    advanced: {
      multiRegion: true,
      automaticFailover: true,
      contentOptimization: true,
      spamScoring: true
    }
  }

  private limiter = new Bottleneck({
    reservoir: RATE_LIMIT.BURST_CAPACITY,
    reservoirRefreshInterval: 1000,
    reservoirRefreshAmount: RATE_LIMIT.MAX_RPS
  });

  protected config: SendGridConfig;
  protected metricsService = MetricsService.getInstance();

  constructor(config: SendGridConfig) {
    super(config as SendGridConfig)
    this.config = config
    this.client = new SendGridClient(config.apiKey)
    this.mailService = new MailService()
    this.client.setApiKey(config.apiKey)
    this.mailService.setApiKey(config.apiKey)
    
    if (config.apiEndpoint) {
      this.client.setDefaultRequest('baseUrl', config.apiEndpoint)
    }
  }

  async sendEmail(message: Message): Promise<MessageResponse> {
    return this.limiter.schedule(() => this._sendEmail(message));
  }

  async sendBatch(messages: Message[]): Promise<MessageResponse[]> {
    await this.rateLimitCheck()
    const batchSize = Math.min(messages.length, this.config.maxBatchSize || 1000)
    const batches = this.chunkArray(messages, batchSize)
    
    const responses: MessageResponse[] = []
    
    for (const batch of batches) {
      const transformedMessages = batch.map(msg => this.transformMessage(msg))
      const startTime = Date.now()
      
      try {
        const response = await this.mailService.sendMultiple(transformedMessages)
        const latency = Date.now() - startTime
        
        await this.recordMetric('batch_send_success', batch.length)
        await this.recordMetric('batch_send_latency', latency)
        
        responses.push(...response[0].map(r => ({
          id: r.headers['x-message-id'],
          status: 'sent',
          provider: this.name,
          timestamp: new Date()
        })))
      } catch (error) {
        await this.handleError(error, 'sendBatch')
        throw error
      }
    }
    
    return responses
  }

  async validateWebhook(payload: string, signature: string): Promise<boolean> {
    const timestamp = Date.now().toString()
    const webhookSecret = this.config.webhookSecret
    
    if (!webhookSecret) {
      throw new Error('Webhook secret is required for validation')
    }

    const hmac = createHmac('sha256', webhookSecret)
    hmac.update(payload + timestamp)
    const computedSignature = hmac.digest('hex')
    
    return computedSignature === signature
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    await this.recordMetric(`webhook_${event.type}`, 1)
    
    switch (event.type) {
      case 'delivered':
        await this.recordMetric('delivery_success', 1)
        break
      case 'bounce':
        await this.recordMetric('delivery_bounce', 1)
        break
      case 'open':
        await this.recordMetric('email_open', 1)
        break
      case 'click':
        await this.recordMetric('email_click', 1)
        break
      case 'unsubscribe':
        await this.recordMetric('unsubscribe', 1)
        break
    }
  }

  async getAnalytics(timeframe: { start: Date; end: Date }): Promise<ProviderAnalytics> {
    const request = {
      url: '/v3/stats',
      method: 'GET' as const,
      qs: {
        start_date: timeframe.start.toISOString(),
        end_date: timeframe.end.toISOString(),
        aggregated_by: 'day'
      }
    }

    try {
      const [response] = await this.client.request(request)
      const stats = response.body[0]
      
      return {
        deliveryRate: stats.metrics.delivered / stats.metrics.requests,
        bounceRate: stats.metrics.bounces / stats.metrics.requests,
        openRate: stats.metrics.unique_opens / stats.metrics.delivered,
        clickRate: stats.metrics.unique_clicks / stats.metrics.delivered,
        spamRate: stats.metrics.spam_reports / stats.metrics.delivered,
        timestamp: new Date()
      }
    } catch (error) {
      await this.handleError(error, 'getAnalytics')
      throw error
    }
  }

  async checkSpamScore(content: string): Promise<number> {
    const request = {
      url: '/v3/mail_settings/spam_check',
      method: 'POST' as const,
      body: { content }
    }

    try {
      const [response] = await this.client.request(request)
      return response.body.score
    } catch (error) {
      await this.handleError(error, 'checkSpamScore')
      throw error
    }
  }

  async validateDKIM(domain: string): Promise<boolean> {
    const request = {
      url: `/v3/whitelabel/domains/${domain}/validate`,
      method: 'POST' as const
    }

    try {
      const [response] = await this.client.request(request)
      return response.body.valid
    } catch (error) {
      await this.handleError(error, 'validateDKIM')
      throw error
    }
  }

  private transformMessage(message: Message): any {
    return {
      to: message.to,
      from: {
        email: message.from || this.config.defaultFromAddress,
        name: message.fromName || this.config.defaultFromName
      },
      subject: message.subject,
      html: message.content,
      text: message.textContent,
      attachments: message.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment'
      })),
      headers: message.headers,
      customArgs: message.metadata,
      trackingSettings: (this.config as SendGridConfig).trackingSettings,
      ipPool: (this.config as SendGridConfig).ipPool,
      sendAt: message.scheduledTime?.getTime() / 1000
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private async _sendEmail(message: Message): Promise<MessageResponse> {
    const transformed = this.transformMessage(message);
    const [response] = await this.mailService.send(transformed);
    
    return {
      id: response.headers['x-message-id'],
      status: 'sent',
      provider: this.name,
      timestamp: new Date().toISOString(),
      metadata: {
        statusCode: response.statusCode
      }
    };
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.client.request({
        url: '/v3/api_keys/validate',
        method: 'POST'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async sendEmailInternal(message: Message): Promise<string> {
    const [response] = await this.mailService.send(this.transformMessage(message));
    return response.headers['x-message-id'];
  }

  protected async validateCredentialsInternal(): Promise<boolean> {
    try {
      await this.client.request({ url: '/v3/api_keys/validate', method: 'POST' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private handleResponse(response: ClientResponse): SendGridResponse {
    return {
      id: response.body.toString(),
      status: this.mapStatus(response.statusCode),
    };
  }

  private async handleError(error: unknown, context: string) {
    if (error instanceof Error) {
      await super.handleError(error, context);
      if (error.message.includes('rate limit')) {
        await this.recordMetric('rate_limit_exceeded', 1);
      }
    }
  }

  async send(message: EmailMessage): Promise<void> {
    try {
      // Implementation
      this.metricsService.increment('emails.sent');
    } catch (error) {
      this.handleError(error, 'send');
      throw new EmailDeliveryError('Failed to send email via SendGrid');
    }
  }
} 
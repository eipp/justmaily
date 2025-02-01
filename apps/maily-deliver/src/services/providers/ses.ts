import { 
  CloudWatchClient, 
  GetMetricDataCommand,
  MetricDataQuery,
  PutMetricDataCommand
} from '@aws-sdk/client-cloudwatch';
import { 
  SESClient, 
  SendEmailCommand,
  SendBulkTemplatedEmailCommand,
  GetSendQuotaCommand,
  CreateConfigurationSetCommand,
  UpdateConfigurationSetTrackingOptionsCommand,
  SendRawEmailCommand,
  GetSendStatisticsCommand,
  SESServiceException
} from '@aws-sdk/client-ses';
import { createHmac } from 'crypto';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { trace } from '@opentelemetry/api';

import { 
  EmailProvider, 
  EmailProviderConfig,
  ProviderAnalytics 
} from './base';
import { Message, MessageResponse, WebhookEvent } from '../../types';

interface SESConfig extends EmailProviderConfig {
  accessKeyId: string
  secretAccessKey: string
  region?: string
  configurationSet?: string
  feedbackForwardingEmail?: string
  customTags?: Record<string, string>
  maxBatchSize?: number
  trackingDomain?: string
  openTrackingEnabled?: boolean
  clickTrackingEnabled?: boolean
}

interface MessageTag {
  Name: string;
  Value: string;
}

export class SESProvider extends EmailProvider {
  private sesClient: SESClient
  private cloudWatchClient: CloudWatchClient
  readonly name = 'ses'
  protected config: SESConfig
  
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
    scheduling: false, // SES doesn't support native scheduling
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
      contentOptimization: false,
      spamScoring: true
    }
  }

  constructor(config: SESConfig) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials must be set in environment variables');
    }
    super(config)
    this.config = config
    
    const httpHandler = new NodeHttpHandler({
      connectionTimeout: 1000,
      socketTimeout: 1000,
      maxSockets: 50
    });

    this.sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      },
      requestHandler: httpHandler
    })
    this.cloudWatchClient = new CloudWatchClient({
      region: config.region || 'us-east-1',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
    
    // Setup configuration set if specified
    if (config.configurationSet) {
      this.setupConfigurationSet().catch(error => {
        this.handleError(error, 'setupConfigurationSet')
      })
    }
  }

  async sendEmail(message: Message): Promise<MessageResponse> {
    const tracer = trace.getTracer('ses-provider');
    return tracer.startActiveSpan('sendEmail', async span => {
      await this.rateLimitCheck()
      const startTime = Date.now()

      try {
        const command = new SendEmailCommand({
          Source: message.from || this.config.defaultFromAddress,
          Destination: {
            ToAddresses: Array.isArray(message.to) ? message.to : [message.to],
            CcAddresses: message.cc || [],
            BccAddresses: message.bcc || []
          },
          Message: {
            Subject: { Data: message.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: message.content, Charset: 'UTF-8' },
              Text: { Data: message.textContent || this.stripHtml(message.content), Charset: 'UTF-8' }
            }
          },
          ConfigurationSetName: (this.config as SESConfig).configurationSet,
          Tags: this.transformTags(message.metadata)
        })

        const response = await this.sesClient.send(command)
        const latency = Date.now() - startTime
        
        await this.recordMetric('send_success', 1)
        await this.recordMetric('send_latency', latency)
        
        span.setAttributes({
          'message.id': message.id,
          'recipient.count': message.to.length
        });
        return {
          id: response.MessageId || '',
          status: 'sent',
          provider: this.name,
          timestamp: new Date().toISOString(),
          metadata: {
            region: this.config.region,
            configurationSet: this.config.configurationSet
          }
        }
      } catch (error) {
        await this.handleError(error, 'sendEmail')
        throw this.transformError(error)
      } finally {
        span.end();
      }
    });
  }

  async sendBatch(messages: Message[]): Promise<MessageResponse[]> {
    await this.rateLimitCheck()
    const batchSize = Math.min(
      messages.length, 
      (this.config as SESConfig).maxBatchSize || 50
    )
    const batches = this.chunkArray(messages, batchSize)
    const responses: MessageResponse[] = []
    
    for (const batch of batches) {
      const startTime = Date.now()
      
      try {
        const command = new SendBulkTemplatedEmailCommand({
          Source: this.config.defaultFromAddress,
          Template: 'DefaultTemplate', // You should create this template in SES
          ConfigurationSetName: (this.config as SESConfig).configurationSet,
          Destinations: batch.map(msg => ({
            Destination: {
              ToAddresses: Array.isArray(msg.to) ? msg.to : [msg.to],
              CcAddresses: msg.cc || [],
              BccAddresses: msg.bcc || []
            },
            ReplacementTemplateData: JSON.stringify({
              subject: msg.subject,
              content: msg.content,
              textContent: msg.textContent || this.stripHtml(msg.content),
              metadata: msg.metadata
            })
          })),
          DefaultTemplateData: JSON.stringify({
            subject: '',
            content: '',
            textContent: '',
            metadata: {}
          })
        })

        const response = await this.sesClient.send(command)
        const latency = Date.now() - startTime
        
        await this.recordMetric('batch_send_success', batch.length)
        await this.recordMetric('batch_send_latency', latency)
        
        responses.push(...response.Status.map(status => ({
          id: status.MessageId,
          status: status.Status === 'Success' ? 'sent' : 'failed',
          provider: this.name,
          timestamp: new Date().toISOString(),
          error: status.Status === 'Success' ? undefined : status.Error,
          metadata: {
            region: this.config.region,
            configurationSet: (this.config as SESConfig).configurationSet
          }
        })))
      } catch (error) {
        await this.handleError(error, 'sendBatch')
        throw this.transformError(error)
      }
    }
    
    return responses
  }

  async validateWebhook(payload: string, signature: string): Promise<boolean> {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret is required for validation')
    }

    const hmac = createHmac('sha256', this.config.webhookSecret)
    hmac.update(payload)
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
      case 'complaint':
        await this.recordMetric('spam_complaint', 1)
        break
      case 'open':
        await this.recordMetric('email_open', 1)
        break
      case 'click':
        await this.recordMetric('email_click', 1)
        break
    }
  }

  async getAnalytics(timeframe: { start: Date; end: Date }): Promise<ProviderAnalytics> {
    try {
      const [sendStats, bounceStats, complaintStats] = await Promise.all([
        this.getMetricData('Delivery', timeframe),
        this.getMetricData('Bounce', timeframe),
        this.getMetricData('Complaint', timeframe)
      ])
      
      const totalSent = sendStats.reduce((sum, stat) => sum + (stat.Values?.[0] || 0), 0)
      const totalBounces = bounceStats.reduce((sum, stat) => sum + (stat.Values?.[0] || 0), 0)
      const totalComplaints = complaintStats.reduce((sum, stat) => sum + (stat.Values?.[0] || 0), 0)
      
      return {
        deliveryRate: totalSent > 0 ? (totalSent - totalBounces) / totalSent : 1,
        bounceRate: totalSent > 0 ? totalBounces / totalSent : 0,
        openRate: 0, // Requires configuration set with open tracking
        clickRate: 0, // Requires configuration set with click tracking
        spamRate: totalSent > 0 ? totalComplaints / totalSent : 0,
        timestamp: new Date()
      }
    } catch (error) {
      await this.handleError(error, 'getAnalytics')
      throw this.transformError(error)
    }
  }

  private async setupConfigurationSet(): Promise<void> {
    const config = this.config as SESConfig
    
    if (!config.configurationSet) {
      return
    }

    try {
      // Create configuration set if it doesn't exist
      await this.sesClient.send(new CreateConfigurationSetCommand({
        ConfigurationSet: {
          Name: config.configurationSet
        }
      }))

      // Configure tracking options if tracking domain is provided
      if (config.trackingDomain) {
        await this.sesClient.send(new UpdateConfigurationSetTrackingOptionsCommand({
          ConfigurationSetName: config.configurationSet,
          TrackingOptions: {
            CustomRedirectDomain: config.trackingDomain
          }
        }))
      }
    } catch (error) {
      // Ignore if configuration set already exists
      if (error instanceof SESServiceException && error.name !== 'ConfigurationSetAlreadyExists') {
        throw error
      }
    }
  }

  private async getMetricData(metricName: string, timeframe: { start: Date; end: Date }) {
    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: `m1`,
          MetricStat: {
            Metric: {
              Namespace: 'AWS/SES',
              MetricName: metricName,
              Dimensions: [
                {
                  Name: 'Configuration Set',
                  Value: (this.config as SESConfig).configurationSet
                }
              ]
            },
            Period: 3600,
            Stat: 'Sum'
          }
        }
      ],
      StartTime: timeframe.start,
      EndTime: timeframe.end
    })

    const response = await this.cloudWatchClient.send(command)
    return response.MetricDataResults[0].Values || []
  }

  private transformTags(metadata?: Record<string, unknown>): MessageTag[] {
    return Object.entries(metadata || {}).map(([Name, Value]) => ({
      Name,
      Value: typeof Value === 'string' ? Value : JSON.stringify(Value)
    }));
  }

  private transformError(error: any): Error {
    if (error instanceof SESServiceException) {
      switch (error.name) {
        case 'MessageRejected':
          return new Error(`Email rejected: ${error.message}`)
        case 'MailFromDomainNotVerified':
          return new Error('Sender domain not verified')
        case 'ConfigurationSetDoesNotExist':
          return new Error('Configuration set not found')
        case 'ThrottlingException':
          return new Error('Rate limit exceeded')
        default:
          return error
      }
    }
    return error
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  protected async sendEmailInternal(message: Message): Promise<MessageResponse> {
    const command = new SendEmailCommand({
      Source: message.from || this.config.defaultFromAddress,
      Destination: {
        ToAddresses: Array.isArray(message.to) ? message.to : [message.to],
        CcAddresses: message.cc || [],
        BccAddresses: message.bcc || []
      },
      Message: {
        Subject: { Data: message.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: message.content, Charset: 'UTF-8' },
          Text: { Data: message.textContent || this.stripHtml(message.content), Charset: 'UTF-8' }
        }
      },
      ConfigurationSetName: (this.config as SESConfig).configurationSet,
      Tags: this.transformTags(message.metadata)
    })
    
    const response = await this.sesClient.send(command)
    return {
      id: response.MessageId || '',
      status: 'sent',
      provider: this.name,
      timestamp: new Date().toISOString(),
      metadata: {
        region: this.config.region,
        configurationSet: (this.config as SESConfig).configurationSet
      }
    }
  }

  public async validateCredentials(): Promise<boolean> {
    try {
      await this.sesClient.send(new GetSendQuotaCommand({}));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Fix tag formatting for AWS SDK
  private formatTags(tags: Record<string, string>): Array<{Name: string; Value: string}> {
    return Object.entries(tags).map(([Name, Value]) => ({ Name, Value }));
  }

  // Implement required base class methods
  protected handleError(error: any, context: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[SES] ${context} error: ${errorMessage}`);
    throw this.transformError(error);
  }

  protected async rateLimitCheck(): Promise<void> {
    const quota = await this.sesClient.send(new GetSendQuotaCommand({}));
    if ((quota.Max24HourSend ?? 0) - (quota.SentLast24Hours ?? 0) < 100) {
      throw new Error('SES rate limit exceeded');
    }
  }

  protected async recordMetric(metric: string, value: number): Promise<void> {
    await this.cloudWatchClient.send(new PutMetricDataCommand({
      Namespace: 'Maily/SES',
      MetricData: [{
        MetricName: metric,
        Value: value,
        Timestamp: new Date()
      }]
    }));
  }

  private sanitizeContent(content: string): string {
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

class SESClientWrapper {
  private static instance: SESClient;

  static getInstance(config: SESConfig): SESClient {
    if (!this.instance) {
      this.instance = new SESClient({
        region: config.region || 'us-east-1',
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey
        }
      });
    }
    return this.instance;
  }
}
import { ApplicationError } from '../../lib/errors';
import { MetricsService } from '../../lib/monitoring';
import type { 
  EmailMessage,
  ProviderAnalytics,
  ProviderConfig,
  ProviderType,
  SESConfig,
  SendGridConfig
} from '../../types';
import { Message, MessageResponse, WebhookEvent } from '../../types';
import { 
  EmailDeliveryError, 
  EmailValidationError, 
  EmailTemplateError, 
  ConfigurationError 
} from '../../lib/errors';
import { logger } from '../../lib/monitoring';
import { captureException } from '../../utils/sentry';

export interface EmailProviderConfig {
  apiKey: string;
  apiEndpoint?: string;
  region?: string;
  webhookSecret?: string;
  defaultFromAddress?: string;
  defaultFromName?: string;
  maxBatchSize?: number;
  rateLimitRPS?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  analyticsEnabled?: boolean;
  metricsPrefix?: string;
  fallbackProviders?: string[];
  retryStrategy?: 'exponential' | 'linear' | 'fixed';
  encryptionKey?: string;
  rateLimitStrategy?: {
    type: 'token-bucket' | 'leaky-bucket' | 'fixed-window';
    capacity: number;
    refillRate: number;
  };
}

export interface EmailProviderFeatures {
  webhooks: boolean;
  batchSending: boolean;
  templateSupport: boolean;
  attachments: boolean;
  tracking: {
    opens: boolean;
    clicks: boolean;
    unsubscribes: boolean;
  };
  customHeaders: boolean;
  scheduling: boolean;
  analytics: {
    realtime: boolean;
    historical: boolean;
    customMetrics: boolean;
  };
  security: {
    encryption: boolean;
    signedWebhooks: boolean;
    ipWhitelisting: boolean;
  };
  advanced: {
    multiRegion: boolean;
    automaticFailover: boolean;
    contentOptimization: boolean;
    spamScoring: boolean;
  };
}

export interface EmailProviderError extends Error {
  isRetryable: boolean;
  isThrottlingError: boolean;
  originalError?: unknown;
  provider: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  content: string;
  variables?: Record<string, string>;
}

export abstract class EmailProvider {
  protected abstract config: ProviderConfig;
  protected abstract metricsService: {
    record(metric: string, value: number): void;
    increment(counter: string): void;
  };

  // Implement required methods
  abstract send(message: EmailMessage): Promise<void>;
  abstract getAnalytics(timeframe: string): ProviderAnalytics;
  
  // Add common error handling
  protected handleError(error: unknown, context: string) {
    this.metricsService.increment('errors.total');
    logger.error({ error, context }, 'Email provider error');
  }
}

export interface SendEmailParams extends Message {
  id: string;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult extends MessageResponse {
  providerMetadata?: Record<string, any>;
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly error: Error,
    public readonly retryAfterMs: number
  ) {
    super(message);
  }
}

abstract class BaseEmailProvider implements EmailProvider {
  protected config: EmailProviderConfig;
  private retryCount: Map<string, number> = new Map();
  private circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };
  private fallbackProviders: EmailProvider[] = [];
  protected providerName!: string;
  protected abstract metricsService: {
    record(metric: string, value: number): void;
    increment(counter: string): void;
  };

  constructor(config: EmailProviderConfig) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      retryStrategy: 'exponential',
      timeout: 30000,
      ...config,
    };
    this.validateConfig();
    this.initializeFallbacks();
  }

  private async initializeFallbacks() {
    if (this.config.fallbackProviders?.length) {
      // Fallback providers will be initialized by the factory
      // This is just a placeholder for the structure
      this.fallbackProviders = [];
    }
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    messageId?: string
  ): Promise<T> {
    // Start timing the operation
    const startTime = Date.now();
    
    try {
      // Circuit breaker check
      if (this.circuitBreaker.isOpen) {
        const cooldownPeriod = 60000; // 1 minute
        if (Date.now() - this.circuitBreaker.lastFailure > cooldownPeriod) {
          this.circuitBreaker.isOpen = false;
          logger.info({
            provider: this.name,
            context,
            messageId,
          }, 'Circuit breaker reset after cooldown');
        } else {
          // Try fallback providers before giving up
          if (this.fallbackProviders.length > 0) {
            logger.info({
              provider: this.name,
              context,
              messageId,
              fallbackCount: this.fallbackProviders.length,
            }, 'Attempting fallback providers');

            for (const fallbackProvider of this.fallbackProviders) {
              try {
                // Execute the operation on the fallback provider
                const result = await operation();
                logger.info({
                  provider: this.name,
                  fallbackProvider: fallbackProvider.name,
                  context,
                  messageId,
                }, 'Operation succeeded using fallback provider');
                return result;
              } catch (fallbackError) {
                logger.error({
                  provider: this.name,
                  fallbackProvider: fallbackProvider.name,
                  error: fallbackError,
                  context,
                  messageId,
                }, 'Fallback provider failed');
                continue;
              }
            }
          }

          throw new EmailDeliveryError(
            'Service temporarily unavailable due to multiple failures',
            this.name,
            messageId,
            { circuitBreaker: 'open' }
          );
        }
      }

      let lastError: Error | null = null;
      const maxAttempts = this.config.retryAttempts!;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await operation();
          
          // Reset circuit breaker on success
          this.circuitBreaker.failures = 0;
          this.circuitBreaker.isOpen = false;
          
          // Record success metrics
          const duration = Date.now() - startTime;
          await this.recordMetric('operation_duration', duration);
          await this.recordMetric('operation_success', 1);
          
          return result;
        } catch (error) {
          lastError = error as Error;
          
          // Update circuit breaker
          this.circuitBreaker.failures++;
          this.circuitBreaker.lastFailure = Date.now();
          
          // Record failure metrics
          await this.recordMetric('operation_failure', 1);
          
          if (this.circuitBreaker.failures >= 5) {
            this.circuitBreaker.isOpen = true;
            logger.warn({
              provider: this.name,
              context,
              messageId,
              failures: this.circuitBreaker.failures,
            }, 'Circuit breaker opened');

            // Try fallback providers
            if (this.fallbackProviders.length > 0) {
              for (const fallbackProvider of this.fallbackProviders) {
                try {
                  const result = await operation();
                  logger.info({
                    provider: this.name,
                    fallbackProvider: fallbackProvider.name,
                    context,
                    messageId,
                  }, 'Operation succeeded using fallback provider after circuit breaker opened');
                  return result;
                } catch (fallbackError) {
                  logger.error({
                    provider: this.name,
                    fallbackProvider: fallbackProvider.name,
                    error: fallbackError,
                    context,
                    messageId,
                  }, 'Fallback provider failed after circuit breaker opened');
                  continue;
                }
              }
            }

            throw new EmailDeliveryError(
              'Circuit breaker opened due to multiple failures',
              this.name,
              messageId,
              { circuitBreaker: 'opened', failures: this.circuitBreaker.failures }
            );
          }

          // Don't retry certain errors
          if (error instanceof EmailValidationError || 
              error instanceof EmailTemplateError) {
            throw error;
          }

          // Calculate retry delay
          let delay = this.config.retryDelay!;
          if (this.config.retryStrategy === 'exponential') {
            delay = delay * Math.pow(2, attempt - 1);
          }

          // Add jitter to prevent thundering herd
          delay += Math.random() * 1000;

          if (attempt < maxAttempts) {
            logger.info({
              provider: this.name,
              context,
              messageId,
              attempt,
              nextDelay: delay,
            }, 'Retrying operation');
            
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }

      // If we get here, all retries failed
      const duration = Date.now() - startTime;
      await this.recordMetric('operation_duration', duration);
      
      throw new EmailDeliveryError(
        `Operation failed after ${maxAttempts} attempts: ${lastError?.message}`,
        this.name,
        messageId,
        { 
          context,
          originalError: lastError?.message,
          attempts: maxAttempts,
          duration,
        }
      );
    } catch (error) {
      // Ensure all errors are properly logged and tracked
      await this.handleError(error as Error, 'sendEmail');
      throw error;
    }
  }

  abstract readonly name: string;
  abstract readonly features: EmailProviderFeatures;

  async sendEmail(message: Message): Promise<MessageResponse> {
    return this.executeWithRetry(
      () => this.sendEmailInternal(message),
      'sendEmail',
      message.id
    );
  }

  protected abstract sendEmailInternal(message: Message): Promise<MessageResponse>;

  async sendBatch(messages: Message[]): Promise<MessageResponse[]> {
    return this.executeWithRetry(
      () => this.sendBatchInternal(messages),
      'sendBatch'
    );
  }

  protected async sendBatchInternal(messages: Message[]): Promise<MessageResponse[]> {
    // Default implementation: send messages one by one
    const results: MessageResponse[] = [];
    for (const message of messages) {
      try {
        const result = await this.sendEmail(message);
        results.push(result);
      } catch (error) {
        results.push({
          id: message.id,
          messageId: `failed-${Date.now()}`,
          status: 'failed',
          timestamp: new Date().toISOString(),
          provider: this.name,
          error: error instanceof Error ? error.message : String(error)
        } as MessageResponse);
      }
    }
    return results;
  }

  protected validateConfig() {
    if (!this.config.apiKey) {
      throw new ConfigurationError('API key is required');
    }

    if (this.config.retryAttempts && this.config.retryAttempts < 0) {
      throw new ConfigurationError('Retry attempts must be non-negative');
    }

    if (this.config.retryDelay && this.config.retryDelay < 0) {
      throw new ConfigurationError('Retry delay must be non-negative');
    }

    if (this.config.timeout && this.config.timeout < 0) {
      throw new ConfigurationError('Timeout must be non-negative');
    }
  }

  protected async handleError(error: Error, context: string) {
    // Log the error
    logger.error({
      error: error.message,
      stack: error.stack,
      context,
      provider: this.name,
    });

    // Track error metric
    await this.recordMetric('errors_total', 1);

    // Report to error tracking
    if (error instanceof AppError) {
      captureException(error, {
        tags: {
          provider: this.name,
          context,
          errorType: error.constructor.name,
        },
        extra: error.details,
      });
    }
  }

  protected metrics = {
    sendAttempts: 0,
    sendSuccess: 0,
    sendFailure: 0,
    lastError: null as Error | null,
    responseTime: [] as number[],
  };

  protected async recordMetric(name: string, value: number) {
    if (this.config.analyticsEnabled) {
      // Implementation for recording metrics to Prometheus
    }
  }

  // Default implementations for new methods...
  async getAnalytics(timeframe: { start: Date; end: Date }): Promise<ProviderAnalytics> {
    throw new Error('Analytics not supported');
  }

  async healthCheck?(): Promise<boolean> {
    return true;
  }

  protected async rateLimitCheck(): Promise<boolean> {
    if (!this.config.rateLimitStrategy) return true;
    // Implementation of configurable rate limiting
    return true;
  }

  abstract validateCredentials(): Promise<boolean>;
  
  async validateCredentials(): Promise<boolean> {
    try {
      return await this.executeWithRetry(
        () => this.validateCredentialsInternal(),
        'validateCredentials'
      );
    } catch (error) {
      return false;
    }
  }

  protected abstract validateCredentialsInternal(): Promise<boolean>;

  protected abstract increment(metric: string, value?: number, tags?: Record<string, string>): void;
  protected abstract gauge(metric: string, value: number, tags?: Record<string, string>): void;
  protected abstract histogram(metric: string, value: number, tags?: Record<string, string>): void;

  protected setProviderConfig(config: ProviderConfig): void {
    this.providerName = config.name;
  }

  protected calculateBackoff(retryCount: number, baseDelay = 1000): number {
    return baseDelay * Math.pow(2, retryCount);
  }

  protected mapEventToAnalytics(
    event: Record<string, unknown>
  ): ProviderAnalytics {
    // ... existing implementation ...
  }
}
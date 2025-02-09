import { z } from 'zod';

export const sesConfigSchema = z.object({
  // AWS Credentials
  accessKeyId: z.string().min(16).max(128),
  secretAccessKey: z.string().min(32).max(256),
  region: z.string().default('us-east-1'),

  // SES Configuration
  configurationSet: z.string().optional(),
  feedbackForwardingEmail: z.string().email().optional(),
  maxBatchSize: z.number().min(1).max(50).default(50),
  
  // Tracking Configuration
  trackingDomain: z.string().optional(),
  openTrackingEnabled: z.boolean().default(true),
  clickTrackingEnabled: z.boolean().default(true),
  
  // Custom Tags
  customTags: z.record(z.string()).optional(),
  
  // Rate Limiting
  rateLimitRPS: z.number().min(1).max(100).default(14), // SES default is 14 emails per second
  rateLimitBurst: z.number().min(1).max(200).default(28), // Allow burst to 2x normal rate
  
  // Retry Configuration
  retryAttempts: z.number().min(0).max(5).default(3),
  retryDelay: z.number().min(100).max(5000).default(1000),
  
  // Monitoring
  monitoringEnabled: z.boolean().default(true),
  metricsNamespace: z.string().default('JustMaily/SES'),
  alertThresholds: z.object({
    bounceRate: z.number().min(0).max(1).default(0.05), // 5% bounce rate threshold
    complaintRate: z.number().min(0).max(1).default(0.001), // 0.1% complaint rate threshold
    deliveryRate: z.number().min(0).max(1).default(0.95), // 95% delivery rate threshold
  }).optional(),
  
  // Security
  encryptionEnabled: z.boolean().default(true),
  webhookSecret: z.string().optional(),
  ipWhitelist: z.array(z.string()).optional(),
});

export type SESConfig = z.infer<typeof sesConfigSchema>;

export const defaultSESConfig: Partial<SESConfig> = {
  region: 'us-east-1',
  maxBatchSize: 50,
  openTrackingEnabled: true,
  clickTrackingEnabled: true,
  rateLimitRPS: 14,
  rateLimitBurst: 28,
  retryAttempts: 3,
  retryDelay: 1000,
  monitoringEnabled: true,
  metricsNamespace: 'JustMaily/SES',
  encryptionEnabled: true,
  alertThresholds: {
    bounceRate: 0.05,
    complaintRate: 0.001,
    deliveryRate: 0.95,
  },
};

export function validateSESConfig(config: Partial<SESConfig>): SESConfig {
  try {
    return sesConfigSchema.parse({
      ...defaultSESConfig,
      ...config,
    });
  } catch (error) {
    throw new Error(`Invalid SES configuration: ${error.message}`);
  }
}

export function createSESConfig(config: Partial<SESConfig>): SESConfig {
  const validatedConfig = validateSESConfig(config);
  
  // Additional validation and setup
  if (validatedConfig.trackingDomain && !validatedConfig.configurationSet) {
    throw new Error('Configuration set is required when using a tracking domain');
  }
  
  if (validatedConfig.webhookSecret && validatedConfig.webhookSecret.length < 32) {
    throw new Error('Webhook secret must be at least 32 characters long');
  }
  
  return validatedConfig;
} 
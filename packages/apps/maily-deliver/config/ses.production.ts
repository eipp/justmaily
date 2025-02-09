import { z } from 'zod';
import type { SESClientConfig } from '@aws-sdk/client-ses';

// Define the validation schema for AWS SES environment variables
const sesEnvSchema = z.object({
  AWS_SES_ACCESS_KEY_ID: z.string(),
  AWS_SES_SECRET_ACCESS_KEY: z.string(),
  SES_TRACKING_DOMAIN: z.string(),
  SES_REGION: z.string().default('us-west-2'),
  SES_FEEDBACK_EMAIL: z.string(),
  SES_MAX_BATCH_SIZE: z.coerce.number().default(50),
  SES_OPEN_TRACKING_ENABLED: z.coerce.boolean().default(true),
  SES_CLICK_TRACKING_ENABLED: z.coerce.boolean().default(true)
});

// Parse and validate environment variables
const sesEnv = sesEnvSchema.safeParse(process.env);

if (!sesEnv.success) {
  throw new Error(
    `Invalid SES configuration: ${JSON.stringify(sesEnv.error.format(), null, 2)}`
  );
}

// Add extended interface for custom config properties
interface SESClientConfigExtension {
  configurationSet: string;
  trackingDomain: string;
  alertThresholds: {
    bounceRate: number;
    complaintRate: number;
    deliveryRate: number;
  };
  metricsNamespace: string;
  feedbackEmail: string;
  maxBatchSize: number;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

// Export the configuration
export const sesProductionConfig: SESClientConfig & SESClientConfigExtension = {
  region: process.env.AWS_REGION,
  configurationSet: 'production',
  feedbackEmail: sesEnv.data.SES_FEEDBACK_EMAIL,
  trackingDomain: sesEnv.data.SES_TRACKING_DOMAIN,
  maxBatchSize: sesEnv.data.SES_MAX_BATCH_SIZE,
  openTrackingEnabled: sesEnv.data.SES_OPEN_TRACKING_ENABLED,
  clickTrackingEnabled: sesEnv.data.SES_CLICK_TRACKING_ENABLED,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
  alertThresholds: {
    bounceRate: 0.05,
    complaintRate: 0.01,
    deliveryRate: 0.95
  },
  metricsNamespace: 'JustMaily/SES',
  maxAttempts: 3
} as const; 
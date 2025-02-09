import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  const env = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    NODE_ENV: process.env.NODE_ENV,
  } as const;

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return result.data;
}

export const env = validateEnv(); 
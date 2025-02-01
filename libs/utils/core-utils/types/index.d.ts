declare module 'p-limit' {
  export interface Limit {
    <T>(fn: () => Promise<T> | T): Promise<T>;
    activeCount: number;
    pendingCount: number;
    clearQueue: () => void;
  }

  export default function pLimit(concurrency: number): Limit;
}

declare module 'exponential-backoff' {
  export interface BackOffOptions {
    numOfAttempts?: number;
    startingDelay?: number;
    timeMultiple?: number;
    maxDelay?: number;
    jitter?: boolean;
    retry?: (e: Error) => boolean;
  }

  export function backOff<T>(
    request: () => Promise<T>,
    options?: BackOffOptions
  ): Promise<T>;
}

declare module '@justmaily/pg-audit' {
  export interface AuditLogger {
    log(event: {
      userId: string;
      action: string;
      resource: string;
      details: Record<string, unknown>;
      timestamp: Date;
    }): Promise<void>;
  }
}

declare module '@justmaily/temporal-core' {
  export interface WorkflowClient {
    execute<T>(workflowId: string, input: unknown): Promise<T>;
    signal(workflowId: string, signalName: string, input?: unknown): Promise<void>;
    query<T>(workflowId: string, queryName: string): Promise<T>;
  }
}

declare module '@upstash/ratelimit' {
  export interface RateLimitConfig {
    redis: unknown;
    limiter: unknown;
    prefix?: string;
    analytics?: boolean;
  }

  export class Ratelimit {
    constructor(config: RateLimitConfig);
    limit(identifier: string): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
    }>;
  }
} 
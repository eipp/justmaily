export interface ABTestConfig {
  campaignId: string;
  variants: ABTestVariant[];
  splitRatio: number;
  status: ABTestStatus;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  subject: string;
  body: string;
}

export enum ABTestStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export interface ABTestResults {
  winnerVariantId?: string;
  metrics: {
    [variantId: string]: ABTestMetrics;
  };
}

export interface ABTestMetrics {
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface ABTestSuggestion {
  variantId: string;
  confidenceLevel: number;
  reason: string;
}
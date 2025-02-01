export interface SpamCheckResult {
  score: number;
  verdict: SpamVerdict;
  details?: SpamCheckDetails;
}

export enum SpamVerdict {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARNING = 'WARNING',
  PENDING = 'PENDING',
}

export interface SpamCheckDetails {
  rules?: SpamCheckRule[];
  summary?: string;
}

export interface SpamCheckRule {
  name: string;
  description: string;
  score: number;
}

export interface ContentQualityMetrics {
  readabilityScore: number;
  sentimentScore: number;
  engagementScore: number;
}
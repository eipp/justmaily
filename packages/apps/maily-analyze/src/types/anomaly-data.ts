export interface AnomalyData {
  campaignId: string;
  anomalies: CampaignAnomaly[];
  detectionTimestamp: Date;
  algorithmVersion: string;
}

export interface CampaignAnomaly {
  metric: string; // e.g., 'openRate', 'clickRate'
  expectedValue: number;
  actualValue: number;
  severity: AnomalySeverity;
  timestamp: Date;
  reason?: string;
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
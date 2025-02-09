export interface CampaignScheduleConfig {
  campaignId: string;
  scheduleType: ScheduleType;
  scheduledAt?: Date;
  cronExpression?: string;
  status: ScheduleStatus;
  predictiveSchedulingData?: PredictiveSchedulingData;
}

export enum ScheduleType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED = 'SCHEDULED',
  RECURRING = 'RECURRING',
  PREDICTIVE = 'PREDICTIVE',
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface PredictiveSchedulingData {
  optimalSendTime?: Date;
  predictedOpenRate?: number;
  predictedClickRate?: number;
}
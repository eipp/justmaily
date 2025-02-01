export interface PredictionData {
  campaignId: string;
  predictedMetrics: PredictedMetrics;
  predictionTimestamp: Date;
  modelVersion: string;
}

export interface PredictedMetrics {
  openRate?: PredictionValue;
  clickRate?: PredictionValue;
  conversionRate?: PredictionValue;
  bounceRate?: PredictionValue;
  unsubscribeRate?: PredictionValue;
  revenue?: PredictionValue;
}

export interface PredictionValue {
  value: number;
  confidenceInterval?: {
    lowerBound: number;
    upperBound: number;
  };
}
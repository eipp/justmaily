export interface CampaignMetrics {
  campaignId: string;
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  spamComplaintCount: number; // Renamed to english
  unsubscribeCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamComplaintRate: number; // Renamed to english
  unsubscribeRate: number;
  revenue?: number;
  conversionRate?: number;
}

export interface ABTestCampaignMetrics extends CampaignMetrics {
  variantMetrics: {
    [variantId: string]: CampaignMetrics;
  };
}
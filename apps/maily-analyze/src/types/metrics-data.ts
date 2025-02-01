export interface CampaignMetricsData {
  campaignId: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    spamComplaints: number;
    unsubscribed: number;
    revenue?: number;
    conversionRate?: number;
  };
  timestamp: Date;
}
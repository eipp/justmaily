export class MetricsService {
  async getCampaignMetrics(campaignData) {
    if (!Array.isArray(campaignData) || campaignData.length === 0) {
      throw new Error('Campaign data must be a non-empty array');
    }
    // Assume each campaignData element has properties: opens, clicks, conversions
    const totalOpens = campaignData.reduce((acc, campaign) => acc + (campaign.opens || 0), 0);
    const totalClicks = campaignData.reduce((acc, campaign) => acc + (campaign.clicks || 0), 0);
    const totalConversions = campaignData.reduce((acc, campaign) => acc + (campaign.conversions || 0), 0);
    const count = campaignData.length;

    const averageOpens = totalOpens / count;
    const averageClicks = totalClicks / count;
    const averageConversions = totalConversions / count;
    const clickThroughRate = totalOpens > 0 ? totalClicks / totalOpens : 0;
    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;

    return {
      averageOpens,
      averageClicks,
      averageConversions,
      clickThroughRate,
      conversionRate
    };
  }
}
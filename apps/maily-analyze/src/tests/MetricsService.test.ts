import { MetricsService } from '../services/MetricsService';

describe('MetricsService', () => {
  let metricsService: MetricsService;

  beforeEach(() => {
    metricsService = new MetricsService();
  });

  describe('getCampaignMetrics', () => {
    it('should return campaign metrics', async () => {
      const metrics = await metricsService.getCampaignMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.campaignId).toBe('campaign123');
      expect(metrics.sent).toBeGreaterThanOrEqual(0);
      expect(metrics.delivered).toBeGreaterThanOrEqual(0);
      expect(metrics.opened).toBeGreaterThanOrEqual(0);
      expect(metrics.clicked).toBeGreaterThanOrEqual(0);
    });
  });
});
import { AnalyticsService } from '../services/analytics.service';
import { PrometheusService } from '../services/prometheus.service';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let prometheusService: PrometheusService;

  beforeEach(() => {
    prometheusService = new PrometheusService(); // Mock or actual PrometheusService
    analyticsService = new AnalyticsService(prometheusService);
  });

  it('should get campaign metrics', async () => {
    const result = await analyticsService.getCampaignMetrics('campaign123');
    expect(result.message).toEqual('Campaign metrics retrieved successfully');
  });

  it('should generate a custom report', async () => {
    const result = await analyticsService.generateCustomReport('campaign456', 'summary', 'pdf');
    expect(result.message).toEqual('Custom report generated successfully');
  });

  it('should get performance predictions', async () => {
    const result = await analyticsService.getPerformancePredictions('campaign789');
    expect(result.message).toEqual('Performance predictions retrieved successfully');
  });

  it('should detect anomalies', async () => {
    const result = await analyticsService.detectAnomalies('campaign101');
    expect(result.message).toEqual('Anomalies detected successfully');
  });
});
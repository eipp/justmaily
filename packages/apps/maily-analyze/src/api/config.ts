import { AnalyticsService } from '../services/analytics.service';
import { PrometheusService } from '../services/prometheus.service';

export interface APIConfig {
  analyticsService: AnalyticsService;
  port: number;
}

export const loadConfig = (): APIConfig => {
  const port = parseInt(process.env.PORT || '3003', 10); // Default port for maily-analyze service
  const prometheusService = new PrometheusService();
  const analyticsService = new AnalyticsService(prometheusService);

  return {
    analyticsService,
    port,
  };
};
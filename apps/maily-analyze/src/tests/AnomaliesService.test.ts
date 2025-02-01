import { AnomaliesService } from '../services/AnomaliesService';

describe('AnomaliesService', () => {
  let anomaliesService: AnomaliesService;

  beforeEach(() => {
    anomaliesService = new AnomaliesService();
  });

  describe('detectAnomalies', () => {
    it('should return anomalies', async () => {
      const anomaliesResult = await anomaliesService.detectAnomalies();
      expect(anomaliesResult).toBeDefined();
      expect(anomaliesResult.anomalyId).toBe('anomaly123');
      expect(anomaliesResult.status).toBe('detected');
      expect(anomaliesResult.anomalies).toBeInstanceOf(Array);
    });
  });
});
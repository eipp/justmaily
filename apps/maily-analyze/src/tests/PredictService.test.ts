import { PredictService } from '../services/PredictService';

describe('PredictService', () => {
  let predictService: PredictService;

  beforeEach(() => {
    predictService = new PredictService();
  });

  describe('generatePrediction', () => {
    it('should return a prediction', async () => {
      const prediction = await predictService.generatePrediction();
      expect(prediction).toBeDefined();
      expect(prediction.predictionId).toBe('prediction123');
      expect(prediction.predictedOpens).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedClicks).toBeGreaterThanOrEqual(0);
      expect(prediction.confidenceLevel).toBeDefined();
    });
  });
});
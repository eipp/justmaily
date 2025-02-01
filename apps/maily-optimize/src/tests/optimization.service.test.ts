import { OptimizationService } from '../services/optimization.service';

describe('OptimizationService', () => {
  let optimizationService: OptimizationService;

  beforeEach(() => {
    optimizationService = new OptimizationService();
  });

  it('should create an A/B test', async () => {
    const result = await optimizationService.createABTest('campaign123', [
      { subject: 'Variant A Subject', body: 'Variant A Body' },
      { subject: 'Variant B Subject', body: 'Variant B Body' },
    ], 0.5);
    expect(result.message).toEqual('A/B test created successfully');
  });

  it('should schedule a campaign', async () => {
    const schedule = new Date();
    const result = await optimizationService.scheduleCampaign('campaign456', schedule);
    expect(result.message).toEqual('Campaign scheduled successfully');
  });

  it('should check content quality', async () => {
    const result = await optimizationService.checkContentQuality('Test content');
    expect(result.message).toEqual('Content check completed successfully');
  });

  it('should get test results', async () => {
    const result = await optimizationService.getTestResults('test789');
    expect(result.message).toEqual('Test results retrieved successfully');
  });
});
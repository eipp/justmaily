import { ReportService } from '../services/ReportService';

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
  });

  describe('generateReport', () => {
    it('should return a report', async () => {
      const report = await reportService.generateReport();
      expect(report).toBeDefined();
      expect(report.reportId).toBe('report123');
      expect(report.status).toBe('generated');
      expect(report.reportUrl).toBeDefined();
    });
  });
});
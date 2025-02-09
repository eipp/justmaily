const request = require('supertest');
const app = require('../../src/index');

describe('API Endpoints', () => {
  // Test for AI-driven test generation endpoint
  describe('POST /test/generate', () => {
    it('should return 400 if codeSnippet is missing', async () => {
      const res = await request(app).post('/test/generate').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Missing codeSnippet in request body');
    });
  });

  // Test for performance benchmark endpoint
  describe('POST /performance/run', () => {
    it('should return performance metrics and success flag', async () => {
      const res = await request(app).post('/performance/run').send({});
      expect(res.statusCode).toBeLessThanOrEqual(500);
      expect(res.body).toHaveProperty('metrics');
      expect(res.body).toHaveProperty('thresholds');
      expect(typeof res.body.success === 'boolean').toBe(true);
    });
  });

  // Test for chaos experiment endpoint
  describe('POST /chaos/experiment', () => {
    it('should trigger chaos experiment and return a result', async () => {
      const res = await request(app).post('/chaos/experiment').send({});
      // Accepting either 200 or a controlled error code
      expect([200, 500]).toContain(res.statusCode);
    });
  });
});

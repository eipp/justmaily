const request = require('supertest');
const app = require('../src/index');

describe('Bug Bounty API Endpoints', () => {
  describe('POST /bug-bounty/submit', () => {
    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/bug-bounty/submit')
        .send({ title: 'Test Bug' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for invalid severity', async () => {
      const res = await request(app).post('/bug-bounty/submit').send({
        title: 'Test Bug',
        description: 'Detailed bug description',
        severity: 'invalid',
        reporterEmail: 'test@example.com',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully submit a bug bounty report', async () => {
      const res = await request(app).post('/bug-bounty/submit').send({
        title: 'Test Bug',
        description: 'Detailed bug description',
        severity: 'High',
        reporterEmail: 'test@example.com',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('reportId');
      expect(res.body.data).toHaveProperty('title', 'Test Bug');
    });
  });

  describe('GET /bug-bounty/guidelines', () => {
    it('should retrieve bug bounty program guidelines', async () => {
      const res = await request(app).get('/bug-bounty/guidelines');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('scope');
    });
  });

  describe('GET /bug-bounty/reports', () => {
    it('should retrieve a list of bug bounty reports', async () => {
      const res = await request(app).get('/bug-bounty/reports');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

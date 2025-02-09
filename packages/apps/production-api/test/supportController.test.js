const request = require('supertest');
const app = require('../src/index');

describe('Support API Endpoints', () => {
  it('should return 400 for missing query parameter', async () => {
    const res = await request(app).post('/support/query').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Query parameter is required');
  });

  it('should return 200 with response for a valid query without escalation', async () => {
    const res = await request(app)
      .post('/support/query')
      .send({ query: 'How do I reset my password?' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });

  it('should escalate when query contains escalation keyword', async () => {
    const res = await request(app)
      .post('/support/query')
      .send({ query: 'Urgent: Error encountered' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('escalation');
  });
});

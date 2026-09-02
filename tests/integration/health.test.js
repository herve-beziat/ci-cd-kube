const request = require('supertest');
const { createServer } = require('../../backend/server');

describe('GET /api/health', () => {
  test('retourne { status: "ok" } avec status 200', async () => {
    const app = createServer();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

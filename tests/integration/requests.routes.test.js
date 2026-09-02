const request = require('supertest');
const { createServer } = require('../../backend/server');

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    headers: {
      get: () => 'application/json',
      entries: () => [['content-type', 'application/json']][Symbol.iterator](),
    },
    json: () => Promise.resolve({ hello: 'world' }),
    text: () => Promise.resolve(''),
  });
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/requests/send', () => {
  test('retourne statusCode, headers, body et responseTime', async () => {
    const app = createServer();
    const res = await request(app)
      .post('/api/requests/send')
      .send({ method: 'GET', url: 'http://test.local' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      body: { hello: 'world' },
      responseTime: expect.any(Number),
    });
  });

  test('retourne 500 si fetch échoue', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const app = createServer();
    const res = await request(app)
      .post('/api/requests/send')
      .send({ method: 'GET', url: 'http://test.local' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

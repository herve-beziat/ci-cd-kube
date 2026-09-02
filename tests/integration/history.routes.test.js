const request = require('supertest');
const { createDatabase, closeDatabase } = require('../../db/database');

let app;
let db;

beforeAll(() => {
  db = createDatabase(':memory:');
  jest.resetModules();
  jest.doMock('../../db/database', () => ({
    getDatabase: () => db,
    closeDatabase,
  }));
  const { createServer } = require('../../backend/server');
  app = createServer();
});

afterAll(() => {
  db.close();
});

beforeEach(() => {
  db.prepare('DELETE FROM history').run();
});

function insertEntry(overrides = {}) {
  db.prepare(`
    INSERT INTO history (method, url, headers, body, status_code, response_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    overrides.method ?? 'GET',
    overrides.url ?? 'https://example.com',
    overrides.headers ? JSON.stringify(overrides.headers) : null,
    overrides.body ? JSON.stringify(overrides.body) : null,
    overrides.statusCode ?? 200,
    overrides.responseTime ?? 100,
  );
}

describe('GET /api/history', () => {
  test('retourne un tableau vide si aucun historique', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('retourne les entrées existantes dans l\'ordre décroissant', async () => {
    insertEntry({ url: 'https://first.com' });
    insertEntry({ url: 'https://second.com' });
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].url).toBe('https://second.com');
  });

  test('les entrées contiennent les champs attendus', async () => {
    insertEntry();
    const res = await request(app).get('/api/history');
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      method: 'GET',
      url: 'https://example.com',
      statusCode: 200,
    });
  });
});

describe('DELETE /api/history/:id', () => {
  test('supprime l\'entrée et répond 204', async () => {
    insertEntry();
    const id = db.prepare('SELECT id FROM history').get().id;
    const res = await request(app).delete(`/api/history/${id}`);
    expect(res.status).toBe(204);
    expect(db.prepare('SELECT * FROM history').all()).toHaveLength(0);
  });

  test('répond 204 même si l\'id n\'existe pas', async () => {
    const res = await request(app).delete('/api/history/9999');
    expect(res.status).toBe(204);
  });
});

describe('DELETE /api/history', () => {
  test('vide tout l\'historique et répond 204', async () => {
    insertEntry();
    insertEntry({ url: 'https://other.com' });
    const res = await request(app).delete('/api/history');
    expect(res.status).toBe(204);
    expect(db.prepare('SELECT * FROM history').all()).toHaveLength(0);
  });

  test('répond 204 même si l\'historique est déjà vide', async () => {
    const res = await request(app).delete('/api/history');
    expect(res.status).toBe(204);
  });
});

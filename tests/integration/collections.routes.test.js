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
  db.prepare('DELETE FROM collection_items').run();
  db.prepare('DELETE FROM collections').run();
});

function insertCollection(name = 'Auth API') {
  return db.prepare('INSERT INTO collections (name) VALUES (?)').run(name).lastInsertRowid;
}

function insertItem(collectionId, overrides = {}) {
  return db.prepare(`
    INSERT INTO collection_items (collection_id, name, method, url, headers, body)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    collectionId,
    overrides.name ?? 'Login',
    overrides.method ?? 'GET',
    overrides.url ?? 'https://example.com',
    overrides.headers ? JSON.stringify(overrides.headers) : null,
    overrides.body ? JSON.stringify(overrides.body) : null,
  ).lastInsertRowid;
}

describe('GET /api/collections', () => {
  test('retourne un tableau vide si aucune collection', async () => {
    const res = await request(app).get('/api/collections');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('retourne les collections avec leurs items', async () => {
    const colId = insertCollection('Auth API');
    insertItem(colId, { url: 'https://example.com/login' });
    const res = await request(app).get('/api/collections');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Auth API');
    expect(res.body[0].items).toHaveLength(1);
  });

  test('retourne les champs attendus', async () => {
    insertCollection();
    const res = await request(app).get('/api/collections');
    expect(res.body[0]).toMatchObject({ id: expect.any(Number), name: 'Auth API', items: [] });
  });
});

describe('POST /api/collections', () => {
  test('crée une collection et répond 201', async () => {
    const res = await request(app)
      .post('/api/collections')
      .send({ name: 'Users API' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Users API');
    expect(db.prepare('SELECT * FROM collections').all()).toHaveLength(1);
  });

  test('répond 400 si le nom est absent', async () => {
    const res = await request(app).post('/api/collections').send({});
    expect(res.status).toBe(400);
  });

  test('répond 400 si le nom est vide', async () => {
    const res = await request(app).post('/api/collections').send({ name: '  ' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/collections/:id', () => {
  test('renomme la collection et répond 204', async () => {
    const id = insertCollection('Ancien nom');
    const res = await request(app)
      .put(`/api/collections/${id}`)
      .send({ name: 'Nouveau nom' });
    expect(res.status).toBe(204);
    const row = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
    expect(row.name).toBe('Nouveau nom');
  });

  test('répond 400 si le nom est absent', async () => {
    const id = insertCollection();
    const res = await request(app).put(`/api/collections/${id}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/collections/:id', () => {
  test('supprime la collection et répond 204', async () => {
    const id = insertCollection();
    const res = await request(app).delete(`/api/collections/${id}`);
    expect(res.status).toBe(204);
    expect(db.prepare('SELECT * FROM collections').all()).toHaveLength(0);
  });

  test('répond 204 même si l\'id n\'existe pas', async () => {
    const res = await request(app).delete('/api/collections/9999');
    expect(res.status).toBe(204);
  });
});

describe('POST /api/collections/:id/items', () => {
  test('ajoute un item et répond 201', async () => {
    const colId = insertCollection();
    const res = await request(app)
      .post(`/api/collections/${colId}/items`)
      .send({ method: 'POST', url: 'https://example.com/login', name: 'Login' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(db.prepare('SELECT * FROM collection_items').all()).toHaveLength(1);
  });

  test('répond 400 si method ou url sont absents', async () => {
    const colId = insertCollection();
    const res = await request(app)
      .post(`/api/collections/${colId}/items`)
      .send({ method: 'GET' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/collections/:id/items/:itemId', () => {
  test('supprime l\'item et répond 204', async () => {
    const colId = insertCollection();
    const itemId = insertItem(colId);
    const res = await request(app).delete(`/api/collections/${colId}/items/${itemId}`);
    expect(res.status).toBe(204);
    expect(db.prepare('SELECT * FROM collection_items').all()).toHaveLength(0);
  });

  test('répond 204 même si l\'item n\'existe pas', async () => {
    const colId = insertCollection();
    const res = await request(app).delete(`/api/collections/${colId}/items/9999`);
    expect(res.status).toBe(204);
  });
});

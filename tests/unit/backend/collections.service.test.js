const { createDatabase } = require('../../../db/database');

let db;
let service;

beforeEach(() => {
  db = createDatabase(':memory:');
  jest.resetModules();
  jest.doMock('../../../db/database', () => ({ getDatabase: () => db }));
  service = require('../../../backend/services/collections.service');
});

afterEach(() => {
  db.close();
});

describe('createCollection()', () => {
  test('insère une collection et la retourne', () => {
    const col = service.createCollection('Auth API');
    expect(col.id).toBeDefined();
    expect(col.name).toBe('Auth API');
  });

  test('la collection est visible en base', () => {
    service.createCollection('Auth API');
    const rows = db.prepare('SELECT * FROM collections').all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Auth API');
  });
});

describe('getAll()', () => {
  test('retourne un tableau vide si aucune collection', () => {
    expect(service.getAll()).toEqual([]);
  });

  test('retourne les collections avec leurs items', () => {
    const col = service.createCollection('Auth API');
    service.addItem(col.id, { method: 'GET', url: 'https://example.com', name: 'Login' });
    const results = service.getAll();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Auth API');
    expect(results[0].items).toHaveLength(1);
    expect(results[0].items[0].url).toBe('https://example.com');
  });

  test('retourne les champs attendus', () => {
    service.createCollection('Test');
    const result = service.getAll()[0];
    expect(result).toMatchObject({ id: expect.any(Number), name: 'Test', items: [] });
  });
});

describe('rename()', () => {
  test('met à jour le nom de la collection', () => {
    const col = service.createCollection('Ancien nom');
    service.rename(col.id, 'Nouveau nom');
    const row = db.prepare('SELECT * FROM collections WHERE id = ?').get(col.id);
    expect(row.name).toBe('Nouveau nom');
  });

  test('ne plante pas si l\'id n\'existe pas', () => {
    expect(() => service.rename(9999, 'Test')).not.toThrow();
  });
});

describe('deleteCollection()', () => {
  test('supprime la collection', () => {
    const col = service.createCollection('À supprimer');
    service.deleteCollection(col.id);
    expect(db.prepare('SELECT * FROM collections').all()).toHaveLength(0);
  });

  test('supprime en cascade les items de la collection', () => {
    const col = service.createCollection('Auth API');
    service.addItem(col.id, { method: 'GET', url: 'https://example.com' });
    service.deleteCollection(col.id);
    expect(db.prepare('SELECT * FROM collection_items').all()).toHaveLength(0);
  });

  test('ne plante pas si l\'id n\'existe pas', () => {
    expect(() => service.deleteCollection(9999)).not.toThrow();
  });
});

describe('addItem()', () => {
  test('insère un item et retourne son id', () => {
    const col = service.createCollection('Auth API');
    const itemId = service.addItem(col.id, {
      method: 'POST',
      url: 'https://example.com/login',
      name: 'Login',
      headers: { Authorization: 'Bearer token' },
      body: { user: 'test' },
    });
    expect(typeof itemId).toBe('number');
  });

  test('sérialise les headers et body en JSON', () => {
    const col = service.createCollection('Auth API');
    service.addItem(col.id, {
      method: 'POST',
      url: 'https://example.com',
      headers: { Authorization: 'Bearer token' },
      body: { key: 'value' },
    });
    const row = db.prepare('SELECT * FROM collection_items').get();
    expect(JSON.parse(row.headers)).toEqual({ Authorization: 'Bearer token' });
    expect(JSON.parse(row.body)).toEqual({ key: 'value' });
  });

  test('accepte null pour headers et body', () => {
    const col = service.createCollection('Auth API');
    service.addItem(col.id, { method: 'GET', url: 'https://example.com', headers: null, body: null });
    const row = db.prepare('SELECT * FROM collection_items').get();
    expect(row.headers).toBeNull();
    expect(row.body).toBeNull();
  });
});

describe('removeItem()', () => {
  test('supprime l\'item correspondant', () => {
    const col = service.createCollection('Auth API');
    const itemId = service.addItem(col.id, { method: 'GET', url: 'https://example.com' });
    service.removeItem(itemId);
    expect(db.prepare('SELECT * FROM collection_items').all()).toHaveLength(0);
  });

  test('ne plante pas si l\'id n\'existe pas', () => {
    expect(() => service.removeItem(9999)).not.toThrow();
  });
});

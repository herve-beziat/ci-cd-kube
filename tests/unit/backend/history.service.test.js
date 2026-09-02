const { createDatabase } = require('../../../db/database');

let db;
let service;

beforeEach(() => {
  db = createDatabase(':memory:');
  jest.resetModules();
  jest.doMock('../../../db/database', () => ({ getDatabase: () => db }));
  service = require('../../../backend/services/history.service');
});

afterEach(() => {
  db.close();
});

const entry = {
  method: 'GET',
  url: 'https://example.com/api',
  headers: { Accept: 'application/json' },
  body: null,
  statusCode: 200,
  responseTime: 42,
};

describe('save()', () => {
  test('insère une entrée dans la base', () => {
    service.save(entry);
    const rows = db.prepare('SELECT * FROM history').all();
    expect(rows).toHaveLength(1);
    expect(rows[0].method).toBe('GET');
    expect(rows[0].url).toBe('https://example.com/api');
    expect(rows[0].status_code).toBe(200);
  });

  test('sérialise les headers en JSON', () => {
    service.save(entry);
    const row = db.prepare('SELECT * FROM history').get();
    expect(JSON.parse(row.headers)).toEqual({ Accept: 'application/json' });
  });

  test('accepte null pour headers et body', () => {
    service.save({ ...entry, headers: null, body: null });
    const row = db.prepare('SELECT * FROM history').get();
    expect(row.headers).toBeNull();
    expect(row.body).toBeNull();
  });

  test('sérialise le body en JSON', () => {
    service.save({ ...entry, body: { key: 'value' } });
    const row = db.prepare('SELECT * FROM history').get();
    expect(JSON.parse(row.body)).toEqual({ key: 'value' });
  });
});

describe('getAll()', () => {
  test('retourne un tableau vide si aucun historique', () => {
    expect(service.getAll()).toEqual([]);
  });

  test('retourne les entrées dans l\'ordre décroissant', () => {
    service.save({ ...entry, url: 'https://first.com' });
    service.save({ ...entry, url: 'https://second.com' });
    const results = service.getAll();
    expect(results[0].url).toBe('https://second.com');
    expect(results[1].url).toBe('https://first.com');
  });

  test('désérialise les headers et body', () => {
    service.save({ ...entry, body: { a: 1 } });
    const results = service.getAll();
    expect(results[0].headers).toEqual({ Accept: 'application/json' });
    expect(results[0].body).toEqual({ a: 1 });
  });

  test('retourne les champs attendus', () => {
    service.save(entry);
    const result = service.getAll()[0];
    expect(result).toMatchObject({
      method: 'GET',
      url: 'https://example.com/api',
      statusCode: 200,
      responseTime: 42,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });
});

describe('deleteById()', () => {
  test('supprime l\'entrée correspondante', () => {
    service.save(entry);
    const id = db.prepare('SELECT id FROM history').get().id;
    service.deleteById(id);
    expect(db.prepare('SELECT * FROM history').all()).toHaveLength(0);
  });

  test('ne plante pas si l\'id n\'existe pas', () => {
    expect(() => service.deleteById(9999)).not.toThrow();
  });
});

describe('deleteAll()', () => {
  test('vide toute la table', () => {
    service.save(entry);
    service.save({ ...entry, url: 'https://other.com' });
    service.deleteAll();
    expect(db.prepare('SELECT * FROM history').all()).toHaveLength(0);
  });

  test('ne plante pas si la table est déjà vide', () => {
    expect(() => service.deleteAll()).not.toThrow();
  });
});

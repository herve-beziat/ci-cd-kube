const { getDatabase, closeDatabase, createDatabase, runMigrations } = require('../../../db/database');

describe('singleton getDatabase()', () => {
  afterEach(() => {
    closeDatabase();
  });

  test('retourne la même instance à chaque appel', () => {
    const db1 = getDatabase();
    const db2 = getDatabase();
    expect(db1).toBe(db2);
  });

  test('retourne une nouvelle instance après closeDatabase()', () => {
    const db1 = getDatabase();
    closeDatabase();
    const db2 = getDatabase();
    expect(db1).not.toBe(db2);
  });

  test('closeDatabase() est sans effet quand aucune connexion n\'est ouverte', () => {
    expect(() => closeDatabase()).not.toThrow();
  });
});

describe('migrations', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  function getTables(db) {
    return db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map(r => r.name);
  }

  test('crée la table history', () => {
    expect(getTables(db)).toContain('history');
  });

  test('crée la table collections', () => {
    expect(getTables(db)).toContain('collections');
  });

  test('crée la table collection_items', () => {
    expect(getTables(db)).toContain('collection_items');
  });

  test('la table history possède les bonnes colonnes', () => {
    const cols = db.pragma('table_info(history)').map(c => c.name);
    expect(cols).toEqual(
      expect.arrayContaining(['id', 'method', 'url', 'headers', 'body', 'status_code', 'response_time', 'created_at'])
    );
  });

  test('la table collection_items a une clé étrangère vers collections', () => {
    const fks = db.pragma('foreign_key_list(collection_items)');
    expect(fks.length).toBe(1);
    expect(fks[0].table).toBe('collections');
    expect(fks[0].on_delete).toBe('CASCADE');
  });

  test('les migrations sont idempotentes — double exécution sans erreur', () => {
    expect(() => runMigrations(db)).not.toThrow();
  });
});

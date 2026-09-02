const { getDatabase } = require('../../db/database');

function createCollection(name) {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO collections (name) VALUES (?)').run(name);
  return db.prepare('SELECT * FROM collections WHERE id = ?').get(result.lastInsertRowid);
}

function getAll() {
  const db = getDatabase();
  const collections = db.prepare('SELECT * FROM collections ORDER BY id ASC').all();
  const items = db.prepare('SELECT * FROM collection_items ORDER BY id ASC').all();
  return collections.map(col => ({
    id: col.id,
    name: col.name,
    createdAt: col.created_at,
    items: items.filter(item => item.collection_id === col.id).map(deserializeItem),
  }));
}

function rename(id, name) {
  const db = getDatabase();
  db.prepare('UPDATE collections SET name = ? WHERE id = ?').run(name, id);
}

function deleteCollection(id) {
  const db = getDatabase();
  db.prepare('DELETE FROM collections WHERE id = ?').run(id);
}

function addItem(collectionId, { name, method, url, headers, body }) {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO collection_items (collection_id, name, method, url, headers, body)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    collectionId,
    name || null,
    method,
    url,
    headers ? JSON.stringify(headers) : null,
    body ? JSON.stringify(body) : null,
  );
  return result.lastInsertRowid;
}

function removeItem(itemId) {
  const db = getDatabase();
  db.prepare('DELETE FROM collection_items WHERE id = ?').run(itemId);
}

function deserializeItem(row) {
  return {
    id: row.id,
    collectionId: row.collection_id,
    name: row.name,
    method: row.method,
    url: row.url,
    headers: row.headers ? JSON.parse(row.headers) : {},
    body: row.body ? JSON.parse(row.body) : null,
  };
}

module.exports = { createCollection, getAll, rename, deleteCollection, addItem, removeItem };

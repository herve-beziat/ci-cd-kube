const { getDatabase } = require('../../db/database');

function save({ method, url, headers, body, statusCode, responseTime }) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO history (method, url, headers, body, status_code, response_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    method,
    url,
    headers ? JSON.stringify(headers) : null,
    body ? JSON.stringify(body) : null,
    statusCode,
    responseTime,
  );
}

function getAll() {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM history ORDER BY id DESC LIMIT 100'
  ).all();
  return rows.map(deserialize);
}

function deleteById(id) {
  const db = getDatabase();
  db.prepare('DELETE FROM history WHERE id = ?').run(id);
}

function deleteAll() {
  const db = getDatabase();
  db.prepare('DELETE FROM history').run();
}

function deserialize(row) {
  return {
    id: row.id,
    method: row.method,
    url: row.url,
    headers: row.headers ? JSON.parse(row.headers) : {},
    body: row.body ? JSON.parse(row.body) : null,
    statusCode: row.status_code,
    responseTime: row.response_time,
    createdAt: row.created_at,
  };
}

module.exports = { save, getAll, deleteById, deleteAll };

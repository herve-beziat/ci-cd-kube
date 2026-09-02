const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let instance = null;
let customDbPath = null;

function setDatabasePath(dbPath) {
  customDbPath = dbPath;
}

function runMigrations(db) {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }
}

function createDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

function getDatabase() {
  if (!instance) {
    const dbPath = customDbPath || path.join(__dirname, 'pocketman.db');
    instance = createDatabase(dbPath);
  }
  return instance;
}

function closeDatabase() {
  if (instance) {
    instance.close();
    instance = null;
  }
}

module.exports = { getDatabase, closeDatabase, createDatabase, runMigrations, setDatabasePath };

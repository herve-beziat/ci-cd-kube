CREATE TABLE IF NOT EXISTS collections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  name          TEXT,
  method        TEXT    NOT NULL,
  url           TEXT    NOT NULL,
  headers       TEXT,
  body          TEXT,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

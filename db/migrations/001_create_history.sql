CREATE TABLE IF NOT EXISTS history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  method      TEXT    NOT NULL,
  url         TEXT    NOT NULL,
  headers     TEXT,
  body        TEXT,
  status_code INTEGER,
  response_time INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

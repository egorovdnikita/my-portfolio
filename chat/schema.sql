-- Журнал вопросов: без IP, cookie, user-agent и идентификаторов посетителей
CREATE TABLE IF NOT EXISTS log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  case_id TEXT NOT NULL,
  question TEXT NOT NULL,
  entry_id TEXT,
  score REAL,
  status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS log_created ON log (created_at);

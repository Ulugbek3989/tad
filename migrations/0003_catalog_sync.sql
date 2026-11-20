-- Katalog kurslarining (masalan, "Tadbirkorlik asoslari") bazadagi nusxasini yangi versiya bilan sinxronlash holati
CREATE TABLE IF NOT EXISTS catalog_sync (
  course_id INTEGER PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Kurs resurslari va talabalarning biznes loyihalari (vertikal loyiha)

CREATE TABLE IF NOT EXISTS course_resources (
  course_id INTEGER PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT '{}',
  progress INTEGER NOT NULL DEFAULT 0,      -- to'ldirilgan bo'limlar soni
  ai_feedback TEXT,                         -- JSON
  teacher_comment TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_projects_course ON projects(course_id);

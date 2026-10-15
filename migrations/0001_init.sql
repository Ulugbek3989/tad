-- TAD Ta'lim platformasi: boshlang'ich sxema

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','teacher','student')),
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  code TEXT,
  description TEXT,
  syllabus TEXT,              -- fan dasturi (markdown)
  objectives TEXT,            -- JSON massiv: o'quv maqsadlari
  literature TEXT,            -- adabiyotlar (markdown)
  color TEXT DEFAULT '#4f46e5',
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_modules_course ON modules(course_id);

CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,               -- ma'ruza matni (markdown)
  methods TEXT,               -- JSON: metod kalitlari
  hours REAL DEFAULT 2,
  kind TEXT DEFAULT 'lecture', -- lecture | practical | lab | seminar | independent
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);

CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  content TEXT NOT NULL DEFAULT '{}',  -- JSON (turga qarab)
  rubric TEXT,                          -- AI/o'qituvchi baholash mezonlari
  max_points INTEGER NOT NULL DEFAULT 10,
  attempts INTEGER NOT NULL DEFAULT 0,  -- 0 = cheklanmagan
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_activities_lesson ON activities(lesson_id);
CREATE INDEX idx_activities_course ON activities(course_id);

CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE group_members (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (group_id, user_id)
);
CREATE INDEX idx_group_members_user ON group_members(user_id);

CREATE TABLE lesson_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rubric TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  bonus_xp INTEGER NOT NULL DEFAULT 50,
  ai_grading INTEGER NOT NULL DEFAULT 1,
  due_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_assignments_course ON assignments(course_id);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer TEXT,                 -- JSON
  score REAL,
  max_score REAL,
  details TEXT,                -- JSON: avtomatik tekshiruv tafsilotlari
  feedback TEXT,               -- o'qituvchi izohi
  ai_feedback TEXT,            -- JSON: AI bahosi
  status TEXT NOT NULL DEFAULT 'graded' CHECK (status IN ('graded','pending','ai_graded','reviewed')),
  graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_activity ON submissions(activity_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_status ON submissions(status);

CREATE TABLE xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  course_id INTEGER,
  given_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_xp_user ON xp_events(user_id, created_at);

CREATE TABLE user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  reason TEXT,
  awarded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

CREATE TABLE srs_cards (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  card_index INTEGER NOT NULL,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL,
  first_seen TEXT NOT NULL DEFAULT (date('now')),
  PRIMARY KEY (user_id, activity_id, card_index)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  column_key TEXT,             -- metod ustuni (masalan, Venn: A / B / umumiy)
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_posts_activity ON posts(activity_id);

CREATE TABLE post_likes (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE recommendations (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,       -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, course_id)
);

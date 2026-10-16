-- Requests from /hire/ (functions/api/hire.ts).
-- Apply: npx wrangler d1 execute hdj-hire --remote --file=migrations/0001_hire.sql
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  org TEXT,
  link TEXT,
  message TEXT,
  services TEXT NOT NULL,   -- JSON array of service ids ('unsure' when they weren't sure)
  answers TEXT NOT NULL,    -- JSON, the cleaned answers the estimate came from
  timeline TEXT,
  budget TEXT,
  total INTEGER NOT NULL DEFAULT 0,    -- dollars, worked out on the server
  monthly INTEGER NOT NULL DEFAULT 0,
  page TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS requests_created ON requests (created_at DESC);

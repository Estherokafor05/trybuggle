-- Community forum (step 8): sections, questions and discussions, answers,
-- comments on answers, "helpful" votes and reports. There are no private
-- messages. Additive and safe to run more than once.

CREATE TABLE IF NOT EXISTS forum_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 300),
  position integer NOT NULL DEFAULT 0,
  -- Locked sections can be read but take no new posts.
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES forum_sections(id) ON DELETE RESTRICT,
  -- auth_user id; null once the author deletes their account.
  author_id text,
  kind text NOT NULL CHECK (kind IN ('question', 'discussion')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  body text NOT NULL CHECK (char_length(body) <= 10000),
  lesson_slug text,
  pinned boolean NOT NULL DEFAULT false,
  locked boolean NOT NULL DEFAULT false,
  hidden_at timestamptz,
  hidden_reason text,
  deleted_at timestamptz,
  accepted_post_id uuid,
  reply_count integer NOT NULL DEFAULT 0,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS forum_threads_section ON forum_threads(section_id, pinned DESC, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS forum_threads_author ON forum_threads(author_id);

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  -- A comment on an answer points to it. Comments can't have comments.
  parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id text,
  body text NOT NULL CHECK (char_length(body) <= 5000),
  hidden_at timestamptz,
  hidden_reason text,
  deleted_at timestamptz,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
CREATE INDEX IF NOT EXISTS forum_posts_thread ON forum_posts(thread_id, created_at);
CREATE INDEX IF NOT EXISTS forum_posts_author ON forum_posts(author_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_threads_accepted_post') THEN
    ALTER TABLE forum_threads ADD CONSTRAINT forum_threads_accepted_post
      FOREIGN KEY (accepted_post_id) REFERENCES forum_posts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- One "helpful" per person per question or answer.
CREATE TABLE IF NOT EXISTS forum_votes (
  target_type text NOT NULL CHECK (target_type IN ('thread', 'post')),
  target_id uuid NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (target_type, target_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('thread', 'post')),
  target_id uuid NOT NULL,
  reporter_id text,
  reason text NOT NULL CHECK (reason IN ('unkind', 'spam', 'personal-info', 'unsafe', 'other')),
  note text CHECK (char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text,
  outcome text CHECK (outcome IN ('hidden', 'kept'))
);
CREATE INDEX IF NOT EXISTS forum_reports_open ON forum_reports(created_at) WHERE resolved_at IS NULL;
-- One open report per person per item.
CREATE UNIQUE INDEX IF NOT EXISTS forum_reports_once ON forum_reports(target_type, target_id, reporter_id) WHERE resolved_at IS NULL;

-- Starting sections. Admins can rename, lock or add sections later.
INSERT INTO forum_sections(slug, title, description, position) VALUES
  ('introductions', 'Say hello', 'New here? Introduce yourself and say what brought you to Buggle Learn.', 10),
  ('ai-foundations', 'Module 1: Foundations of AI', 'Questions and thoughts about the Module 1 lessons.', 20),
  ('talking-to-ai', 'Module 2: Talking to AI', 'Prompts that worked, prompts that didn''t, and questions about Module 2.', 30),
  ('staying-safe-with-ai', 'Staying safe with AI', 'Scams, fakes, privacy and using AI fairly.', 40),
  ('ai-at-work', 'AI at work and study', 'How you use AI in your job, studies or business.', 50),
  ('feedback', 'Ideas and feedback', 'Tell us what would make Buggle Learn better.', 60)
ON CONFLICT (slug) DO NOTHING;

-- The lesson builder: courses made in the admin area (by Buggle Learn) or by
-- organisations on a Platform plan, from blocks such as text, images and video.
-- The AI Literacy course stays in the course files ('files').
-- Additive and safe to run more than once.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'builder';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_source') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_source CHECK (source IN ('files', 'builder'));
  END IF;
END $$;
UPDATE courses SET source = 'files' WHERE slug = 'ai-literacy';
CREATE INDEX IF NOT EXISTS courses_organization ON courses(organization_id);

-- Images for builder lessons, kept small.
CREATE TABLE IF NOT EXISTS course_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  bytes bytea NOT NULL CHECK (octet_length(bytes) <= 1500000),
  type text NOT NULL CHECK (type IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Results of knowledge checks in builder courses.
CREATE TABLE IF NOT EXISTS builder_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id text NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  submission_key uuid NOT NULL,
  answers jsonb NOT NULL,
  question_count smallint NOT NULL CHECK (question_count > 0),
  correct_count smallint NOT NULL CHECK (correct_count >= 0),
  pass_percent smallint NOT NULL CHECK (pass_percent BETWEEN 1 AND 100),
  passed boolean GENERATED ALWAYS AS (correct_count * 100 >= question_count * pass_percent) STORED,
  feedback jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_id, assessment_id, submission_key)
);
CREATE INDEX IF NOT EXISTS builder_attempts_learner ON builder_attempts(learner_id, assessment_id);

-- Lessons with no knowledge check are done when the learner says so.
CREATE TABLE IF NOT EXISTS builder_completions (
  learner_id text NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES course_items(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id, item_id)
);

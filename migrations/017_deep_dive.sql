-- Deep Dive courses: "What is AI" (the starting course) and the AI courses
-- that open after it, each with chapters and units, built in the lesson
-- builder. Plus who may open the paid parts. Additive and safe to run again.

-- 'short': a free short course (or an organisation's own course).
-- 'deep_dive': part of the paid Deep Dive catalogue (Buggle Learn's own only).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'short';
-- The course every other Deep Dive course needs first: "What is AI".
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_foundation boolean NOT NULL DEFAULT false;
-- How many chapters anyone can open without paying.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS free_chapters smallint NOT NULL DEFAULT 0;
-- Order in the Deep Dive catalogue.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS catalogue_position integer NOT NULL DEFAULT 100;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_kind') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_kind CHECK (kind IN ('short', 'deep_dive'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_free_chapters') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_free_chapters CHECK (free_chapters BETWEEN 0 AND 20);
  END IF;
  -- Only Buggle Learn's own courses are in the paid catalogue.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_deep_dive_is_ours') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_deep_dive_is_ours CHECK (kind = 'short' OR organization_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_foundation_is_deep_dive') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_foundation_is_deep_dive CHECK (NOT is_foundation OR kind = 'deep_dive');
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS courses_one_foundation ON courses((true)) WHERE is_foundation;

-- Who may open a paid course. course_id NULL means every Deep Dive course
-- (all-access). ends_at NULL means for good (a course bought once).
CREATE TABLE IF NOT EXISTS course_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id text NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  -- purchase: bought once. subscription: all-access, paid monthly or yearly.
  -- test: a test purchase on a test site. admin: given by a Buggle Learn admin.
  source text NOT NULL CHECK (source IN ('purchase', 'subscription', 'test', 'admin', 'gift')),
  -- The payment or subscription it came from, so a refund or cancellation can end it.
  reference text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_entitlements_learner ON course_entitlements(learner_id);
CREATE UNIQUE INDEX IF NOT EXISTS course_entitlements_reference ON course_entitlements(reference) WHERE reference IS NOT NULL;

-- Learner settings that follow them across devices (language for now).
-- Additive and safe to run more than once.
CREATE TABLE IF NOT EXISTS learner_preferences (
  learner_id text PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
  locale text NOT NULL DEFAULT 'en' CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

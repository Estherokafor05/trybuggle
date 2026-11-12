CREATE TABLE IF NOT EXISTS learners (
 id text PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS learning_lessons (
 slug text PRIMARY KEY,
 title text NOT NULL,
 content_version integer NOT NULL DEFAULT 1
);
INSERT INTO learning_lessons(slug,title) VALUES
 ('what-counts-as-ai','What is AI?'),
 ('ai-in-your-day','AI Is Already in Your Day'),
 ('before-chatgpt','AI Did Not Start with ChatGPT'),
 ('ai-or-software','AI or Ordinary Software?'),
 ('what-ai-can-do','What AI Can Do, and Where You Stay in Charge')
ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title;
CREATE TABLE IF NOT EXISTS learning_checkpoints (
 learner_id text NOT NULL REFERENCES learners(id),
 lesson_slug text NOT NULL REFERENCES learning_lessons(slug),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 checkpoint jsonb NOT NULL CHECK(jsonb_typeof(checkpoint)='object'),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(learner_id,lesson_slug)
);
CREATE TABLE IF NOT EXISTS assessment_attempts (
 id uuid PRIMARY KEY,
 learner_id text NOT NULL REFERENCES learners(id),
 lesson_slug text NOT NULL REFERENCES learning_lessons(slug),
 assessment_version integer NOT NULL,
 submission_key uuid NOT NULL,
 answers jsonb NOT NULL,
 correct_count smallint NOT NULL CHECK(correct_count BETWEEN 0 AND 10),
 question_count smallint NOT NULL DEFAULT 10 CHECK(question_count=10),
 passed boolean GENERATED ALWAYS AS(correct_count>=7) STORED,
 feedback jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(learner_id,lesson_slug,submission_key)
);
CREATE INDEX IF NOT EXISTS assessment_attempts_learner_lesson ON assessment_attempts(learner_id,lesson_slug,created_at DESC);

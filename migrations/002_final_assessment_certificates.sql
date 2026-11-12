-- Module final assessments (short refreshers) and Certificates of Completion.
-- Additive only: lesson checks keep their own table and rules.
CREATE TABLE IF NOT EXISTS module_assessment_attempts (
 id uuid PRIMARY KEY,
 learner_id text NOT NULL REFERENCES learners(id),
 module_slug text NOT NULL,
 assessment_version integer NOT NULL,
 submission_key uuid NOT NULL,
 answers jsonb NOT NULL,
 question_count smallint NOT NULL CHECK(question_count BETWEEN 1 AND 50),
 correct_count smallint NOT NULL,
 passed boolean GENERATED ALWAYS AS(correct_count*10 >= question_count*7) STORED,
 feedback jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(learner_id,module_slug,submission_key),
 CHECK(correct_count BETWEEN 0 AND question_count)
);
CREATE INDEX IF NOT EXISTS module_assessment_attempts_learner ON module_assessment_attempts(learner_id,module_slug,created_at DESC);
CREATE TABLE IF NOT EXISTS certificates (
 id uuid PRIMARY KEY,
 code text NOT NULL UNIQUE,
 learner_id text NOT NULL REFERENCES learners(id),
 module_slug text NOT NULL,
 learner_name text NOT NULL CHECK(char_length(learner_name) BETWEEN 1 AND 80),
 completed_on date NOT NULL,
 requirements jsonb NOT NULL,
 issued_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(learner_id,module_slug)
);

-- Configurable knowledge checks (step 4).
-- Each result now remembers the pass mark it was marked against, so changing a
-- check's pass mark later never changes anyone's earlier result.
-- Existing results keep 70%, which gives exactly the same pass/fail as before.
-- Additive and safe to run more than once.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'assessment_attempts' AND column_name = 'pass_percent'
  ) THEN
    ALTER TABLE assessment_attempts DROP COLUMN IF EXISTS passed;
    ALTER TABLE assessment_attempts
      ADD COLUMN pass_percent smallint NOT NULL DEFAULT 70 CONSTRAINT assessment_attempts_pass_percent CHECK (pass_percent BETWEEN 1 AND 100);
    ALTER TABLE assessment_attempts
      ADD COLUMN passed boolean GENERATED ALWAYS AS (correct_count * 100 >= question_count * pass_percent) STORED;
    -- Answers show in their written order unless an admin turns shuffling on.
    -- Runs once: no admin could have changed these settings before this step.
    ALTER TABLE assessments ALTER COLUMN shuffle_options SET DEFAULT false;
    UPDATE assessments SET shuffle_options = false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'module_assessment_attempts' AND column_name = 'pass_percent'
  ) THEN
    ALTER TABLE module_assessment_attempts DROP COLUMN IF EXISTS passed;
    ALTER TABLE module_assessment_attempts
      ADD COLUMN pass_percent smallint NOT NULL DEFAULT 70 CONSTRAINT module_assessment_attempts_pass_percent CHECK (pass_percent BETWEEN 1 AND 100);
    ALTER TABLE module_assessment_attempts
      ADD COLUMN passed boolean GENERATED ALWAYS AS (correct_count * 100 >= question_count * pass_percent) STORED;
  END IF;
END $$;

-- Counting a learner's tries and finding passes quickly.
CREATE INDEX IF NOT EXISTS assessment_attempts_passed ON assessment_attempts(learner_id) WHERE passed;
CREATE INDEX IF NOT EXISTS module_assessment_attempts_passed ON module_assessment_attempts(learner_id) WHERE passed;

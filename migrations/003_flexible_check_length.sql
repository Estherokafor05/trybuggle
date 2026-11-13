-- Knowledge checks can have any number of questions (5 from Module 2 onwards).
-- Passing stays at 70%: 7 of 10, 4 of 5. Existing 10-question results are unchanged.
-- Safe to run more than once.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_attempts_question_range') THEN
    ALTER TABLE assessment_attempts DROP CONSTRAINT IF EXISTS assessment_attempts_question_count_check;
    ALTER TABLE assessment_attempts DROP CONSTRAINT IF EXISTS assessment_attempts_correct_count_check;
    ALTER TABLE assessment_attempts DROP COLUMN IF EXISTS passed;
    ALTER TABLE assessment_attempts ADD COLUMN passed boolean GENERATED ALWAYS AS (correct_count * 10 >= question_count * 7) STORED;
    ALTER TABLE assessment_attempts ADD CONSTRAINT assessment_attempts_question_range CHECK (question_count BETWEEN 1 AND 50 AND correct_count BETWEEN 0 AND question_count);
  END IF;
END $$;

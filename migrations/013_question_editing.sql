-- Editing knowledge-check questions in the admin area (step 10).
-- Once an admin edits a check's questions, the site uses the database copy and
-- re-importing the course files never changes them again.
-- Additive and safe to run more than once.
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS questions_edited_at timestamptz;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS questions_edited_by text;

-- Essentials certificate and public verification (step 6).
-- One certificate after every Essentials module (FRD Version 2), and later one
-- after the Deep Dive. Module certificates issued before this step keep working.
-- Additive and safe to run more than once.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'module';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS course_slug text NOT NULL DEFAULT 'ai-literacy';
-- Set by an admin if a certificate must be withdrawn. Verification then says so.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_reason text;
ALTER TABLE certificates ALTER COLUMN module_slug DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_kind') THEN
    ALTER TABLE certificates ADD CONSTRAINT certificates_kind
      CHECK (kind IN ('module', 'essentials', 'deep_dive'));
  END IF;
  -- Only module certificates name a module.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_module_matches_kind') THEN
    ALTER TABLE certificates ADD CONSTRAINT certificates_module_matches_kind
      CHECK ((kind = 'module') = (module_slug IS NOT NULL));
  END IF;
END $$;

-- One Essentials (and one Deep Dive) certificate per learner and course.
CREATE UNIQUE INDEX IF NOT EXISTS certificates_one_per_course
  ON certificates(learner_id, course_slug, kind) WHERE kind <> 'module';

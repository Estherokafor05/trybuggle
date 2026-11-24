-- Courses stored as data (lms-platform build, step 2).
-- A course has two levels: Essentials (modules made of lessons) and Deep Dive
-- (chapters made of units). The platform calls a module or chapter a "section"
-- and a lesson or unit an "item". Every item is built from content blocks.
-- Additive only: existing tables are unchanged. Safe to run more than once.

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
 summary text NOT NULL DEFAULT '',
 -- NULL for Buggle's own courses; set to the owning organisation once organisations exist.
 organization_id text,
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);

-- A module (Essentials) or a chapter (Deep Dive).
CREATE TABLE IF NOT EXISTS course_sections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 level text NOT NULL CHECK (level IN ('essentials', 'deep_dive')),
 position integer NOT NULL CHECK (position > 0),
 slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
 summary text NOT NULL DEFAULT '',
 outcome text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (id, course_id),
 UNIQUE (course_id, slug),
 CONSTRAINT course_sections_order UNIQUE (course_id, level, position) DEFERRABLE INITIALLY DEFERRED
);

-- A lesson (Essentials) or a unit (Deep Dive).
CREATE TABLE IF NOT EXISTS course_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid NOT NULL,
 section_id uuid NOT NULL,
 position integer NOT NULL CHECK (position > 0),
 slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
 summary text NOT NULL DEFAULT '',
 objective text NOT NULL DEFAULT '',
 estimated_minutes smallint NOT NULL DEFAULT 0 CHECK (estimated_minutes BETWEEN 0 AND 120),
 sources jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(sources) = 'array'),
 content_version integer NOT NULL DEFAULT 1 CHECK (content_version > 0),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (section_id, course_id) REFERENCES course_sections(id, course_id) ON DELETE CASCADE,
 UNIQUE (course_id, slug),
 CONSTRAINT course_items_order UNIQUE (section_id, position) DEFERRABLE INITIALLY DEFERRED
);

-- The pieces a lesson or unit is made of, in order.
-- course_component renders a screen written in the course's own code; it bridges
-- today's lesson-specific activities until they are rebuilt as general blocks.
CREATE TABLE IF NOT EXISTS content_blocks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 item_id uuid NOT NULL REFERENCES course_items(id) ON DELETE CASCADE,
 position integer NOT NULL CHECK (position > 0),
 type text NOT NULL CHECK (type IN (
   'text', 'image', 'video', 'short', 'audio', 'animation', 'story_film',
   'interactive', 'reflection', 'practice_quiz', 'download', 'embed', 'course_component'
 )),
 data jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(data) = 'object'),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT content_blocks_order UNIQUE (item_id, position) DEFERRABLE INITIALLY DEFERRED
);

-- A knowledge check (one item), a module or chapter assessment (one section),
-- or a final assessment for a whole level.
CREATE TABLE IF NOT EXISTS assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 scope text NOT NULL CHECK (scope IN ('item', 'section', 'level')),
 item_id uuid REFERENCES course_items(id) ON DELETE CASCADE,
 section_id uuid REFERENCES course_sections(id) ON DELETE CASCADE,
 level text CHECK (level IN ('essentials', 'deep_dive')),
 -- The id the current assessment pages and saved results use, e.g. a lesson or module slug.
 legacy_key text,
 question_count smallint NOT NULL CHECK (question_count BETWEEN 1 AND 50),
 pass_percent smallint NOT NULL DEFAULT 70 CHECK (pass_percent BETWEEN 1 AND 100),
 -- NULL means unlimited retries.
 max_attempts smallint CHECK (max_attempts IS NULL OR max_attempts > 0),
 shuffle_options boolean NOT NULL DEFAULT true,
 version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT assessments_scope CHECK (
   (scope = 'item' AND item_id IS NOT NULL AND section_id IS NULL AND level IS NULL)
   OR (scope = 'section' AND section_id IS NOT NULL AND item_id IS NULL AND level IS NULL)
   OR (scope = 'level' AND level IS NOT NULL AND item_id IS NULL AND section_id IS NULL)
 )
);
CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_per_item ON assessments(item_id) WHERE scope = 'item';
CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_per_section ON assessments(section_id) WHERE scope = 'section';
CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_per_level ON assessments(course_id, level) WHERE scope = 'level';
CREATE UNIQUE INDEX IF NOT EXISTS assessments_legacy_key ON assessments(course_id, legacy_key) WHERE legacy_key IS NOT NULL;

-- Questions and their correct answers. Server code only: never send correct_option to a browser.
CREATE TABLE IF NOT EXISTS assessment_questions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
 -- Stable id used in submitted answers, e.g. "meaning".
 key text NOT NULL CHECK (char_length(key) BETWEEN 1 AND 80),
 position integer NOT NULL CHECK (position > 0),
 prompt text NOT NULL CHECK (char_length(prompt) > 0),
 -- [{ "id": "0", "text": "..." }, ...]
 options jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) BETWEEN 2 AND 8),
 correct_option text NOT NULL,
 explanation text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (assessment_id, key),
 CONSTRAINT assessment_questions_order UNIQUE (assessment_id, position) DEFERRABLE INITIALLY DEFERRED,
 CONSTRAINT assessment_questions_correct_is_an_option
   CHECK (options @> jsonb_build_array(jsonb_build_object('id', correct_option)))
);

CREATE INDEX IF NOT EXISTS course_sections_course ON course_sections(course_id, level, position);
CREATE INDEX IF NOT EXISTS course_items_section ON course_items(section_id, position);
CREATE INDEX IF NOT EXISTS content_blocks_item ON content_blocks(item_id, position);
CREATE INDEX IF NOT EXISTS assessment_questions_assessment ON assessment_questions(assessment_id, position);

CREATE OR REPLACE TRIGGER courses_touch BEFORE UPDATE ON courses
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE OR REPLACE TRIGGER course_sections_touch BEFORE UPDATE ON course_sections
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE OR REPLACE TRIGGER course_items_touch BEFORE UPDATE ON course_items
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE OR REPLACE TRIGGER content_blocks_touch BEFORE UPDATE ON content_blocks
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE OR REPLACE TRIGGER assessments_touch BEFORE UPDATE ON assessments
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE OR REPLACE TRIGGER assessment_questions_touch BEFORE UPDATE ON assessment_questions
 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

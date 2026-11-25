-- Rewards: points, badges and leaderboards are worked out from what learners
-- have done, so only the choice to stay off leaderboards is stored.
-- Additive and safe to run more than once.
ALTER TABLE learner_preferences ADD COLUMN IF NOT EXISTS leaderboard_hidden boolean NOT NULL DEFAULT false;

-- Helps the leaderboard add up points quickly.
CREATE INDEX IF NOT EXISTS assessment_attempts_points ON assessment_attempts(learner_id, lesson_slug, created_at);
CREATE INDEX IF NOT EXISTS module_assessment_attempts_points ON module_assessment_attempts(learner_id, module_slug, created_at);
CREATE INDEX IF NOT EXISTS forum_threads_author ON forum_threads(author_id, created_at);
CREATE INDEX IF NOT EXISTS forum_posts_author ON forum_posts(author_id, created_at);

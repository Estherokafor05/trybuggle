-- Early-access sign-ups (AI for Testers first). One row per email per list.
-- Signing up again only updates the role. Safe to run more than once.
CREATE TABLE IF NOT EXISTS waitlist_signups (
 list text NOT NULL,
 email text NOT NULL CHECK (email = lower(email) AND length(email) <= 254),
 role text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (list, email)
);

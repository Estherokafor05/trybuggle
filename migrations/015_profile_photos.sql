-- Profile photos learners upload in Settings. The browser shrinks each photo to
-- a small square before sending it, which also removes hidden details such as
-- where it was taken. Additive and safe to run more than once.
CREATE TABLE IF NOT EXISTS profile_photos (
  user_id text PRIMARY KEY REFERENCES auth_user(id) ON DELETE CASCADE,
  -- A new id for every upload, so the address changes and browsers fetch the new photo.
  id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  bytes bytea NOT NULL CHECK (octet_length(bytes) <= 300000),
  type text NOT NULL CHECK (type IN ('image/png', 'image/jpeg', 'image/webp')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

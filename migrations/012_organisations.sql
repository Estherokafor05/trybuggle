-- Organisations and their plans (step 9). Companies, schools and teams buy a
-- yearly plan per learner ("seat"), add their members, and see their progress.
-- Payments go through Stripe; prices are set by Buggle Learn admins.
-- Additive and safe to run more than once.

-- The three plans. Prices are in the smallest unit (cents), per learner per year.
CREATE TABLE IF NOT EXISTS org_plans (
  code text PRIMARY KEY CHECK (code IN ('platform', 'content', 'both')),
  name text NOT NULL,
  description text NOT NULL,
  price_per_seat_year integer NOT NULL DEFAULT 0 CHECK (price_per_seat_year >= 0),
  currency text NOT NULL DEFAULT 'usd' CHECK (currency ~ '^[a-z]{3}$'),
  active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Plans start switched off with no price: an admin sets prices, then switches them on.
INSERT INTO org_plans(code, name, description) VALUES
  ('platform', 'Platform only', 'Your own space on Buggle Learn for your own courses, with your members, progress dashboard and branding.'),
  ('content', 'Buggle content', 'Buggle Learn courses for your members, including the Deep Dive when it launches, with a progress dashboard and your branding.'),
  ('both', 'Platform and content', 'Everything: your own courses and all Buggle Learn content, with your members, progress dashboard and branding.')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 60),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  logo bytea CHECK (logo IS NULL OR octet_length(logo) <= 300000),
  logo_type text CHECK (logo_type IS NULL OR logo_type IN ('image/png', 'image/jpeg', 'image/webp')),
  plan text REFERENCES org_plans(code),
  seats integer NOT NULL DEFAULT 0 CHECK (seats >= 0 AND seats <= 100000),
  -- none: no plan yet. active and past_due come from Stripe; test: simulated on a test site.
  status text NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'active', 'past_due', 'cancelled', 'test')),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  current_period_end timestamptz,
  join_token_hash text UNIQUE,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organisation_members (
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "auth_user"("id") ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
CREATE INDEX IF NOT EXISTS organisation_members_user ON organisation_members(user_id);

-- Email invites. Only a hash of each link's token is stored; links work once.
CREATE TABLE IF NOT EXISTS organisation_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email = lower(email)),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  token_hash text NOT NULL UNIQUE,
  invited_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS organisation_invites_org ON organisation_invites(org_id);

-- Stripe sends each event at least once; this makes handling each one exactly once.
CREATE TABLE IF NOT EXISTS stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

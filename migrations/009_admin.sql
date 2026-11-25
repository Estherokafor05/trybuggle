-- Admin accounts, kept apart from learner accounts (step 7).
-- Admins have their own tables, sign-in address and cookie (src/admin-auth.ts),
-- join by invite only, and must use an authenticator app.
-- Additive and safe to run more than once.

CREATE TABLE IF NOT EXISTS "admin_user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "twoFactorEnabled" boolean default false, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);
CREATE TABLE IF NOT EXISTS "admin_session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "admin_user" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "admin_account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "admin_user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);
CREATE TABLE IF NOT EXISTS "admin_verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);
CREATE TABLE IF NOT EXISTS "admin_rate_limit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);
CREATE TABLE IF NOT EXISTS "admin_two_factor" ("id" text not null primary key, "secret" text not null, "backupCodes" text not null, "userId" text not null references "admin_user" ("id") on delete cascade, "verified" boolean default true, "failedVerificationCount" integer default 0, "lockedUntil" timestamptz);
CREATE INDEX IF NOT EXISTS "admin_session_userId_idx" on "admin_session" ("userId");
CREATE INDEX IF NOT EXISTS "admin_account_userId_idx" on "admin_account" ("userId");
CREATE INDEX IF NOT EXISTS "admin_verification_identifier_idx" on "admin_verification" ("identifier");
CREATE INDEX IF NOT EXISTS "admin_two_factor_userId_idx" on "admin_two_factor" ("userId");
CREATE INDEX IF NOT EXISTS "admin_two_factor_secret_idx" on "admin_two_factor" ("secret");

-- Set when the very first admin is created, so set-up can only ever happen once.
CREATE TABLE IF NOT EXISTS admin_setup (id text PRIMARY KEY CHECK (id = 'first'), claimed_at timestamptz NOT NULL DEFAULT now());

-- Invites. Only a hash of the link's token is stored; links work once and expire.
CREATE TABLE IF NOT EXISTS admin_invites (
  id uuid PRIMARY KEY,
  email text NOT NULL CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 254),
  token_hash text NOT NULL UNIQUE,
  invited_by text REFERENCES "admin_user"("id") ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS admin_invites_email ON admin_invites(email);

-- Every change an admin makes, newest first on the activity page.
CREATE TABLE IF NOT EXISTS admin_audit (
  id bigserial PRIMARY KEY,
  admin_id text REFERENCES "admin_user"("id") ON DELETE SET NULL,
  admin_email text NOT NULL,
  action text NOT NULL,
  target text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_created ON admin_audit(created_at DESC);

-- Extra tries an admin gives a learner on a check with a tries limit.
CREATE TABLE IF NOT EXISTS assessment_attempt_grants (
  learner_id text NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  assessment_key text NOT NULL,
  extra smallint NOT NULL CHECK (extra BETWEEN 1 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id, assessment_key)
);

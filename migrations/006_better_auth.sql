-- Accounts and sign-in, used by Better Auth (src/auth.ts), lms-platform step 3.
-- Generated from our Better Auth settings, then made safe to run more than once.
-- Learner progress tables are unchanged: their learner_id is auth_user.id.
-- Passwords are stored only as hashes in auth_account.password.

CREATE TABLE IF NOT EXISTS "auth_user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);
CREATE TABLE IF NOT EXISTS "auth_session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "auth_user" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "auth_account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "auth_user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);
CREATE TABLE IF NOT EXISTS "auth_verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);
CREATE TABLE IF NOT EXISTS "auth_rate_limit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);
CREATE INDEX IF NOT EXISTS "auth_session_userId_idx" on "auth_session" ("userId");
CREATE INDEX IF NOT EXISTS "auth_account_userId_idx" on "auth_account" ("userId");
CREATE INDEX IF NOT EXISTS "auth_verification_identifier_idx" on "auth_verification" ("identifier");

-- One Google (or other) account can belong to only one Buggle Learn account.
CREATE UNIQUE INDEX IF NOT EXISTS "auth_account_provider_account_idx" ON "auth_account" ("providerId", "accountId");

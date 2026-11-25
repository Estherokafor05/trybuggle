// Sign-in for admins: a separate Better Auth setup from learners (src/auth.ts).
// Admins have their own tables (admin_*), their own address (/admin) and their
// own cookie, so a learner login never opens admin pages and an admin login
// never appears on the learner site. There is no sign-up: admins join by
// invite (src/server/admin.ts) and must use an authenticator app.
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { headers } from "next/headers";
import { Pool } from "pg";
import { cache } from "react";

let pool: Pool | undefined;
function database() {
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  }));
}

export const adminAuth = betterAuth({
  appName: "Buggle Learn Admin",
  basePath: "/api/admin-auth",
  database: database(),
  baseURL: {
    allowedHosts: ["trybuggle.vercel.app", "*.vercel.app", "localhost:3000", "127.0.0.1:3000"],
    fallback: "https://trybuggle.vercel.app",
  },
  user: { modelName: "admin_user" },
  session: {
    modelName: "admin_session",
    // Admin sessions are short: 12 hours, refreshed while in use.
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
  },
  account: { modelName: "admin_account", accountLinking: { enabled: false } },
  verification: { modelName: "admin_verification" },
  rateLimit: {
    enabled: process.env.AUTH_RATE_LIMIT !== "off",
    storage: "database",
    modelName: "admin_rate_limit",
    customRules: { "/sign-in/email": { window: 60, max: 5 } },
  },
  advanced: {
    cookiePrefix: "buggle-admin",
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  },
  emailAndPassword: {
    enabled: true,
    // Invite only: accounts are created when an invite is accepted.
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  plugins: [
    twoFactor({
      issuer: "Buggle Learn Admin",
      twoFactorTable: "admin_two_factor",
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 15 * 60 },
    }),
    nextCookies(),
  ],
});

export type AdminSession = {
  user: { id: string; name: string; email: string; twoFactorEnabled: boolean };
};

/** The signed-in admin, or null. Reads request headers, so pages using it are dynamic. */
export const currentAdmin = cache(async (): Promise<AdminSession | null> => {
  const list = await headers();
  if (!process.env.DATABASE_URL) return null;
  const session = await adminAuth.api.getSession({ headers: list }).catch(() => null);
  if (!session?.user) return null;
  const user = session.user as typeof session.user & { twoFactorEnabled?: boolean | null };
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
    },
  };
});

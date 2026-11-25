// Sign-in for learners, using Better Auth: email and password, plus Google.
// Accounts are stored in the auth_* tables (migrations/006_better_auth.sql).
// Other sign-in methods are linked from Settings; accounts are never merged
// automatically because two emails match.
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { Pool } from "pg";
import { cache } from "react";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { sendAccountEmail } from "@/server/email";
import { GUEST_COOKIE, guestIdFromCookieHeader } from "@/server/guest";
import { legacyGoogleLearnerId, moveLearnerData, type Sql } from "@/server/identity";

let pool: Pool | undefined;
function database() {
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  }));
}

/** Runs `work` in one transaction on the auth database pool. */
async function inTransaction(work: (sql: Sql) => Promise<void>) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await work({ query: (text, params) => client.query(text, params as unknown[]) });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Brings over progress from the old Google sign-in for every Google account this user has. */
async function adoptLegacyGoogleProgress(userId: string, googleAccountIds: string[]) {
  if (!googleAccountIds.length) return;
  await inTransaction(async (sql) => {
    for (const googleId of googleAccountIds)
      await moveLearnerData(sql, legacyGoogleLearnerId(googleId), userId);
  });
}

export const auth = betterAuth({
  appName: "Buggle Learn",
  database: database(),
  // Test sites live on *.vercel.app addresses; links in emails use the address the learner is on.
  baseURL: {
    allowedHosts: ["trybuggle.vercel.app", "*.vercel.app", "localhost:3000", "127.0.0.1:3000"],
    fallback: "https://trybuggle.vercel.app",
  },
  user: { modelName: "auth_user" },
  session: { modelName: "auth_session" },
  account: {
    modelName: "auth_account",
    accountLinking: {
      enabled: true,
      // Never join accounts on sign-in just because the emails match.
      disableImplicitLinking: true,
      // Learners may link a Google account whose email differs from their Buggle Learn email.
      allowDifferentEmails: true,
    },
  },
  verification: { modelName: "auth_verification" },
  // AUTH_RATE_LIMIT=off is only for local browser tests, which sign in many times a minute.
  rateLimit: { enabled: process.env.AUTH_RATE_LIMIT !== "off", storage: "database", modelName: "auth_rate_limit" },
  // Vercel replaces x-forwarded-for with the visitor's real address, so limits count per visitor.
  advanced: { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async sendResetPassword({ user, url }) {
      await sendAccountEmail({
        to: user.email,
        subject: "Reset your Buggle Learn password",
        heading: "Reset your password",
        message: "Someone asked to reset the password for your Buggle Learn account. The link works for one hour.",
        action: { label: "Choose a new password", url },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendAccountEmail({
        to: user.email,
        subject: "Confirm your email for Buggle Learn",
        heading: "Confirm your email",
        message: `Hi ${user.name || "there"}, confirm your email address to start learning with Buggle Learn.`,
        action: { label: "Confirm my email", url },
      });
    },
  },
  socialProviders: googleAuthConfigured
    ? {
        google: {
          clientId: process.env.AUTH_GOOGLE_ID as string,
          clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
          prompt: "select_account",
          // Google creates accounts only from the sign-up page, after the age check.
          disableImplicitSignUp: true,
        },
      }
    : {},
  databaseHooks: {
    user: {
      create: {
        // Every account is also a learner, so saved progress has somewhere to go.
        async after(user) {
          await inTransaction((sql) =>
            sql.query("INSERT INTO learners(id) VALUES($1) ON CONFLICT DO NOTHING", [user.id]).then(() => undefined),
          );
        },
      },
    },
    account: {
      create: {
        // Linking or signing up with Google brings over progress from the old sign-in.
        async after(account) {
          if (account.providerId === "google")
            await adoptLegacyGoogleProgress(account.userId, [account.accountId]).catch((error) =>
              console.error("Could not bring over earlier progress", error),
            );
        },
      },
    },
    session: {
      create: {
        async after(session, context) {
          const accounts = (await context?.context.internalAdapter.findAccounts(session.userId)) ?? [];
          await adoptLegacyGoogleProgress(
            session.userId,
            accounts.filter((a) => a.providerId === "google").map((a) => a.accountId),
          ).catch((error) => console.error("Could not bring over earlier progress", error));
          // Results earned as a guest on this device move into the account.
          const guest = guestIdFromCookieHeader(context?.request?.headers.get("cookie") ?? context?.headers?.get("cookie"));
          if (guest) {
            await inTransaction((sql) => moveLearnerData(sql, guest, session.userId)).catch((error) =>
              console.error("Could not bring over guest results", error),
            );
            context?.setCookie(GUEST_COOKIE, "", { path: "/", maxAge: 0 });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type LearnerSession = { user: { id: string; name: string; email: string; emailVerified: boolean; image: string | null } };

/** The signed-in learner for this request, or null. Cached per request. */
export const currentSession = cache(async (): Promise<LearnerSession | null> => {
  // Read the request first, so pages that check the session are always rendered per visitor.
  const requestHeaders = await headers();
  if (!process.env.DATABASE_URL) return null;
  const session = await auth.api.getSession({ headers: requestHeaders }).catch(() => null);
  if (!session?.user) return null;
  const { id, name, email, emailVerified, image } = session.user;
  return { user: { id, name, email, emailVerified, image: image ?? null } };
});

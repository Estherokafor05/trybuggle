// Runs the real Better Auth setup (src/auth.ts) against a real, in-memory
// Postgres served over a socket, to check sign-up, email confirmation,
// login, and that nobody's earlier progress is lost.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 56000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let auth: typeof import("../../src/auth").auth;

/** Email links that would have been sent, captured from the test-site log line. */
const sentLinks: string[] = [];
const originalWarn = console.warn;

before(async () => {
  db = await PGlite.create();
  const files = (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
  delete process.env.RESEND_API_KEY;
  console.warn = (...args: unknown[]) => {
    const match = /\[email not sent: no RESEND_API_KEY\] .*?: (\S+)/.exec(String(args[0]));
    if (match) sentLinks.push(match[1]);
    else originalWarn(...args);
  };
  ({ auth } = await import("../../src/auth"));
});

after(async () => {
  console.warn = originalWarn;
  await server.stop();
  await db.close();
  // The auth pool keeps sockets open; end the process once the tests have finished.
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

beforeEach(() => {
  sentLinks.length = 0;
});

const email = () => `learner-${randomUUID()}@example.com`;
const tokenFrom = (url: string) => new URL(url).searchParams.get("token") ?? new URL(url).pathname.split("/").pop()!;

async function signUpAndVerify(address: string, password = "a-long-password") {
  sentLinks.length = 0;
  const signUp = await auth.api.signUpEmail({ body: { name: "Test Learner", email: address, password } });
  assert.equal(sentLinks.length, 1, "a confirmation link is sent");
  await auth.api.verifyEmail({ query: { token: tokenFrom(sentLinks[0]) } });
  return signUp.user.id;
}

describe("email and password", () => {
  test("signing up creates a learner and sends a confirmation link", async () => {
    const result = await auth.api.signUpEmail({
      body: { name: "Ada", email: email(), password: "a-long-password" },
    });
    assert.equal(result.token, null, "no session until the email is confirmed");
    const { rows } = await db.query("SELECT 1 FROM learners WHERE id = $1", [result.user.id]);
    assert.equal(rows.length, 1, "progress has somewhere to go");
    assert.equal(sentLinks.length, 1);
  });

  test("logging in needs a confirmed email", async () => {
    const address = email();
    await auth.api.signUpEmail({ body: { name: "Ada", email: address, password: "a-long-password" } });
    await assert.rejects(
      auth.api.signInEmail({ body: { email: address, password: "a-long-password" } }),
      (error: { body?: { code?: string } }) => error.body?.code === "EMAIL_NOT_VERIFIED",
    );
  });

  test("after confirming, the learner can log in", async () => {
    const address = email();
    await signUpAndVerify(address);
    const result = await auth.api.signInEmail({ body: { email: address, password: "a-long-password" } });
    assert.ok(result.token, "a session is created");
  });

  test("a wrong password is refused", async () => {
    const address = email();
    await signUpAndVerify(address);
    await assert.rejects(
      auth.api.signInEmail({ body: { email: address, password: "not-the-password" } }),
      (error: { body?: { code?: string } }) => error.body?.code === "INVALID_EMAIL_OR_PASSWORD",
    );
  });

  test("passwords shorter than 8 characters are refused", async () => {
    await assert.rejects(
      auth.api.signUpEmail({ body: { name: "Ada", email: email(), password: "short" } }),
      (error: { body?: { code?: string } }) => error.body?.code === "PASSWORD_TOO_SHORT",
    );
  });

  test("passwords are stored only as hashes", async () => {
    const address = email();
    const id = await signUpAndVerify(address, "a-secret-password");
    const { rows } = await db.query<{ password: string }>(
      `SELECT password FROM auth_account WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [id],
    );
    assert.ok(rows[0].password && !rows[0].password.includes("a-secret-password"));
  });

  test("a password can be reset with the emailed link", async () => {
    const address = email();
    await signUpAndVerify(address);
    sentLinks.length = 0;
    await auth.api.requestPasswordReset({ body: { email: address, redirectTo: "/reset-password" } });
    assert.equal(sentLinks.length, 1, "a reset link is sent");
    const link = await fetchRedirect(sentLinks[0]);
    const token = new URL(link, "https://x.test").searchParams.get("token");
    assert.ok(token, "the link leads to the reset page with a token");
    await auth.api.resetPassword({ body: { newPassword: "a-brand-new-password", token: token! } });
    const result = await auth.api.signInEmail({ body: { email: address, password: "a-brand-new-password" } });
    assert.ok(result.token);
  });
});

/** Follows a Better Auth link once, without a browser, and returns where it redirects. */
async function fetchRedirect(url: string) {
  const response = await auth.handler(new Request(url.replace(/^https?:\/\/[^/]+/, "http://localhost:3000")));
  return response.headers.get("location") ?? "";
}

describe("nobody loses progress", () => {
  test("linking a Google account brings over progress from the old sign-in", async () => {
    const userId = await signUpAndVerify(email());
    const googleId = `g${Date.now()}`;
    const legacy = `google:${googleId}`;
    await db.query("INSERT INTO learners(id) VALUES($1)", [legacy]);
    await db.query(
      `INSERT INTO learning_checkpoints(learner_id, lesson_slug, checkpoint) VALUES($1, 'what-counts-as-ai', '{"step":3}')`,
      [legacy],
    );
    await db.query(
      `INSERT INTO certificates(id, code, learner_id, module_slug, learner_name, completed_on, requirements)
       VALUES($1, $2, $3, 'ai-foundations', 'Old Name', current_date, '{}')`,
      [randomUUID(), `CODE-${googleId}`, legacy],
    );
    const ctx = await auth.$context;
    await ctx.internalAdapter.createAccount({ userId, providerId: "google", accountId: googleId });

    const moved = await db.query("SELECT 1 FROM learning_checkpoints WHERE learner_id = $1", [userId]);
    const certificate = await db.query("SELECT code FROM certificates WHERE learner_id = $1", [userId]);
    const left = await db.query("SELECT 1 FROM learners WHERE id = $1", [legacy]);
    assert.equal(moved.rows.length, 1, "saved place moved");
    assert.equal(certificate.rows.length, 1, "certificate moved, with the same code");
    assert.equal(left.rows.length, 0, "the old learner ID is gone");
  });

  test("results earned as a guest move in when the learner logs in", async () => {
    const address = email();
    const userId = await signUpAndVerify(address);
    const guestUuid = randomUUID();
    const guest = `guest:${guestUuid}`;
    await db.query("INSERT INTO learners(id) VALUES($1)", [guest]);
    await db.query(
      `INSERT INTO assessment_attempts(id, learner_id, lesson_slug, assessment_version, submission_key, answers, correct_count, question_count, feedback)
       VALUES($1, $2, 'what-counts-as-ai', 1, $3, '{}', 5, 5, '[]')`,
      [randomUUID(), guest, randomUUID()],
    );
    await auth.api.signInEmail({
      body: { email: address, password: "a-long-password" },
      headers: new Headers({ cookie: `buggle_guest=${guestUuid}` }),
    });
    const { rows } = await db.query("SELECT 1 FROM assessment_attempts WHERE learner_id = $1", [userId]);
    assert.equal(rows.length, 1);
  });
});

describe("account settings", () => {
  test("accounts are never joined automatically by matching email", () => {
    assert.equal(auth.options.account?.accountLinking?.disableImplicitLinking, true);
  });

  test("Google cannot create an account from the login page", () => {
    const google = (auth.options.socialProviders as Record<string, { disableImplicitSignUp?: boolean }> | undefined)?.google;
    // Only configured when Google keys are present; then sign-up must be explicit.
    if (google) assert.equal(google.disableImplicitSignUp, true);
  });

  test("one Google account cannot belong to two learners", async () => {
    const first = await signUpAndVerify(email());
    const second = await signUpAndVerify(email());
    const ctx = await auth.$context;
    const googleId = `g-shared-${Date.now()}`;
    await ctx.internalAdapter.createAccount({ userId: first, providerId: "google", accountId: googleId });
    await assert.rejects(
      ctx.internalAdapter.createAccount({ userId: second, providerId: "google", accountId: googleId }),
    );
  });
});

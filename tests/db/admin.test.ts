// Admin accounts and admin changes (step 7), with the real Better Auth setup
// and admin rules, against an in-memory Postgres served over a socket.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { base32 } from "@better-auth/utils/base32";
import { createOTP } from "@better-auth/utils/otp";
import { planCourse, writeCourse } from "../../src/server/course-import";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 59000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let adminAuth: typeof import("../../src/admin-auth").adminAuth;
let auth: typeof import("../../src/auth").auth;
let admin: typeof import("../../src/server/admin");
let checks: typeof import("../../src/server/checks");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  await db.transaction((tx) =>
    writeCourse({ query: async (text, params) => (await tx.query<Record<string, unknown>>(text, params)).rows }, planCourse()),
  );
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
  process.env.AUTH_RATE_LIMIT = "off";
  delete process.env.RESEND_API_KEY;
  ({ adminAuth } = await import("../../src/admin-auth"));
  ({ auth } = await import("../../src/auth"));
  admin = await import("../../src/server/admin");
  checks = await import("../../src/server/checks");
});

after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

const email = () => `admin-${randomUUID()}@example.com`;
const token = (path: string) => path.split("/").at(-1)!;
const PASSWORD = "a-long-admin-password";

/** Signs in and returns the cookie header for the session (or the two-factor step). */
async function signIn(address: string, password = PASSWORD) {
  const { headers, response } = await adminAuth.api.signInEmail({
    body: { email: address, password },
    returnHeaders: true,
  });
  const cookie = headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { cookie, response: response as { twoFactorRedirect?: boolean; token?: string } };
}

async function newAdmin() {
  const address = email();
  const invite = await admin.createInvite(address, null);
  assert.ok("path" in invite);
  const joined = await admin.acceptInvite(token(invite.path!), "Test Admin", PASSWORD);
  assert.ok("email" in joined);
  return address;
}

describe("admin accounts are separate and invite-only", () => {
  test("there is no admin sign-up", async () => {
    await assert.rejects(adminAuth.api.signUpEmail({ body: { name: "X", email: email(), password: PASSWORD } }));
    const { rows } = await db.query(`SELECT 1 FROM "admin_user"`);
    assert.equal(rows.length, 0);
  });

  test("a learner account can't sign in to the admin area", async () => {
    const address = email();
    const { user } = await auth.api.signUpEmail({ body: { name: "Learner", email: address, password: PASSWORD } });
    await db.query(`UPDATE auth_user SET "emailVerified" = true WHERE id = $1`, [user.id]);
    assert.ok((await auth.api.signInEmail({ body: { email: address, password: PASSWORD } })).token);
    await assert.rejects(
      adminAuth.api.signInEmail({ body: { email: address, password: PASSWORD } }),
      (e: { body?: { code?: string } }) => e.body?.code === "INVALID_EMAIL_OR_PASSWORD",
    );
  });

  test("an invite works once, for its email, and makes a hashed-password admin", async () => {
    const address = email();
    const invite = await admin.createInvite(address.toUpperCase(), null);
    assert.ok("path" in invite);
    assert.equal(invite.email, address, "emails are stored in lower case");
    assert.deepEqual(await admin.findInvite(token(invite.path!)), { email: address });
    const { rows: stored } = await db.query<{ token_hash: string }>("SELECT token_hash FROM admin_invites WHERE email = $1", [address]);
    assert.ok(!invite.path!.includes(stored[0].token_hash), "only a hash of the link is stored");

    assert.ok("error" in (await admin.acceptInvite(token(invite.path!), "Ada", "short")));
    assert.ok("email" in (await admin.acceptInvite(token(invite.path!), "Ada", PASSWORD)));
    assert.ok("error" in (await admin.acceptInvite(token(invite.path!), "Eve", PASSWORD)), "never twice");
    assert.equal(await admin.findInvite(token(invite.path!)), null);
    const { rows } = await db.query<{ password: string }>(
      `SELECT a.password FROM admin_account a JOIN admin_user u ON u.id = a."userId" WHERE u.email = $1`,
      [address],
    );
    assert.ok(rows[0].password && !rows[0].password.includes(PASSWORD));
    assert.ok("error" in (await admin.createInvite(address, null)), "already an admin");
  });

  test("expired and cancelled invites don't work; a new invite replaces the old one", async () => {
    const address = email();
    const first = await admin.createInvite(address, null);
    const second = await admin.createInvite(address, null);
    assert.equal(await admin.findInvite(token(first.path!)), null, "the older link stops working");
    assert.ok(await admin.findInvite(token(second.path!)));
    await db.query("UPDATE admin_invites SET expires_at = now() - interval '1 minute' WHERE email = $1", [address]);
    assert.ok("error" in (await admin.acceptInvite(token(second.path!), "Ada", PASSWORD)));
    const third = await admin.createInvite(address, null);
    const { rows } = await db.query<{ id: string }>("SELECT id FROM admin_invites WHERE email = $1 AND revoked_at IS NULL AND accepted_at IS NULL AND expires_at > now()", [address]);
    assert.equal(await admin.revokeInvite(rows[0].id), address);
    assert.ok("error" in (await admin.acceptInvite(token(third.path!), "Ada", PASSWORD)));
    assert.equal(await admin.findInvite("not-a-real-token"), null);
  });

  test("after setting up an authenticator app, signing in needs a code", async () => {
    const address = await newAdmin();
    const first = await signIn(address);
    assert.ok(first.response.token, "signed in, app not set up yet");
    const session = await adminAuth.api.getSession({ headers: new Headers({ cookie: first.cookie }) });
    assert.equal((session?.user as { twoFactorEnabled?: boolean }).twoFactorEnabled, false);

    const enabled = await adminAuth.api.enableTwoFactor({
      body: { password: PASSWORD, method: "totp" },
      headers: new Headers({ cookie: first.cookie }),
    });
    assert.equal(enabled.method, "totp");
    if (enabled.method !== "totp") return;
    assert.equal(enabled.backupCodes.length, 10);
    const secret = base32.decode(new URL(enabled.totpURI).searchParams.get("secret")!);
    const code = () => createOTP(secret, { digits: 6, period: 30 }).totp();
    await adminAuth.api.verifyTOTP({ body: { code: await code() }, headers: new Headers({ cookie: first.cookie }) });

    const second = await signIn(address);
    assert.equal(second.response.twoFactorRedirect, true, "the password alone is not enough");
    assert.equal(second.response.token, undefined);
    await assert.rejects(
      adminAuth.api.verifyTOTP({ body: { code: "000000" }, headers: new Headers({ cookie: second.cookie }) }),
    );
    const done = await adminAuth.api.verifyTOTP({
      body: { code: await code() },
      headers: new Headers({ cookie: second.cookie }),
      returnHeaders: true,
    });
    assert.ok(done.headers.getSetCookie().some((c) => c.startsWith("buggle-admin.session_token=")), "the admin cookie, not the learner one");

    // A backup code also works, once.
    const third = await signIn(address);
    await adminAuth.api.verifyBackupCode({ body: { code: enabled.backupCodes[0] }, headers: new Headers({ cookie: third.cookie }) });
    const fourth = await signIn(address);
    await assert.rejects(
      adminAuth.api.verifyBackupCode({ body: { code: enabled.backupCodes[0] }, headers: new Headers({ cookie: fourth.cookie }) }),
    );
  });

  test("admins can't remove themselves or the last admin", async () => {
    const a = await newAdmin();
    const b = await newAdmin();
    const id = async (address: string) =>
      (await db.query<{ id: string }>(`SELECT id FROM admin_user WHERE email = $1`, [address])).rows[0].id;
    assert.ok("error" in (await admin.removeAdmin(await id(a), await id(a))));
    const removed = await admin.removeAdmin(await id(a), await id(b));
    assert.equal("email" in removed && removed.email, b);
    await db.query(`DELETE FROM admin_user WHERE id <> $1`, [await id(a)]);
    const other = await newAdmin();
    await db.query(`DELETE FROM admin_user WHERE email = $1`, [a]);
    assert.ok("error" in (await admin.removeAdmin("someone", await id(other))), "never the last admin");
  });
});

describe("the first admin", () => {
  test("set-up needs the key and works only while there are no admins", async () => {
    await db.query(`DELETE FROM admin_user`);
    await db.query(`DELETE FROM admin_setup`);
    delete process.env.ADMIN_SETUP_KEY;
    assert.ok("error" in (await admin.createFirstAdmin("", email(), "Ada", PASSWORD)), "off without a key");
    process.env.ADMIN_SETUP_KEY = "short";
    assert.equal(admin.setupKeyConfigured(), false, "keys under 20 characters don't count");
    process.env.ADMIN_SETUP_KEY = "a-long-set-up-key-for-tests";
    assert.ok("error" in (await admin.createFirstAdmin("a-long-set-up-key-for-testz", email(), "Ada", PASSWORD)));
    const first = email();
    assert.ok("email" in (await admin.createFirstAdmin("a-long-set-up-key-for-tests", first, "Ada", PASSWORD)));
    assert.equal(await admin.adminCount(), 1);
    assert.ok("error" in (await admin.createFirstAdmin("a-long-set-up-key-for-tests", email(), "Eve", PASSWORD)), "closed after");
    assert.ok((await signIn(first)).response.token);
    delete process.env.ADMIN_SETUP_KEY;
  });
});

describe("admin changes", () => {
  async function learnerWithFailedTries(key: string, tries: number) {
    const learner = `test:${randomUUID()}`;
    await db.query("INSERT INTO learners(id) VALUES($1)", [learner]);
    const ref = checks.lessonCheck(key)!;
    const wrong = Object.fromEntries(ref.questions.map((q) => [q.id, q.options.find((o) => o.id !== q.correct)!.id]));
    for (let i = 0; i < tries; i++)
      await checks.submitCheck(ref, learner, { version: 1, submissionKey: randomUUID(), answers: wrong });
    return { learner, ref, wrong };
  }

  test("check settings change through the editor's validation", async () => {
    const form = (values: Record<string, string>) => {
      const f = new FormData();
      for (const [k, v] of Object.entries(values)) f.set(k, v);
      return f;
    };
    assert.ok("error" in admin.parseCheckSettings(form({ passPercent: "0" })));
    assert.ok("error" in admin.parseCheckSettings(form({ passPercent: "70", maxAttempts: "2.5" })));
    assert.deepEqual(admin.parseCheckSettings(form({ passPercent: "80", maxAttempts: "", shuffle: "on" })), {
      passPercent: 80,
      maxAttempts: null,
      shuffle: true,
    });
    const outline = await admin.courseOutline();
    const check = outline!.sections[0].items[0].check!;
    assert.equal(check.key, "what-counts-as-ai");
    const changed = await admin.updateCheckSettings(check.id, { passPercent: 80, maxAttempts: 3, shuffle: false });
    assert.equal(changed?.key, "what-counts-as-ai");
    assert.deepEqual(await checks.checkSettings(checks.lessonCheck("what-counts-as-ai")!), {
      passPercent: 80,
      maxAttempts: 3,
      shuffleOptions: false,
    });
    await admin.updateCheckSettings(check.id, { passPercent: 70, maxAttempts: null, shuffle: false });
  });

  test("giving one more try lets a learner who used every try go again", async () => {
    const outline = await admin.courseOutline();
    const check = outline!.sections[0].items[0].check!;
    await admin.updateCheckSettings(check.id, { passPercent: 70, maxAttempts: 1, shuffle: false });
    try {
      const { learner, ref, wrong } = await learnerWithFailedTries("what-counts-as-ai", 1);
      const blocked = await checks.submitCheck(ref, learner, { version: 1, submissionKey: randomUUID(), answers: wrong });
      assert.equal(blocked.failure?.status, 403);
      assert.equal(await admin.grantTry(learner, "what-counts-as-ai"), 1);
      assert.equal((await checks.loadCheck(ref, learner)).data?.attemptsLeft, 1);
      assert.ok((await checks.submitCheck(ref, learner, { version: 1, submissionKey: randomUUID(), answers: wrong })).data);
      assert.equal((await checks.loadCheck(ref, learner)).data?.attemptsLeft, 0);
      const detail = await admin.learnerDetail(learner);
      assert.equal(detail, null, "only learners with accounts are listed");
      assert.equal(await admin.grantTry("nobody", "what-counts-as-ai"), null);
    } finally {
      await admin.updateCheckSettings(check.id, { passPercent: 70, maxAttempts: null, shuffle: false });
    }
  });

  test("withdrawing and restoring a certificate", async () => {
    const learner = `test:${randomUUID()}`;
    await db.query("INSERT INTO learners(id) VALUES($1)", [learner]);
    await db.query(
      `INSERT INTO certificates(id,code,learner_id,kind,module_slug,learner_name,completed_on,requirements)
       VALUES(gen_random_uuid(),'BL-E-WWWW-XXXX',$1,'essentials',NULL,'A Learner','2026-11-01','[]')`,
      [learner],
    );
    assert.equal(await admin.setCertificateWithdrawn("BL-E-WWWW-XXXX", "Issued by mistake"), true);
    assert.equal(await admin.setCertificateWithdrawn("BL-E-WWWW-XXXX", "Again"), false, "already withdrawn");
    const [listed] = await admin.listCertificates("wwww");
    assert.deepEqual(listed.withdrawn, { reason: "Issued by mistake" });
    assert.equal(await admin.setCertificateWithdrawn("BL-E-WWWW-XXXX", null), true);
    assert.equal((await admin.listCertificates("BL-E-WWWW"))[0].withdrawn, null);
  });

  test("searches treat % and _ as plain text", async () => {
    assert.deepEqual(await admin.findLearners("%"), []);
    assert.deepEqual(await admin.listCertificates("_"), []);
  });

  test("the activity log and overview read without errors", async () => {
    const [someone] = (await db.query<{ id: string; email: string; name: string }>(`SELECT id, email, name FROM admin_user LIMIT 1`)).rows;
    await admin.audit({ user: { ...someone, twoFactorEnabled: true } }, "check.settings_changed", "what-counts-as-ai", { after: { passPercent: 80 } });
    const [latest] = await admin.activity(1);
    assert.equal(latest.action, "check.settings_changed");
    const numbers = await admin.overview();
    assert.ok(numbers.learners >= 1);
    assert.equal(typeof numbers.checksTaken, "number");
  });
});

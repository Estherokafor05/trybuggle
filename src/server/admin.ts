// Admin rules: who is an admin, invites, the activity log, and the changes
// admins can make. Every page and action under /admin calls requireAdmin().
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { adminAuth, currentAdmin, type AdminSession } from "@/admin-auth";
import { course } from "@course";
import { db } from "./database";

export const INVITE_DAYS = 7;

/**
 * The signed-in admin. Sends anyone else to the admin sign-in page, and an
 * admin without an authenticator app to set one up first.
 */
export async function requireAdmin({ setup = false } = {}): Promise<AdminSession> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/sign-in");
  if (!admin.user.twoFactorEnabled && !setup) redirect("/admin/security");
  return admin;
}

/** Records a change for the activity page. */
export async function audit(admin: AdminSession, action: string, target: string | null, details: object = {}) {
  await db()`INSERT INTO admin_audit(admin_id, admin_email, action, target, details) VALUES(${admin.user.id}, ${admin.user.email}, ${action}, ${target}, ${db().json(details as never)})`;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const cleanEmail = (raw: string) => raw.normalize("NFKC").trim().toLowerCase();
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Creates an invite and returns its one-time link path. Earlier pending invites for the email stop working. */
export async function createInvite(rawEmail: string, invitedBy: string | null) {
  const email = cleanEmail(rawEmail);
  if (!emailShape.test(email) || email.length > 254) return { error: "Enter a valid email address." } as const;
  const sql = db();
  const [existing] = await sql`SELECT 1 FROM "admin_user" WHERE lower("email") = ${email}`;
  if (existing) return { error: "That person is already an admin." } as const;
  const token = randomBytes(32).toString("base64url");
  await sql.begin(async (tx) => {
    await tx`UPDATE admin_invites SET revoked_at = now() WHERE email = ${email} AND accepted_at IS NULL AND revoked_at IS NULL`;
    await tx`INSERT INTO admin_invites(id, email, token_hash, invited_by, expires_at) VALUES(${randomUUID()}, ${email}, ${hash(token)}, ${invitedBy}, now() + ${`${INVITE_DAYS} days`}::interval)`;
  });
  return { email, path: `/admin/invite/${token}` } as const;
}

/** The email an invite is for, if the link still works. */
export async function findInvite(token: string) {
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(token)) return null;
  const [row] = await db()`SELECT email FROM admin_invites WHERE token_hash = ${hash(token)} AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()`;
  return row ? { email: row.email as string } : null;
}

/** Uses an invite once: creates the admin account with a password. */
export async function acceptInvite(token: string, name: string, password: string) {
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(token)) return { error: "This invite link doesn't work." } as const;
  if (!name.trim() || name.trim().length > 80) return { error: "Enter your name (80 characters or fewer)." } as const;
  if (password.length < 12 || password.length > 128) return { error: "Use a password of 12 to 128 characters." } as const;
  const sql = db();
  // Claim the invite first, so the same link can never make two accounts.
  const [claimed] = await sql`UPDATE admin_invites SET accepted_at = now() WHERE token_hash = ${hash(token)} AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() RETURNING id, email, invited_by`;
  if (!claimed) return { error: "This invite link has expired or has already been used. Ask an admin for a new one." } as const;
  try {
    const user = await createAdminAccount(claimed.email as string, name, password);
    await sql`INSERT INTO admin_audit(admin_id, admin_email, action, target, details) VALUES(${user.id}, ${user.email}, 'admin.joined', ${user.email}, ${sql.json({ invitedBy: claimed.invited_by ?? "set-up script" })})`;
    return { email: user.email } as const;
  } catch (error) {
    await sql`UPDATE admin_invites SET accepted_at = NULL WHERE id = ${claimed.id}`;
    throw error;
  }
}

/** Makes an admin account with a password. Callers check who may do this. */
async function createAdminAccount(email: string, name: string, password: string) {
  const ctx = await adminAuth.$context;
  const user = await ctx.internalAdapter.createUser(
    { email, name: name.trim(), emailVerified: true },
    { method: "email-password" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  return user;
}

// ---------------------------------------------------------------------------
// The very first admin. Works only while there are no admins, and only with
// the ADMIN_SETUP_KEY set in Vercel (at least 20 characters).

export const setupKeyConfigured = () => (process.env.ADMIN_SETUP_KEY ?? "").length >= 20;

export async function adminCount() {
  const [row] = await db()`SELECT count(*)::int AS n FROM "admin_user"`;
  return row.n as number;
}

export async function createFirstAdmin(key: string, rawEmail: string, name: string, password: string) {
  const expected = Buffer.from(process.env.ADMIN_SETUP_KEY ?? "");
  const given = Buffer.from(key);
  if (!setupKeyConfigured() || expected.length !== given.length || !timingSafeEqual(expected, given))
    return { error: "That set-up key isn't right." } as const;
  const email = cleanEmail(rawEmail);
  if (!emailShape.test(email) || email.length > 254) return { error: "Enter a valid email address." } as const;
  if (!name.trim() || name.trim().length > 80) return { error: "Enter your name (80 characters or fewer)." } as const;
  if (password.length < 12 || password.length > 128) return { error: "Use a password of 12 to 128 characters." } as const;
  const sql = db();
  if ((await adminCount()) > 0) return closed;
  // Claim set-up first, so two people can never both become the first admin.
  const [claim] = await sql`INSERT INTO admin_setup(id) VALUES('first') ON CONFLICT DO NOTHING RETURNING id`;
  if (!claim) return closed;
  try {
    const user = await createAdminAccount(email, name, password);
    await sql`INSERT INTO admin_audit(admin_id, admin_email, action, target) VALUES(${user.id}, ${user.email}, 'admin.first_set_up', ${user.email})`;
    return { email: user.email } as const;
  } catch (error) {
    await sql`DELETE FROM admin_setup WHERE id = 'first'`;
    throw error;
  }
}

const closed = { error: "Set-up is closed: an admin already exists. Ask them for an invite." } as const;

export async function listTeam() {
  const sql = db();
  const [admins, invites] = await Promise.all([
    sql`SELECT "id", "name", "email", "twoFactorEnabled", "createdAt" FROM "admin_user" ORDER BY "createdAt"`,
    sql`SELECT id, email, created_at, expires_at FROM admin_invites WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() ORDER BY created_at DESC`,
  ]);
  return {
    admins: admins.map((a) => ({
      id: a.id as string,
      name: a.name as string,
      email: a.email as string,
      twoFactor: Boolean(a.twoFactorEnabled),
      since: new Date(a.createdAt as Date).toISOString(),
    })),
    invites: invites.map((i) => ({
      id: i.id as string,
      email: i.email as string,
      expires: new Date(i.expires_at as Date).toISOString(),
    })),
  };
}

export async function revokeInvite(id: string) {
  const rows = await db()`UPDATE admin_invites SET revoked_at = now() WHERE id = ${id} AND accepted_at IS NULL AND revoked_at IS NULL RETURNING email`;
  return (rows[0]?.email as string) ?? null;
}

/** Removes an admin and signs them out everywhere. Never yourself, never the last admin. */
export async function removeAdmin(self: string, id: string) {
  if (self === id) return { error: "You can't remove yourself." } as const;
  const sql = db();
  return sql.begin(async (tx) => {
    const [{ n }] = await tx`SELECT count(*)::int AS n FROM "admin_user"`;
    if (n <= 1) return { error: "Buggle Learn needs at least one admin." } as const;
    const [row] = await tx`DELETE FROM "admin_user" WHERE "id" = ${id} RETURNING "email"`;
    return row ? ({ email: row.email as string } as const) : ({ error: "That admin no longer exists." } as const);
  });
}

// ---------------------------------------------------------------------------
// What admins see and change.

export async function overview() {
  const sql = db();
  const [[people], [checks], [certs], recentCerts, modules] = await Promise.all([
    sql`SELECT count(*)::int AS learners,
          count(*) FILTER (WHERE "createdAt" > now() - interval '7 days')::int AS week,
          count(*) FILTER (WHERE "createdAt" > now() - interval '30 days')::int AS month
        FROM "auth_user"`,
    sql`SELECT count(*)::int AS taken, count(*) FILTER (WHERE passed)::int AS passed,
          count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '7 days')::int AS active
        FROM (SELECT learner_id, passed, created_at FROM assessment_attempts
              UNION ALL SELECT learner_id, passed, created_at FROM module_assessment_attempts) a`,
    sql`SELECT count(*) FILTER (WHERE kind = 'essentials' AND revoked_at IS NULL)::int AS essentials,
          count(*) FILTER (WHERE revoked_at IS NOT NULL)::int AS withdrawn FROM certificates`,
    sql`SELECT code, learner_name, kind, module_slug, issued_at, revoked_at FROM certificates ORDER BY issued_at DESC LIMIT 5`,
    sql`SELECT module_slug, count(DISTINCT learner_id)::int AS passed FROM module_assessment_attempts WHERE passed GROUP BY module_slug`,
  ]);
  const started = await sql`SELECT count(DISTINCT learner_id)::int AS n FROM assessment_attempts`;
  const [more] = await sql`SELECT
      (SELECT count(*) FROM organisations)::int AS orgs,
      (SELECT count(DISTINCT learner_id) FROM course_entitlements WHERE ends_at IS NULL OR ends_at > now())::int AS paid_learners,
      (SELECT coalesce(sum(amount_paid), 0) FROM purchases WHERE status = 'paid' AND currency = 'usd' AND created_at > now() - interval '30 days')::int AS revenue,
      ((SELECT count(*) FROM forum_threads WHERE created_at > now() - interval '7 days')
        + (SELECT count(*) FROM forum_posts WHERE created_at > now() - interval '7 days'))::int AS forum_week,
      (SELECT count(*) FROM forum_reports WHERE resolved_at IS NULL)::int AS reports`;
  return {
    organisations: more.orgs as number,
    paidLearners: more.paid_learners as number,
    revenueMonth: more.revenue as number,
    forumWeek: more.forum_week as number,
    openReports: more.reports as number,
    learners: people.learners as number,
    newThisWeek: people.week as number,
    newThisMonth: people.month as number,
    activeThisWeek: checks.active as number,
    checksTaken: checks.taken as number,
    checksPassed: checks.passed as number,
    startedLearning: started[0].n as number,
    essentials: certs.essentials as number,
    withdrawn: certs.withdrawn as number,
    modulesPassed: Object.fromEntries(modules.map((m) => [m.module_slug as string, m.passed as number])),
    recentCertificates: recentCerts.map((c) => ({
      code: c.code as string,
      name: c.learner_name as string,
      kind: c.kind as string,
      moduleSlug: (c.module_slug as string) ?? null,
      issuedAt: new Date(c.issued_at as Date).toISOString(),
      withdrawn: Boolean(c.revoked_at),
    })),
  };
}

/** Learners whose email or name contains the search, newest first. */
export async function findLearners(search: string) {
  const term = `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await db()`
    SELECT u."id", u."name", u."email", u."createdAt",
      (SELECT count(*) FROM assessment_attempts a WHERE a.learner_id = u."id" AND a.passed)::int AS passed
    FROM "auth_user" u
    WHERE ${search.trim() ? db()`lower(u."email") LIKE ${term} OR lower(u."name") LIKE ${term}` : db()`true`}
    ORDER BY u."createdAt" DESC LIMIT 50`;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    joined: new Date(r.createdAt as Date).toISOString(),
    checksPassed: r.passed as number,
  }));
}

export async function learnerDetail(id: string) {
  const sql = db();
  const [user] = await sql`SELECT "id", "name", "email", "emailVerified", "createdAt" FROM "auth_user" WHERE "id" = ${id}`;
  if (!user) return null;
  const [attempts, certificates, grants] = await Promise.all([
    sql`SELECT 'lesson' AS kind, lesson_slug AS key, count(*)::int AS tries, bool_or(passed) AS passed, max(correct_count)::int AS best, max(question_count)::int AS questions, max(created_at) AS last
        FROM assessment_attempts WHERE learner_id = ${id} GROUP BY lesson_slug
        UNION ALL
        SELECT 'final', module_slug, count(*)::int, bool_or(passed), max(correct_count)::int, max(question_count)::int, max(created_at)
        FROM module_assessment_attempts WHERE learner_id = ${id} GROUP BY module_slug`,
    sql`SELECT code, kind, module_slug, learner_name, issued_at, revoked_at, revoked_reason FROM certificates WHERE learner_id = ${id} ORDER BY issued_at`,
    sql`SELECT assessment_key, extra FROM assessment_attempt_grants WHERE learner_id = ${id}`,
  ]);
  return {
    id: user.id as string,
    name: user.name as string,
    email: user.email as string,
    confirmed: Boolean(user.emailVerified),
    joined: new Date(user.createdAt as Date).toISOString(),
    results: attempts.map((a) => ({
      kind: a.kind as "lesson" | "final",
      key: a.key as string,
      tries: a.tries as number,
      passed: Boolean(a.passed),
      best: a.best as number,
      questions: a.questions as number,
      last: new Date(a.last as Date).toISOString(),
    })),
    certificates: certificates.map((c) => ({
      code: c.code as string,
      kind: c.kind as string,
      moduleSlug: (c.module_slug as string) ?? null,
      name: c.learner_name as string,
      issuedAt: new Date(c.issued_at as Date).toISOString(),
      withdrawn: c.revoked_at ? { reason: (c.revoked_reason as string) ?? "" } : null,
    })),
    extraTries: Object.fromEntries(grants.map((g) => [g.assessment_key as string, g.extra as number])),
  };
}

/** One more try on a check with a tries limit. */
export async function grantTry(learner: string, key: string) {
  const [row] = await db()`
    INSERT INTO assessment_attempt_grants(learner_id, assessment_key, extra)
    SELECT ${learner}, ${key}, 1 WHERE EXISTS (SELECT 1 FROM learners WHERE id = ${learner})
    ON CONFLICT (learner_id, assessment_key) DO UPDATE SET extra = LEAST(assessment_attempt_grants.extra + 1, 100), updated_at = now()
    RETURNING extra`;
  return (row?.extra as number) ?? null;
}

export async function setCertificateWithdrawn(code: string, reason: string | null) {
  const rows = reason
    ? await db()`UPDATE certificates SET revoked_at = now(), revoked_reason = ${reason} WHERE code = ${code} AND revoked_at IS NULL RETURNING code`
    : await db()`UPDATE certificates SET revoked_at = NULL, revoked_reason = NULL WHERE code = ${code} AND revoked_at IS NOT NULL RETURNING code`;
  return Boolean(rows[0]);
}

export async function listCertificates(search: string) {
  const term = `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await db()`
    SELECT c.code, c.kind, c.module_slug, c.learner_name, c.learner_id, c.issued_at, c.revoked_at, c.revoked_reason
    FROM certificates c
    WHERE ${search.trim() ? db()`lower(c.code) LIKE ${term} OR lower(c.learner_name) LIKE ${term}` : db()`true`}
    ORDER BY c.issued_at DESC LIMIT 100`;
  return rows.map((c) => ({
    code: c.code as string,
    kind: c.kind as string,
    moduleSlug: (c.module_slug as string) ?? null,
    name: c.learner_name as string,
    learnerId: c.learner_id as string,
    issuedAt: new Date(c.issued_at as Date).toISOString(),
    withdrawn: c.revoked_at ? { reason: (c.revoked_reason as string) ?? "" } : null,
  }));
}

/** The course as stored in the database, with each check's settings. */
export async function courseOutline() {
  const sql = db();
  const [courseRow] = await sql`SELECT id, title, status FROM courses WHERE slug = ${course.slug}`;
  if (!courseRow) return null;
  const [sections, items, checks] = await Promise.all([
    sql`SELECT id, slug, title, level, position, status FROM course_sections WHERE course_id = ${courseRow.id} ORDER BY level, position`,
    sql`SELECT id, section_id, slug, title, position, status FROM course_items WHERE course_id = ${courseRow.id} ORDER BY position`,
    sql`SELECT id, item_id, section_id, scope, legacy_key, question_count, pass_percent, max_attempts, shuffle_options, status FROM assessments WHERE course_id = ${courseRow.id}`,
  ]);
  const toCheck = (a: Record<string, unknown>) => ({
    id: a.id as string,
    key: a.legacy_key as string,
    scope: a.scope as string,
    questions: a.question_count as number,
    passPercent: a.pass_percent as number,
    maxAttempts: (a.max_attempts as number | null) ?? null,
    shuffle: Boolean(a.shuffle_options),
  });
  return {
    title: courseRow.title as string,
    status: courseRow.status as string,
    sections: sections.map((s) => ({
      id: s.id as string,
      slug: s.slug as string,
      title: s.title as string,
      level: s.level as string,
      status: s.status as string,
      final: checks.filter((a) => a.section_id === s.id && a.scope === "section").map(toCheck)[0] ?? null,
      items: items
        .filter((i) => i.section_id === s.id)
        .map((i) => ({
          id: i.id as string,
          slug: i.slug as string,
          title: i.title as string,
          status: i.status as string,
          check: checks.filter((a) => a.item_id === i.id).map(toCheck)[0] ?? null,
        })),
    })),
  };
}

export type CheckSettingsInput = { passPercent: number; maxAttempts: number | null; shuffle: boolean };

/** Validates settings typed into the course editor. */
export function parseCheckSettings(form: FormData): CheckSettingsInput | { error: string } {
  const pass = Number(form.get("passPercent"));
  const triesRaw = String(form.get("maxAttempts") ?? "").trim();
  const tries = triesRaw === "" ? null : Number(triesRaw);
  if (!Number.isInteger(pass) || pass < 1 || pass > 100) return { error: "The pass mark must be a whole number from 1 to 100." };
  if (tries !== null && (!Number.isInteger(tries) || tries < 1 || tries > 50))
    return { error: "Tries must be a whole number from 1 to 50, or empty for unlimited." };
  return { passPercent: pass, maxAttempts: tries, shuffle: form.get("shuffle") === "on" };
}

export async function updateCheckSettings(id: string, settings: CheckSettingsInput) {
  const [before] = await db()`SELECT legacy_key, pass_percent, max_attempts, shuffle_options FROM assessments WHERE id = ${id}`;
  if (!before) return null;
  await db()`UPDATE assessments SET pass_percent = ${settings.passPercent}, max_attempts = ${settings.maxAttempts}, shuffle_options = ${settings.shuffle} WHERE id = ${id}`;
  return {
    key: before.legacy_key as string,
    before: { passPercent: before.pass_percent, maxAttempts: before.max_attempts, shuffle: before.shuffle_options },
  };
}

export async function activity(limit = 100) {
  const rows = await db()`SELECT admin_email, action, target, details, created_at FROM admin_audit ORDER BY created_at DESC, id DESC LIMIT ${limit}`;
  return rows.map((r) => ({
    admin: r.admin_email as string,
    action: r.action as string,
    target: (r.target as string) ?? null,
    details: r.details as Record<string, unknown>,
    at: new Date(r.created_at as Date).toISOString(),
  }));
}

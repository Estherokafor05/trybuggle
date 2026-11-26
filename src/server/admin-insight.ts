// What admins can see about every learner and organisation, and the few
// changes they can make. Every change is written to the activity log by the
// admin action that calls it.
import { db } from "./database";
import { myPurchases } from "./learner-payments";
import { myRewards } from "./rewards";
import { memberProgress, orgById, setSubscription, type PlanCode } from "./organisations";

type Fail = { error: string };

// ---------------------------------------------------------------------------
// One learner, everything

export async function learnerInsight(id: string) {
  const sql = db();
  const [[user], [prefs], accounts, sessions, orgs, entitlements, courses, forum, recentPosts] = await Promise.all([
    sql`SELECT "image" FROM "auth_user" WHERE "id" = ${id}`,
    sql`SELECT locale, leaderboard_hidden FROM learner_preferences WHERE learner_id = ${id}`,
    sql`SELECT "providerId" AS provider FROM "auth_account" WHERE "userId" = ${id}`,
    sql`SELECT count(*)::int AS n, max("updatedAt") AS last FROM "auth_session" WHERE "userId" = ${id} AND "expiresAt" > now()`,
    sql`SELECT o.id, o.name, o.slug, m.role FROM organisation_members m JOIN organisations o ON o.id = m.org_id WHERE m.user_id = ${id} ORDER BY m.joined_at`,
    sql`SELECT e.id, e.source, e.starts_at, e.ends_at, c.title FROM course_entitlements e LEFT JOIN courses c ON c.id = e.course_id
        WHERE e.learner_id = ${id} ORDER BY e.created_at DESC`,
    sql`SELECT c.id, c.title, c.kind, c.slug,
          (SELECT count(*) FROM course_items i WHERE i.course_id = c.id)::int AS total,
          (SELECT count(*) FROM course_items i WHERE i.course_id = c.id AND (
             EXISTS (SELECT 1 FROM builder_completions d WHERE d.item_id = i.id AND d.learner_id = ${id})
             OR EXISTS (SELECT 1 FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id WHERE a.item_id = i.id AND t.learner_id = ${id} AND t.passed)))::int AS done
        FROM courses c WHERE c.source = 'builder' AND EXISTS (
          SELECT 1 FROM course_items i WHERE i.course_id = c.id AND (
            EXISTS (SELECT 1 FROM builder_completions d WHERE d.item_id = i.id AND d.learner_id = ${id})
            OR EXISTS (SELECT 1 FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id WHERE a.item_id = i.id AND t.learner_id = ${id})))`,
    sql`SELECT (SELECT count(*) FROM forum_threads WHERE author_id = ${id} AND deleted_at IS NULL)::int AS threads,
          (SELECT count(*) FROM forum_posts WHERE author_id = ${id} AND deleted_at IS NULL)::int AS posts,
          ((SELECT count(*) FROM forum_threads WHERE author_id = ${id} AND hidden_at IS NOT NULL)
            + (SELECT count(*) FROM forum_posts WHERE author_id = ${id} AND hidden_at IS NOT NULL))::int AS hidden`,
    sql`SELECT * FROM (
          SELECT t.id AS thread_id, t.title, t.body AS text, t.created_at, 'question' AS kind, t.hidden_at FROM forum_threads t WHERE t.author_id = ${id} AND t.deleted_at IS NULL
          UNION ALL
          SELECT p.thread_id, t.title, p.body, p.created_at, 'reply', p.hidden_at FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE p.author_id = ${id} AND p.deleted_at IS NULL
        ) x ORDER BY created_at DESC LIMIT 5`,
  ]);
  const [rewards, purchases, activity] = await Promise.all([
    myRewards(id).catch(() => null),
    myPurchases(id).catch(() => []),
    learnerActivity(id),
  ]);
  return {
    image: (user?.image as string | null) ?? null,
    locale: (prefs?.locale as string) ?? "en",
    leaderboardHidden: Boolean(prefs?.leaderboard_hidden),
    signIn: accounts.map((a) => (a.provider === "credential" ? "Email and password" : a.provider === "google" ? "Google" : (a.provider as string))),
    sessions: { active: sessions[0].n as number, lastSeen: sessions[0].last ? new Date(sessions[0].last as Date).toISOString() : null },
    organisations: orgs.map((o) => ({ id: o.id as string, name: o.name as string, slug: o.slug as string, role: o.role as string })),
    access: entitlements.map((e) => ({
      id: e.id as string,
      what: (e.title as string | null) ?? "All-access (every Deep Dive course)",
      source: e.source as string,
      ends: e.ends_at ? new Date(e.ends_at as Date).toISOString() : null,
      active: !e.ends_at || new Date(e.ends_at as Date) > new Date(),
    })),
    courses: courses.map((c) => ({ title: c.title as string, kind: c.kind as string, slug: c.slug as string, done: c.done as number, total: c.total as number })),
    forum: { threads: forum[0].threads as number, posts: forum[0].posts as number, hidden: forum[0].hidden as number },
    recentPosts: recentPosts.map((p) => ({
      threadId: p.thread_id as string,
      title: p.title as string,
      text: (p.text as string).slice(0, 160),
      kind: p.kind as string,
      hidden: Boolean(p.hidden_at),
      at: new Date(p.created_at as Date).toISOString(),
    })),
    rewards,
    purchases,
    activity,
  };
}

/** The learner's latest 25 things, newest first. */
async function learnerActivity(id: string) {
  const rows = await db()`SELECT * FROM (
      SELECT created_at AS at, 'check' AS kind, lesson_slug AS what, passed FROM assessment_attempts WHERE learner_id = ${id}
      UNION ALL SELECT created_at, 'final', module_slug, passed FROM module_assessment_attempts WHERE learner_id = ${id}
      UNION ALL SELECT t.created_at, 'course check', c.title, t.passed FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id JOIN courses c ON c.id = a.course_id WHERE t.learner_id = ${id}
      UNION ALL SELECT d.completed_at, 'unit done', i.title, true FROM builder_completions d JOIN course_items i ON i.id = d.item_id WHERE d.learner_id = ${id}
      UNION ALL SELECT created_at, 'question', title, NULL FROM forum_threads WHERE author_id = ${id}
      UNION ALL SELECT created_at, 'reply', NULL, NULL FROM forum_posts WHERE author_id = ${id}
      UNION ALL SELECT created_at, 'purchase', coalesce(course_title, kind), status = 'paid' FROM purchases WHERE learner_id = ${id}
      UNION ALL SELECT issued_at, 'certificate', kind, NULL FROM certificates WHERE learner_id = ${id}
    ) a ORDER BY at DESC LIMIT 25`;
  return rows.map((r) => ({ at: new Date(r.at as Date).toISOString(), kind: r.kind as string, what: (r.what as string | null) ?? "", passed: r.passed as boolean | null }));
}

// ---------------------------------------------------------------------------
// Changes admins can make to a learner

/** Gives Deep Dive access: one course or all-access, for good or a number of days. */
export async function giveAccess(learner: string, input: { course: unknown; days: unknown }): Promise<Fail | { ok: true }> {
  const sql = db();
  const [exists] = await sql`SELECT 1 FROM "auth_user" WHERE "id" = ${learner}`;
  if (!exists) return { error: "That learner no longer exists." };
  const course = String(input.course ?? "");
  let courseId: string | null = null;
  if (course !== "all") {
    const [c] = /^[0-9a-f-]{36}$/i.test(course) ? await sql`SELECT id FROM courses WHERE id = ${course} AND kind = 'deep_dive'` : [];
    if (!c) return { error: "Choose a Deep Dive course, or all-access." };
    courseId = c.id as string;
  }
  const days = String(input.days ?? "").trim() ? Number(input.days) : null;
  if (days !== null && (!Number.isInteger(days) || days < 1 || days > 3650)) return { error: "Days must be 1 to 3650, or empty for good." };
  await sql`INSERT INTO learners(id) VALUES(${learner}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO course_entitlements(learner_id, course_id, source, ends_at)
    VALUES(${learner}, ${courseId}, 'admin', ${days ? sql`now() + make_interval(days => ${days})` : null})`;
  return { ok: true };
}

/** Ends access an admin gave, or a test purchase. Paid access is ended by refunding in Stripe. */
export async function endAccess(learner: string, entitlementId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(entitlementId)) return false;
  const rows = await db()`UPDATE course_entitlements SET ends_at = now() WHERE id = ${entitlementId} AND learner_id = ${learner}
    AND source IN ('admin', 'test', 'gift') AND (ends_at IS NULL OR ends_at > now()) RETURNING id`;
  return rows.length > 0;
}

export async function removeLearnerPhoto(learner: string) {
  await db()`DELETE FROM profile_photos WHERE user_id = ${learner}`;
  await db()`UPDATE "auth_user" SET "image" = NULL WHERE "id" = ${learner}`;
}

export async function setLearnerLeaderboard(learner: string, hidden: boolean) {
  const sql = db();
  await sql`INSERT INTO learners(id) VALUES(${learner}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO learner_preferences(learner_id, leaderboard_hidden) VALUES(${learner}, ${hidden})
    ON CONFLICT (learner_id) DO UPDATE SET leaderboard_hidden = EXCLUDED.leaderboard_hidden, updated_at = now()`;
}

/** Signs the learner out on every device. */
export async function signOutEverywhere(learner: string) {
  const rows = await db()`DELETE FROM "auth_session" WHERE "userId" = ${learner} RETURNING 1`;
  return rows.length;
}

/** For someone who can't get the confirmation email. */
export async function confirmEmail(learner: string) {
  await db()`UPDATE "auth_user" SET "emailVerified" = true, "updatedAt" = now() WHERE "id" = ${learner}`;
}

export async function deepDiveCourses() {
  const rows = await db()`SELECT id, title FROM courses WHERE kind = 'deep_dive' AND source = 'builder' ORDER BY is_foundation DESC, catalogue_position, title`;
  return rows.map((r) => ({ id: r.id as string, title: r.title as string }));
}

// ---------------------------------------------------------------------------
// One organisation, everything

export async function organisationInsight(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const org = await orgById(id);
  if (!org) return null;
  const sql = db();
  const [members, courses, purchases, [created]] = await Promise.all([
    memberProgress(id),
    sql`SELECT c.id, c.title, c.status, (SELECT count(*) FROM course_items i WHERE i.course_id = c.id)::int AS lessons
        FROM courses c WHERE c.organization_id = ${id} ORDER BY c.updated_at DESC`,
    sql`SELECT kind, interval, amount_paid, currency, discount, status, created_at FROM purchases WHERE org_id = ${id} ORDER BY created_at DESC LIMIT 50`,
    sql`SELECT o.created_at, u.email AS creator FROM organisations o LEFT JOIN "auth_user" u ON u.id = o.created_by WHERE o.id = ${id}`,
  ]);
  return {
    org,
    created: new Date(created.created_at as Date).toISOString(),
    creator: (created.creator as string | null) ?? null,
    members,
    courses: courses.map((c) => ({ id: c.id as string, title: c.title as string, status: c.status as string, lessons: c.lessons as number })),
    purchases: purchases.map((p) => ({
      kind: p.kind as string,
      interval: (p.interval as string | null) ?? null,
      amount: p.amount_paid as number,
      currency: p.currency as string,
      discount: (p.discount as string | null) ?? null,
      status: p.status as string,
      at: new Date(p.created_at as Date).toISOString(),
    })),
  };
}

/**
 * Gives an organisation a plan without payment (for partners or pilots), or ends it.
 * If the organisation pays through Stripe, Stripe's updates take over again.
 */
export async function setOrgPlanByAdmin(orgId: string, input: { plan: unknown; seats: unknown; days: unknown }): Promise<Fail | { ok: true }> {
  const org = await orgById(orgId);
  if (!org) return { error: "That organisation no longer exists." };
  if (input.plan === "none") {
    await setSubscription(orgId, { status: "cancelled" });
    return { ok: true };
  }
  if (!["content", "platform", "both"].includes(String(input.plan))) return { error: "Choose a plan." };
  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 10000) return { error: "Places must be 1 to 10,000." };
  if (seats < org.members) return { error: `It has ${org.members} members, so it needs at least ${org.members} places.` };
  const days = Number(input.days);
  if (!Number.isInteger(days) || days < 1 || days > 3650) return { error: "Days must be 1 to 3650." };
  await setSubscription(orgId, { plan: input.plan as PlanCode, seats, status: "active", periodEnd: new Date(Date.now() + days * 86400_000) });
  return { ok: true };
}

export async function renameOrg(orgId: string, raw: unknown): Promise<Fail | { ok: true }> {
  const name = typeof raw === "string" ? raw.normalize("NFC").replace(/\s+/g, " ").trim() : "";
  if (name.length < 2 || name.length > 80) return { error: "Names are 2 to 80 characters." };
  await db()`UPDATE organisations SET name = ${name} WHERE id = ${orgId}`;
  return { ok: true };
}

export async function adminRemoveMember(orgId: string, user: string): Promise<Fail | { ok: true }> {
  const [m] = await db()`SELECT role FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  if (!m) return { ok: true };
  if (m.role === "owner") return { error: "The owner can't be removed. Make someone else the owner first." };
  await db()`DELETE FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  return { ok: true };
}

export async function adminSetRole(orgId: string, user: string, role: unknown): Promise<Fail | { ok: true }> {
  if (role !== "owner" && role !== "manager" && role !== "member") return { error: "Choose a role." };
  const sql = db();
  const [m] = await sql`SELECT role FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  if (!m) return { error: "That person is no longer a member." };
  await sql.begin(async (tx) => {
    // One owner: making someone the owner turns the old owner into a manager.
    if (role === "owner") await tx`UPDATE organisation_members SET role = 'manager' WHERE org_id = ${orgId} AND role = 'owner'`;
    else if (m.role === "owner") throw new Error("owner");
    await tx`UPDATE organisation_members SET role = ${role} WHERE org_id = ${orgId} AND user_id = ${user}`;
  }).catch((error) => {
    if (!(error instanceof Error && error.message === "owner")) throw error;
  });
  const [after] = await sql`SELECT role FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  return after.role === role ? { ok: true } : { error: "Make someone else the owner first." };
}

// ---------------------------------------------------------------------------
// Payments, all of them

export async function allPayments() {
  const sql = db();
  const [rows, [totals], [subs]] = await Promise.all([
    sql`SELECT p.id, p.kind, p.course_title, p.interval, p.amount_paid, p.currency, p.discount, p.status, p.created_at,
          p.learner_id, u.email, p.org_id, o.name AS org_name
        FROM purchases p LEFT JOIN "auth_user" u ON u.id = p.learner_id LEFT JOIN organisations o ON o.id = p.org_id
        ORDER BY p.created_at DESC LIMIT 200`,
    sql`SELECT coalesce(sum(amount_paid) FILTER (WHERE status = 'paid'), 0)::int AS paid,
          coalesce(sum(amount_paid) FILTER (WHERE status = 'paid' AND created_at > now() - interval '30 days'), 0)::int AS month,
          count(*) FILTER (WHERE status = 'refunded')::int AS refunds FROM purchases WHERE currency = 'usd'`,
    sql`SELECT count(DISTINCT learner_id)::int AS n FROM course_entitlements WHERE course_id IS NULL AND source = 'subscription' AND ends_at > now()`,
  ]);
  return {
    totals: { paid: totals.paid as number, month: totals.month as number, refunds: totals.refunds as number, subscribers: subs.n as number },
    payments: rows.map((r) => ({
      id: r.id as string,
      kind: r.kind as string,
      what: r.kind === "course" ? ((r.course_title as string) ?? "A course") : r.kind === "all_access" ? `All-access, ${r.interval === "month" ? "monthly" : "yearly"}` : `Organisation plan, ${r.interval === "month" ? "monthly" : "yearly"}`,
      amount: r.amount_paid as number,
      currency: r.currency as string,
      discount: (r.discount as string | null) ?? null,
      status: r.status as string,
      at: new Date(r.created_at as Date).toISOString(),
      learner: r.learner_id ? { id: r.learner_id as string, email: (r.email as string) ?? "" } : null,
      org: r.org_id ? { id: r.org_id as string, name: (r.org_name as string) ?? "" } : null,
    })),
  };
}

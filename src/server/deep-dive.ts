// The Deep Dive: "What is AI" first, then the other AI courses. Who may open
// which course, and which parts are paid.
//
// - "What is AI" (the foundation course) opens once the Essentials is finished.
// - Every other Deep Dive course opens once "What is AI" is finished.
// - Each course's first chapters (free_chapters) are free; the rest needs the
//   course bought once, an all-access subscription, or an organisation plan
//   that includes Buggle Learn's courses.
import { db } from "./database";
import { essentialsStatus } from "./certificates";
import { deepDiveThroughOrg } from "./organisations";

export type Gate =
  | { kind: "essentials"; title: string; href: string }
  | { kind: "foundation"; title: string; href: string }
  | null;

export type Access = { gate: Gate; entitled: boolean; via: "course" | "all" | "org" | null; freeChapters: number };

/** The foundation course, if one is published. */
export async function foundationCourse() {
  const [row] = await db()`SELECT id, slug, title FROM courses WHERE is_foundation AND status = 'published' AND source = 'builder'`;
  return row ? { id: row.id as string, slug: row.slug as string, title: row.title as string } : null;
}

/** Whether the learner has finished every lesson (with something in it) of a course. */
export async function finishedCourse(user: string, courseId: string) {
  const [row] = await db()`
    SELECT count(*) FILTER (WHERE NOT done)::int AS left, count(*)::int AS total FROM (
      SELECT i.id,
        (EXISTS (SELECT 1 FROM builder_completions d WHERE d.item_id = i.id AND d.learner_id = ${user})
          OR EXISTS (SELECT 1 FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id
                     WHERE a.item_id = i.id AND t.learner_id = ${user} AND t.passed)) AS done
      FROM course_items i
      WHERE i.course_id = ${courseId} AND (EXISTS (SELECT 1 FROM content_blocks k WHERE k.item_id = i.id)
        OR EXISTS (SELECT 1 FROM assessments a JOIN assessment_questions q ON q.assessment_id = a.id WHERE a.item_id = i.id))
    ) x`;
  return row.total > 0 && row.left === 0;
}

/** Active paid access: this course, all-access, or through an organisation. */
export async function entitlement(user: string, courseId: string): Promise<Access["via"]> {
  const rows = await db()`SELECT course_id FROM course_entitlements
    WHERE learner_id = ${user} AND (course_id = ${courseId} OR course_id IS NULL)
      AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())`;
  if (rows.some((r) => r.course_id === null)) return "all";
  if (rows.length) return "course";
  return (await deepDiveThroughOrg(user)) ? "org" : null;
}

/** What stands between a learner and a Deep Dive course, and whether its paid parts are open. */
export async function deepDiveAccess(user: string | null, course: { id: string; isFoundation: boolean; freeChapters: number }): Promise<Access> {
  const freeChapters = course.freeChapters;
  if (!user) return { gate: null, entitled: false, via: null, freeChapters };
  let gate: Gate = null;
  if (course.isFoundation) {
    if (!(await essentialsStatus(user)).eligible) gate = { kind: "essentials", title: "the Essentials", href: "/certificate" };
  } else {
    const foundation = await foundationCourse();
    if (foundation && !(await finishedCourse(user, foundation.id)))
      gate = { kind: "foundation", title: foundation.title, href: `/learn/${foundation.slug}` };
    else if (!foundation && !(await essentialsStatus(user)).eligible) gate = { kind: "essentials", title: "the Essentials", href: "/certificate" };
  }
  const via = await entitlement(user, course.id);
  return { gate, entitled: Boolean(via), via, freeChapters };
}

/** The Deep Dive catalogue: "What is AI" first, then the rest, with each one's state for this learner. */
export async function catalogue(user: string | null) {
  const rows = await db()`SELECT c.id, c.slug, c.title, c.summary, c.is_foundation, c.free_chapters,
      (SELECT count(*) FROM course_sections s WHERE s.course_id = c.id)::int AS chapters
    FROM courses c WHERE c.kind = 'deep_dive' AND c.status = 'published' AND c.source = 'builder'
    ORDER BY c.is_foundation DESC, c.catalogue_position, c.title`;
  return Promise.all(
    rows.map(async (r) => {
      const course = { id: r.id as string, isFoundation: Boolean(r.is_foundation), freeChapters: r.free_chapters as number };
      const access = await deepDiveAccess(user, course);
      const finished = user ? await finishedCourse(user, course.id) : false;
      return {
        ...course,
        slug: r.slug as string,
        title: r.title as string,
        summary: r.summary as string,
        chapters: r.chapters as number,
        access,
        finished,
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Test purchases: on test sites only, so the paid parts can be tried before
// Stripe is set up. Never on the live site.

export function canTestPurchase() {
  return process.env.VERCEL_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;
}

export async function testPurchase(user: string, what: { courseId: string } | "all") {
  if (!canTestPurchase()) return false;
  const sql = db();
  await sql`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
  const courseId = what === "all" ? null : what.courseId;
  if (courseId) {
    const [c] = await sql`SELECT 1 FROM courses WHERE id = ${courseId} AND kind = 'deep_dive'`;
    if (!c) return false;
  }
  await sql`INSERT INTO course_entitlements(learner_id, course_id, source, ends_at)
    VALUES(${user}, ${courseId}, 'test', ${what === "all" ? sql`now() + interval '30 days'` : null})`;
  return true;
}

/** Ends test purchases, so a tester can try the locked state again. */
export async function endTestPurchases(user: string) {
  await db()`DELETE FROM course_entitlements WHERE learner_id = ${user} AND source = 'test'`;
}

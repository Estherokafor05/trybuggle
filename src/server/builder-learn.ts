// Learning a builder course: which courses a learner can see, which lessons are
// open (one at a time, in order), marking lessons done, and the knowledge checks.
import { randomUUID } from "node:crypto";
import { passMark, scoreAssessment, type Question } from "@/lib/assessment-scoring";
import { orderedOptions, type Outcome } from "./checks";
import { db } from "./database";
import { deepDiveAccess, type Access } from "./deep-dive";

/** locked: an earlier lesson (or course) comes first. paid: next up, but needs buying. */
export type LessonState = "done" | "open" | "locked" | "paid";

/** Published builder courses: Buggle Learn's own, plus any from the learner's organisations. */
export async function visibleCourses(user: string | null) {
  const rows = await db()`SELECT c.id, c.slug, c.title, c.summary, o.name AS org_name,
      (SELECT count(*) FROM course_items i WHERE i.course_id = c.id)::int AS lessons
    FROM courses c LEFT JOIN organisations o ON o.id::text = c.organization_id
    WHERE c.source = 'builder' AND c.status = 'published' AND c.kind = 'short' AND (c.organization_id IS NULL OR EXISTS (
      SELECT 1 FROM organisation_members m WHERE m.org_id::text = c.organization_id AND m.user_id = ${user ?? ""}))
    ORDER BY c.organization_id IS NULL, c.title`;
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    summary: r.summary as string,
    from: (r.org_name as string | null) ?? null,
    lessons: r.lessons as number,
  }));
}

/** A published course the learner may see, with every lesson's state. */
export async function courseForLearner(slug: string, user: string | null) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const sql = db();
  const [c] = await sql`SELECT c.id, c.slug, c.title, c.summary, c.organization_id, o.name AS org_name, c.kind, c.is_foundation, c.free_chapters
    FROM courses c LEFT JOIN organisations o ON o.id::text = c.organization_id
    WHERE c.slug = ${slug} AND c.source = 'builder' AND c.status = 'published'`;
  if (!c) return null;
  if (c.organization_id) {
    if (!user) return { signInNeeded: true as const };
    const [m] = await sql`SELECT 1 FROM organisation_members WHERE org_id::text = ${c.organization_id as string} AND user_id = ${user}`;
    if (!m) return null;
  }
  const deepDive = c.kind === "deep_dive";
  const access: Access | null = deepDive
    ? await deepDiveAccess(user, { id: c.id as string, isFoundation: Boolean(c.is_foundation), freeChapters: c.free_chapters as number })
    : null;
  const [sections, items] = await Promise.all([
    sql`SELECT id, title FROM course_sections WHERE course_id = ${c.id} ORDER BY position`,
    sql`SELECT i.id, i.section_id, i.slug, i.title, i.summary, i.estimated_minutes, a.id AS assessment_id,
          (SELECT count(*) FROM assessment_questions q WHERE q.assessment_id = a.id)::int AS questions,
          EXISTS (SELECT 1 FROM content_blocks k WHERE k.item_id = i.id) AS has_blocks,
          (EXISTS (SELECT 1 FROM builder_completions d WHERE d.item_id = i.id AND d.learner_id = ${user ?? ""})
            OR EXISTS (SELECT 1 FROM builder_attempts t WHERE t.assessment_id = a.id AND t.learner_id = ${user ?? ""} AND t.passed)) AS done
        FROM course_items i JOIN course_sections s ON s.id = i.section_id
        LEFT JOIN assessments a ON a.item_id = i.id
        WHERE i.course_id = ${c.id} ORDER BY s.position, i.position`,
  ]);
  // Empty lessons (nothing added yet) are left out; the rest open one at a time.
  // In a Deep Dive course, chapters after the free ones need paying for.
  const chapterOf = new Map(sections.map((s, i) => [s.id as string, i]));
  let reachable = !access?.gate;
  const lessons = items
    .filter((i) => i.has_blocks || i.questions > 0)
    .map((i) => {
      const paid = Boolean(access && !access.entitled && (chapterOf.get(i.section_id as string) ?? 0) >= access.freeChapters);
      const state: LessonState = i.done ? "done" : !reachable ? "locked" : paid ? "paid" : "open";
      if (!i.done) reachable = false;
      return {
        paid,
        id: i.id as string,
        sectionId: i.section_id as string,
        slug: i.slug as string,
        title: i.title as string,
        summary: i.summary as string,
        minutes: i.estimated_minutes as number,
        assessmentId: (i.questions as number) > 0 ? (i.assessment_id as string) : null,
        state,
      };
    });
  return {
    id: c.id as string,
    slug: c.slug as string,
    title: c.title as string,
    summary: c.summary as string,
    from: (c.org_name as string | null) ?? null,
    deepDive,
    isFoundation: Boolean(c.is_foundation),
    access,
    sections: sections
      .map((s) => ({ id: s.id as string, title: s.title as string, lessons: lessons.filter((l) => l.sectionId === s.id) }))
      .filter((s) => s.lessons.length),
    lessons,
    done: lessons.filter((l) => l.state === "done").length,
  };
}

export async function blocksFor(itemId: string) {
  const rows = await db()`SELECT id, type, data FROM content_blocks WHERE item_id = ${itemId} ORDER BY position`;
  return rows.map((r) => ({ id: r.id as string, type: r.type as string, data: r.data as Record<string, string> }));
}

/** Marks a lesson with no knowledge check as done, if it's open to the learner. */
export async function markDone(slug: string, itemId: string, user: string) {
  const course = await courseForLearner(slug, user);
  if (!course || "signInNeeded" in course) return false;
  const lesson = course.lessons.find((l) => l.id === itemId);
  if (!lesson || lesson.state !== "open" || lesson.assessmentId) return false;
  const sql = db();
  await sql`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO builder_completions(learner_id, item_id) VALUES(${user}, ${itemId}) ON CONFLICT DO NOTHING`;
  return true;
}

// ---------------------------------------------------------------------------
// Knowledge checks

type Failure = { status: number; error: string; locked?: boolean };

/** The check, if the learner may take it now: its course is published and visible, and the lesson is open. */
async function openCheck(assessmentId: string, user: string): Promise<{ failure: Failure } | { id: string; passPercent: number; maxAttempts: number | null; shuffle: boolean; questions: Question[] }> {
  const notFound = { failure: { status: 404, error: "Knowledge check not found" } };
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) return notFound;
  const sql = db();
  const [a] = await sql`SELECT a.id, a.item_id, a.pass_percent, a.max_attempts, a.shuffle_options, c.slug
    FROM assessments a JOIN courses c ON c.id = a.course_id
    WHERE a.id = ${assessmentId} AND c.source = 'builder' AND a.item_id IS NOT NULL`;
  if (!a) return notFound;
  const course = await courseForLearner(a.slug as string, user);
  if (!course || "signInNeeded" in course) return notFound;
  const lesson = course.lessons.find((l) => l.id === a.item_id);
  if (!lesson) return notFound;
  if (lesson.state === "paid") return { failure: { status: 403, error: "Unlock this course to carry on.", locked: true } };
  if (lesson.state === "locked") return { failure: { status: 403, error: "Finish the lessons before this one first.", locked: true } };
  const rows = await sql`SELECT key, prompt, options, correct_option, explanation FROM assessment_questions WHERE assessment_id = ${assessmentId} ORDER BY position`;
  return {
    id: a.id as string,
    passPercent: a.pass_percent as number,
    maxAttempts: (a.max_attempts as number | null) ?? null,
    shuffle: Boolean(a.shuffle_options),
    questions: rows.map((r) => ({
      id: r.key as string,
      prompt: r.prompt as string,
      options: r.options as Question["options"],
      correct: r.correct_option as string,
      explanation: r.explanation as string,
    })),
  };
}

export async function loadBuilderCheck(assessmentId: string, user: string): Promise<Outcome<Record<string, unknown>>> {
  const check = await openCheck(assessmentId, user);
  if ("failure" in check) return check;
  const sql = db();
  const [latest, [totals]] = await Promise.all([
    sql`SELECT id, correct_count, question_count, passed, feedback, created_at FROM builder_attempts
      WHERE learner_id = ${user} AND assessment_id = ${check.id} ORDER BY created_at DESC LIMIT 1`,
    sql`SELECT count(*)::int AS used, coalesce(bool_or(passed), false) AS passed FROM builder_attempts
      WHERE learner_id = ${user} AND assessment_id = ${check.id}`,
  ]);
  const used = Number(totals.used);
  const passed = Boolean(totals.passed);
  return {
    data: {
      version: 1,
      questions: orderedOptions(check.questions, `${user}:${check.id}`, check.shuffle),
      latest: latest[0] ?? null,
      passed,
      passPercent: check.passPercent,
      passMark: passMark(check.questions.length, check.passPercent),
      maxAttempts: check.maxAttempts,
      attemptsUsed: used,
      attemptsLeft: check.maxAttempts == null || passed ? null : Math.max(0, check.maxAttempts - used),
    },
  };
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function submitBuilderCheck(assessmentId: string, user: string, body: unknown): Promise<Outcome<Record<string, unknown>>> {
  const check = await openCheck(assessmentId, user);
  if ("failure" in check) return check;
  const input = body as Record<string, unknown> | null;
  let result: ReturnType<typeof scoreAssessment>;
  try {
    if (
      !input ||
      typeof input !== "object" ||
      Object.keys(input).some((k) => !["submissionKey", "answers", "version"].includes(k)) ||
      input.version !== 1 ||
      typeof input.submissionKey !== "string" ||
      !uuid.test(input.submissionKey)
    )
      throw new Error("Invalid submission. Reload the page and try again.");
    result = scoreAssessment(check.questions, input.answers, check.questions.length, check.passPercent);
  } catch (error) {
    return { failure: { status: 400, error: error instanceof Error ? error.message : "Invalid answers" } };
  }
  const answers = input!.answers as Record<string, string>;
  const submissionKey = input!.submissionKey as string;
  const outcome = (await db().begin(async (tx) => {
    await tx`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
    await tx`SELECT id FROM learners WHERE id = ${user} FOR UPDATE`;
    const [existing] = await tx`SELECT id, correct_count, question_count, passed, feedback, created_at, answers FROM builder_attempts
      WHERE learner_id = ${user} AND assessment_id = ${check.id} AND submission_key = ${submissionKey}`;
    if (existing) return { attempt: existing };
    if (check.maxAttempts != null) {
      const [row] = await tx`SELECT count(*)::int AS used, coalesce(bool_or(passed), false) AS passed FROM builder_attempts
        WHERE learner_id = ${user} AND assessment_id = ${check.id}`;
      if (!row.passed && Number(row.used) >= check.maxAttempts)
        return { failure: { status: 409, error: `You have used all ${check.maxAttempts} tries for this check. Ask the course team for another try.` } };
    }
    const [created] = await tx`INSERT INTO builder_attempts(id, learner_id, assessment_id, submission_key, answers, question_count, correct_count, pass_percent, feedback)
      VALUES(${randomUUID()}, ${user}, ${check.id}, ${submissionKey}, ${tx.json(answers)}, ${check.questions.length}, ${result.correct}, ${check.passPercent}, ${tx.json(result.feedback)})
      RETURNING id, correct_count, question_count, passed, feedback, created_at, answers`;
    return { attempt: created };
  })) as { attempt?: Record<string, unknown> & { answers: Record<string, string> }; failure?: Failure };
  if (outcome.failure) return { failure: outcome.failure };
  const { answers: stored, ...response } = outcome.attempt!;
  if (check.questions.some((q) => stored[q.id] !== answers[q.id]))
    return { failure: { status: 409, error: "This submission was already saved with different answers. Reload to review it." } };
  return { data: response };
}

// Knowledge checks and final assessments: loading, settings, strict order and
// marking, in one place. Route handlers stay thin and both kinds of check
// follow exactly the same rules.
//
// Settings (pass mark, number of tries, shuffled answers) come from the
// `assessments` table, so admins can change them without a code change.
// A check with no row there uses the defaults below.
import { createHash, randomUUID } from "node:crypto";
import { course, getModule, modules } from "@course";
import { assessmentBank, moduleAssessmentBank } from "@course/assessments";
import { passMark, scoreAssessment, type Question } from "@/lib/assessment-scoring";
import { db } from "./database";
import { finishFirstText, stepAccess } from "./progression";

export type CheckSettings = {
  passPercent: number;
  /** Null means unlimited tries. */
  maxAttempts: number | null;
  shuffleOptions: boolean;
};

export const defaultCheckSettings: CheckSettings = {
  passPercent: 70,
  maxAttempts: null,
  shuffleOptions: false,
};

export type CheckRef = {
  kind: "lesson" | "final";
  /** Lesson slug for a knowledge check, module slug for a final assessment. */
  key: string;
  moduleSlug: string;
  /** The step id on the learning path. */
  stepId: string;
  questions: Question[];
};

export function lessonCheck(lessonSlug: string): CheckRef | null {
  if (!Object.hasOwn(assessmentBank, lessonSlug)) return null;
  const mod = modules.find((m) => m.lessons.some((l) => l.slug === lessonSlug));
  if (!mod) return null;
  return {
    kind: "lesson",
    key: lessonSlug,
    moduleSlug: mod.slug,
    stepId: lessonSlug,
    questions: assessmentBank[lessonSlug],
  };
}

export function finalCheck(moduleSlug: string): CheckRef | null {
  if (!Object.hasOwn(moduleAssessmentBank, moduleSlug) || !getModule(moduleSlug)) return null;
  return {
    kind: "final",
    key: moduleSlug,
    moduleSlug,
    stepId: "final-assessment",
    questions: moduleAssessmentBank[moduleSlug],
  };
}

/** The settings admins chose for a check, or the defaults. */
export async function checkSettings(ref: CheckRef): Promise<CheckSettings> {
  try {
    const rows = await db()`
      SELECT a.pass_percent, a.max_attempts, a.shuffle_options
      FROM assessments a JOIN courses c ON c.id = a.course_id
      WHERE c.slug = ${course.slug} AND a.legacy_key = ${ref.key}`;
    if (rows[0])
      return {
        passPercent: Number(rows[0].pass_percent),
        maxAttempts: rows[0].max_attempts == null ? null : Number(rows[0].max_attempts),
        shuffleOptions: Boolean(rows[0].shuffle_options),
      };
  } catch {
    // Course tables not set up yet: the defaults keep today's behaviour.
  }
  return defaultCheckSettings;
}

/** The same answer order every time for one learner, so a reload never reshuffles. */
export function orderedOptions(questions: Question[], seed: string, shuffle: boolean) {
  return questions.map(({ id, prompt, options }) => ({
    id,
    prompt,
    options: shuffle
      ? [...options].sort((a, b) => {
          const rank = (o: { id: string }) =>
            createHash("sha256").update(`${seed}:${id}:${o.id}`).digest("hex");
          return rank(a) < rank(b) ? -1 : 1;
        })
      : options,
  }));
}

/** Plain-English intro for a check, from its settings. */
export function checkIntro(ref: CheckRef, settings: CheckSettings, unit: string) {
  const count = ref.questions.length;
  const tries =
    settings.maxAttempts == null
      ? "You can try again as many times as you need."
      : `You have ${settings.maxAttempts} ${settings.maxAttempts === 1 ? "try" : "tries"}.`;
  return ref.kind === "lesson"
    ? `${count} quick questions about this ${unit}. Get ${passMark(count, settings.passPercent)} or more right to pass. ${tries}`
    : `${count} questions covering every ${unit} in this module. Get ${passMark(count, settings.passPercent)} or more right to pass. There is no time limit. ${tries}`;
}

const table = (ref: CheckRef) =>
  ref.kind === "lesson"
    ? { name: "assessment_attempts", column: "lesson_slug" }
    : { name: "module_assessment_attempts", column: "module_slug" };

export type Failure = { status: number; error: string; locked?: boolean };
export type Outcome<T> = { failure: Failure; data?: never } | { failure?: never; data: T };

/** Why a learner can't take a check right now, if they can't. */
async function blocked(ref: CheckRef, learner: string): Promise<Failure | null> {
  const access = await stepAccess(learner, ref.moduleSlug, ref.stepId);
  if (access.open) return null;
  return {
    status: 403,
    locked: true,
    error: `This is locked for now. ${finishFirstText(access.finishFirst, ref.moduleSlug)} first.`,
  };
}

const noTriesLeft = (max: number): Failure => ({
  status: 403,
  error: `You've used all ${max} ${max === 1 ? "try" : "tries"} for this check. Contact Buggle Learn support to ask for another go.`,
});

/** Questions (without answers), the latest result and tries left. */
export async function loadCheck(ref: CheckRef, learner: string): Promise<Outcome<Record<string, unknown>>> {
  const stop = await blocked(ref, learner);
  if (stop) return { failure: stop };
  const settings = await checkSettings(ref);
  const sql = db();
  const t = table(ref);
  const [latest, totals] = await Promise.all([
    sql`SELECT id,correct_count,question_count,passed,feedback,created_at FROM ${sql(t.name)} WHERE learner_id=${learner} AND ${sql(t.column)}=${ref.key} ORDER BY created_at DESC LIMIT 1`,
    sql`SELECT count(*)::int AS used, coalesce(bool_or(passed), false) AS passed FROM ${sql(t.name)} WHERE learner_id=${learner} AND ${sql(t.column)}=${ref.key}`,
  ]);
  const used = Number(totals[0]?.used ?? 0);
  const passed = Boolean(totals[0]?.passed);
  return {
    data: {
      version: 1,
      questions: orderedOptions(ref.questions, `${learner}:${ref.key}`, settings.shuffleOptions),
      latest: latest[0] ?? null,
      passed,
      passPercent: settings.passPercent,
      passMark: passMark(ref.questions.length, settings.passPercent),
      maxAttempts: settings.maxAttempts,
      attemptsUsed: used,
      // Once passed, extra practice is always allowed.
      attemptsLeft:
        settings.maxAttempts == null || passed ? null : Math.max(0, settings.maxAttempts - used),
    },
  };
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Marks a submission on the server and stores it once per submission key. */
export async function submitCheck(
  ref: CheckRef,
  learner: string,
  body: unknown,
): Promise<Outcome<Record<string, unknown>>> {
  const stop = await blocked(ref, learner);
  if (stop) return { failure: stop };
  const settings = await checkSettings(ref);
  const questions = ref.questions;
  let submissionKey: string, answers: Record<string, string>, result;
  try {
    const input = body as Record<string, unknown> | null;
    if (
      !input ||
      typeof input !== "object" ||
      Object.keys(input).some((k) => !["submissionKey", "answers", "version"].includes(k)) ||
      input.version !== 1 ||
      typeof input.submissionKey !== "string" ||
      !uuid.test(input.submissionKey)
    )
      throw new Error("Invalid submission. Reload the page and try again.");
    submissionKey = input.submissionKey;
    answers = input.answers as Record<string, string>;
    result = scoreAssessment(questions, answers, questions.length, settings.passPercent);
  } catch (error) {
    return {
      failure: { status: 400, error: error instanceof Error ? error.message : "Invalid answers" },
    };
  }
  const t = table(ref);
  const sql = db();
  const outcome = await sql.begin(async (tx) => {
    await tx`INSERT INTO learners(id) VALUES(${learner}) ON CONFLICT DO NOTHING`;
    // One submission at a time per learner, so the tries limit can't be raced.
    await tx`SELECT id FROM learners WHERE id=${learner} FOR UPDATE`;
    const existing = await tx`SELECT id,correct_count,question_count,passed,feedback,created_at,answers FROM ${tx(t.name)} WHERE learner_id=${learner} AND ${tx(t.column)}=${ref.key} AND submission_key=${submissionKey}`;
    if (existing[0]) return { attempt: existing[0] };
    if (settings.maxAttempts != null) {
      const [row] = await tx`SELECT count(*)::int AS used, coalesce(bool_or(passed), false) AS passed FROM ${tx(t.name)} WHERE learner_id=${learner} AND ${tx(t.column)}=${ref.key}`;
      if (!row.passed && Number(row.used) >= settings.maxAttempts)
        return { failure: noTriesLeft(settings.maxAttempts) };
    }
    const created = await tx`INSERT INTO ${tx(t.name)}(id,learner_id,${tx(t.column)},assessment_version,submission_key,answers,question_count,correct_count,pass_percent,feedback) VALUES(${randomUUID()},${learner},${ref.key},1,${submissionKey},${tx.json(answers)},${questions.length},${result.correct},${settings.passPercent},${tx.json(result.feedback)}) RETURNING id,correct_count,question_count,passed,feedback,created_at,answers`;
    return { attempt: created[0] };
  }) as { attempt?: Record<string, unknown> & { answers: Record<string, string> }; failure?: Failure };
  if (outcome.failure) return { failure: outcome.failure };
  const attempt = outcome.attempt!;
  if (questions.some((q) => attempt.answers[q.id] !== answers[q.id]))
    return {
      failure: {
        status: 409,
        error: "This submission was already saved with different answers. Reload to review it.",
      },
    };
  const { answers: storedAnswers, ...response } = attempt;
  void storedAnswers;
  return { data: response };
}

// Everything a learner's dashboard shows, worked out on the server from their
// stored results. Read-only.
import { getBuiltLesson, getModule, modules } from "@course";
import { db } from "./database";
import { coursePath, passedSteps, type PathStep } from "./progression";
import { finalCheck, lessonCheck } from "./checks";

/** Minutes a step usually takes: the film or guide, plus about a minute per question. */
export function stepMinutes(step: PathStep) {
  if (step.kind === "final") return finalCheck(step.moduleSlug)?.questions.length ?? 5;
  const film = Number(/(\d+)/.exec(getBuiltLesson(step.id)?.duration ?? "")?.[1] ?? 4);
  // Watching or reading takes about twice the film's length, then the check.
  return film * 2 + (lessonCheck(step.id)?.questions.length ?? 5);
}

/** "About 25 minutes", "About 1 hour 10 minutes". */
export function formatMinutes(total: number) {
  if (total <= 0) return "No time";
  const rounded = total < 60 ? Math.max(5, Math.round(total / 5) * 5) : Math.round(total / 5) * 5;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  const parts = [
    hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
    minutes ? `${minutes} minutes` : "",
  ].filter(Boolean);
  return `About ${parts.join(" ")}`;
}

export type ModuleSummary = {
  slug: string;
  order: number;
  title: string;
  href: string;
  /** done: every step passed. comingSoon: nothing to take yet. */
  state: "done" | "inProgress" | "notStarted" | "locked" | "comingSoon";
  done: number;
  total: number;
  minutesLeft: number;
  certificate: { code: string } | null;
};

export type Activity = {
  label: string;
  title: string;
  href: string;
  correct: number;
  questions: number;
  passed: boolean;
  at: string;
};

export async function learnerDashboard(learner: string) {
  const sql = db();
  const path = coursePath();
  const [passed, certificates, recentRows, days] = await Promise.all([
    passedSteps(learner),
    sql`SELECT module_slug, code FROM certificates WHERE learner_id=${learner}`,
    sql`
      SELECT 'lesson' AS kind, lesson_slug AS key, correct_count, question_count, passed, created_at
        FROM assessment_attempts WHERE learner_id=${learner}
      UNION ALL
      SELECT 'final' AS kind, module_slug AS key, correct_count, question_count, passed, created_at
        FROM module_assessment_attempts WHERE learner_id=${learner}
      ORDER BY created_at DESC LIMIT 5`,
    sql`
      SELECT count(DISTINCT (created_at AT TIME ZONE 'UTC')::date)::int AS n FROM (
        SELECT created_at FROM assessment_attempts WHERE learner_id=${learner}
        UNION ALL SELECT created_at FROM module_assessment_attempts WHERE learner_id=${learner}
        UNION ALL SELECT updated_at FROM learning_checkpoints WHERE learner_id=${learner}
      ) activity`,
  ]);
  const certificateFor = new Map(certificates.map((r) => [r.module_slug as string, r.code as string]));
  const next = path.find((step) => !passed.has(step.key)) ?? null;
  const nextIndex = next ? path.indexOf(next) : path.length;

  const summaries: ModuleSummary[] = [...modules]
    .sort((a, b) => a.order - b.order)
    .map((mod) => {
      const steps = path.filter((s) => s.moduleSlug === mod.slug);
      const done = steps.filter((s) => passed.has(s.key)).length;
      const firstIndex = steps.length ? path.indexOf(steps[0]) : -1;
      const state: ModuleSummary["state"] = !steps.length
        ? "comingSoon"
        : done === steps.length
          ? "done"
          : firstIndex > nextIndex
            ? "locked"
            : done > 0
              ? "inProgress"
              : "notStarted";
      return {
        slug: mod.slug,
        order: mod.order,
        title: mod.title,
        href: `/modules/${mod.slug}`,
        state,
        done,
        total: steps.length,
        minutesLeft: steps.filter((s) => !passed.has(s.key)).reduce((sum, s) => sum + stepMinutes(s), 0),
        certificate: certificateFor.has(mod.slug) ? { code: certificateFor.get(mod.slug)! } : null,
      };
    });

  const recent: Activity[] = recentRows.map((row) => {
    const step =
      row.kind === "final"
        ? path.find((s) => s.kind === "final" && s.moduleSlug === row.key)
        : path.find((s) => s.kind === "lesson" && s.id === row.key);
    const mod = getModule(step?.moduleSlug ?? "");
    return {
      label: step
        ? row.kind === "final"
          ? `Module ${step.moduleOrder} final assessment`
          : `${step.label} knowledge check`
        : "Knowledge check",
      title: step?.title ?? String(row.key),
      href: step ? (step.kind === "final" ? step.href : `${step.href}#knowledge-check`) : mod ? `/modules/${mod.slug}` : "/curriculum",
      correct: Number(row.correct_count),
      questions: Number(row.question_count),
      passed: Boolean(row.passed),
      at: new Date(row.created_at as Date).toISOString(),
    };
  });

  const current = next ? summaries.find((m) => m.slug === next.moduleSlug)! : null;
  return {
    next,
    /** The module the learner is working through, for "time to your next certificate". */
    current,
    modules: summaries,
    overall: {
      done: path.filter((s) => passed.has(s.key)).length,
      total: path.length,
      minutesLeft: path.filter((s) => !passed.has(s.key)).reduce((sum, s) => sum + stepMinutes(s), 0),
      openModules: summaries.filter((m) => m.state !== "comingSoon").length,
      plannedModules: summaries.length,
    },
    stats: {
      checksPassed: passed.size,
      certificates: certificateFor.size,
      daysLearning: Number(days[0]?.n ?? 0),
    },
    recent,
  };
}

export type Dashboard = Awaited<ReturnType<typeof learnerDashboard>>;

// Strict order (FRD Version 2): a learner opens a lesson, episode or final
// assessment only after passing every step before it, across all modules.
// Module 2 opens after Module 1's final assessment, and so on. Steps that are
// still being made are skipped, and anything a learner has already passed
// stays open so they can revisit it.
//
// The rule itself is a pure function (`accessFrom`) so it can be tested
// without a database; `stepAccess` and `pathStatus` add the learner's results.
import { getModule, journeyFor, modules } from "@course";
import { db } from "./database";

export type PathStep = {
  key: string;
  moduleSlug: string;
  moduleOrder: number;
  id: string;
  kind: "lesson" | "final";
  label: string;
  title: string;
  href: string;
};

export type Access =
  | { open: true }
  | { open: false; finishFirst: PathStep };

export const stepKey = (moduleSlug: string, id: string) => `${moduleSlug}/${id}`;

/** Every step a learner must pass, in order. The welcome is always open and is not part of it. */
export function coursePath(): PathStep[] {
  return [...modules]
    .sort((a, b) => a.order - b.order)
    .flatMap((mod) =>
      journeyFor(mod.slug)
        .filter((step) => step.available && step.id !== "welcome")
        .map((step) => ({
          key: stepKey(mod.slug, step.id),
          moduleSlug: mod.slug,
          moduleOrder: mod.order,
          id: step.id,
          kind: step.id === "final-assessment" ? ("final" as const) : ("lesson" as const),
          label: step.label,
          title: step.title,
          href: step.href,
        })),
    );
}

/** Whether a step is open, given the keys of the steps the learner has passed. */
export function accessFrom(
  path: PathStep[],
  passed: ReadonlySet<string>,
  moduleSlug: string,
  id: string,
): Access {
  const key = stepKey(moduleSlug, id);
  if (passed.has(key)) return { open: true };
  const index = path.findIndex((step) => step.key === key);
  // Not on the path (the welcome, or a step still being made): nothing to unlock.
  if (index < 0) return { open: true };
  const blocker = path.slice(0, index).find((step) => !passed.has(step.key));
  return blocker ? { open: false, finishFirst: blocker } : { open: true };
}

/** Keys of every step the learner has passed. */
export async function passedSteps(learner: string): Promise<Set<string>> {
  const sql = db();
  const [lessons, finals] = await Promise.all([
    sql`SELECT DISTINCT lesson_slug FROM assessment_attempts WHERE learner_id=${learner} AND passed`,
    sql`SELECT DISTINCT module_slug FROM module_assessment_attempts WHERE learner_id=${learner} AND passed`,
  ]);
  const passedLessons = new Set(lessons.map((r) => r.lesson_slug as string));
  const passedFinals = new Set(finals.map((r) => r.module_slug as string));
  return new Set(
    coursePath()
      .filter((step) =>
        step.kind === "final" ? passedFinals.has(step.moduleSlug) : passedLessons.has(step.id),
      )
      .map((step) => step.key),
  );
}

/** Whether this learner can open a step. */
export async function stepAccess(learner: string, moduleSlug: string, id: string) {
  return accessFrom(coursePath(), await passedSteps(learner), moduleSlug, id);
}

/** Which of a module's steps are done or locked for a learner, for paths and lists. */
export async function pathStatus(learner: string | null | undefined, moduleSlug: string) {
  const path = coursePath();
  const passed = learner ? await passedSteps(learner).catch(() => null) : null;
  const done: string[] = [];
  const locked: Record<string, PathStep> = {};
  if (passed)
    for (const step of path.filter((s) => s.moduleSlug === moduleSlug)) {
      if (passed.has(step.key)) done.push(step.id);
      const access = accessFrom(path, passed, moduleSlug, step.id);
      if (!access.open) locked[step.id] = access.finishFirst;
    }
  return { known: Boolean(passed), done, locked };
}

/** A plain sentence naming what to finish first, e.g. "Pass Lesson 2's knowledge check". */
export function finishFirstText(step: PathStep, from: string) {
  const mod = getModule(step.moduleSlug);
  const where = step.moduleSlug === from || !mod ? "" : ` in Module ${mod.order}`;
  return step.kind === "final"
    ? `Pass the Module ${step.moduleOrder} final assessment`
    : `Pass the knowledge check for ${step.label}${where}`;
}

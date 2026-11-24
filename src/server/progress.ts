// Where a returning learner should pick up: the first step on the open
// modules' paths they have not passed yet. Read-only.
import { journeyFor, type JourneyStep } from "@course";
import { getModule } from "@course";
import { db } from "./database";

const openPaths = ["ai-foundations", "talking-to-ai"];

export type ContinuePoint = { step: JourneyStep; moduleOrder: number; moduleTitle: string };

/** Null for someone who has not passed or saved anything yet, or who has finished everything open. */
export async function continuePoint(learner: string): Promise<ContinuePoint | null> {
  const sql = db();
  const [lessons, finals, places] = await Promise.all([
    sql`SELECT DISTINCT lesson_slug FROM assessment_attempts WHERE learner_id=${learner} AND passed`,
    sql`SELECT DISTINCT module_slug FROM module_assessment_attempts WHERE learner_id=${learner} AND passed`,
    sql`SELECT count(*)::int AS n FROM learning_checkpoints WHERE learner_id=${learner}`,
  ]);
  const passed = new Set(lessons.map((r) => r.lesson_slug as string));
  const passedFinals = new Set(finals.map((r) => r.module_slug as string));
  if (!passed.size && !passedFinals.size && !places[0]?.n) return null;
  for (const slug of openPaths) {
    const mod = getModule(slug)!;
    for (const step of journeyFor(slug)) {
      if (step.id === "welcome" || !step.available) continue;
      const done = step.id === "final-assessment" ? passedFinals.has(slug) : passed.has(step.id);
      if (!done) return { step, moduleOrder: mod.order, moduleTitle: mod.title };
    }
  }
  return null;
}

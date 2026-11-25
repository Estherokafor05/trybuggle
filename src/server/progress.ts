// Where a returning learner should pick up: the first step on the learning
// path they have not passed yet (lessons open in order). Read-only.
import { getModule } from "@course";
import { db } from "./database";
import { coursePath, passedSteps, type PathStep } from "./progression";

export type ContinuePoint = { step: PathStep; moduleOrder: number; moduleTitle: string };

/** Null for someone who has not passed or saved anything yet, or who has finished everything open. */
export async function continuePoint(learner: string): Promise<ContinuePoint | null> {
  const [passed, places] = await Promise.all([
    passedSteps(learner),
    db()`SELECT count(*)::int AS n FROM learning_checkpoints WHERE learner_id=${learner}`,
  ]);
  if (!passed.size && !places[0]?.n) return null;
  const step = coursePath().find((s) => !passed.has(s.key));
  if (!step) return null;
  return { step, moduleOrder: step.moduleOrder, moduleTitle: getModule(step.moduleSlug)?.title ?? "" };
}

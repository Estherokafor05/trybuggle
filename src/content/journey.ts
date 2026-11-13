// The ordered path a learner follows through each module.
// Module 1: Welcome → five lessons → final assessment.
// Other modules: their episodes in order (and a final assessment once it exists).
// Every page that is part of a path reads its position from here so the
// "where am I / what's next" signposting stays consistent.
import { getModule } from "./modules";
import { getBuiltLesson } from "./preview-lessons";

export interface JourneyStep {
  id: string;
  /** Short label for steppers, e.g. "Welcome" or "Lesson 1". */
  label: string;
  title: string;
  href: string;
  available: boolean;
  /** Open without signing in. */
  free: boolean;
  duration?: string;
}

/** Modules that end with a final assessment page today. */
const withFinal = new Set(["ai-foundations"]);

export function journeyFor(moduleSlug: string): JourneyStep[] {
  const mod = getModule(moduleSlug);
  if (!mod) return [];
  const first = mod.order === 1;
  const steps: JourneyStep[] = mod.lessons.map((lesson, index) => {
    const built = getBuiltLesson(lesson.slug);
    return {
      id: lesson.slug,
      label: first ? `Lesson ${index + 1}` : `Episode ${mod.order}.${index + 1}`,
      title: lesson.title,
      href: `/modules/${mod.slug}/lessons/${lesson.slug}`,
      available: Boolean(built),
      free: Boolean(built?.preview),
      duration: built?.duration,
    };
  });
  if (first)
    steps.unshift({
      id: "welcome",
      label: "Welcome",
      title: "Welcome to Buggle Learn",
      href: "/welcome",
      available: true,
      free: true,
      duration: "2 minutes",
    });
  if (withFinal.has(mod.slug))
    steps.push({
      id: "final-assessment",
      label: "Final assessment",
      title: `Module ${mod.order} refresher`,
      href: `/modules/${mod.slug}/final-assessment`,
      available: true,
      free: true,
      duration: "8 questions",
    });
  return steps;
}

/** Module 1's path, used by the home page and the welcome. */
export const journey: JourneyStep[] = journeyFor("ai-foundations");

export function journeyPosition(id: string, moduleSlug = "ai-foundations") {
  const steps = journeyFor(moduleSlug);
  const index = steps.findIndex((step) => step.id === id);
  return {
    steps,
    index,
    step: steps[index],
    previous: index > 0 ? steps[index - 1] : undefined,
    next: index >= 0 ? steps[index + 1] : undefined,
  };
}

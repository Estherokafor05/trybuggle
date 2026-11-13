// The single ordered path a new learner follows:
// Welcome → Module 1 lessons, one after another → final assessment.
// Every page that is part of the path reads its position from here so the
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
  /** Open without signing in (all of Module 1). */
  free: boolean;
  duration?: string;
}

const foundations = getModule("ai-foundations")!;

export const journey: JourneyStep[] = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Welcome to Buggle Learn",
    href: "/welcome",
    available: true,
    free: true,
    duration: "2 minutes",
  },
  ...foundations.lessons.map((lesson, index) => {
    const built = getBuiltLesson(lesson.slug);
    return {
      id: lesson.slug,
      label: `Lesson ${index + 1}`,
      title: lesson.title,
      href: `/modules/${foundations.slug}/lessons/${lesson.slug}`,
      available: Boolean(built),
      free: Boolean(built?.preview),
      duration: built?.duration,
    };
  }),
  {
    id: "final-assessment",
    label: "Final assessment",
    title: "Module 1 refresher",
    href: `/modules/${foundations.slug}/final-assessment`,
    available: true,
    free: true,
    duration: "8 questions",
  },
];

export function journeyPosition(id: string) {
  const index = journey.findIndex((step) => step.id === id);
  return {
    index,
    step: journey[index],
    previous: index > 0 ? journey[index - 1] : undefined,
    next: index >= 0 ? journey[index + 1] : undefined,
  };
}

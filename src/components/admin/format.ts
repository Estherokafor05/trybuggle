// Small formatting helpers for admin pages.
import { course, getModule, modules } from "@course";
export { button, card, input, outline } from "./styles";

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(iso)) + " UTC";

/** "Lesson 2: AI in Your Day" or "Module 1 final assessment" from a check key. */
export function checkName(kind: "lesson" | "final", key: string) {
  if (kind === "final") {
    const mod = getModule(key);
    return mod ? `Module ${mod.order} final assessment` : key;
  }
  for (const mod of modules) {
    const i = mod.lessons.findIndex((l) => l.slug === key);
    if (i >= 0) return `${mod.order === 1 ? `Lesson ${i + 1}` : `Episode ${mod.order}.${i + 1}`}: ${mod.lessons[i].title}`;
  }
  return key;
}

export function certificateName(kind: string, moduleSlug: string | null) {
  if (kind === "essentials") return `${course.title} Essentials`;
  if (kind === "deep_dive") return "Deep Dive";
  return `${getModule(moduleSlug ?? "")?.title ?? "Module"} (module certificate)`;
}

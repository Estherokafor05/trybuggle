// When is a Read & Explore step actually finished, not just visited?
// Each rule mirrors the success state the activity itself shows the learner.
import type { ActivityState } from "@/lib/learning-state";

type All = Record<string, ActivityState>;
const m = (s: ActivityState | undefined, key: string) => s?.matches?.[key];
const allMatch = (s: ActivityState | undefined, expected: Record<string, string>) =>
  Object.entries(expected).every(([k, v]) => m(s, k) === v);
const dayPlaces = ["home", "journey", "centre", "shopping"];

const rules: Record<string, (s: ActivityState | undefined, all: All) => boolean> = {
  // Lesson 1
  meet: (s) => m(s, "q") === "systems",
  automatic: (s) => m(s, "timer") === "no" && (s?.stage ?? 0) >= 3,
  learn: (s) => Boolean(m(s, "test2")),
  request: (s) => (s?.stage ?? 0) >= 1,
  investigate: (s) => Boolean(s?.revised),
  reflect: (s) => m(s, "health") === "expert",
  // Lesson 2
  "day-map": (_s, all) => dayPlaces.every((id) => all[id]?.revised),
  home: (s) => Boolean(s?.revised),
  journey: (s) => Boolean(s?.revised),
  centre: (s) => Boolean(s?.revised),
  shopping: (s) => Boolean(s?.revised),
  "day-reflect": (_s, all) => dayPlaces.every((id) => all[id]?.revised),
  // Lesson 3
  "time-1950": (s) => m(s, "q") === "behaviour",
  "time-1956": (s) => m(s, "q") === "ai",
  "time-rules": (s) => m(s, "q") === "rule",
  "time-1997": (s) => allMatch(s, { chess: "rules", photos: "learn", printer: "rules", speech: "learn" }),
  "time-2022": (s) => m(s, "q") === "chat",
  "time-reflect": (s) => m(s, "q") === "decades",
  // Lesson 4
  "rec-desk": (s) => Object.keys(s?.matches ?? {}).length >= 4,
  "rec-reminder": (s) => m(s, "q") === "rule",
  "rec-checkin": (s) => m(s, "q") === "steps",
  "rec-inbox": (s) => (s?.stage ?? 0) >= 2,
  "rec-mistake": (s) => allMatch(s, { q1: "parking", q2: "deliveries", q3: "it", q4: "visitor" }),
  "rec-sort": (s) => allMatch(s, { calendar: "ordinary", tablet: "ordinary", inbox: "ai", sheet: "ordinary", chatbot: "unknown" }),
  // Lesson 5
  "hr-brief": (s) => {
    const chosen = new Set(s?.items ?? []);
    return s?.stage === 1 && ["job", "title", "tone"].every((x) => chosen.has(x)) && !chosen.has("names") && !chosen.has("cv");
  },
  "hr-facts": (s) => Boolean(s?.revised),
  "hr-questions": (s) => allMatch(s, { q1: "keep", q2: "keep", q3: "remove", q4: "keep", q5: "remove", q6: "keep" }),
  "hr-privacy": (s) => m(s, "q") === "approved",
  "hr-ranking": (s) => s?.stage === 1,
  "hr-checking": (s) => allMatch(s, { s1: "light", s2: "check", s3: "check", s4: "person", s5: "person" }),
};

/** True once the learner has done what the step asks, not merely opened it. */
export function stepComplete(stepId: string, all: All) {
  return rules[stepId]?.(all[stepId], all) ?? false;
}

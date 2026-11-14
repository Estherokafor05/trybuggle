export type ActivityState = {
  stage?: number;
  selection?: string;
  items?: string[];
  matches?: Record<string, string>;
  revised?: boolean;
};
export type Checkpoint = {
  version: 1;
  route: "watch" | "explore";
  step: number;
  visited: string[];
  activities: Record<string, ActivityState>;
  videoTime: number;
};
export const emptyCheckpoint = (): Checkpoint => ({
  version: 1,
  route: "watch",
  step: 0,
  visited: [],
  activities: {},
  videoTime: 0,
});

export function sameCheckpoint(first: Checkpoint, second: Checkpoint): boolean {
  function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, canonical(item)]),
      );
    }
    return value;
  }
  return JSON.stringify(canonical(first)) === JSON.stringify(canonical(second));
}
const ids: Record<string, string[]> = {
  "what-counts-as-ai": [
    "meet",
    "automatic",
    "learn",
    "request",
    "investigate",
    "reflect",
  ],
  "ai-in-your-day": [
    "day-map",
    "home",
    "journey",
    "centre",
    "shopping",
    "day-reflect",
  ],
  "before-chatgpt": [
    "time-1950",
    "time-1956",
    "time-rules",
    "time-1997",
    "time-2022",
    "time-reflect",
  ],
  "ai-or-software": [
    "rec-desk",
    "rec-reminder",
    "rec-checkin",
    "rec-inbox",
    "rec-mistake",
    "rec-sort",
  ],
  "what-ai-can-do": [
    "hr-brief",
    "hr-facts",
    "hr-questions",
    "hr-privacy",
    "hr-ranking",
    "hr-checking",
  ],
  "a-new-helper": ["chat-busy", "chat-ask", "chat-check", "chat-why", "chat-turn"],
  "the-email-that-said-nothing": ["email-first", "email-missing", "email-build", "email-private", "email-turn"],
  "three-tries-at-the-flyer": ["flyer-first", "flyer-next", "flyer-tone", "flyer-check", "flyer-turn"],
  "thirty-pages-by-friday": ["pages-first", "pages-send", "pages-check", "pages-fix", "pages-turn"],
  "the-grant-that-didnt-exist": ["grant-first", "grant-check", "grant-steer", "grant-funder", "grant-turn"],
};
// Step ids from earlier guide versions. Saved places that mention them are
// still accepted; the retired entries are dropped instead of rejecting the
// learner's whole saved place.
const retired: Record<string, string[]> = {
  "what-counts-as-ai": ["match", "repair"],
  "ai-in-your-day": ["messages", "tasks"],
  "before-chatgpt": [],
  "ai-or-software": [],
  "what-ai-can-do": [],
  "a-new-helper": [],
  "the-email-that-said-nothing": [],
  "three-tries-at-the-flyer": [],
  "thirty-pages-by-friday": [],
  "the-grant-that-didnt-exist": [],
};
/** Longest film in seconds, so a saved video position can be validated. */
const filmLength: Record<string, number> = {
  "what-counts-as-ai": 242,
  "ai-in-your-day": 193,
  "before-chatgpt": 256,
  "ai-or-software": 237,
  "what-ai-can-do": 185,
  "a-new-helper": 156,
  "the-email-that-said-nothing": 126,
  "three-tries-at-the-flyer": 112,
  "thirty-pages-by-friday": 116,
  "the-grant-that-didnt-exist": 133,
};
export function parseCheckpoint(
  value: unknown,
  slug: string,
): Checkpoint | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !Object.hasOwn(ids, slug)
  )
    return null;
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) =>
        ![
          "version",
          "route",
          "step",
          "visited",
          "activities",
          "videoTime",
        ].includes(k),
    )
  )
    return null;
  if (
    v.version !== 1 ||
    !["watch", "explore"].includes(String(v.route)) ||
    !Number.isInteger(v.step) ||
    Number(v.step) < 0 ||
    Number(v.step) >= ids[slug].length + retired[slug].length
  )
    return null;
  if (
    typeof v.videoTime !== "number" ||
    !Number.isFinite(v.videoTime) ||
    v.videoTime < 0 ||
    v.videoTime > filmLength[slug]
  )
    return null;
  const known = (x: unknown) =>
    typeof x === "string" &&
    (ids[slug].includes(x) || retired[slug].includes(x));
  if (
    !Array.isArray(v.visited) ||
    v.visited.length > ids[slug].length + retired[slug].length ||
    !v.visited.every(known)
  )
    return null;
  if (
    !v.activities ||
    typeof v.activities !== "object" ||
    Array.isArray(v.activities)
  )
    return null;
  const activities: Record<string, ActivityState> = {};
  for (const [id, raw] of Object.entries(v.activities)) {
    if (
      !known(id) ||
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw)
    )
      return null;
    const activity = raw as Record<string, unknown>;
    if (
      Object.keys(activity).some(
        (k) =>
          !["stage", "selection", "items", "matches", "revised"].includes(k),
      )
    )
      return null;
    if (
      activity.stage !== undefined &&
      (!Number.isInteger(activity.stage) ||
        Number(activity.stage) < 0 ||
        Number(activity.stage) > 20)
    )
      return null;
    if (
      activity.selection !== undefined &&
      (typeof activity.selection !== "string" ||
        activity.selection.length > 100)
    )
      return null;
    if (activity.revised !== undefined && typeof activity.revised !== "boolean")
      return null;
    if (
      activity.items !== undefined &&
      (!Array.isArray(activity.items) ||
        activity.items.length > 12 ||
        !activity.items.every((x) => typeof x === "string" && x.length <= 100))
    )
      return null;
    if (
      activity.matches !== undefined &&
      (!activity.matches ||
        typeof activity.matches !== "object" ||
        Array.isArray(activity.matches) ||
        Object.keys(activity.matches).length > 12 ||
        Object.entries(activity.matches).some(
          ([k, x]) => k.length > 100 || typeof x !== "string" || x.length > 100,
        ))
    )
      return null;
    if (ids[slug].includes(id)) activities[id] = activity as ActivityState;
  }
  return {
    version: 1,
    route: v.route as Checkpoint["route"],
    step: Math.min(Number(v.step), ids[slug].length - 1),
    visited: [
      ...new Set((v.visited as string[]).filter((x) => ids[slug].includes(x))),
    ],
    activities,
    videoTime: v.videoTime,
  };
}

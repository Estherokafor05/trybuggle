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
    "match",
    "learn",
    "request",
    "investigate",
    "repair",
    "reflect",
  ],
  "ai-in-your-day": [
    "day-map",
    "home",
    "journey",
    "shopping",
    "messages",
    "tasks",
    "day-reflect",
  ],
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
    Number(v.step) >= ids[slug].length
  )
    return null;
  if (
    typeof v.videoTime !== "number" ||
    !Number.isFinite(v.videoTime) ||
    v.videoTime < 0 ||
    v.videoTime > (slug === "ai-in-your-day" ? 193 : 242)
  )
    return null;
  if (
    !Array.isArray(v.visited) ||
    v.visited.length > ids[slug].length ||
    !v.visited.every((x) => typeof x === "string" && ids[slug].includes(x))
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
      !ids[slug].includes(id) ||
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
    activities[id] = activity as ActivityState;
  }
  return {
    version: 1,
    route: v.route as Checkpoint["route"],
    step: Number(v.step),
    visited: [...new Set(v.visited as string[])],
    activities,
    videoTime: v.videoTime,
  };
}

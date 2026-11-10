export const JOURNEY_DURATION = 57;
export const journeyChapters = [
  {
    at: 0,
    still: 5,
    title: "Before leaving",
    description:
      "Maya stands in her hallway. She lifts her phone to check the journey before setting off.",
  },
  {
    at: 9,
    still: 19,
    title: "Traffic changes the estimate",
    description:
      "Cars queue on Maya’s usual road. The map shows an estimated 30 minutes on that route and 20 minutes on the alternative.",
  },
  {
    at: 23,
    still: 33,
    title: "Where the estimate comes from",
    description:
      "Traffic information now and patterns from earlier journeys combine to help estimate a travel time. This simplified diagram does not show the exact internals of a product.",
  },
  {
    at: 37,
    still: 40,
    title: "A prediction, not a promise",
    description:
      "Two routes lead to the same community centre. Their journey times are estimates of what may happen next.",
  },
  {
    at: 43,
    still: 46,
    title: "Maya makes the decision",
    description:
      "Maya reviews the route on her phone before choosing it. The tool offers an estimate; Maya decides whether the route suits her.",
  },
  {
    at: 49,
    still: 54,
    title: "Ready to go",
    description:
      "Maya puts her phone away and walks toward the door. Traffic can change, so the 20-minute estimate is not a guarantee.",
  },
] as const;
// Deliberately fictional teaching values, not a live AI model or traffic service.
export function journeyEstimate(traffic: "light" | "heavy") {
  return {
    usual: traffic === "heavy" ? 30 : 15,
    alternative: 20,
    recommended: traffic === "heavy" ? "alternative" : "usual",
  } as const;
}
export function chapterAt(time: number) {
  return Math.max(
    0,
    journeyChapters.findLastIndex((chapter) => chapter.at <= time),
  );
}

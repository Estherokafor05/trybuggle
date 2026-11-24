"use client";
// Which Read & Explore activity each lesson uses. Lessons not listed here use
// the Module 1 dispatcher, which picks an activity by step id.
import type { ReactNode } from "react";
import type { Props } from "@/components/blocks/Blocks";
import { Activity } from "./FoundationsActivities";
import { HistoryActivity } from "./HistoryActivities";
import { OfficeActivity } from "./OfficeActivities";
import { HiringActivity } from "./HiringActivities";
import { HelperActivity } from "./HelperActivities";
import { EmailActivity } from "./EmailActivities";
import { FlyerActivity } from "./FlyerActivities";
import { PagesActivity } from "./PagesActivities";
import { GrantActivity } from "./GrantActivities";

const activityFor: Record<string, (props: Props) => ReactNode> = {
  "before-chatgpt": HistoryActivity,
  "ai-or-software": OfficeActivity,
  "what-ai-can-do": HiringActivity,
  "a-new-helper": HelperActivity,
  "the-email-that-said-nothing": EmailActivity,
  "three-tries-at-the-flyer": FlyerActivity,
  "thirty-pages-by-friday": PagesActivity,
  "the-grant-that-didnt-exist": GrantActivity,
};

/** Renders one guide step's activity for the given lesson. */
export function LessonActivity(props: Props) {
  const Component = activityFor[props.slug] ?? Activity;
  return <Component {...props} />;
}

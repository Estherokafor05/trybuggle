// Optional product analytics, session replay and error tracking with PostHog.
// Nothing loads unless a PostHog key is configured AND the learner has agreed.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
const CHOICE = "buggle-analytics";

export const analyticsAvailable = () => Boolean(KEY);

export function analyticsChoice(): "yes" | "no" | null {
  try {
    const v = window.localStorage.getItem(CHOICE);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

let started = false;
export async function startAnalytics() {
  if (!KEY || started) return;
  started = true;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: "history_change",
      capture_pageleave: true,
      capture_exceptions: true,
      person_profiles: "identified_only",
      session_recording: {
        // Typed text (notes, names, answers in boxes) and marked personal text are hidden.
        maskAllInputs: true,
        maskTextSelector: ".ph-mask",
      },
    });
  } catch {
    started = false;
  }
}

export async function setAnalyticsChoice(choice: "yes" | "no") {
  try {
    window.localStorage.setItem(CHOICE, choice);
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
  if (choice === "yes") return startAnalytics();
  if (started) {
    const { default: posthog } = await import("posthog-js");
    posthog.opt_out_capturing();
    posthog.reset();
    started = false;
  }
}

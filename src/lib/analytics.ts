// Product analytics, session replay and error tracking with PostHog.
//
// Everyone (when a PostHog key is configured): anonymous, cookieless page views and
// error reports. Nothing is stored in the browser and no one is identified; PostHog
// counts visitors with a daily-rotating hash on its servers.
//
// Only learners who agree: full tracking with a browser ID, click capture and
// session recordings (typed text hidden).
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
const CHOICE = "buggle-analytics";

type Choice = "yes" | "no";
type PostHog = (typeof import("posthog-js"))["default"];

export const analyticsAvailable = () => Boolean(KEY);

export function analyticsChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(CHOICE);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

let loading: Promise<PostHog | null> | null = null;

/** Loads PostHog once. Starts in anonymous cookieless mode unless the learner already agreed. */
export function startAnalytics(): Promise<PostHog | null> {
  if (!KEY) return Promise.resolve(null);
  loading ??= (async () => {
    try {
      const agreed = analyticsChoice() === "yes";
      const { default: posthog } = await import("posthog-js");
      posthog.init(KEY, {
        api_host: HOST,
        // Until a learner says yes they count as opted out, which in this mode means
        // anonymous cookieless capture rather than no capture.
        cookieless_mode: "on_reject",
        opt_out_capturing_by_default: !agreed,
        capture_pageview: "history_change",
        capture_pageleave: true,
        capture_exceptions: true,
        autocapture: agreed,
        disable_session_recording: !agreed,
        person_profiles: "identified_only",
        session_recording: {
          // Typed text (notes, names, answers in boxes) and marked personal text are hidden.
          maskAllInputs: true,
          maskTextSelector: ".ph-mask",
        },
      });
      return posthog;
    } catch {
      loading = null;
      return null;
    }
  })();
  return loading;
}

export async function setAnalyticsChoice(choice: Choice) {
  try {
    window.localStorage.setItem(CHOICE, choice);
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
  const posthog = await startAnalytics();
  if (!posthog) return;
  if (choice === "yes") {
    posthog.opt_in_capturing();
    posthog.set_config({ autocapture: true });
    posthog.startSessionRecording();
  } else {
    posthog.stopSessionRecording();
    posthog.set_config({ autocapture: false });
    // Back to anonymous cookieless counting; clears the browser ID.
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

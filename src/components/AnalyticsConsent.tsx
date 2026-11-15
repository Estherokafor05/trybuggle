"use client";
// Asks once whether the learner is happy to share usage data. Hidden when
// analytics is not configured, or once they have chosen.
import Link from "next/link";
import { useEffect, useState } from "react";
import { analyticsAvailable, analyticsChoice, setAnalyticsChoice } from "@/lib/analytics";

export function AnalyticsConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Read the saved choice after hydration, so the server and browser agree.
    const id = window.setTimeout(() => setShow(analyticsAvailable() && analyticsChoice() === null), 0);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  const choose = (choice: "yes" | "no") => {
    void setAnalyticsChoice(choice);
    setShow(false);
  };
  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-lg sm:bottom-5 sm:p-5"
    >
      <h2 id="consent-title" className="font-bold">Help us improve Buggle Learn?</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        We&apos;re testing Buggle Learn. With your OK, we&apos;ll see which pages you use and where
        things go wrong, including recordings of your visit with anything you type hidden. No
        adverts, ever. If you say no, we only count visits and errors anonymously, without cookies.{" "}
        <Link href="/privacy#analytics" className="font-semibold text-navy underline underline-offset-4">
          Learn more
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("yes")} className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-brand-deep">
          Yes, that&apos;s fine
        </button>
        <button type="button" onClick={() => choose("no")} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy hover:bg-lavender">
          No thanks
        </button>
      </div>
    </section>
  );
}

/** A small control on the privacy page to change the choice later. */
export function AnalyticsChoiceControl() {
  const [choice, setChoice] = useState<"yes" | "no" | null | undefined>(undefined);
  useEffect(() => {
    const id = window.setTimeout(() => setChoice(analyticsChoice()), 0);
    return () => window.clearTimeout(id);
  }, []);
  if (choice === undefined) return null;
  const set = (c: "yes" | "no") => {
    void setAnalyticsChoice(c);
    setChoice(c);
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm font-semibold" role="status">
        {choice === "yes" ? "You have agreed to share usage data." : choice === "no" ? "You have said no to sharing usage data." : "You have not chosen yet."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={choice === "yes"} onClick={() => set("yes")} className="inline-flex min-h-11 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white disabled:opacity-50">
          Share usage data
        </button>
        <button type="button" disabled={choice === "no"} onClick={() => set("no")} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-navy disabled:opacity-50">
          Don&apos;t share
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SetupHelpResponse } from "@/app/api/setup-help/route";
import { starterPlans, type Situation } from "@/content/use-ai";

const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60";

/** Pick a situation, get a free starter plan, then optionally join the setup-help list. */
export function StartUsingAi({ initial }: { initial: Situation | null }) {
  const [situation, setSituation] = useState<Situation | null>(initial);
  const plan = starterPlans.find((p) => p.id === situation);
  const planRef = useRef<HTMLElement>(null);

  function choose(id: Situation) {
    setSituation(id);
    // Keep the URL shareable and the choice on refresh, without a navigation.
    const url = new URL(window.location.href);
    url.searchParams.set("for", id);
    window.history.replaceState(null, "", url);
    requestAnimationFrame(() => planRef.current?.focus());
  }

  return (
    <>
      <fieldset className="mt-6">
        <legend className="text-xl font-bold">Where do you want to use AI first?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {starterPlans.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={situation === p.id}
              onClick={() => choose(p.id)}
              className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors ${
                situation === p.id ? "border-brand-deep bg-lavender text-navy" : "border-line bg-white text-ink hover:border-brand"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      {plan && (
        <>
          <section
            ref={planRef}
            tabIndex={-1}
            aria-labelledby="plan-title"
            className="mt-6 scroll-mt-28 rounded-[1.75rem] border border-line bg-white p-5 outline-none sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Your free starter plan</p>
            <h2 id="plan-title" className="mt-2 text-2xl font-bold">
              {plan.heading}
            </h2>
            <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">{plan.intro}</p>
            <ol className="mt-5 grid gap-4">
              {plan.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-1 leading-relaxed text-ink">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-2xl bg-canvas p-4 sm:p-5">
              <h3 className="font-bold">Try this first prompt</h3>
              <p className="mt-1 text-sm text-muted">Replace the parts in [brackets] with your own details.</p>
              <p className="mt-3 rounded-xl border border-line bg-white p-4 leading-relaxed">{plan.firstPrompt}</p>
              <CopyButton text={plan.firstPrompt} />
            </div>
          </section>

          <SetupHelp situation={plan.id} />
        </>
      )}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="mt-3 inline-flex min-h-11 items-center rounded-full border border-navy/25 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-lavender"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }}
    >
      <span aria-live="polite">{copied ? "Copied ✓" : "Copy prompt"}</span>
    </button>
  );
}

/** Interest list for personal setup help. No payment is taken here. */
function SetupHelp({ situation }: { situation: Situation }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState<string | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (joined) doneRef.current?.focus();
  }, [joined]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/setup-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, situation }),
      });
      const result: SetupHelpResponse = await response.json();
      if (!result.ok) throw new Error(result.message);
      setJoined(email.trim());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "That did not go through. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="setup-help-title" className="mt-6 rounded-[1.75rem] bg-hero-lavender p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Want a hand?</p>
      <h2 id="setup-help-title" className="mt-2 text-2xl font-bold">
        Get personal help setting AI up
      </h2>
      <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">
        We&apos;re planning one-to-one sessions where we set AI up with you for your own job, business or home. This
        will be a paid service, separate from Buggle Learn&apos;s free courses. Join the list and we&apos;ll email you
        the details and price when it opens. Joining is free and doesn&apos;t commit you to anything.
      </p>

      {joined ? (
        <div ref={doneRef} tabIndex={-1} role="status" className="mt-4 rounded-2xl border-2 border-teal bg-mint p-5 outline-none">
          <p className="text-lg font-bold">You&apos;re on the list.</p>
          <p className="mt-1.5 leading-relaxed">
            We&apos;ll email <span className="break-all font-semibold">{joined}</span> when personal setup help opens.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label htmlFor="setup-help-email" className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold">
            Email
            <input
              id="setup-help-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-navy/30 bg-white px-3 py-2.5 font-normal focus-visible:outline-2 focus-visible:outline-brand-deep"
            />
          </label>
          <button type="submit" disabled={sending} className={primary}>
            {sending ? "Sending…" : "Join the list"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-peach p-3 text-sm">
          {error}
        </p>
      )}
      <p className="mt-3 text-sm text-ink">
        We keep your email and choice only to tell you about this service. See our{" "}
        <Link href="/privacy#waitlist" className="font-semibold text-navy underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </section>
  );
}

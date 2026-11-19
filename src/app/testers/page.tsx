import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaitlistForm } from "@/components/WaitlistForm";
import { testerModules, testerTracks } from "@/content/testers";

export const metadata: Metadata = {
  title: "AI for Testers | Buggle Learn",
  description:
    "Build agents that review acceptance criteria, draft test cases and write bug reports, without Python. Then learn how to tell when they're wrong.",
};

function Box({
  title,
  note,
  tone = "plain",
  className = "",
}: {
  title: string;
  note: string;
  tone?: "plain" | "accent" | "deep" | "deepAccent";
  className?: string;
}) {
  const tones = {
    plain: "border-line bg-white text-ink",
    accent: "border-brand-deep bg-lavender text-ink",
    deep: "border-deep-line bg-white/5 text-white",
    deepAccent: "border-teal-light bg-white/10 text-white",
  };
  const noteTone = tone.startsWith("deep") ? "text-deep-muted" : "text-muted";
  return (
    <div className={`rounded-2xl border-2 px-4 py-3 sm:px-5 ${tones[tone]} ${className}`}>
      <p className="font-display text-lg font-bold leading-tight">{title}</p>
      <p className={`mt-1 font-mono text-sm ${noteTone}`}>{note}</p>
    </div>
  );
}

function Down({ deep = false }: { deep?: boolean }) {
  return (
    <div aria-hidden="true" className={`ml-8 h-7 w-0.5 ${deep ? "bg-deep-muted" : "bg-muted"} relative`}>
      <span
        className={`absolute -bottom-1 -left-[5px] size-0 border-x-[6px] border-t-[7px] border-x-transparent ${
          deep ? "border-t-deep-muted" : "border-t-muted"
        }`}
      />
    </div>
  );
}

function Across({ label, deep = false }: { label?: string; deep?: boolean }) {
  return (
    <div aria-hidden="true" className="flex flex-col items-center justify-center px-1 py-2 sm:py-0">
      {label && <span className={`font-mono text-xs ${deep ? "text-deep-muted" : "text-muted"}`}>{label}</span>}
      <span className={`text-xl leading-none ${deep ? "text-deep-muted" : "text-muted"}`}>
        <span className="sm:hidden">↓</span>
        <span className="hidden sm:inline">→</span>
      </span>
    </div>
  );
}

function Figure({ label, children, deep = false }: { label: string; children: ReactNode; deep?: boolean }) {
  return (
    <figure
      className={`rounded-3xl border p-5 sm:p-7 ${deep ? "border-deep-line" : "border-line bg-white"}`}
    >
      <p className="sr-only">{label}</p>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}

export default function TestersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        {/* Hero */}
        <section className="grid gap-8 rounded-[2rem] bg-hero-lavender p-6 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-xs font-semibold text-ink">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              AI for Testers · early access
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.05] tracking-tight">
              You don&apos;t need Python to build with AI.
            </h1>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-ink/85 sm:text-lg">
              Most AI courses start by asking you to open a terminal. This one doesn&apos;t.
              You&apos;ll learn what these systems actually are, then build agents that review
              acceptance criteria, draft test cases and write bug reports, and learn how to tell
              when they&apos;re wrong.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#early-access"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Get early access
              </a>
              <a
                href="#curriculum"
                className="inline-flex min-h-11 items-center rounded-full border-2 border-navy/15 bg-white/85 px-5 py-3 text-sm font-semibold text-ink hover:border-brand"
              >
                See the curriculum
              </a>
            </div>
            <p className="mt-5 text-sm text-ink">
              <strong className="font-semibold">Open to Testers Connect members first.</strong>{" "}
              <span className="text-ink/75">Module 1 lands soon.</span>
            </p>
          </div>

          <Figure label="How an acceptance criteria agent works: a ticket and its acceptance criteria come from Jira or Linear. Your agent reads the criteria, flags what is ambiguous and drafts test cases. You review them: keep, cut or rewrite. What you keep becomes your test suite, and what you cut teaches the next run. This is the agent you build in Module 4.">
            <Box title="Ticket + AC" note="from Jira / Linear" tone="accent" />
            <Down />
            <Box title="Your agent" note="reads the criteria · flags what is ambiguous · drafts cases" />
            <Down />
            <div className="flex flex-col sm:flex-row sm:items-stretch">
              <Box title="You review" note="keep · cut · rewrite" tone="accent" className="sm:flex-1" />
              <Across />
              <Box title="Test suite" note="yours" className="sm:flex-1" />
            </div>
            <p className="mt-3 font-mono text-xs text-muted">↺ what you cut teaches the next run</p>
            <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
              Module 4 · Acceptance criteria agent
            </p>
          </Figure>
        </section>

        {/* The distinction */}
        <section aria-labelledby="distinction" className="mt-8 rounded-[2rem] bg-deep-bg p-6 text-deep-ink sm:p-9 lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal-light">
            The distinction most courses skip
          </p>
          <h2 id="distinction" className="mt-3 max-w-[24ch] text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight">
            Using AI and testing AI are two different jobs.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-deep-muted sm:text-lg">
            People mix these up constantly, and it costs them. Bring deterministic testing habits
            to an AI feature and your assertions break on every run. Trust an agent&apos;s output
            without knowing how to grade it and you ship its mistakes as your own. We teach both,
            and we keep them apart.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {testerTracks.map((track, i) => (
              <article key={track.label} className="flex flex-col rounded-3xl border border-deep-line p-5 sm:p-7">
                <p className="w-fit rounded-full bg-white/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-teal-light">
                  {track.label}
                </p>
                <h3 className="mt-3 text-xl font-bold">{track.title}</h3>
                <div className="mt-5" aria-hidden="true">
                  {i === 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-stretch">
                      <Box title="You + agent" note="the tester's side" tone="deepAccent" className="sm:flex-1" />
                      <Across label="tests" deep />
                      <Box title="The app" note="same input, same output" tone="deep" className="sm:flex-1" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-stretch">
                      <Box title="The AI feature" note="same input, different output" tone="deep" className="sm:flex-1" />
                      <Across deep />
                      <Box title="Eval set" note="graded, not asserted" tone="deepAccent" className="sm:flex-1" />
                    </div>
                  )}
                </div>
                <p className="mt-5 leading-relaxed text-deep-muted">{track.body}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-deep-muted">
                  {track.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" aria-labelledby="curriculum-title" className="mt-12 scroll-mt-28">
          <p className="text-xs font-semibold tracking-wide text-brand-deep">The curriculum</p>
          <h2 id="curriculum-title" className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
            Six modules, from first principles to your own agents
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-2">
            {testerModules.map((module) => (
              <li key={module.number} className="flex gap-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
                <span className="font-mono text-sm font-semibold text-teal" aria-hidden="true">
                  {module.number}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-ink">
                    <span className="sr-only">Module {Number(module.number)}: </span>
                    {module.title}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{module.body}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink">
                    <span className="mr-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">You leave with</span>
                    {module.leaveWith}
                  </p>
                  <p className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] ${
                        module.badge ? "bg-navy text-white" : "bg-lavender text-navy"
                      }`}
                    >
                      {module.badge ?? `Module ${Number(module.number)}`}
                    </span>
                    <span className="rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                      {module.tag}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Early access */}
        <section
          id="early-access"
          aria-labelledby="early-access-title"
          className="mt-12 grid scroll-mt-28 gap-6 rounded-[2rem] border border-line bg-white p-6 sm:p-9 md:grid-cols-[1fr_minmax(0,22rem)] md:items-start"
        >
          <div>
            <h2 id="early-access-title" className="text-2xl font-bold text-ink sm:text-3xl">
              Get early access
            </h2>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">
              Open to Testers Connect members first. Leave your email and we&apos;ll send one
              message when Module 1 opens.
            </p>
          </div>
          <WaitlistForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

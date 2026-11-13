import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ModuleCard } from "@/components/ModuleCard";
import { TRACK_LABELS, modules, type Track } from "@/content/modules";

export const metadata: Metadata = {
  title: "Learning Path | Buggle Learn",
  description:
    "A beginner-friendly path through AI foundations, AI systems, machine learning, generative AI, agents, and practical workflows.",
};

const TRACK_ORDER: Track[] = ["foundations", "systems", "practice"];

const TRACK_NOTES: Record<Track, string> = {
  foundations: "Modules 1 to 3 are for everyone: understand AI, talk to it well, and stay safe with it.",
  systems: "An optional module for curious learners who want to know what happens inside AI tools.",
  practice: "After Module 3, choose a path for your job or everyday life. Each ends with a helper card you can use in any AI tool.",
};

const PATHS = [
  { name: "Office and Admin", note: "Forms, minutes, reports and rotas" },
  { name: "Students", note: "Study, research and honest writing" },
  { name: "Small Business", note: "Posts, customer replies and planning" },
  { name: "Everyday Life", note: "Money, side hustles and your phone" },
  { name: "Sales and Customer Service", note: "Replies, follow-ups and complaints" },
  { name: "Nurses", note: "Handovers, families and safe care" },
  { name: "Teachers", note: "Lesson plans, feedback and fair marking" },
];

const TRACK_COLOURS: Record<Track, string> = {
  foundations: "bg-lavender",
  systems: "bg-mint",
  practice: "bg-peach",
};

export default function CurriculumPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="grid items-center gap-6 rounded-3xl border border-navy/10 bg-lavender p-5 text-navy sm:p-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10 lg:p-10">
          <div>
            <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full bg-surface/80 px-3 py-1.5 text-xs font-semibold">
              The learning path <span aria-hidden="true">·</span> {modules.length}{" "}
              modules
            </p>
            <h1 className="mt-4 max-w-[19ch] text-[clamp(2rem,5vw,3.25rem)] leading-[1.08] font-bold">
              Learn the basics, then put them to use.
            </h1>
            <p className="mt-4 max-w-[48ch] leading-relaxed sm:text-lg">
              Three modules for everyone take you from understanding AI to using it
              safely, then you choose a path for your job. No coding experience is required.
            </p>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed">
              <strong className="font-semibold">Everything on Buggle Learn is free.</strong>{" "}
              Every module, knowledge check and certificate, with no payments
              or subscriptions.
            </p>
          </div>

          <nav
            aria-label="Jump to a learning track"
            className="min-w-0 rounded-3xl bg-surface p-4"
          >
            <p className="px-2 pb-1 text-sm font-semibold">Explore by track</p>
            <ol className="mt-2 grid gap-1">
              {TRACK_ORDER.map((track, index) => (
                <li key={track}>
                  <a
                    href={`#${track}`}
                    className="flex min-h-12 items-center gap-2.5 rounded-2xl px-2 py-1.5 text-sm font-semibold hover:bg-lavender/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full text-xs tabular-nums ${TRACK_COLOURS[track]}`}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">{TRACK_LABELS[track]}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0"
                      aria-hidden="true"
                      focusable="false"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14m-6-6 6 6 6-6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <section className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-navy p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold">New here? Start with Module 1</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/85">
              Begin with a 2-minute welcome. It leads you into Lesson 1, then
              each lesson points you to the next.
            </p>
          </div>
          <Link
            href="/welcome"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-lavender"
          >
            Start with the welcome <span aria-hidden="true">→</span>
          </Link>
        </section>

        <div className="mt-10 flex flex-col gap-10 sm:mt-12 sm:gap-12">
          {TRACK_ORDER.map((track, index) => (
            <section
              key={track}
              id={track}
              aria-labelledby={`${track}-title`}
              className="scroll-mt-28"
            >
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand-deep">
                  Track {String(index + 1).padStart(2, "0")}
                </p>
                <h2 id={`${track}-title`} className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
                  {TRACK_LABELS[track]}
                </h2>
                <p className="mt-1.5 max-w-[60ch] leading-relaxed text-muted">
                  {TRACK_NOTES[track]}
                </p>
              </div>
              {track === "practice" ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PATHS.map((path) => (
                    <li key={path.name} className="rounded-3xl border border-line bg-white p-5">
                      <p className="text-xs font-semibold text-muted">Coming after Module 3</p>
                      <p className="mt-2 text-lg font-bold text-ink">{path.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{path.note}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {modules
                    .filter((module) => module.track === track)
                    .map((module) => (
                      <ModuleCard key={module.slug} module={module} />
                    ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

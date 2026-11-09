import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ModuleCard } from "@/components/ModuleCard";
import { TRACK_LABELS, modules, type Track } from "@/content/modules";

export const metadata: Metadata = {
  title: "Curriculum — Buggle Learn",
  description:
    "Six modules, in order: AI foundations, machine learning, building an agent, QA agent workflows, testing AI-native products, and knowing when the agent is wrong.",
};

const TRACK_ORDER: Track[] = ["foundations", "using-ai", "testing-ai"];

const TRACK_NOTES: Record<Track, string> = {
  foundations:
    "You can't judge a tool without understanding how it was built. Start here.",
  "using-ai":
    "The software under test is deterministic. AI sits on your side of the screen.",
  "testing-ai":
    "The software under test is not deterministic. Now AI is the thing you're testing.",
};

export default function CurriculumPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 flex max-w-[64ch] flex-col gap-3">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-brand">
            Curriculum
          </p>
          <h1 className="text-[clamp(2rem,4.4vw,2.9rem)] font-bold leading-[1.1]">
            Six modules, in order.
          </h1>
          <p className="text-[1.02rem] leading-relaxed text-muted">
            Foundations first, then building, then the harder half — testing
            systems whose output changes every run. Nothing here asks you to
            write Python.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {TRACK_ORDER.map((track) => (
            <section key={track} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[1.3rem] font-bold text-ink">
                  {TRACK_LABELS[track]}
                </h2>
                <p className="max-w-[60ch] text-[0.93rem] text-muted">
                  {TRACK_NOTES[track]}
                </p>
              </div>
              <div className="flex flex-col gap-3.5">
                {modules
                  .filter((mod) => mod.track === track)
                  .map((mod) => (
                    <ModuleCard key={mod.slug} module={mod} />
                  ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-[0.93rem] text-muted">
          Module 1 opens to Testers Connect members first.{" "}
          <Link href="/#join" className="font-semibold text-brand underline">
            Get early access
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

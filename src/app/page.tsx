import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AgentFlow } from "@/components/diagrams/AgentFlow";
import {
  TestingAiDiagram,
  UsingAiDiagram,
} from "@/components/diagrams/TrackDiagrams";
import { ModuleCard } from "@/components/ModuleCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { modules } from "@/content/modules";

const METHOD = [
  {
    title: "Drawn, then explained",
    body: "Every concept gets a diagram that shows the real mechanism, with the explanation next to it. The picture carries the structure; the words carry the detail.",
  },
  {
    title: "Built on your own work",
    body: "Exercises use your tickets, your acceptance criteria, your flaky test. Nothing is practised on a toy app you'll never see again.",
  },
  {
    title: "Read in any order, after module 1",
    body: "Foundations come first because the rest depends on them. After that, take the module you need this week.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid items-center gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div className="flex min-w-0 flex-col gap-5">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-brand">
                For testers and QA engineers
              </p>
              <h1 className="text-[clamp(2.1rem,5.4vw,3.6rem)] font-bold leading-[1.1]">
                You don&apos;t need Python to build with{" "}
                <span className="text-brand">AI</span>.
              </h1>
              <p className="max-w-[60ch] text-[clamp(1.02rem,1.5vw,1.17rem)] leading-relaxed text-muted">
                Most AI courses start by asking you to open a terminal. This one
                doesn&apos;t. You&apos;ll learn what these systems actually are,
                then build agents that review acceptance criteria, draft test
                cases and write bug reports — and learn how to tell when
                they&apos;re wrong.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#join"
                  className="rounded-[9px] bg-brand px-5 py-2.5 text-[0.92rem] font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  Get early access
                </Link>
                <Link
                  href="/curriculum"
                  className="rounded-[9px] border border-line px-5 py-2.5 text-[0.92rem] font-semibold text-ink transition-colors hover:border-brand-soft hover:bg-brand-soft hover:text-brand"
                >
                  See the curriculum
                </Link>
              </div>
              <p className="text-[0.85rem] text-muted">
                <b className="font-semibold text-ink">
                  Open to Testers Connect members first.
                </b>{" "}
                Module 1 lands soon.
              </p>
            </div>

            <AgentFlow />
          </div>
        </section>

        {/* Two tracks */}
        <section id="tracks" className="bg-deep-bg text-deep-ink">
          <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
            <div className="mb-8 flex max-w-[64ch] flex-col gap-3">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-gold">
                The distinction most courses skip
              </p>
              <h2 className="text-[clamp(1.6rem,3.4vw,2.35rem)] font-bold leading-[1.1]">
                Using AI and testing AI are two different jobs.
              </h2>
              <p className="text-[1.02rem] leading-relaxed text-deep-muted">
                People mix these up constantly, and it costs them. Bring
                deterministic testing habits to an AI feature and your assertions
                break on every run. Trust an agent&apos;s output without knowing
                how to grade it and you ship its mistakes as your own. We teach
                both, and we keep them apart.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-deep-line p-6">
                <span className="self-start rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[0.69rem] uppercase tracking-[0.1em] text-gold">
                  Track A
                </span>
                <h3 className="text-[1.07rem] font-bold">
                  AI as a tool for testing
                </h3>
                <UsingAiDiagram />
                <p className="text-[0.95rem] text-deep-muted">
                  The software under test behaves the same way every time. AI
                  just makes you faster at testing it.
                </p>
                <ul className="flex list-disc flex-col gap-1.5 pl-[1.05em] text-[0.9rem] text-deep-muted">
                  <li>Agents that review acceptance criteria</li>
                  <li>Drafting cases and bug reports</li>
                  <li>Triaging a failed run</li>
                </ul>
              </article>

              <article className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-deep-line p-6">
                <span className="self-start rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[0.69rem] uppercase tracking-[0.1em] text-gold">
                  Track B
                </span>
                <h3 className="text-[1.07rem] font-bold">
                  Testing AI-native products
                </h3>
                <TestingAiDiagram />
                <p className="text-[0.95rem] text-deep-muted">
                  Output varies run to run. You can&apos;t assert equality on it,
                  so you grade it instead.
                </p>
                <ul className="flex list-disc flex-col gap-1.5 pl-[1.05em] text-[0.9rem] text-deep-muted">
                  <li>Accuracy, hallucination, bias</li>
                  <li>Building an eval set and a rubric</li>
                  <li>Regression when the model changes under you</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum">
          <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
            <div className="mb-8 flex max-w-[64ch] flex-col gap-3">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-brand">
                Curriculum
              </p>
              <h2 className="text-[clamp(1.6rem,3.4vw,2.35rem)] font-bold leading-[1.1]">
                Foundations first, then you build.
              </h2>
              <p className="text-[1.02rem] leading-relaxed text-muted">
                You can&apos;t judge a tool you don&apos;t understand the shape
                of. So we start with what these systems are and how they&apos;re
                built, and only then put one to work. Modules release in order.
              </p>
            </div>
            <div className="flex flex-col gap-3.5">
              {modules.map((mod) => (
                <ModuleCard key={mod.slug} module={mod} />
              ))}
            </div>
          </div>
        </section>

        {/* Method */}
        <section id="method" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
            <div className="mb-8 flex max-w-[64ch] flex-col gap-3">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-brand">
                How it works
              </p>
              <h2 className="text-[clamp(1.6rem,3.4vw,2.35rem)] font-bold leading-[1.1]">
                Diagrams and written docs. Not a video wall.
              </h2>
              <p className="text-[1.02rem] leading-relaxed text-muted">
                You can&apos;t search a video, skim it on a lunch break, or copy a
                line out of it. Everything here is written and drawn, so you can
                read it at your own pace and come back to the one paragraph you
                needed.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {METHOD.map((item) => (
                <div key={item.title} className="flex min-w-0 flex-col gap-2.5">
                  <span className="h-[3px] w-[34px] rounded-sm bg-gold" />
                  <h3 className="text-[1.07rem] font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-[0.93rem] text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join */}
        <section id="join">
          <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid items-center gap-7 rounded-2xl border border-line bg-surface p-7 sm:p-10 md:grid-cols-2 md:gap-11">
              <div className="flex min-w-0 flex-col gap-3">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-brand">
                  Early access
                </p>
                <h2 className="text-[clamp(1.6rem,3.4vw,2.35rem)] font-bold leading-[1.1]">
                  Testers Connect members go first.
                </h2>
                <p className="text-base leading-relaxed text-muted">
                  Module 1 opens to the community before anyone else. Tell us
                  where you&apos;re starting from and we&apos;ll pitch it at the
                  right level.
                </p>
              </div>
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

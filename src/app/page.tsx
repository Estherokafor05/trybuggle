import Image from "next/image";
import Link from "next/link";
import { ModuleCard } from "@/components/ModuleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { modules } from "@/content/modules";
import { previewLessons } from "@/content/preview-lessons";

const foundationsPath = "/modules/ai-foundations";

const learningMethods = [
  {
    number: "01",
    title: "See the idea",
    body: "Diagrams make unfamiliar AI concepts easier to picture.",
    accent: "bg-lavender",
  },
  {
    number: "02",
    title: "Listen or read",
    body: "Choose a narrated walkthrough or a written guide.",
    accent: "bg-peach",
  },
  {
    number: "03",
    title: "Check what you learned",
    body: "Knowledge checks will give feedback and let you try again.",
    accent: "bg-mint",
  },
];

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="size-4 shrink-0"
    >
      <path
        d="M3.5 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1232px] px-4 pb-12 pt-6 sm:px-7 sm:pb-16 sm:pt-8">
        <section className="relative isolate grid overflow-hidden rounded-[2rem] bg-hero-lavender sm:rounded-[2.5rem] md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="relative z-10 px-6 pt-7 sm:px-9 sm:pt-9 md:py-10 lg:px-12 lg:py-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-xs font-semibold text-ink">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              AI for curious beginners
            </p>
            <h1 className="mt-4 text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[1.04] tracking-tight sm:mt-5">
              <span className="block">Understand AI.</span>
              <span className="block">Learn how to use it.</span>
            </h1>
            <p className="mt-4 max-w-[42ch] text-[0.975rem] leading-relaxed text-ink/85 sm:text-base">
              See where AI shows up in work, study and everyday life. Learn how
              it works and how to use it thoughtfully, with no coding required.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={foundationsPath}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Explore Module 1 <Arrow />
              </Link>
              <Link
                href="/curriculum"
                className="inline-flex min-h-11 items-center rounded-full px-1 text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
              >
                View the learning path
              </Link>
            </div>
          </div>

          <div className="relative isolate mx-auto flex w-full max-w-[24rem] items-end justify-center px-7 pb-5 pt-5 sm:max-w-[27rem] md:max-w-none md:self-stretch md:px-4 md:py-6 lg:items-center lg:px-8">
            <div aria-hidden="true" className="absolute inset-x-[10%] top-[12%] -z-10 aspect-square rounded-full border border-ink/15 md:inset-x-[14%]" />
            <div aria-hidden="true" className="absolute -right-[7%] -top-[21%] -z-10 aspect-square w-[77%] rounded-full border border-ink/15" />
            <Image
              src="/illustrations/ai-learning-hero.png"
              alt=""
              width={1448}
              height={1086}
              sizes="(min-width: 1232px) 430px, (min-width: 768px) 40vw, 90vw"
              fetchPriority="high"
              loading="eager"
              className="h-auto w-full max-w-[28rem] object-contain"
            />
          </div>
        </section>

        <div className="mt-8 grid items-start gap-7 sm:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section id="learn" aria-labelledby="learning-path-title" className="scroll-mt-24">
            <div className="mb-4 sm:mb-5">
              <h2 id="learning-path-title" className="text-2xl font-bold sm:text-[1.85rem]">
                Your learning path
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Start with the foundations. Modules 1 and 2 are free.
              </p>
            </div>
            <div className="grid auto-rows-fr gap-3.5 sm:grid-cols-2">
              {modules.map((module) => (
                <ModuleCard key={module.slug} module={module} />
              ))}
            </div>
          </section>

          <aside className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
            <section aria-labelledby="preview-title">
              <div className="mb-4 sm:mb-5">
                <h2 id="preview-title" className="text-2xl font-bold sm:text-[1.85rem]">
                  Try a free lesson
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Open either preview without an account.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-line/70 bg-white px-4 py-2 shadow-sm sm:px-5">
                <ol className="divide-y divide-line/80">
                  {previewLessons.map((lesson, index) => (
                    <li key={lesson.slug}>
                      <Link
                        href={foundationsPath + "/lessons/" + lesson.slug}
                        className="group grid min-h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-1.5 py-3 transition-colors hover:bg-canvas"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-10 place-items-center rounded-2xl bg-lavender font-display text-sm font-bold text-navy"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold leading-snug group-hover:underline">
                            {lesson.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted">{lesson.duration}</span>
                        </span>
                        <Arrow />
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section id="how-it-works" aria-labelledby="learning-methods-title" className="scroll-mt-24">
              <h2 id="learning-methods-title" className="mb-4 text-2xl font-bold">
                How it works
              </h2>
              <ol className="grid gap-2.5">
                {learningMethods.map((method) => (
                  <li
                    key={method.number}
                    className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-2xl border border-line/70 bg-white p-3.5"
                  >
                    <span aria-hidden="true" className={"grid size-9 place-items-center rounded-xl font-display text-xs font-bold " + method.accent}>
                      {method.number}
                    </span>
                    <div>
                      <h3 className="text-base font-bold">{method.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{method.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <section className="mt-9 flex flex-col items-start gap-5 rounded-[1.75rem] bg-navy p-6 text-white sm:mt-11 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold text-teal-light">Practical learning</p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">
              Build a workflow for a task you know
            </h2>
            <p className="mt-1.5 max-w-[55ch] text-sm leading-relaxed text-white/85">
              The practical workflow creation experience is planned as a one-time $50 purchase.
            </p>
          </div>
          <Link
            href="/curriculum"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lavender"
          >
            Explore the modules <Arrow />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

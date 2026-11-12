import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { modules } from "@/content/modules";
import { journey } from "@/content/journey";

const foundationsPath = "/modules/ai-foundations";

const startSteps = journey.filter((step) => step.available);
const comingSoon = journey.length - startSteps.length;

const learningMethods = [
  {
    number: "01",
    title: "Learn it",
    body: "Watch a short narrated film, or read an interactive guide. Your choice.",
    accent: "bg-lavender",
  },
  {
    number: "02",
    title: "Check it",
    body: "Answer 10 quick questions. Get 7 right to pass, and retry as often as you need.",
    accent: "bg-peach",
  },
  {
    number: "03",
    title: "Move on",
    body: "Each lesson ends by pointing you to the next one.",
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
                href="/welcome"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Start learning <Arrow />
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink/75">
              Begins with a 2-minute welcome, then Lesson 1.
            </p>
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

        <section
          id="start"
          aria-labelledby="start-title"
          className="mt-8 scroll-mt-24 sm:mt-10"
        >
          <div className="mb-4 sm:mb-5">
            <h2 id="start-title" className="text-2xl font-bold sm:text-[1.85rem]">
              Start here
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Follow these steps in order. No account is needed for the
              welcome and the first two lessons. Lesson 3 onwards needs a
              free Google sign-in.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {startSteps.map((step, index) => (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className="group flex h-full flex-col rounded-3xl border border-line/70 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className={`grid size-10 place-items-center rounded-2xl font-display text-sm font-bold ${
                        "bg-lavender text-navy"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {step.free ? step.duration : "Free account"}
                    </span>
                  </span>
                  <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-brand-deep">
                    {step.label}
                  </span>
                  <span className="mt-1 block text-lg font-bold leading-snug group-hover:underline">
                    {step.title}
                  </span>
                  <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold">
                    {index === 0 ? "Watch the welcome" : `Open ${step.label}`} <Arrow />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={foundationsPath}
                className="flex h-full flex-col rounded-3xl border border-dashed border-line bg-white/60 p-5 hover:bg-white"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-2xl bg-white font-display text-sm font-bold text-muted"
                >
                  {startSteps.length + 1}
                </span>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  Then
                </span>
                <span className="mt-1 block text-lg font-bold leading-snug">
                  The rest of Module 1
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {comingSoon} more {comingSoon === 1 ? "lesson is" : "lessons are"} coming soon.
                </span>
                <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-navy">
                  See all Module 1 lessons <Arrow />
                </span>
              </Link>
            </li>
          </ol>
        </section>

        <section id="how-it-works" aria-labelledby="learning-methods-title" className="mt-10 scroll-mt-24">
          <h2 id="learning-methods-title" className="mb-4 text-2xl font-bold sm:text-[1.85rem]">
            How each lesson works
          </h2>
          <ol className="grid gap-2.5 sm:grid-cols-3">
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

        <section
          aria-labelledby="who-title"
          className="mt-10 grid gap-5 rounded-[1.75rem] border border-line/70 bg-white p-6 sm:p-8 md:grid-cols-2 md:gap-10"
        >
          <div>
            <h2 id="who-title" className="text-xl font-bold sm:text-2xl">
              Who it&apos;s for
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Teachers, nurses, administrators, students, jobseekers,
              small-business owners and anyone curious about AI. You don&apos;t
              need any programming or technical background.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Where it leads</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Module 1, Foundations of Artificial Intelligence, is the first of{" "}
              {modules.length} modules. Modules 1 and 2 are free.
            </p>
            <Link
              href="/curriculum"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4"
            >
              See all {modules.length} modules <Arrow />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

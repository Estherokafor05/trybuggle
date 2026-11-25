import Image from "next/image";
import Link from "next/link";
import { currentSession } from "@/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getBuiltLesson, journey, modules } from "@course";
import {
  CertificateScene,
  InitiativeScene,
  JourneyScene,
  LessonBadge,
  Portrait,
  portraitShirts,
  WhatWeDoScene,
} from "@/components/home/HomeScenes";
import { guestId } from "@/server/guest";
import { continuePoint } from "@/server/progress";

export const dynamic = "force-dynamic";

const foundationsPath = "/modules/ai-foundations";

const startSteps = journey.filter((step) => step.available);
const comingSoon = journey.length - startSteps.length;

const learningMethods = [
  {
    number: "01",
    badge: "learn" as const,
    title: "Learn it",
    body: "Watch a short narrated film, or read an interactive guide. Your choice.",
    accent: "bg-lavender",
  },
  {
    number: "02",
    badge: "check" as const,
    title: "Check it",
    body: "Answer 5 quick questions. Get 4 right to pass, and retry as often as you need.",
    accent: "bg-peach",
  },
  {
    number: "03",
    badge: "next" as const,
    title: "Move on",
    body: "Passing opens the next lesson. Lessons open in order, so each one builds on the last.",
    accent: "bg-mint",
  },
];


const offers = [
  {
    title: "Understand it",
    body: "What AI is, where it already shows up in your day, and what it can and can't do.",
    tone: "bg-lavender",
  },
  {
    title: "Use it well",
    body: "How to talk to AI chat tools so you get useful answers, and how to check what they give you.",
    tone: "bg-mint",
  },
  {
    title: "Stay safe",
    body: "What never to share, how to spot AI-made scams and fakes, and how to use AI fairly.",
    tone: "bg-peach",
  },
];

const promises = [
  { title: "Free to start", body: "The Essentials course and its certificate cost nothing." },
  { title: "Plain language", body: "No jargon and no coding. If we use a technical word, we explain it." },
  { title: "Made for everyone, everywhere", body: "Stories and examples work wherever you live and whatever you do." },
  { title: "Safety first", body: "Every module helps you use AI with care for yourself and other people." },
];

const route = [
  { title: "Create a free account", body: "Sign up with your email or Google. You need to be 15 or over." },
  { title: "Take the lessons in order", body: "Each module is a set of short lessons. The next one opens when you pass the one before." },
  { title: "Earn your certificate", body: "Finish every Essentials module to get your free certificate, with an ID anyone can check." },
  { title: "Go deeper", body: "Coming later: the Deep Dive, with in-depth chapters for when you want to go further." },
];

const audiences = [
  "Teachers and lecturers",
  "Nurses and carers",
  "Office and admin staff",
  "Students",
  "Jobseekers",
  "Small-business owners",
];

const questions = [
  {
    q: "Do I need any technical background?",
    a: "No. Buggle Learn is made for people who don't work in tech. There is no coding, and every idea is explained with everyday stories.",
  },
  {
    q: "How long does a lesson take?",
    a: "Lessons are short: a few minutes of film or reading, then 5 quick questions. You can stop at any time and pick up where you left off, on any device.",
  },
  {
    q: "Is it free?",
    a: "Yes. The Essentials course and its certificate are free. You only need a free account.",
  },
  {
    q: "What happens if I don't pass a check?",
    a: "You'll see which answers were right and why, then you can try again. The next lesson opens as soon as you pass.",
  },
  {
    q: "What do I get at the end?",
    a: "A free AI Literacy Essentials certificate. You can download it as a PDF, share a link that anyone can use to check it, and add it to your LinkedIn profile.",
  },
  {
    q: "What do you do with my information?",
    a: "We use it to save your progress and issue your certificate. We never sell it or use it for advertising.",
  },
];

/** A section heading with a small label above it, used down the home page. */
function SectionTitle({ id, kicker, title, intro }: { id: string; kicker: string; title: string; intro?: string }) {
  return (
    <div className="max-w-[60ch]">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep">{kicker}</p>
      <h2 id={id} className="mt-2 text-2xl font-bold sm:text-[1.85rem]">
        {title}
      </h2>
      {intro && <p className="mt-2 leading-relaxed text-ink/85">{intro}</p>}
    </div>
  );
}

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

export default async function Home() {
  const session = await currentSession();
  const learner = session?.user?.id ?? (await guestId());
  const resume = learner ? await continuePoint(learner).catch(() => null) : null;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1232px] px-4 pb-12 pt-6 sm:px-7 sm:pb-16 sm:pt-8">
        {resume && (
          <section aria-labelledby="resume-title" className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border-2 border-brand/30 bg-white p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep">Welcome back</p>
              <h2 id="resume-title" className="mt-1 text-xl font-bold">
                Continue where you left off
              </h2>
              <p className="mt-1 text-sm text-muted">
                Module {resume.moduleOrder} · {resume.step.label}: {resume.step.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {session?.user && (
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
                >
                  Your dashboard
                </Link>
              )}
              <Link
                href={resume.step.href}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Continue <Arrow />
              </Link>
            </div>
          </section>
        )}
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
            <div className="mt-6 grid gap-3 sm:max-w-[34rem] sm:grid-cols-2">
              <Link
                href="/welcome"
                className="group flex flex-col rounded-2xl bg-navy p-4 text-white transition-colors hover:bg-brand-deep"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/80">New to AI?</span>
                <span className="mt-1 flex items-center gap-2 text-base font-bold">
                  Start with the basics <Arrow />
                </span>
                <span className="mt-1 text-xs text-white/85">Module 1 · begins with a 2-minute welcome</span>
              </Link>
              <Link
                href="/modules/talking-to-ai"
                className="group flex flex-col rounded-2xl border-2 border-navy/15 bg-white/85 p-4 text-ink transition-colors hover:border-brand"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-deep">Already use AI?</span>
                <span className="mt-1 flex items-center gap-2 text-base font-bold">
                  Get better at using it <Arrow />
                </span>
                <span className="mt-1 text-xs text-muted">Module 2 · Talking to AI</span>
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink/75">
              Free. Create an account to start learning.
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
          id="what-we-do"
          aria-labelledby="what-we-do-title"
          className="home-reveal mt-8 grid scroll-mt-24 items-center gap-6 rounded-[2rem] border border-line/70 bg-white p-6 sm:mt-10 sm:p-9 md:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <SectionTitle
              id="what-we-do-title"
              kicker="What we do"
              title="We teach AI to people who don't work in tech"
              intro="Buggle Learn uses short story films and hands-on guides to show how AI works, how to use it well in your work and life, and how to stay safe while you do."
            />
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              {offers.map((offer) => (
                <li key={offer.title} className={`rounded-2xl p-4 ${offer.tone}`}>
                  <h3 className="font-bold">{offer.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/85">{offer.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[26rem] rounded-[1.75rem] bg-hero-lavender p-4">
            <WhatWeDoScene />
          </div>
        </section>

        <section
          id="our-initiative"
          aria-labelledby="initiative-title"
          className="home-reveal mt-6 grid scroll-mt-24 items-center gap-6 rounded-[2rem] bg-mint p-6 sm:p-9 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="order-last mx-auto w-full max-w-[26rem] md:order-first">
            <InitiativeScene />
          </div>
          <div>
            <SectionTitle
              id="initiative-title"
              kicker="Our initiative"
              title="AI for everyone, not just experts"
              intro="AI is already part of how we work, study and live, but most guides assume you know a lot about technology. We believe everyone should be able to understand AI, use it with confidence and notice when something isn't right."
            />
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {promises.map((p) => (
                <li key={p.title} className="flex gap-3 rounded-2xl bg-white/80 p-4">
                  <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs font-bold text-white">
                    ✓
                  </span>
                  <span>
                    <span className="block font-bold">{p.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink/85">{p.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-you-learn" aria-labelledby="how-you-learn-title" className="home-reveal mt-10 scroll-mt-24">
          <SectionTitle
            id="how-you-learn-title"
            kicker="How to learn"
            title="From your first lesson to your certificate"
            intro="Everything happens in one place, at your own pace. Your progress is saved to your account, so you can switch devices any time."
          />
          <div className="mt-5 grid items-center gap-5 md:grid-cols-[1fr_1.1fr]">
            <div className="rounded-[1.75rem] bg-peach p-4 sm:p-6">
              <JourneyScene />
            </div>
            <ol className="grid gap-2.5">
              {route.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-2xl border border-line/70 bg-white p-4">
                  <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-lavender font-display text-sm font-bold text-navy">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{step.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="learning-methods-title" className="home-reveal mt-10 scroll-mt-24">
          <SectionTitle id="learning-methods-title" kicker="Inside every lesson" title="How each lesson works" />
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {learningMethods.map((method) => (
              <li key={method.number} className={`flex flex-col gap-3 rounded-3xl p-5 ${method.accent}`}>
                <span className="flex items-center justify-between">
                  <LessonBadge kind={method.badge} />
                  <span aria-hidden="true" className="font-display text-sm font-bold text-navy">
                    {method.number}
                  </span>
                </span>
                <div>
                  <h3 className="text-lg font-bold">{method.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/85">{method.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="whats-inside" aria-labelledby="inside-title" className="home-reveal mt-10 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle
              id="inside-title"
              kicker="What's inside"
              title={`The Essentials: ${modules.length} modules`}
              intro="Each module is a set of short lessons and ends with a final check. New modules open as soon as they're ready."
            />
            <Link href="/curriculum" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
              See every lesson <Arrow />
            </Link>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...modules]
              .sort((a, b) => a.order - b.order)
              .map((mod, index) => {
                const open = mod.lessons.some((l) => getBuiltLesson(l.slug));
                return (
                  <li key={mod.slug}>
                    <Link
                      href={`/modules/${mod.slug}`}
                      className={`flex h-full flex-col rounded-3xl p-5 transition-shadow hover:shadow-md ${
                        open ? ["bg-lavender", "bg-mint", "bg-peach", "bg-blush"][index % 4] : "border border-dashed border-line bg-white"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-white/80 px-3 py-1 font-mono text-xs font-semibold text-navy">
                          Module {String(mod.order).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-semibold text-navy">{open ? "Open now" : "Coming soon"}</span>
                      </span>
                      <span className="mt-4 block text-lg font-bold leading-snug">{mod.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink/80">{mod.outcome}</span>
                    </Link>
                  </li>
                );
              })}
          </ol>
        </section>

        <section
          id="certificate"
          aria-labelledby="certificate-title"
          className="home-reveal mt-10 grid scroll-mt-24 items-center gap-6 rounded-[2rem] bg-blush p-6 sm:p-9 md:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <SectionTitle
              id="certificate-title"
              kicker="Your certificate"
              title="Finish the Essentials, get a certificate you can share"
              intro="Complete every Essentials module to earn your free AI Literacy Essentials certificate."
            />
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-ink">
              <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-teal">✓</span>Download it as a PDF.</li>
              <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-teal">✓</span>Share a link that anyone can use to check it&apos;s real.</li>
              <li className="flex gap-2"><span aria-hidden="true" className="font-bold text-teal">✓</span>Add it to your LinkedIn profile in a couple of clicks.</li>
            </ul>
            <Link href="/verify" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
              Check someone&apos;s certificate <Arrow />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[24rem]">
            <CertificateScene />
          </div>
        </section>

        <section id="who-its-for" aria-labelledby="who-title" className="home-reveal mt-10 scroll-mt-24 rounded-[2rem] border border-line/70 bg-white p-6 sm:p-9">
          <SectionTitle
            id="who-title"
            kicker="Who it's for"
            title="Anyone curious about AI"
            intro="You don't need any programming or technical background. If you're 15 or over and want to understand AI, Buggle Learn is for you."
          />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((who, i) => (
              <li key={who} className="flex items-center gap-3 rounded-2xl bg-canvas p-3">
                <Portrait i={i} shirt={portraitShirts[i % portraitShirts.length]} />
                <span className="font-semibold">{who}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="questions" aria-labelledby="faq-title" className="home-reveal mt-10 scroll-mt-24">
          <SectionTitle id="faq-title" kicker="Questions" title="Good to know" />
          <div className="mt-5 grid gap-2.5 md:grid-cols-2">
            {questions.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-line/70 bg-white p-4 open:bg-lavender/60">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {item.q}
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-lavender text-navy transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="start"
          aria-labelledby="start-title"
          className="mt-10 scroll-mt-24"
        >
          <div className="mb-4 sm:mb-5">
            <h2 id="start-title" className="text-2xl font-bold sm:text-[1.85rem]">
              Start here
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              New to AI? Follow these steps in order. Create a free account to
              start, and your progress is saved on any device.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            {comingSoon > 0 && (
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
            )}
          </ol>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}

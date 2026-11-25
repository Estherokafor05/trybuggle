import type { Metadata } from "next";
import Link from "next/link";
import { currentSession } from "@/auth";
import { BuggleSays } from "@/components/Buggle";
import { LockIcon } from "@/components/LockIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkles } from "@/components/Sparkles";
import { catalogue } from "@/server/deep-dive";

export const metadata: Metadata = {
  title: "The Deep Dive | Buggle Learn",
  description: "Go further after the Essentials: start with What is AI, then AI courses for your work, each with chapters, units and a certificate.",
};

const TONES = ["bg-lavender", "bg-peach", "bg-mint", "bg-blush"];

export default async function DeepDivePage() {
  const session = await currentSession();
  const courses = await catalogue(session?.user?.id ?? null).catch(() => []);
  const foundation = courses.find((c) => c.isFoundation);
  const rest = courses.filter((c) => !c.isFoundation);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1040px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          <Sparkles />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">After the Essentials</p>
          <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">The Deep Dive</h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink">
            Go further, one course at a time. Every course has chapters and short units, and gives you its own certificate.
          </p>
          <ol className="mt-5 grid max-w-[640px] gap-2 text-sm sm:grid-cols-3">
            {["Finish the Essentials (free)", foundation ? `Take "${foundation.title}": Chapter 1 is free` : 'Take "What is AI"', "Then any AI course opens"].map((step, i) => (
              <li key={step} className="flex items-start gap-2 rounded-2xl bg-white/85 p-3 text-ink">
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </header>

        {!courses.length ? (
          <div className="mt-8">
            <BuggleSays mood="sleepy">The Deep Dive courses are being made. They&apos;ll appear here soon. 🌱</BuggleSays>
          </div>
        ) : (
          <>
            {foundation && (
              <section aria-labelledby="start-title" className="mt-8">
                <h2 id="start-title" className="text-xl font-bold">
                  ⭐ Start here
                </h2>
                <Card course={foundation} tone="bg-hero-lavender" big />
              </section>
            )}
            {rest.length > 0 && (
              <section aria-labelledby="courses-title" className="mt-8">
                <h2 id="courses-title" className="text-xl font-bold">
                  📚 AI courses
                </h2>
                {foundation && (
                  <p className="mt-1 text-sm text-muted">
                    These open once you&apos;ve finished &quot;{foundation.title}&quot;. It&apos;s the starting point for all of them.
                  </p>
                )}
                <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                  {rest.map((c, i) => (
                    <li key={c.id}>
                      <Card course={c} tone={TONES[i % TONES.length]} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ course, tone, big = false }: { course: Awaited<ReturnType<typeof catalogue>>[number]; tone: string; big?: boolean }) {
  const { gate, entitled, freeChapters } = course.access;
  return (
    <article className={`mt-3 flex h-full flex-col rounded-3xl border border-navy/10 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md ${tone}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {course.finished ? (
          <span className="rounded-full bg-white px-2.5 py-1 text-navy">✓ Finished</span>
        ) : gate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-navy">
            <LockIcon /> {gate.kind === "essentials" ? "After the Essentials" : `After "${gate.title}"`}
          </span>
        ) : entitled ? (
          <span className="rounded-full bg-white px-2.5 py-1 text-navy">✓ Unlocked</span>
        ) : (
          <span className="rounded-full bg-white px-2.5 py-1 text-navy">
            {freeChapters ? `💳 Chapter${freeChapters > 1 ? `s 1–${freeChapters}` : " 1"} free, then paid` : "💳 Paid"}
          </span>
        )}
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-navy">
          {course.chapters} {course.chapters === 1 ? "chapter" : "chapters"} · 🎓 certificate
        </span>
      </div>
      <h3 className={`mt-3 break-words font-bold ${big ? "text-2xl" : "text-xl"}`}>{course.title}</h3>
      {course.summary && <p className="mt-2 flex-1 whitespace-pre-line leading-relaxed text-ink">{course.summary}</p>}
      <Link
        href={`/learn/${course.slug}`}
        className="mt-4 inline-flex min-h-11 items-center self-start rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        {course.finished ? "Review" : gate ? "See what's inside" : "Open course"}
        <span className="sr-only">: {course.title}</span>
      </Link>
    </article>
  );
}

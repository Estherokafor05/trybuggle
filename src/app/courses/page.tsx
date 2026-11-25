import type { Metadata } from "next";
import Link from "next/link";
import { currentSession } from "@/auth";
import { BuggleSays } from "@/components/Buggle";
import { Sparkles } from "@/components/Sparkles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { visibleCourses } from "@/server/builder-learn";

export const metadata: Metadata = {
  title: "More courses | Buggle Learn",
  description: "Short courses from Buggle Learn and your organisation, alongside the AI Literacy learning path.",
};

export default async function CoursesPage() {
  const session = await currentSession();
  const courses = await visibleCourses(session?.user?.id ?? null);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          <Sparkles />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Courses</p>
          <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">More courses</h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink">
            Short courses from Buggle Learn{session ? " and your organisation" : ""}. The AI Literacy learning path is still where to start.
          </p>
          <Link href="/curriculum" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
            AI Literacy learning path <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </header>
        {courses.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <li key={c.id} className="flex flex-col rounded-3xl border border-line bg-white p-6">
                {c.from && <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">From {c.from}</p>}
                <h2 className="mt-1 break-words text-xl font-bold">{c.title}</h2>
                {c.summary && <p className="mt-2 flex-1 whitespace-pre-line leading-relaxed text-ink">{c.summary}</p>}
                <p className="mt-3 text-sm text-muted">
                  {c.lessons} {c.lessons === 1 ? "lesson" : "lessons"}
                </p>
                <Link
                  href={`/learn/${c.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center self-start rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy hover:bg-lavender"
                >
                  Open course<span className="sr-only">: {c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <BuggleSays mood="sleepy">No other courses yet. New ones will appear here. 🌱</BuggleSays>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

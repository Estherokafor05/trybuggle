import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { LockIcon } from "@/components/LockIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { courseForLearner } from "@/server/builder-learn";

type Props = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  const session = await currentSession();
  const c = await courseForLearner(course, session?.user?.id ?? null).catch(() => null);
  return { title: c && !("signInNeeded" in c) ? `${c.title} | Buggle Learn` : "Course | Buggle Learn" };
}

export default async function LearnCoursePage({ params }: Props) {
  const { course: slug } = await params;
  const session = await currentSession();
  const course = await courseForLearner(slug, session?.user?.id ?? null);
  if (!course) notFound();
  if ("signInNeeded" in course) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/learn/${slug}`)}`);
  const next = course.lessons.find((l) => l.state === "open");
  const finished = course.lessons.length > 0 && course.done === course.lessons.length;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <p>
          <Link href="/courses" className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
            ← More courses
          </Link>
        </p>
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          {course.from && <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">From {course.from}</p>}
          <h1 className="mt-2 break-words text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">{course.title}</h1>
          {course.summary && <p className="mt-3 max-w-[60ch] whitespace-pre-line leading-relaxed text-ink">{course.summary}</p>}
          <p className="mt-4 text-sm font-semibold text-navy">
            {course.done} of {course.lessons.length} {course.lessons.length === 1 ? "lesson" : "lessons"} done
          </p>
          {next && (
            <Link
              href={session ? `/learn/${course.slug}/${next.slug}` : `/sign-in?callbackUrl=${encodeURIComponent(`/learn/${course.slug}/${next.slug}`)}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              {course.done ? "Continue" : "Start the course"}: {next.title} <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          )}
        </header>
        {finished && (
          <p role="status" className="mt-6 rounded-2xl bg-mint p-4 font-semibold text-navy">
            ✓ You&apos;ve finished every lesson in this course. Well done.
          </p>
        )}
        {course.sections.map((s, si) => (
          <section key={s.id} aria-labelledby={`m-${s.id}`} className="mt-8">
            <h2 id={`m-${s.id}`} className="text-xl font-bold">
              {course.sections.length > 1 ? `Module ${si + 1}: ` : ""}
              {s.title}
            </h2>
            <ol className="mt-3 grid gap-3">
              {s.lessons.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white p-5">
                  <div className="min-w-0">
                    {l.state === "locked" ? (
                      <p className="break-words font-semibold text-muted">{l.title}</p>
                    ) : (
                      <Link href={`/learn/${course.slug}/${l.slug}`} className="break-words font-semibold underline-offset-4 hover:underline">
                        {l.title}
                      </Link>
                    )}
                    {l.summary && <p className="mt-1 text-sm text-muted">{l.summary}</p>}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
                    {l.state === "done" ? (
                      "✓ Done"
                    ) : l.state === "locked" ? (
                      <>
                        <LockIcon /> Finish the lesson before first
                      </>
                    ) : (
                      "Up next"
                    )}
                    {l.minutes ? <span className="font-normal text-muted"> · {l.minutes} min</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}

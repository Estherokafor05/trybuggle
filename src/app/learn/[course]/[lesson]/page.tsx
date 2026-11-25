import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { markDoneAction } from "@/app/actions/learn";
import { currentSession } from "@/auth";
import { KnowledgeCheck } from "@/components/assessment/KnowledgeCheck";
import { LessonBlocks } from "@/components/builder/LessonBlocks";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { passMark } from "@/lib/assessment-scoring";
import { blocksFor, courseForLearner } from "@/server/builder-learn";
import { db } from "@/server/database";

type Props = { params: Promise<{ course: string; lesson: string }> };

export const metadata: Metadata = { title: "Lesson | Buggle Learn" };

const primary = "inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";

export default async function LearnLessonPage({ params }: Props) {
  const { course: slug, lesson: lessonSlug } = await params;
  const session = await currentSession();
  const here = `/learn/${slug}/${lessonSlug}`;
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(here)}`);
  const course = await courseForLearner(slug, session.user.id);
  if (!course || "signInNeeded" in course) notFound();
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  const lesson = course.lessons[index];
  if (!lesson) notFound();
  const next = course.lessons[index + 1];
  const afterHref = next ? `/learn/${slug}/${next.slug}` : `/learn/${slug}`;
  const afterLabel = next ? `Next lesson: ${next.title}` : "Back to the course";

  if (lesson.state === "locked") {
    const first = course.lessons.find((l) => l.state === "open");
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 sm:py-14">
          <section className="rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">{course.title}</p>
            <h1 className="mt-2 break-words text-3xl font-bold">{lesson.title}</h1>
            <p className="mt-4 leading-relaxed text-ink">Lessons open one at a time. Finish {first ? `"${first.title}"` : "the lessons before this one"} first.</p>
            {first && (
              <Link href={`/learn/${slug}/${first.slug}`} className={`${primary} mt-6`}>
                Go to {first.title}
              </Link>
            )}
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const blocks = await blocksFor(lesson.id);
  const [{ n: questionCount }] = lesson.assessmentId
    ? await db()`SELECT count(*)::int AS n FROM assessment_questions WHERE assessment_id = ${lesson.assessmentId}`
    : [{ n: 0 }];
  const [settings] = lesson.assessmentId ? await db()`SELECT pass_percent, max_attempts FROM assessments WHERE id = ${lesson.assessmentId}` : [];
  const tries = settings?.max_attempts ? `You have ${settings.max_attempts} tries.` : "You can try again as many times as you need.";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-12 pt-3 sm:px-6 sm:pt-10">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <li>
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href="/courses">
                Courses
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link className="inline-flex min-h-11 items-center break-words underline-offset-4 hover:underline" href={`/learn/${slug}`}>
                {course.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-navy">
              Lesson {index + 1} of {course.lessons.length}
            </li>
          </ol>
        </nav>
        <header className="mt-1 rounded-[1.75rem] bg-hero-lavender p-5 sm:mt-3 sm:rounded-[2rem] sm:p-8">
          <h1 className="break-words text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">{lesson.title}</h1>
          {lesson.summary && <p className="mt-3 max-w-[65ch] leading-relaxed text-ink">{lesson.summary}</p>}
          {lesson.minutes > 0 && <p className="mt-3 text-sm font-semibold text-navy">About {lesson.minutes} minutes</p>}
        </header>
        <div className="mt-8">
          <LessonBlocks blocks={blocks} />
        </div>
        <div className="mt-10">
          {lesson.assessmentId ? (
            <KnowledgeCheck
              slug={lesson.assessmentId}
              signedIn
              endpoint={`/api/builder-checks/${lesson.assessmentId}`}
              kicker="Check it"
              intro={`${questionCount} ${questionCount === 1 ? "question" : "questions"} about this lesson. Get ${passMark(questionCount, settings?.pass_percent ?? 70)} or more right to finish it. ${tries}`}
              afterPass={
                <Link href={afterHref} className={`${primary} mt-3`}>
                  {afterLabel} <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              }
            />
          ) : lesson.state === "done" ? (
            <section className="rounded-3xl bg-mint p-5 sm:p-6">
              <p className="font-semibold text-navy">✓ You&apos;ve finished this lesson.</p>
              <Link href={afterHref} className={`${primary} mt-3`}>
                {afterLabel} <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </section>
          ) : (
            <form action={markDoneAction} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <input type="hidden" name="course" value={slug} />
              <input type="hidden" name="item" value={lesson.id} />
              <p className="text-ink">Read through everything above? Mark the lesson as done to open the next one.</p>
              <button type="submit" className={`${primary} mt-3`}>
                Mark as done
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

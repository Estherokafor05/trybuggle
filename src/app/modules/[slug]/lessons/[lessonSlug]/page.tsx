import type { Metadata } from "next";
import { createHash } from "node:crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { JourneyProgress } from "@/components/JourneyProgress";
import { LessonPreview } from "@/components/LessonPreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@/content/modules";
import { journeyPosition } from "@/content/journey";
import { getBuiltLesson } from "@/content/preview-lessons";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { db } from "@/server/database";

/** Whether a signed-in learner has passed a lesson's knowledge check. Never blocks: null when unknown. */
async function passedCheck(learner: string, lessonSlug: string) {
  try {
    const rows =
      await db()`SELECT EXISTS(SELECT 1 FROM assessment_attempts WHERE learner_id=${learner} AND lesson_slug=${lessonSlug} AND passed) AS passed`;
    return Boolean(rows[0]?.passed);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const mod = getModule(slug);
  const lessonMeta = mod?.lessons.find((item) => item.slug === lessonSlug);
  const lesson = getBuiltLesson(lessonSlug);
  if (!mod || !lessonMeta || slug !== "ai-foundations") {
    return { title: "Lesson not found | Buggle Learn" };
  }
  return {
    title: `${lesson?.title ?? lessonMeta.title} | ${mod.title}`,
    description: lesson?.objective ?? lessonMeta.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const mod = getModule(slug);
  const lessonMeta = mod?.lessons.find((item) => item.slug === lessonSlug);
  const lesson = getBuiltLesson(lessonSlug);
  if (!mod || !lessonMeta || slug !== "ai-foundations") notFound();

  const lessonIndex = mod.lessons.findIndex((item) => item.slug === lessonSlug);
  if (lessonIndex < 0) notFound();
  const session = googleAuthConfigured ? await auth() : null;
  const returnTo = `/modules/${slug}/lessons/${lessonSlug}`;

  if (lesson && !lesson.preview && !session?.user) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(googleAuthConfigured ? returnTo : `/modules/${slug}`)}`);
  }

  if (!lesson) {
    if (!googleAuthConfigured) {
      redirect(
        `/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}`)}`,
      );
    }
    if (!session?.user) {
      redirect(`/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`);
    }
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[960px] px-4 py-10 sm:px-6 sm:py-14">
          <section className="rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
              Your account is ready
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              This lesson is being prepared
            </h1>
            <p className="mt-4 leading-relaxed text-ink">
              You can revisit the earlier lessons from the Module 1 overview.
            </p>
            <Link
              href={`/modules/${slug}`}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Return to Module 1
            </Link>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const position = journeyPosition(lessonSlug);
  const previous = position.previous;
  const next = position.next;
  const nextStep = next
    ? {
        href: next.href,
        label: next.label,
        title: next.title,
        available: next.available,
        ...(next.free || session?.user
          ? {}
          : { href: `/sign-in?callbackUrl=${encodeURIComponent(next.href)}` }),
      }
    : undefined;
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`;
  // Passing each check is encouraged, but learners can always carry on.
  const previousLesson = previous && previous.id !== "welcome" ? previous : undefined;
  const previousPassed =
    previousLesson && session?.user?.id
      ? await passedCheck(session.user.id, previousLesson.id)
      : null;
  // Guests who reach the end of a free lesson sign in on their way to the next one.
  const nextNeedsSignIn = Boolean(next?.available && !next.free && !session?.user);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-8 pt-3 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <li>
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href="/curriculum">
                Learning path
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={`/modules/${slug}`}>
                Module 1
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-navy">
              Lesson {lessonIndex + 1}
            </li>
          </ol>
        </nav>

        <header className="mt-1 flex items-center justify-between gap-6 rounded-[1.75rem] bg-hero-lavender p-5 sm:mt-3 sm:rounded-[2rem] sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
              Foundations of Artificial Intelligence
            </p>
            <h1 className="mt-3 max-w-[23ch] text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.08]">
              {lesson.title}
            </h1>
            <p className="mt-2 max-w-[62ch] leading-relaxed text-ink sm:mt-3 sm:text-lg">
              {lesson.objective}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy sm:mt-4">
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                Lesson {lessonIndex + 1} of {mod.lessons.length}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                About {lesson.duration}
              </span>
              {lesson.preview && (
                <span className="rounded-full bg-mint px-3 py-1.5">
                  Free preview
                </span>
              )}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="hidden size-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/65 font-display text-4xl font-bold text-navy sm:flex lg:size-28"
          >
            {String(lessonIndex + 1).padStart(2, "0")}
          </div>
        </header>

        <div className="mt-3 sm:mt-5">
          <JourneyProgress current={lessonSlug} />
        </div>

        {previousLesson && previousPassed === false && (
          <section
            aria-labelledby="previous-check-title"
            className="mt-5 rounded-2xl border-l-4 border-brand bg-lavender p-5"
          >
            <h2 id="previous-check-title" className="font-bold">
              You haven&apos;t passed {previousLesson.label}&apos;s knowledge check yet
            </h2>
            <p className="mt-1 leading-relaxed text-ink">
              Passing every knowledge check is part of completing Module 1. You
              can take it now, or carry on with this lesson and come back to it
              later.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={`${previousLesson.href}#knowledge-check`}
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Take {previousLesson.label}&apos;s check
              </Link>
              <a
                href="#lesson-start"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
              >
                Continue with this lesson
              </a>
            </div>
          </section>
        )}
        <span id="lesson-start" className="block scroll-mt-24" />
        {session?.user && !session.user.id && (
          <p className="mt-5 rounded-2xl bg-mint p-5 leading-relaxed">
            Saved learning is now available. Sign in with Google again to
            connect your account and keep your place across devices.{" "}
            <Link className="font-semibold underline" href={signInHref}>
              Connect saved learning
            </Link>
          </p>
        )}
        <LessonPreview
          key={lesson.slug}
          next={nextStep}
          lesson={lesson}
          signedIn={Boolean(session?.user?.id)}
          scope={
            session?.user?.id
              ? createHash("sha256")
                  .update(session.user.id)
                  .digest("hex")
                  .slice(0, 24)
              : "guest"
          }
        />

        <section
          aria-labelledby="up-next-title"
          className={`mt-7 rounded-[2rem] p-6 sm:p-8 ${next?.available ? "bg-hero-lavender" : session?.user ? "bg-mint" : "bg-blush"}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Step 3 · Move on
          </p>
          {next?.available && nextNeedsSignIn ? (
            <>
              <h2 id="up-next-title" className="mt-2 text-2xl font-bold">
                Up next: {next.label}, {next.title}
              </h2>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                The first two lessons are free to preview. Sign in with Google
                to continue with {next.label}. It&apos;s free, and your
                progress and knowledge check results are saved.
              </p>
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(next.href)}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Continue with Google
              </Link>
            </>
          ) : next?.available ? (
            <>
              <h2 id="up-next-title" className="mt-2 text-2xl font-bold">
                Up next: {next.label}, {next.title}
              </h2>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                When you&apos;re ready, carry on to the next lesson. You can
                come back to this one at any time.
              </p>
              <Link
                href={next.href}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Start {next.label} <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : session?.user ? (
            <>
              <h2 id="up-next-title" className="mt-2 text-2xl font-bold">
                {next
                  ? `${next.label}, ${next.title}, is being prepared`
                  : "You have reached the end of Module 1"}
              </h2>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                Your account is ready. You can revisit these lessons or
                return to the Module 1 overview.
              </p>
              <Link
                href={`/modules/${slug}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Return to Module 1
              </Link>
            </>
          ) : (
            <>
              <h2 id="up-next-title" className="mt-2 text-2xl font-bold">
                Continue with a free account
              </h2>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                Sign in with Google to save your progress and continue through
                the learning path.
                {next && ` ${next.label}, ${next.title}, is still being prepared.`}
              </p>
              <Link
                href={signInHref}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Continue with Google
              </Link>
            </>
          )}
        </section>

        <nav
          aria-label="Lesson navigation"
          className="mt-6 flex flex-wrap items-center justify-between gap-4"
        >
          {previous ? (
            <Link
              href={previous.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
            >
              <span aria-hidden="true">←</span>{" "}
              {previous.id === "welcome"
                ? "Back to the welcome"
                : `Previous: ${previous.label}`}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href={`/modules/${slug}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
          >
            All Module 1 lessons
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

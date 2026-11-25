import type { Metadata } from "next";
import { createHash } from "node:crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { JourneyProgress } from "@/components/JourneyProgress";
import { LessonPreview } from "@/components/LessonPreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@course";
import { journeyPosition } from "@course";
import { getBuiltLesson } from "@course";
import { LockedStep } from "@/components/LockedStep";
import { checkIntro, checkSettings, defaultCheckSettings, lessonCheck } from "@/server/checks";
import { pathStatus } from "@/server/progression";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const mod = getModule(slug);
  const lessonMeta = mod?.lessons.find((item) => item.slug === lessonSlug);
  const lesson = getBuiltLesson(lessonSlug);
  if (!mod || !lessonMeta) {
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
  if (!mod || !lessonMeta) notFound();

  const lessonIndex = mod.lessons.findIndex((item) => item.slug === lessonSlug);
  if (lessonIndex < 0) notFound();
  const session = await currentSession();
  const returnTo = `/modules/${slug}/lessons/${lessonSlug}`;

  // Anyone can browse modules, but learning needs an account (FRD Version 2).
  if (!session?.user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`);

  if (!lesson) {
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
              You can revisit the earlier lessons from the Module {mod.order} overview.
            </p>
            <Link
              href={`/modules/${slug}`}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Return to Module {mod.order}
            </Link>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const position = journeyPosition(lessonSlug, slug);
  const lessonLabel = mod.order === 1 ? `Lesson ${lessonIndex + 1}` : `Episode ${mod.order}.${lessonIndex + 1}`;
  // Lessons open in order (FRD Version 2). If the database can't be reached,
  // the lesson still shows; the check itself enforces the order.
  const status = await pathStatus(session.user.id, slug);
  if (status.locked[lessonSlug])
    return (
      <LockedStep
        moduleSlug={slug}
        moduleOrder={mod.order}
        title={`${lessonLabel}: ${lesson.title}`}
        finishFirst={status.locked[lessonSlug]}
        done={status.done}
        locked={Object.keys(status.locked)}
      />
    );
  const check = lessonCheck(lessonSlug);
  const settings = check ? await checkSettings(check) : defaultCheckSettings;
  const intro = check
    ? checkIntro(check, settings, mod.order === 1 ? "lesson" : "episode")
    : undefined;
  const passedThis = status.done.includes(lessonSlug);
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
                Module {mod.order}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-navy">
              {lessonLabel}
            </li>
          </ol>
        </nav>

        <header className="mt-1 flex items-center justify-between gap-6 rounded-[1.75rem] bg-hero-lavender p-5 sm:mt-3 sm:rounded-[2rem] sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
              {mod.title}
            </p>
            <h1 className="mt-3 max-w-[23ch] text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.08]">
              {lesson.title}
            </h1>
            <p className="mt-2 max-w-[62ch] leading-relaxed text-ink sm:mt-3 sm:text-lg">
              {lesson.objective}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy sm:mt-4">
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                {lessonLabel} of {mod.lessons.length}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                About {lesson.duration}
              </span>
            </p>
          </div>
          <div
            aria-hidden="true"
            className="hidden size-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/65 font-display text-4xl font-bold text-navy sm:flex lg:size-28"
          >
            {mod.order === 1 ? String(lessonIndex + 1).padStart(2, "0") : `${mod.order}.${lessonIndex + 1}`}
          </div>
        </header>

        <div className="mt-3 sm:mt-5">
          <JourneyProgress
            current={lessonSlug}
            moduleSlug={slug}
            done={status.done}
            locked={Object.keys(status.locked)}
          />
        </div>

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
          moduleSlug={slug}
          checkIntro={intro}
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
                {!passedThis && status.known
                  ? `Pass this ${mod.order === 1 ? "lesson" : "episode"}'s knowledge check above to open ${next.id === "final-assessment" ? "the final assessment" : next.label}. Steps open one at a time, in order.`
                  : next.id === "final-assessment"
                    ? "You've reached the end of the module. When you're ready, take the final assessment: a short refresher with no time limit."
                    : `When you're ready, carry on to ${next.label}. You can come back to this one at any time.`}
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
                  : `You have reached the end of Module ${mod.order}`}
              </h2>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                Your account is ready. You can revisit these lessons or
                return to the Module {mod.order} overview.
              </p>
              <Link
                href={`/modules/${slug}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Return to Module {mod.order}
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
            All Module {mod.order} {mod.order === 1 ? "lessons" : "episodes"}
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

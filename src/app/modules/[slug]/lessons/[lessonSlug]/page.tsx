import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { LessonPreview } from "@/components/LessonPreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@/content/modules";
import { getPreviewLesson } from "@/content/preview-lessons";
import { googleAuthConfigured } from "@/lib/auth-configured";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const mod = getModule(slug);
  const lessonMeta = mod?.lessons.find((item) => item.slug === lessonSlug);
  const lesson = getPreviewLesson(lessonSlug);
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
  const lesson = getPreviewLesson(lessonSlug);
  if (!mod || !lessonMeta || slug !== "ai-foundations") notFound();

  const lessonIndex = mod.lessons.findIndex((item) => item.slug === lessonSlug);
  if (lessonIndex < 0) notFound();
  const session = googleAuthConfigured ? await auth() : null;

  if (!lesson) {
    if (!googleAuthConfigured) {
      redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}`)}`);
    }
    const session = await auth();
    if (!session?.user) {
      const returnTo = `/modules/${slug}/lessons/${lessonSlug}`;
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
            <h1 className="mt-3 text-3xl font-bold">This lesson is being prepared</h1>
            <p className="mt-4 leading-relaxed text-ink">
              You can revisit the first two lessons from the Module 1 overview.
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

  const previous = mod.lessons[lessonIndex - 1];
  const next = mod.lessons[lessonIndex + 1];
  const isLastPreview = lessonIndex === 1;
  const nextPath = next
    ? `/modules/${slug}/lessons/${next.slug}`
    : `/modules/${slug}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={`/modules/${slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
        >
          <span aria-hidden="true">←</span> Module 1 overview
        </Link>

        <header className="mt-5 flex items-center justify-between gap-6 rounded-[2rem] bg-hero-lavender p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
              Foundations of Artificial Intelligence
            </p>
            <h1 className="mt-3 max-w-[23ch] text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.08]">
              {lesson.title}
            </h1>
            <p className="mt-3 max-w-[62ch] leading-relaxed text-ink sm:text-lg">
              {lesson.objective}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy">
              <span className="rounded-full bg-white/80 px-3 py-1.5">Lesson {lessonIndex + 1}</span>
              <span className="rounded-full bg-white/80 px-3 py-1.5">About {lesson.duration}</span>
              <span className="rounded-full bg-mint px-3 py-1.5">Free preview</span>
            </p>
          </div>
          <div aria-hidden="true" className="hidden size-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/65 font-display text-4xl font-bold text-navy sm:flex lg:size-28">
            {String(lessonIndex + 1).padStart(2, "0")}
          </div>
        </header>

        <LessonPreview lesson={lesson} />

        <nav
          aria-label="Lesson navigation"
          className="mt-6 flex flex-wrap items-center justify-between gap-4"
        >
          {previous ? (
            <Link
              href={`/modules/${slug}/lessons/${previous.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
            >
              <span aria-hidden="true">←</span> Previous lesson
            </Link>
          ) : <span />}
          {next && !isLastPreview && (
            <Link
              href={nextPath}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Continue to the next lesson <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>

        {isLastPreview && (
          <section className={`mt-6 rounded-[2rem] p-6 sm:p-8 ${session?.user ? "bg-mint" : "bg-blush"}`}>
            {session?.user ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
                  You are signed in
                </p>
                <h2 className="mt-2 text-2xl font-bold">Your next lesson is being prepared</h2>
                <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                  Your account is ready. You can revisit these previews or
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
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
                  Want to keep going?
                </p>
                <h2 className="mt-2 text-2xl font-bold">Continue with a free account</h2>
                <p className="mt-3 max-w-[64ch] leading-relaxed text-ink">
                  Sign in with Google to continue to the learning path. The next
                  lesson is still being prepared.
                </p>
                <Link
                  href={`/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}/lessons/${lessonSlug}`)}`}
                  className="mt-5 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  Continue with Google
                </Link>
              </>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

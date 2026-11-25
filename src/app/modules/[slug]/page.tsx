import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JourneyProgress } from "@/components/JourneyProgress";
import { FoundationsIllustration } from "@course/ui";
import { finalQuestionCount } from "@course";
import { checkQuestions, finalCheck } from "@/server/checks";
import { TRACK_LABELS, getModule, modules } from "@course";
import { getBuiltLesson } from "@course";
import { currentSession } from "@/auth";
import { LockIcon } from "@/components/LockIcon";
import { ForumPeek } from "@/components/forum/ForumPeek";
import { finishFirstText, pathStatus } from "@/server/progression";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return modules.map((mod) => ({ slug: mod.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) return { title: "Module not found | Buggle Learn" };
  return {
    title: `${mod.title} | Buggle Learn`,
    description: mod.summary,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const session = await currentSession();
  const next = modules.find((m) => m.order === mod.order + 1);
  const isFoundations = mod.order === 1;
  const firstBuilt = mod.lessons.find((l) => getBuiltLesson(l.slug));
  const unit = isFoundations ? "lessons" : "episodes";
  const final = finalCheck(slug);
  const finalCount = final ? (await checkQuestions(final)).length : finalQuestionCount[slug];
  // Signed-in learners see what they've passed and what is still locked.
  const status = await pathStatus(session?.user?.id, slug);
  const lockedIds = Object.keys(status.locked);
  const firstStep = isFoundations ? mod.lessons[0]?.slug : firstBuilt?.slug;
  const moduleLocked = firstStep ? status.locked[firstStep] : undefined;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/curriculum"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
        >
          <span aria-hidden="true">←</span> All modules
        </Link>

        <header
          className={`mt-5 grid items-center gap-4 overflow-hidden rounded-[2rem] bg-hero-lavender px-6 py-8 sm:p-10 ${isFoundations ? "md:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]" : ""}`}
        >
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-navy">
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                Module {String(mod.order).padStart(2, "0")}
              </span>
              {TRACK_LABELS[mod.track]}
            </p>
            <h1 className="mt-5 max-w-[20ch] text-[clamp(2.1rem,5vw,3.5rem)] font-bold leading-[1.04]">
              {mod.title}
            </h1>
            <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink sm:text-lg">
              {mod.summary}
            </p>
            {!isFoundations && !firstBuilt && (
              <p className="mt-6 max-w-[58ch] rounded-2xl bg-white/80 p-4 text-sm leading-relaxed text-ink">
                <b>This module is being made.</b> Its episodes will appear here as soon as they are
                ready. In the meantime, you can work through the modules that are already open.
              </p>
            )}
            {moduleLocked && (
              <p className="mt-6 flex max-w-[58ch] items-start gap-2 rounded-2xl bg-white/80 p-4 text-sm leading-relaxed text-ink">
                <LockIcon className="mt-0.5 size-4 shrink-0 text-navy" />
                <span>
                  <b>Not open yet.</b> Modules open in order. Finish Module {moduleLocked.moduleOrder},
                  including its final assessment, to open this one. Next up for you:{" "}
                  {moduleLocked.label}.
                </span>
              </p>
            )}
            {moduleLocked && (
              <div className="mt-6">
                <Link
                  href={moduleLocked.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  Continue Module {moduleLocked.moduleOrder} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
            {!isFoundations && firstBuilt && !moduleLocked && (
              <div className="mt-6">
                <Link
                  href={`/modules/${slug}/lessons/${firstBuilt.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  Start Episode {mod.order}.{mod.lessons.indexOf(firstBuilt) + 1} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
            {isFoundations && (
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/welcome"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  Start with the welcome <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={`/modules/${slug}/lessons/${mod.lessons[0].slug}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
                >
                  Go straight to Lesson 1
                </Link>
              </div>
            )}
          </div>
          {isFoundations && (
            <div className="mx-auto w-full max-w-[16rem] md:max-w-none">
              <FoundationsIllustration />
            </div>
          )}
        </header>

        {(isFoundations || firstBuilt) && (
          <div className="mt-5">
            <JourneyProgress moduleSlug={slug} done={status.done} locked={lockedIds} />
          </div>
        )}

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.42fr)]">
          <section aria-labelledby="module-lessons">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id="module-lessons" className="text-2xl font-bold text-ink">{isFoundations ? "Lessons" : "Episodes"}, in order</h2>
              <p className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                {mod.lessons.length} {unit}
              </p>
            </div>
            {session?.user && isFoundations && (
              <p className="mb-4 rounded-2xl bg-mint p-4 text-sm leading-relaxed text-ink">
                You&apos;re signed in, so your progress and knowledge check
                results are saved.
              </p>
            )}
            <ol className="grid gap-3 sm:grid-cols-2">
              {mod.lessons.map((lesson, index) => {
                const built = getBuiltLesson(lesson.slug);
                const preview = Boolean(built);
                const tone = ["bg-lavender", "bg-peach", "bg-mint"][index % 3];
                const passed = status.done.includes(lesson.slug);
                const lockedBy = status.locked[lesson.slug];
                const badge = !built
                  ? "Coming soon"
                  : passed
                    ? "✓ Passed"
                    : lockedBy
                      ? "Locked"
                      : status.known
                        ? "Open"
                        : built.preview
                          ? "Free"
                          : "Free account";

                return (
                  <li
                    key={lesson.slug}
                    className={`relative flex min-w-0 flex-col items-start rounded-3xl border p-5 ${preview ? `border-transparent ${tone} hover:border-brand/35` : "border-line bg-white"}`}
                  >
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-navy">
                        {mod.order}.{index + 1}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
                        {lockedBy && built && <LockIcon />}
                        {badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-ink">
                      {preview ? (
                        <Link
                          href={`/modules/${slug}/lessons/${lesson.slug}`}
                          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        lesson.title
                      )}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{lesson.summary}</p>
                    {preview && (
                      <span aria-hidden="true" className="mt-auto pt-4 text-sm font-semibold text-navy">
                        {lockedBy
                          ? `${finishFirstText(lockedBy, slug)} first`
                          : passed
                            ? `Revisit ${isFoundations ? "lesson" : "episode"} →`
                            : `Start ${isFoundations ? "lesson" : "episode"} →`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            {finalCount && (
              <ol start={mod.lessons.length + 1} className="mt-3 grid gap-3 sm:grid-cols-2">
                <li className="relative flex flex-col items-start rounded-3xl border border-transparent bg-lavender p-5 hover:border-brand/35">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
                    {status.locked["final-assessment"] && <LockIcon />}
                    {status.done.includes("final-assessment")
                      ? "✓ Passed"
                      : status.locked["final-assessment"]
                        ? "Locked"
                        : `Then · ${finalCount} questions`}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">
                    <Link
                      href={`/modules/${slug}/final-assessment`}
                      className="after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
                    >
                      Final assessment
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A short refresher across all {mod.lessons.length} {unit}. No time limit.
                  </p>
                  <span aria-hidden="true" className="mt-auto pt-4 text-sm font-semibold text-navy">
                    {status.locked["final-assessment"]
                      ? "Opens after every knowledge check above"
                      : "Take the refresher →"}
                  </span>
                </li>
                <li className="relative flex flex-col items-start rounded-3xl border border-line bg-white p-5 hover:border-brand/35">
                  <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-semibold text-navy">
                    Counts towards
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">
                    <Link
                      href="/certificate"
                      className="after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
                    >
                      Your Essentials certificate
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Complete every module in the Essentials to earn your free certificate. Download it, share a check link and add it to LinkedIn.
                  </p>
                  <span aria-hidden="true" className="mt-auto pt-4 text-sm font-semibold text-navy">
                    See your progress →
                  </span>
                </li>
              </ol>
            )}
          </section>

          <aside className="flex flex-col gap-3 self-start lg:mt-12">
            <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-navy">You leave with</h2>
              <p className="mt-2 leading-relaxed text-muted">{mod.outcome}</p>
            </section>
            {isFoundations && (
              <section className="rounded-3xl bg-blush p-5 sm:p-6">
                <h2 className="text-lg font-bold text-navy">How each lesson works</h2>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
                  <li>1. Watch a short film, or work through an interactive guide.</li>
                  <li>2. Take a 5-question knowledge check.</li>
                  <li>3. Pass with 4 or more. Retry as often as you need.</li>
                </ol>
                {!session?.user && (
                  <Link
                    href={`/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}`)}`}
                    className="mt-4 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                  >
                    Sign in to save your progress
                  </Link>
                )}
              </section>
            )}
          </aside>
        </div>

        <div className="mt-9">
          <ForumPeek
            moduleSlug={slug}
            heading={`Talk about Module ${mod.order}`}
            intro="Questions, tips and ideas from other learners about this module. Learn more from each other."
          />
        </div>

        <nav aria-label="Module navigation" className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <Link
            href="/curriculum"
            className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            All modules
          </Link>
          {next && (
            <Link
              href={`/modules/${next.slug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-deep hover:underline"
            >
              Next module · {next.title}
              {!next.lessons.some((l) => getBuiltLesson(l.slug)) && " (coming soon)"} <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JourneyProgress } from "@/components/JourneyProgress";
import { FoundationsIllustration } from "@/components/diagrams/FoundationIllustrations";
import { TRACK_LABELS, getModule, modules } from "@/content/modules";
import { auth } from "@/auth";
import { googleAuthConfigured } from "@/lib/auth-configured";

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

  const session = googleAuthConfigured ? await auth() : null;
  const next = modules.find((m) => m.order === mod.order + 1);
  const isFoundations = mod.order === 1;

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

        {isFoundations && (
          <div className="mt-5">
            <JourneyProgress />
          </div>
        )}

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.42fr)]">
          <section aria-labelledby="module-lessons">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id="module-lessons" className="text-2xl font-bold text-ink">Lessons, in order</h2>
              <p className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                {mod.lessons.length} lessons
              </p>
            </div>
            {session?.user && isFoundations && (
              <p className="mb-4 rounded-2xl bg-mint p-4 text-sm leading-relaxed text-ink">
                You&apos;re signed in, so your progress and knowledge check
                results are saved. Lessons 3 to 5 are coming soon.
              </p>
            )}
            <ol className="grid gap-3 sm:grid-cols-2">
              {mod.lessons.map((lesson, index) => {
                const preview = isFoundations && index < 2;
                const tone = index === 0 ? "bg-lavender" : "bg-peach";

                return (
                  <li
                    key={lesson.slug}
                    className={`relative flex min-w-0 flex-col items-start rounded-3xl border p-5 ${preview ? `border-transparent ${tone} hover:border-brand/35` : "border-line bg-white"}`}
                  >
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-navy">
                        {mod.order}.{index + 1}
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
                        {preview ? "Free" : "Coming soon"}
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
                        Start lesson →
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
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
                  <li>2. Take a 10-question knowledge check.</li>
                  <li>3. Pass with 7 or more. Retry as often as you need.</li>
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

        <nav aria-label="Module navigation" className="mt-9 flex flex-wrap items-center gap-4 border-t border-line pt-6">
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
              Next module · {next.title} <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}

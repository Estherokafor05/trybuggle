import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { CertificatePanel } from "@/components/certificate/CertificatePanel";
import { Requirements } from "@/components/certificate/Requirements";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getBuiltLesson, getModule, modules } from "@course";
import {
  essentialsTitle,
  getCertificate,
  hasFinalAssessment,
  moduleRequirements,
} from "@/server/certificates";
import { siteOrigin } from "@/server/site";

export const metadata: Metadata = { title: "Module progress | Buggle Learn" };

// A module's checklist. Modules no longer have their own certificate: each one
// counts towards the Essentials certificate (FRD Version 2). A module
// certificate issued before that change still shows here and still verifies.
export default async function ModuleCompletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod || !hasFinalAssessment(slug)) notFound();
  const session = await currentSession();
  if (!session?.user?.id)
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}/certificate`)}`);
  const learner = session.user.id;
  const [loaded, origin] = await Promise.all([
    Promise.all([moduleRequirements(learner, slug), getCertificate(learner, slug)]).catch(() => null),
    siteOrigin(),
  ]);
  const complete = Boolean(loaded?.[0].eligible);
  const legacy = loaded?.[1] ?? null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-10 pt-3 sm:px-6 sm:py-12">
        <Link href={`/modules/${slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Module {mod.order}
        </Link>
        <header className="mt-2 rounded-[1.75rem] bg-hero-lavender p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">{mod.title}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">
            {complete ? `Module ${mod.order} complete` : `Finish Module ${mod.order}`}
          </h1>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">
            Pass every knowledge check in this module and the final assessment. Each completed module
            counts towards your free {essentialsTitle} certificate.
          </p>
        </header>
        {!loaded ? (
          <p role="alert" className="mt-6 rounded-xl bg-peach p-4">
            Your progress couldn&apos;t load right now. Please refresh in a moment.
          </p>
        ) : (
          <>
            {complete ? (
              <section aria-labelledby="complete-title" className="mt-6 rounded-[1.75rem] bg-mint p-5 sm:p-6">
                <h2 id="complete-title" className="text-xl font-bold">
                  ✓ You&apos;ve passed everything in Module {mod.order}
                </h2>
                <p className="mt-2 leading-relaxed text-ink">
                  This module now counts towards your {essentialsTitle} certificate.
                </p>
                <Link
                  href="/certificate"
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  See your Essentials certificate <span aria-hidden="true">→</span>
                </Link>
              </section>
            ) : (
              <p className="mt-6 rounded-2xl bg-canvas p-5 leading-relaxed">
                You&apos;re nearly there. This module is complete as soon as everything below is ticked.
              </p>
            )}
            {legacy && (
              <CertificatePanel
                slug={slug}
                moduleTitle={mod.title}
                profileName={session.user.name ?? ""}
                initial={legacy}
                origin={origin}
                canCreate={false}
              />
            )}
            {complete && <StartUsingAiCard slug={slug} />}
            {complete && <NextModule order={mod.order} />}
            <div className="mt-7">
              <Requirements requirements={loaded[0].requirements} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

/** What to do after a module: start the next one, or hear that it is on its way. */
function NextModule({ order }: { order: number }) {
  const next = modules.find((m) => m.order === order + 1);
  if (!next) return null;
  const first = next.lessons.find((l) => getBuiltLesson(l.slug));
  return (
    <section aria-labelledby="next-module-title" className="mt-6 rounded-[1.75rem] bg-mint/70 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">What&apos;s next</p>
      <h2 id="next-module-title" className="mt-2 text-xl font-bold">
        Module {next.order}: {next.title}
      </h2>
      <p className="mt-2 leading-relaxed text-ink">{next.summary}</p>
      {first ? (
        <Link
          href={`/modules/${next.slug}/lessons/${first.slug}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Start Module {next.order} <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <p className="mt-3 text-sm font-semibold text-navy">
          This module is being made. Its episodes will appear on the module page as soon as they are ready.
        </p>
      )}
    </section>
  );
}

/** After completing a module: a way into the free "start using AI" plans. */
function StartUsingAiCard({ slug }: { slug: string }) {
  return (
    <section aria-labelledby="start-using-ai-title" className="mt-6 rounded-[1.75rem] bg-hero-lavender p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Put it into practice</p>
      <h2 id="start-using-ai-title" className="mt-2 text-xl font-bold">
        Ready to use AI in your own life?
      </h2>
      <p className="mt-2 leading-relaxed text-ink">
        Get a free, step-by-step plan for using AI in your job, your business or at home.
      </p>
      <Link
        href={`/start-using-ai?from=${slug}`}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        How can I start using AI? <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

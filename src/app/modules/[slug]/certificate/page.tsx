import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CertificatePanel } from "@/components/certificate/CertificatePanel";
import { Requirements } from "@/components/certificate/Requirements";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { stepLabel } from "@/content/journey";
import { getModule, modules } from "@/content/modules";
import { getBuiltLesson } from "@/content/preview-lessons";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { getCertificate, hasFinalAssessment, moduleRequirements } from "@/server/certificates";
import { claimGuest, guestId, openToGuests } from "@/server/guest";

export const metadata: Metadata = { title: "Your certificate | Buggle Learn" };

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod || !hasFinalAssessment(slug)) notFound();
  const session = googleAuthConfigured ? await auth() : null;
  const signUpHref = `/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}/certificate`)}`;
  const account = session?.user?.id ?? null;
  const guest = await guestId();
  if (!account && !openToGuests(slug)) redirect(signUpHref);
  // Results earned as a guest on this device count once the learner signs up.
  if (account && guest) await claimGuest(guest, account).catch(() => undefined);
  const learner = account ?? guest;
  const loaded = learner
    ? await Promise.all([moduleRequirements(learner, slug), account ? getCertificate(account, slug) : null]).catch(() => null)
    : null;
  const guestRequirements = !learner ? moduleRequirementsPlaceholder(slug) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-10 pt-3 sm:px-6 sm:py-12">
        <Link href={`/modules/${slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Module {mod.order}
        </Link>
        <header className="mt-2 rounded-[1.75rem] bg-hero-lavender p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">{mod.title}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Certificate of Completion</h1>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">
            Pass every knowledge check in this module and the final assessment to receive your certificate from Buggle Learn.
          </p>
        </header>
        {!account && (
          <section aria-labelledby="sign-up-title" className="mt-6 rounded-[1.75rem] bg-lavender p-5 sm:p-6">
            <h2 id="sign-up-title" className="text-xl font-bold">
              {loaded?.[0].eligible ? "You've done it! Sign up to get your certificate" : "Sign up to get your certificate"}
            </h2>
            <p className="mt-2 leading-relaxed text-ink">
              {loaded?.[0].eligible
                ? `You've passed everything in Module ${mod.order}. Create a free account to collect your certificate. Your results come with you.`
                : "You don't need an account to learn. When you've passed everything below, create a free account to collect your certificate. Results you earn on this device come with you."}
            </p>
            <Link
              href={signUpHref}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Sign up to get your certificate
            </Link>
          </section>
        )}
        {guestRequirements ? (
          <div className="mt-7">
            <Requirements requirements={guestRequirements} />
          </div>
        ) : !loaded ? (
          <p role="alert" className="mt-6 rounded-xl bg-peach p-4">
            Your certificate details couldn&apos;t load right now. Please refresh in a moment.
          </p>
        ) : (
          <>
            {!account ? null : loaded[1] || loaded[0].eligible ? (
              <CertificatePanel
                slug={slug}
                moduleTitle={mod.title}
                profileName={session?.user?.name ?? ""}
                initial={loaded[1]}
              />
            ) : (
              <p className="mt-6 rounded-2xl bg-canvas p-5 leading-relaxed">
                You&apos;re nearly there. Your certificate becomes available as soon as everything below is ticked.
              </p>
            )}
            {(loaded[1] || loaded[0].eligible) && <StartUsingAiCard slug={slug} />}
            {account && (loaded[1] || loaded[0].eligible) && <NextModule order={mod.order} />}
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

/** The checklist for a visitor who has not taken anything yet. */
function moduleRequirementsPlaceholder(slug: string) {
  const mod = getModule(slug)!;
  return [
    ...mod.lessons.map((l, i) => ({
      id: l.slug,
      label: `${stepLabel(mod.order, i)} knowledge check`,
      title: l.title,
      href: `/modules/${slug}/lessons/${l.slug}#knowledge-check`,
      passedAt: null,
    })),
    {
      id: "final-assessment",
      label: "Final assessment",
      title: `Module ${mod.order} refresher`,
      href: `/modules/${slug}/final-assessment`,
      passedAt: null,
    },
  ];
}

/** What to do after a certificate: start the next module, or hear that it is on its way. */
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

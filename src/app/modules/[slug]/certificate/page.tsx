import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CertificatePanel } from "@/components/certificate/CertificatePanel";
import { Requirements } from "@/components/certificate/Requirements";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@/content/modules";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { getCertificate, hasFinalAssessment, moduleRequirements } from "@/server/certificates";

export const metadata: Metadata = { title: "Your certificate | Buggle Learn" };

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod || !hasFinalAssessment(slug)) notFound();
  const session = googleAuthConfigured ? await auth() : null;
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}/certificate`)}`);
  const learner = session.user.id;
  const loaded = await Promise.all([moduleRequirements(learner, slug), getCertificate(learner, slug)]).catch(() => null);

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
            Pass every lesson&apos;s knowledge check and the final assessment to receive your certificate from Buggle Learn.
          </p>
        </header>
        {!loaded ? (
          <p role="alert" className="mt-6 rounded-xl bg-peach p-4">
            Your certificate details couldn&apos;t load right now. Please refresh in a moment.
          </p>
        ) : (
          <>
            {loaded[1] || loaded[0].eligible ? (
              <CertificatePanel
                slug={slug}
                moduleTitle={mod.title}
                profileName={session.user.name ?? ""}
                initial={loaded[1]}
              />
            ) : (
              <p className="mt-6 rounded-2xl bg-canvas p-5 leading-relaxed">
                You&apos;re nearly there. Your certificate becomes available as soon as everything below is ticked.
              </p>
            )}
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

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { CertificatePanel } from "@/components/certificate/CertificatePanel";
import { EssentialsChecklist } from "@/components/certificate/EssentialsChecklist";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  ESSENTIALS,
  essentialsStatus,
  essentialsTitle,
  getEssentialsCertificate,
} from "@/server/certificates";
import { siteOrigin } from "@/server/site";

export const metadata: Metadata = { title: "Your Essentials certificate | Buggle Learn" };

// The free Essentials certificate: earned after every Essentials module.
export default async function EssentialsCertificatePage() {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fcertificate");
  const learner = session.user.id;
  const [loaded, origin] = await Promise.all([
    Promise.all([essentialsStatus(learner), getEssentialsCertificate(learner)]).catch(() => null),
    siteOrigin(),
  ]);
  const status = loaded?.[0];
  const certificate = loaded?.[1] ?? null;
  const skipped = status?.modules.filter((m) => m.state === "skipped").length ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-10 pt-3 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Your dashboard
        </Link>
        <header className="mt-2 rounded-[1.75rem] bg-hero-lavender p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Free certificate</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">{essentialsTitle}</h1>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">
            Complete every module in the Essentials, including each final assessment, to receive your
            certificate from Buggle Learn. It has its own ID that anyone can check, and you can add it
            to LinkedIn.
          </p>
        </header>

        {!status ? (
          <p role="alert" className="mt-6 rounded-xl bg-peach p-4">
            Your certificate details couldn&apos;t load right now. Please refresh in a moment.
          </p>
        ) : (
          <>
            {certificate || status.eligible ? (
              <CertificatePanel
                slug={ESSENTIALS}
                moduleTitle={essentialsTitle}
                profileName={session.user.name ?? ""}
                initial={certificate}
                origin={origin}
              />
            ) : (
              <p className="mt-6 rounded-2xl bg-canvas p-5 leading-relaxed">
                You&apos;re on your way. Your certificate becomes available as soon as every module below is complete.
              </p>
            )}
            {skipped > 0 && (
              <p className="mt-6 rounded-2xl bg-peach p-4 text-sm leading-relaxed">
                <b>Test site:</b> {skipped} {skipped === 1 ? "module is" : "modules are"} still being made, so{" "}
                {skipped === 1 ? "it is" : "they are"} skipped here. On the live site every module counts.
              </p>
            )}
            <div className="mt-7">
              <EssentialsChecklist modules={status.modules} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

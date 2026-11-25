import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { verifyCertificate } from "@/server/certificates";
import { VerifyForm } from "@/components/certificate/VerifyForm";

type Props = { params: Promise<{ code: string }> };

// One lookup per request, shared by the page and its metadata.
const lookup = cache(async (code: string) => {
  try {
    return { result: await verifyCertificate(decodeURIComponent(code)) };
  } catch {
    return { failed: true as const };
  }
});

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await lookup((await params).code);
  const cert = "result" in found ? found.result : null;
  // Search engines never list people's certificates; links shared on purpose still preview.
  const robots = { index: false, follow: false };
  if (!cert || cert.status !== "valid") return { title: "Certificate check | Buggle Learn", robots };
  const title = `${cert.learnerName} completed ${cert.title}`;
  const description = `A Buggle Learn certificate, completed on ${longDate(cert.completedOn)}. Certificate ID ${cert.code}.`;
  return {
    title: `${title} | Buggle Learn`,
    description,
    robots,
    openGraph: { title, description, siteName: "Buggle Learn", type: "website" },
  };
}

// Public: shows only what the certificate itself shows.
export default async function VerifyCodePage({ params }: Props) {
  const { code } = await params;
  const found = await lookup(code);
  const cert = "result" in found ? found.result : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        {"failed" in found ? (
          <section className="rounded-[2rem] bg-peach p-6 sm:p-9">
            <h1 className="text-3xl font-bold">We couldn&apos;t check this right now</h1>
            <p className="mt-3 leading-relaxed text-ink">Please try again in a moment.</p>
          </section>
        ) : !cert ? (
          <section aria-labelledby="result-title" className="rounded-[2rem] bg-peach p-6 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Certificate check</p>
            <h1 id="result-title" className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1]">
              No certificate found
            </h1>
            <p className="mt-3 max-w-[58ch] leading-relaxed text-ink">
              There is no Buggle Learn certificate with the ID{" "}
              <span className="break-all font-mono font-bold">{decodeURIComponent(code).toUpperCase()}</span>. Check
              the ID for typing mistakes. A certificate also stops showing here if its owner deletes their account.
            </p>
          </section>
        ) : (
          <section
            aria-labelledby="result-title"
            className={`rounded-[2rem] p-6 sm:p-9 ${cert.status === "valid" ? "bg-mint" : "bg-peach"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Certificate check</p>
            <h1 id="result-title" className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1]">
              {cert.status === "valid" ? "✓ This certificate is real" : "This certificate has been withdrawn"}
            </h1>
            <p className="mt-3 max-w-[58ch] leading-relaxed text-ink">
              {cert.status === "valid"
                ? "Buggle Learn issued this certificate. These are its details."
                : "Buggle Learn issued this certificate but has since withdrawn it, so it no longer counts."}
            </p>
            <dl className="mt-6 grid gap-4 rounded-3xl bg-white/85 p-5 sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">Issued to</dt>
                <dd className="ph-mask mt-1 break-words font-display text-2xl font-bold text-navy">{cert.learnerName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">For completing</dt>
                <dd className="mt-1 text-lg font-bold text-teal">{cert.title}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Completed on</dt>
                <dd className="mt-1 font-bold text-navy">{longDate(cert.completedOn)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Certificate ID</dt>
                <dd className="mt-1 break-all font-mono font-bold text-navy">{cert.code}</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              This is a certificate of completion from Buggle Learn. It is not an accredited qualification or proof
              of professional competence.{" "}
              <Link href="/curriculum" className="font-semibold text-navy underline underline-offset-4">
                See what the course covers
              </Link>
            </p>
          </section>
        )}
        <div className="mt-6">
          <VerifyForm heading={false} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

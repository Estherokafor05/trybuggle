import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { normaliseCode } from "@/server/certificates";
import { VerifyForm } from "@/components/certificate/VerifyForm";

export const metadata: Metadata = {
  title: "Check a certificate | Buggle Learn",
  description: "Check that a Buggle Learn certificate is real, using its certificate ID.",
};

// Public: anyone can type a certificate ID to check it.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const clean = code ? normaliseCode(code) : null;
  if (clean) redirect(`/verify/${encodeURIComponent(clean)}`);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <VerifyForm invalid={Boolean(code)} value={code ?? ""} />
      </main>
      <SiteFooter />
    </>
  );
}

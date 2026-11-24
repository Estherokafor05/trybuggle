import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StartUsingAi } from "@/components/use-ai/StartUsingAi";
import { getModule } from "@course";
import { getStarterPlan } from "@/content/use-ai";

export const metadata: Metadata = {
  title: "Start using AI | Buggle Learn",
  description: "A free starter plan for using AI in your job, your business or at home, with the safety habits from the course.",
};

export default async function StartUsingAiPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string; from?: string }>;
}) {
  const { for: situation, from } = await searchParams;
  const mod = from ? getModule(from) : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-10 pt-3 sm:px-6 sm:py-12">
        {mod && (
          <Link
            href={`/modules/${mod.slug}/certificate`}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">←</span> Module {mod.order} certificate
          </Link>
        )}
        <header className="mt-2 rounded-[1.75rem] bg-mint p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Put it into practice</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Start using AI in your life</h1>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink">
            You&apos;ve learned what AI is and how to use it safely. Choose where you want to start and we&apos;ll give you a
            simple plan for your first week.
          </p>
        </header>
        <StartUsingAi initial={getStarterPlan(situation)?.id ?? null} />
      </main>
      <SiteFooter />
    </>
  );
}

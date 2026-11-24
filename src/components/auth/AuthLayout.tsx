// Shared frame for the sign-in pages: the same card, spacing and colours as the
// rest of Buggle Learn, centred and full width on phones.
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@course";

export function AuthLayout({
  returnTo,
  eyebrow,
  title,
  intro,
  children,
}: {
  returnTo: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  // Speak to the module the learner came from (Module 1 if we cannot tell).
  const fromModule =
    getModule(returnTo.match(/^\/modules\/([^/?#]+)/)?.[1] ?? "") ?? getModule("ai-foundations")!;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[560px] items-center px-4 py-10 sm:px-6 sm:py-14">
        <section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
          <Link
            href={returnTo.startsWith("/modules/") ? returnTo : `/modules/${fromModule.slug}`}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-deep hover:underline"
          >
            <span aria-hidden="true">←</span> Back to Module {fromModule.order}
          </Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-teal">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold">{title}</h1>
          {intro && <div className="mt-3 leading-relaxed text-muted">{intro}</div>}
          {children}
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Buggle Learn only asks for the details needed to run your account. Read our{" "}
            <Link href="/privacy" className="font-semibold text-navy underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Page not found | Buggle Learn",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-[640px] items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-[2rem] bg-hero-lavender p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Page not found
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 leading-relaxed text-ink">
            The link may be old or mistyped. You can pick up where the
            learning starts, or go back to the home page.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/modules/ai-foundations"
              className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Go to Module 1
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

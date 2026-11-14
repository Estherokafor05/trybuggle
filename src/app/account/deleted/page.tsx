import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Account deleted | Buggle Learn" };

export default function AccountDeletedPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-[640px] items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-[2rem] bg-hero-lavender p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Account</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Your account has been deleted</h1>
          <p className="mt-3 leading-relaxed text-ink">
            Your progress, results and certificates have been permanently deleted, and you have
            been signed out. You are welcome back any time.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Back to home
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

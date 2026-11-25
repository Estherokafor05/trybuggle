import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { createOrganisationAction } from "@/app/org/actions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { orgButton, orgInput } from "@/components/org/OrgShell";

export const metadata: Metadata = { title: "Create an organisation | Buggle Learn" };

export default async function NewOrganisationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Forganisations%2Fnew");
  const { error } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[640px] px-4 pb-12 pt-3 sm:px-6 sm:pt-8">
        <Link href="/organisations" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> For organisations
        </Link>
        <section className="mt-2 rounded-3xl border border-line bg-white p-6 sm:p-9">
          <h1 className="text-3xl font-bold">Create an organisation</h1>
          <p className="mt-2 leading-relaxed text-muted">
            You&apos;ll be its owner. Next, you choose a plan and the number of places, then add your members.
          </p>
          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-peach p-3 text-sm">
              {error}
            </p>
          )}
          <form action={createOrganisationAction} className="mt-6 grid gap-4">
            <label className="grid gap-2 font-semibold">
              Organisation name
              <input name="name" required minLength={2} maxLength={80} autoComplete="organization" className={orgInput} />
            </label>
            <button type="submit" className={`${orgButton} justify-self-start`}>
              Create organisation
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

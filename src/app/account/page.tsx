import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteAccountAction } from "@/app/actions/account";
import { auth } from "@/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { googleAuthConfigured } from "@/lib/auth-configured";

export const metadata: Metadata = { title: "Your account | Buggle Learn" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ confirm?: string }> }) {
  const session = googleAuthConfigured ? await auth() : null;
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Faccount");
  const { confirm } = await searchParams;
  const { name, email } = session.user;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Account</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Your account</h1>
          <dl className="mt-4 grid gap-1 text-ink sm:text-lg">
            {name && (
              <div>
                <dt className="sr-only">Name</dt>
                <dd className="font-semibold">{name}</dd>
              </div>
            )}
            {email && (
              <div>
                <dt className="sr-only">Email</dt>
                <dd>{email}</dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-sm text-navy">Signed in with Google</p>
        </header>

        <section aria-labelledby="data" className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="data" className="text-xl font-bold text-ink">What we keep for your account</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
            <li>Your knowledge check and final assessment answers and results</li>
            <li>Where you are in each lesson</li>
            <li>Your certificates and the name shown on them</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Read more in our{" "}
            <Link href="/privacy" className="font-semibold text-navy underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </section>

        <section id="delete" aria-labelledby="delete-title" className="mt-6 rounded-3xl border-2 border-red-200 bg-white p-5 sm:p-6">
          <h2 id="delete-title" className="text-xl font-bold text-ink">Delete your account</h2>
          <p className="mt-3 leading-relaxed">
            This permanently deletes everything listed above, straight away, and signs you out.
            Your certificates will stop working. It cannot be undone. You can always start again
            later with a new account.
          </p>
          <form action={deleteAccountAction} className="mt-5">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 leading-relaxed">
              <input type="checkbox" name="confirm" value="yes" required className="mt-1 size-5 shrink-0 accent-red-700" />
              I understand that my progress, results and certificates will be deleted for good.
            </label>
            {confirm === "required" && (
              <p role="alert" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
                Tick the box to confirm, then press the button again.
              </p>
            )}
            <button
              type="submit"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Delete my account
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

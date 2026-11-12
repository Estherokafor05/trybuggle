import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Create your free account | Buggle Learn",
  description: "Sign in with Google to continue learning about AI.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  if (googleAuthConfigured) {
    const session = await auth();
    if (session?.user) redirect(returnTo);
  }

  async function continueWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: returnTo });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[560px] items-center px-4 py-10 sm:px-6 sm:py-14">
        <section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
          <Link
            href="/modules/ai-foundations"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-deep hover:underline"
          >
            <span aria-hidden="true">←</span> Back to Module 1
          </Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-teal">
            Keep learning
          </p>
          <h1 className="mt-3 text-3xl font-bold">Create your free account</h1>
          <p className="mt-3 leading-relaxed text-muted">
            You can explore the first two lessons without an account. Sign in with
            Google when you are ready to continue through the learning path.
          </p>

          {googleAuthConfigured ? (
            <form action={continueWithGoogle} className="mt-7">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-5 py-3.5 font-semibold text-ink transition-colors hover:border-brand hover:bg-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <p className="mt-7 rounded-xl border border-line bg-ivory p-4 text-sm leading-relaxed text-muted">
              Google sign-in is not configured yet. Add the Google OAuth settings
              to the local environment to enable accounts.
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Sign-in returns you to the page you chose. Buggle Learn only requests
            the basic account details needed to identify your session.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

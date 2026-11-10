import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
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
    <main className="mx-auto flex min-h-[75vh] max-w-[560px] items-center px-4 py-14 sm:px-6">
      <section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
        <Link href="/modules/ai-foundations" className="text-sm font-semibold text-brand hover:underline">
          Back to Module 1
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-teal">
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
              <span aria-hidden="true" className="font-bold text-brand">G</span>
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
  );
}

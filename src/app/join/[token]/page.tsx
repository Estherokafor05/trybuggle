import type { Metadata } from "next";
import Link from "next/link";
import { currentSession } from "@/auth";
import { acceptJoinAction } from "@/app/org/actions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { orgButton } from "@/components/org/OrgShell";
import { findJoin } from "@/server/organisations";

export const metadata: Metadata = { title: "Join an organisation | Buggle Learn", robots: { index: false } };

// Joining an organisation from an invite or a join link.
export default async function JoinPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params;
  const { error } = await searchParams;
  const join = await findJoin(token).catch(() => null);
  const session = await currentSession();
  const back = encodeURIComponent(`/join/${token}`);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-[560px] items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
          {!join ? (
            <>
              <h1 className="text-3xl font-bold">This link doesn&apos;t work</h1>
              <p className="mt-3 leading-relaxed text-muted">It may have expired or been switched off. Ask your organisation for a new one.</p>
            </>
          ) : (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-teal">Invitation</p>
              <h1 className="mt-3 text-3xl font-bold">Join {join.name}</h1>
              <p className="mt-3 leading-relaxed text-muted">
                You&apos;ll learn about AI on Buggle Learn as part of {join.name}. Its managers will be able to see your progress,
                results and certificates. You can leave at any time.
                {join.kind === "invite" && (
                  <>
                    {" "}
                    This invite is for <b className="ph-mask text-ink">{join.email}</b>.
                  </>
                )}
              </p>
              {error && (
                <p role="alert" className="mt-5 rounded-xl bg-peach p-3 text-sm">
                  {error}
                </p>
              )}
              {session?.user ? (
                <form action={acceptJoinAction} className="mt-6">
                  <input type="hidden" name="token" value={token} />
                  <button type="submit" className={orgButton}>
                    Join {join.name}
                  </button>
                </form>
              ) : (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/sign-up?callbackUrl=${back}`} className={orgButton}>
                    Create a free account
                  </Link>
                  <Link href={`/sign-in?callbackUrl=${back}`} className="inline-flex min-h-11 items-center font-semibold text-navy underline underline-offset-4">
                    I have an account
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

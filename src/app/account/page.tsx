import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  changePasswordAction,
  deleteAccountAction,
  linkGoogleAction,
  unlinkAction,
  updateNameAction,
} from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";
import { setLanguageAction } from "@/app/actions/account";
import { LOCALES, DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { db } from "@/server/database";
import { auth, currentSession } from "@/auth";
import { FormMessage, GoogleIcon, TextField } from "@/components/auth/fields";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { authMessage, notices } from "@/lib/auth-messages";
import { googleAuthConfigured } from "@/lib/auth-configured";

const button =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";
const outlineButton =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender";

export const metadata: Metadata = { title: "Your account | Buggle Learn" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; error?: string; notice?: string }>;
}) {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Faccount");
  const { confirm, error, notice } = await searchParams;
  const { name, email } = session.user;
  const accounts = await auth.api.listUserAccounts({ headers: await headers() }).catch(() => []);
  const password = accounts.find((a) => a.providerId === "credential");
  const google = accounts.find((a) => a.providerId === "google");
  const errorMessage = authMessage(error);
  const noticeMessage = notice ? notices[notice] : null;
  const [pref] = await db()`SELECT locale FROM learner_preferences WHERE learner_id = ${session.user.id}`.catch(() => []);
  const locale = isLocale(pref?.locale) ? pref.locale : DEFAULT_LOCALE;
  const methods = [password && "email and password", google && "Google"].filter(Boolean).join(" or ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
        >
          <span aria-hidden="true">←</span> Your dashboard
        </Link>
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Account</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Your account</h1>
          <dl className="ph-mask mt-4 grid gap-1 text-ink sm:text-lg">
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
          {methods && <p className="mt-3 text-sm text-navy">You log in with {methods}</p>}
        </header>

        {(errorMessage || noticeMessage) && (
          <div className="mt-6">
            {noticeMessage && <FormMessage tone="success">{noticeMessage}</FormMessage>}
            {errorMessage && <FormMessage tone="error">{errorMessage}</FormMessage>}
          </div>
        )}

        <section id="details" aria-labelledby="details-title" className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="details-title" className="text-xl font-bold text-ink">Your details</h2>
          <form action={updateNameAction} className="mt-4 grid gap-4">
            <TextField
              id="name"
              label="Your name"
              hint="New certificates use this name. You can also change the name on each certificate."
              defaultValue={name}
              autoComplete="name"
              maxLength={80}
              required
            />
            <div>
              <button type="submit" className={button}>Save name</button>
            </div>
          </form>
        </section>

        <section id="sign-in" aria-labelledby="sign-in-title" className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="sign-in-title" className="text-xl font-bold text-ink">How you log in</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Link more than one way to log in, so you never get locked out.
          </p>

          <h3 className="mt-6 font-bold text-ink">Password</h3>
          <form action={changePasswordAction} className="mt-3 grid gap-4">
            {password && (
              <TextField id="currentPassword" label="Current password" type="password" autoComplete="current-password" required />
            )}
            <TextField id="newPassword" label={password ? "New password" : "Choose a password"} hint="At least 8 characters." type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            <TextField id="confirmPassword" label="Type it again" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            <div>
              <button type="submit" className={button}>{password ? "Change password" : "Add a password"}</button>
            </div>
          </form>

          {googleAuthConfigured && (
            <>
              <h3 className="mt-8 flex items-center gap-2 font-bold text-ink">
                <GoogleIcon /> Google
              </h3>
              {google ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="leading-relaxed">Linked. You can log in with Google.</p>
                  {password ? (
                    <form action={unlinkAction}>
                      <input type="hidden" name="accountId" value={google.accountId} />
                      <button type="submit" className={outlineButton}>Remove Google</button>
                    </form>
                  ) : (
                    <p className="text-sm text-muted">Add a password before removing Google.</p>
                  )}
                </div>
              ) : (
                <form action={linkGoogleAction} className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="leading-relaxed">Not linked yet.</p>
                  <button type="submit" className={outlineButton}>
                    <GoogleIcon /> Link Google
                  </button>
                </form>
              )}
            </>
          )}
        </section>

        <section id="language" aria-labelledby="language-title" className="mt-8 scroll-mt-24 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="language-title" className="text-xl font-bold text-ink">Language</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Choose the language for Buggle Learn&apos;s menus and buttons. Lessons are in English for now; more
            languages are on the way, and they&apos;ll appear here as soon as they&apos;re ready.
          </p>
          {notice === "language-saved" && (
            <p role="status" className="mt-3 rounded-xl bg-mint p-3 text-sm">
              Language saved.
            </p>
          )}
          <form action={setLanguageAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid flex-1 gap-2 font-semibold">
              Language
              <select
                name="locale"
                defaultValue={locale}
                className="min-h-11 w-full rounded-xl border-2 border-navy/30 bg-white px-3 py-2 text-base font-normal text-ink"
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code} lang={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Save language
            </button>
          </form>
        </section>

        <section aria-labelledby="data" className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="data" className="text-xl font-bold text-ink">What we keep for your account</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
            <li>Your knowledge check and final assessment answers and results</li>
            <li>Where you are in each lesson</li>
            <li>Your certificates and the name shown on them</li>
            <li>Your forum posts. If you delete your account, your name and words are removed from the forum; other people&apos;s replies stay.</li>
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
            {confirm === "owner" && (
              <p role="alert" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
                You own an organisation with a plan or other members. Contact us to hand it over or close it, then you can
                delete your account.
              </p>
            )}
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

        <section aria-labelledby="sign-out-title" className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="sign-out-title" className="text-xl font-bold text-ink">Sign out</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Sign out of Buggle Learn on this device. Your progress stays saved to your account.
          </p>
          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-lavender"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 13.5 16.5 10 13 6.5M16.5 10H8" />
              </svg>
              Sign out
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

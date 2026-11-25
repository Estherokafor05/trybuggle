import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  changePasswordAction,
  deleteAccountAction,
  linkGoogleAction,
  setLanguageAction,
  setLeaderboardAction,
  unlinkAction,
  updateNameAction,
} from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";
import { auth, currentSession } from "@/auth";
import { AccountRefresh } from "@/components/account/AccountRefresh";
import { PhotoPicker } from "@/components/account/PhotoPicker";
import { FormMessage, GoogleIcon, TextField } from "@/components/auth/fields";
import { ThemeChoice } from "@/components/theme/ThemeControls";
import { Avatar } from "@/components/Avatar";
import { Sparkles } from "@/components/Sparkles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_LOCALE, isLocale, LOCALES, UPCOMING_LOCALES } from "@/i18n/locales";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { authMessage, notices } from "@/lib/auth-messages";
import { db } from "@/server/database";
import { hiddenFromLeaderboard } from "@/server/rewards";

const button =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";
const outlineButton =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender";
const card = "scroll-mt-24 rounded-3xl border border-line bg-white p-5 sm:p-6";

export const metadata: Metadata = { title: "Your account | Buggle Learn" };

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "M10 10a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM4 16.5c.8-2.8 3.2-4.3 6-4.3s5.2 1.5 6 4.3" },
  { id: "sign-in", label: "Logging in", icon: "M6 9V6.5a4 4 0 0 1 8 0V9M5 9h10v7.5H5z" },
  { id: "language", label: "Language", icon: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm-7 7h14M10 3c2 2 2.8 4.5 2.8 7S12 15 10 17c-2-2-2.8-4.5-2.8-7S8 5 10 3Z" },
  { id: "appearance", label: "Appearance", icon: "M16 12.3A6.5 6.5 0 0 1 7.7 4a6.5 6.5 0 1 0 8.3 8.3Z" },
  { id: "data", label: "Your data", icon: "M4 5.5C4 4.1 6.7 3 10 3s6 1.1 6 2.5S13.3 8 10 8 4 6.9 4 5.5Zm0 0v9C4 15.9 6.7 17 10 17s6-1.1 6-2.5v-9M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" },
  { id: "leave", label: "Sign out or delete", icon: "M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 13.5 16.5 10 13 6.5M16.5 10H8" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Section({ id, title, intro, children, tone = card }: { id: string; title: string; intro?: ReactNode; children: ReactNode; tone?: string }) {
  const s = SECTIONS.find((x) => x.id === id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={tone}>
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-xl font-bold text-ink">
        {s && (
          <span className="grid size-8 place-items-center rounded-full bg-lavender text-navy">
            <Icon d={s.icon} />
          </span>
        )}
        {title}
      </h2>
      {intro && <p className="mt-2 leading-relaxed text-muted">{intro}</p>}
      {children}
    </section>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; error?: string; notice?: string; s?: string }>;
}) {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Faccount");
  const { confirm, error, notice, s: changed } = await searchParams;
  const { name, email } = session.user;
  const image = session.user.image ?? null;
  const accounts = await auth.api.listUserAccounts({ headers: await headers() }).catch(() => []);
  const password = accounts.find((a) => a.providerId === "credential");
  const google = accounts.find((a) => a.providerId === "google");
  const [pref] = await db()`SELECT locale FROM learner_preferences WHERE learner_id = ${session.user.id}`.catch(() => []);
  const locale = isLocale(pref?.locale) ? pref.locale : DEFAULT_LOCALE;
  const hidden = await hiddenFromLeaderboard(session.user.id).catch(() => false);
  const methods = [password && "email and password", google && "Google"].filter(Boolean).join(" or ");

  // Each message shows in the section that changed.
  const message = (section: string) => {
    if (changed !== section && !(section === "profile" && !changed)) return null;
    const ok = notice ? notices[notice] : null;
    const bad = authMessage(error);
    return (
      <>
        {ok && <FormMessage tone="success">{ok}</FormMessage>}
        {bad && <FormMessage tone="error">{bad}</FormMessage>}
      </>
    );
  };

  return (
    <>
      <SiteHeader />
      <AccountRefresh name={name ?? ""} image={image} />
      <main className="mx-auto max-w-[1080px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <Link href="/dashboard" className={`${outlineButton} mb-4`}>
          <span aria-hidden="true">←</span> Your dashboard
        </Link>
        <header className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <Sparkles />
          <Avatar name={name} image={image} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Settings</p>
            <h1 className="mt-1 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Your account</h1>
            <dl className="ph-mask mt-2 grid gap-0.5 text-ink">
              {name && (
                <div>
                  <dt className="sr-only">Name</dt>
                  <dd className="break-words font-semibold sm:text-lg">{name}</dd>
                </div>
              )}
              {email && (
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd className="break-all">{email}</dd>
                </div>
              )}
            </dl>
            {methods && <p className="mt-2 text-sm text-navy">You log in with {methods}</p>}
          </div>
        </header>

        <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
          <nav aria-label="Settings sections" className="-mx-4 mb-6 overflow-x-auto px-4 lg:mx-0 lg:mb-0 lg:px-0">
            <ul className="flex w-max gap-2 lg:sticky lg:top-24 lg:w-auto lg:flex-col lg:gap-1">
              {SECTIONS.map((x) => (
                <li key={x.id}>
                  <a
                    href={`#${x.id}`}
                    className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender lg:rounded-2xl lg:border-transparent lg:bg-transparent"
                  >
                    <Icon d={x.icon} />
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid min-w-0 gap-6">
            <Section id="profile" title="Profile" intro="How you appear on Buggle Learn.">
              {message("profile")}
              <div className="mt-5">
                <PhotoPicker name={name ?? ""} image={image} />
              </div>
              <form action={setLeaderboardAction} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
                <label className="flex min-h-11 flex-1 cursor-pointer items-start gap-3">
                  <input type="checkbox" name="show" defaultChecked={!hidden} className="mt-1 size-5 shrink-0 accent-brand" />
                  <span>
                    <span className="block font-semibold text-ink">Show me on leaderboards</span>
                    <span className="block text-sm text-muted">Others see your short name, photo and points. You earn points either way.</span>
                  </span>
                </label>
                <button type="submit" className={outlineButton}>
                  Save
                </button>
              </form>
              <form action={updateNameAction} className="mt-6 grid gap-4 border-t border-line/70 pt-5">
                <TextField
                  id="name"
                  label="Your name"
                  hint="New certificates use this name. At the top of the page, we show your first name and the first letter of your last name."
                  defaultValue={name}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                <div>
                  <button type="submit" className={button}>
                    Save name
                  </button>
                </div>
              </form>
            </Section>

            <Section id="sign-in" title="Logging in" intro="Link more than one way to log in, so you never get locked out.">
              {message("sign-in")}
              <div className="mt-5 grid gap-3">
                <details className="group rounded-2xl bg-canvas p-4" open={changed === "sign-in" && Boolean(error)}>
                  <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="block font-bold text-ink">Password</span>
                      <span className="block text-sm text-muted">{password ? "Set" : "Not set yet: you log in with Google"}</span>
                    </span>
                    <span className={outlineButton}>
                      {password ? "Change password" : "Add a password"}
                      <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </span>
                  </summary>
                  <form action={changePasswordAction} className="mt-4 grid gap-4">
                    {password && <TextField id="currentPassword" label="Current password" type="password" autoComplete="current-password" required />}
                    <TextField
                      id="newPassword"
                      label={password ? "New password" : "Choose a password"}
                      hint="At least 8 characters."
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                    />
                    <TextField id="confirmPassword" label="Type it again" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
                    <div>
                      <button type="submit" className={button}>
                        {password ? "Save new password" : "Add the password"}
                      </button>
                    </div>
                  </form>
                </details>

                {googleAuthConfigured && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
                    <span>
                      <span className="flex items-center gap-2 font-bold text-ink">
                        <GoogleIcon /> Google
                      </span>
                      <span className="block text-sm text-muted">{google ? "Linked. You can log in with Google." : "Not linked yet."}</span>
                    </span>
                    {google ? (
                      password ? (
                        <form action={unlinkAction}>
                          <input type="hidden" name="accountId" value={google.accountId} />
                          <button type="submit" className={outlineButton}>
                            Remove Google
                          </button>
                        </form>
                      ) : (
                        <span className="text-sm text-muted">Add a password before removing Google.</span>
                      )
                    ) : (
                      <form action={linkGoogleAction}>
                        <button type="submit" className={outlineButton}>
                          <GoogleIcon /> Link Google
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </Section>

            <Section
              id="language"
              title="Language"
              intro="Choose the language for Buggle Learn's menus and buttons. Lessons are in English for now. The greyed-out languages aren't ready yet; they'll open here as soon as they are."
            >
              {message("language")}
              <form action={setLanguageAction} className="mt-5">
                <fieldset>
                  <legend className="sr-only">Language</legend>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {LOCALES.map((l) => (
                      <li key={l.code}>
                        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-2 has-[:checked]:border-brand-deep has-[:checked]:bg-lavender">
                          <input type="radio" name="locale" value={l.code} defaultChecked={l.code === locale} className="size-5 accent-brand" />
                          <span lang={l.code} className="font-semibold text-ink">
                            {l.native}
                          </span>
                        </label>
                      </li>
                    ))}
                    {UPCOMING_LOCALES.map((l) => (
                      <li key={l.code}>
                        <label className="flex min-h-14 cursor-not-allowed items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-canvas px-4 py-2">
                          <input type="radio" name="locale" value={l.code} disabled className="size-5" />
                          <span className="min-w-0 flex-1">
                            <span lang={l.code} className="block font-semibold text-muted">
                              {l.native}
                            </span>
                            {l.native !== l.name && <span className="block text-xs text-muted">{l.name}</span>}
                          </span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-line">Not ready yet</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
                <button type="submit" className={`${button} mt-4`}>
                  Save language
                </button>
              </form>
            </Section>

            <Section id="appearance" title="Appearance" intro="Light or dark. You can also switch with the sun and moon button at the top of every page.">
              <div className="mt-5">
                <ThemeChoice />
              </div>
            </Section>

            <Section id="data" title="Your data" intro="What we keep for your account.">
              <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
                <li>Your knowledge check and final assessment answers and results</li>
                <li>Where you are in each lesson</li>
                <li>Your certificates and the name shown on them</li>
                <li>Your profile photo, if you add one</li>
                <li>Your forum posts. If you delete your account, your name and words are removed from the forum; other people&apos;s replies stay.</li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Read more in our{" "}
                <Link href="/privacy" className="font-semibold text-navy underline underline-offset-4">
                  privacy policy
                </Link>
                .
              </p>
            </Section>

            <Section id="leave" title="Sign out or delete">
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
                <p className="leading-relaxed text-ink">Sign out on this device. Your progress stays saved.</p>
                <form action={signOutAction}>
                  <button type="submit" className={outlineButton}>
                    <Icon d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 13.5 16.5 10 13 6.5M16.5 10H8" />
                    Sign out
                  </button>
                </form>
              </div>
              <details id="delete" className="mt-3 scroll-mt-24 rounded-2xl border-2 border-red-200 p-4" open={Boolean(confirm)}>
                <summary className="flex min-h-11 cursor-pointer items-center font-bold text-ink">Delete your account</summary>
                <p className="mt-2 leading-relaxed">
                  This permanently deletes everything listed under Your data, straight away, and signs you out. Your certificates will stop working. It cannot be
                  undone. You can always start again later with a new account.
                </p>
                <form action={deleteAccountAction} className="mt-4">
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 leading-relaxed">
                    <input type="checkbox" name="confirm" value="yes" required className="mt-1 size-5 shrink-0 accent-red-700" />
                    I understand that my progress, results and certificates will be deleted for good.
                  </label>
                  {confirm === "owner" && (
                    <p role="alert" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
                      You own an organisation with a plan or other members. Contact us to hand it over or close it, then you can delete your account.
                    </p>
                  )}
                  {confirm === "required" && (
                    <p role="alert" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
                      Tick the box to confirm, then press the button again.
                    </p>
                  )}
                  <button type="submit" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-red-50 hover:bg-red-800">
                    Delete my account
                  </button>
                </form>
              </details>
            </Section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

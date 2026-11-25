import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { LockIcon } from "@/components/LockIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatMinutes, learnerDashboard, type Dashboard, type ModuleSummary } from "@/server/dashboard";
import { OrgLogo } from "@/components/org/OrgShell";
import { Badges } from "@/components/rewards/Badges";
import { visibleCourses } from "@/server/builder-learn";
import { myRewards } from "@/server/rewards";
import { canManage, myOrganisations } from "@/server/organisations";

export const metadata: Metadata = { title: "Your dashboard | Buggle Learn" };

const button =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";

function Bar({ done, total, label }: { done: number; total: number; label: string }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${done} of ${total} done`}
      className="h-2.5 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-line/70"
    >
      <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
    </div>
  );
}

const stateText: Record<ModuleSummary["state"], string> = {
  done: "✓ Complete",
  inProgress: "In progress",
  notStarted: "Ready to start",
  locked: "Locked",
  comingSoon: "Coming soon",
};
const tones = ["bg-lavender", "bg-peach", "bg-mint", "bg-blush"];

function ModuleCard({ mod }: { mod: ModuleSummary }) {
  const muted = mod.state === "locked" || mod.state === "comingSoon";
  return (
    <li
      className={`relative flex min-w-0 flex-col rounded-3xl border p-5 ${
        muted ? "border-line bg-white" : `border-transparent ${tones[(mod.order - 1) % tones.length]} hover:border-brand/35`
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold text-navy">
          Module {String(mod.order).padStart(2, "0")}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            mod.state === "done" ? "bg-white/80 text-teal" : muted ? "bg-canvas text-muted" : "bg-white/80 text-navy"
          }`}
        >
          {mod.state === "locked" && <LockIcon />}
          {stateText[mod.state]}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink">
        <Link
          href={mod.href}
          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
        >
          {mod.title}
        </Link>
      </h3>
      {mod.state === "comingSoon" ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">This module is being made.</p>
      ) : (
        <>
          <div className="mt-4">
            <Bar done={mod.done} total={mod.total} label={`Module ${mod.order} progress`} />
          </div>
          <p className="mt-2 flex flex-wrap justify-between gap-x-3 text-sm text-muted">
            <span>
              {mod.done} of {mod.total} steps passed
            </span>
            {mod.state !== "done" && <span>{formatMinutes(mod.minutesLeft)} left</span>}
          </p>
        </>
      )}
      {mod.state === "done" && (
        <p className="relative z-10 mt-3 text-sm font-semibold">
          <Link className="text-navy underline underline-offset-4" href={`${mod.href}/certificate`}>
            {mod.certificate ? "View your module certificate" : "See what you passed"}
          </Link>
        </p>
      )}
    </li>
  );
}

function Stat({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: string }) {
  return (
    <div className={`rounded-3xl p-5 ${tone}`}>
      <p className="text-sm font-semibold text-navy">{title}</p>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  );
}

function when(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function Overview({ data, name }: { data: Dashboard; name: string }) {
  const { next, current, overall, stats } = data;
  const firstName = name.trim().split(/\s+/)[0];
  const started = overall.done > 0 || stats.daysLearning > 0;
  return (
    <header className="grid gap-6 rounded-[2rem] bg-hero-lavender p-6 sm:p-9 md:grid-cols-[1.3fr_1fr] md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Your dashboard</p>
        <h1 className="ph-mask mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">
          {started ? "Welcome back" : "Welcome"}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        {next ? (
          <>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-ink">
              {started ? "Pick up where you left off:" : "Your first step:"} Module {next.moduleOrder},{" "}
              {next.label}: {next.title}.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href={next.href} className={button}>
                {started ? "Continue" : "Start learning"} <span aria-hidden="true">→</span>
              </Link>
              {!started && (
                <Link href="/welcome" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
                  Watch the 2-minute welcome first
                </Link>
              )}
            </div>
          </>
        ) : (
          <p className="mt-3 max-w-[52ch] leading-relaxed text-ink">
            You&apos;ve passed everything that&apos;s open so far. New modules will appear here as soon as they&apos;re ready.
          </p>
        )}
      </div>
      <div className="rounded-3xl bg-white/80 p-5">
        <p className="text-sm font-semibold text-navy">Essentials progress</p>
        <p className="mt-1 font-display text-3xl font-bold text-ink">
          {overall.total ? Math.round((overall.done / overall.total) * 100) : 0}%
        </p>
        <div className="mt-3">
          <Bar done={overall.done} total={overall.total} label="Essentials progress" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {overall.done} of {overall.total} steps passed in the {overall.openModules} open{" "}
          {overall.openModules === 1 ? "module" : "modules"}.
          {current && ` Module ${current.order} is next.`}
        </p>
      </div>
    </header>
  );
}

export default async function DashboardPage() {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fdashboard");
  let data: Dashboard | null = null;
  try {
    data = await learnerDashboard(session.user.id);
  } catch {
    data = null;
  }
  const [orgs, more, rewards] = await Promise.all([
    myOrganisations(session.user.id).catch(() => []),
    visibleCourses(session.user.id).catch(() => []),
    myRewards(session.user.id).catch(() => null),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        {!data ? (
          <section className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
            <h1 className="text-3xl font-bold">Your dashboard</h1>
            <p className="mt-3 leading-relaxed text-ink">
              Your progress can&apos;t be loaded right now. Your results are safe. Please try again in a moment.
            </p>
          </section>
        ) : (
          <>
            <Overview data={data} name={session.user.name ?? ""} />

            <section aria-label="Your numbers" className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                tone="bg-white border border-line"
                title="Time to your Essentials certificate"
                value={
                  data.essentials.code
                    ? "Earned"
                    : data.overall.minutesLeft
                      ? formatMinutes(data.overall.minutesLeft)
                      : "Ready to create"
                }
                detail={
                  data.essentials.code
                    ? "You've earned your Essentials certificate."
                    : `${data.overall.total - data.overall.done} steps left in the open modules${
                        data.essentials.beingMade && !data.essentials.skipUnbuilt
                          ? `, plus ${data.essentials.beingMade} ${data.essentials.beingMade === 1 ? "module" : "modules"} still being made.`
                          : "."
                      }`
                }
              />
              <Stat
                tone="bg-mint"
                title="Checks passed"
                value={`${data.stats.checksPassed} of ${data.overall.total}`}
                detail={`${data.stats.certificates} ${data.stats.certificates === 1 ? "certificate" : "certificates"} earned so far.`}
              />
              <Stat
                tone="bg-peach"
                title="Days learning"
                value={String(data.stats.daysLearning)}
                detail="Days you watched, explored or took a check."
              />
            </section>

            <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.45fr)]">
              <section aria-labelledby="modules-title">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="modules-title" className="text-2xl font-bold text-ink">
                    Your modules
                  </h2>
                  <p className="text-sm text-muted">They open in order.</p>
                </div>
                <ol className="grid gap-3 sm:grid-cols-2">
                  {data.modules.map((mod) => (
                    <ModuleCard key={mod.slug} mod={mod} />
                  ))}
                </ol>
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed text-muted ring-1 ring-line/70">
                  <b className="text-ink">Your Essentials certificate</b> comes after every module is complete.{" "}
                  {data.overall.openModules} of {data.overall.plannedModules} modules are open so far
                  {data.overall.minutesLeft > 0
                    ? `, with ${formatMinutes(data.overall.minutesLeft).toLowerCase()} of learning left in them.`
                    : "."}{" "}
                  <Link href="/certificate" className="font-semibold text-navy underline underline-offset-4">
                    {data.essentials.code ? "View your certificate" : "See your certificate progress"}
                  </Link>
                </p>
              </section>

              <aside className="flex flex-col gap-5 self-start">
                <section aria-labelledby="recent-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
                  <h2 id="recent-title" className="text-lg font-bold">
                    Recent results
                  </h2>
                  {data.recent.length ? (
                    <ol className="mt-4 space-y-2">
                      {data.recent.map((item) => (
                        <li key={`${item.at}-${item.label}`} className="rounded-xl bg-canvas px-3 py-2.5">
                          <Link href={item.href} className="block min-h-11 underline-offset-4 hover:underline">
                            <span className="block font-semibold text-ink">{item.label}</span>
                            <span className="block truncate text-sm text-muted">{item.title}</span>
                          </Link>
                          <p className="mt-1 flex flex-wrap justify-between gap-x-3 text-sm">
                            <span className={item.passed ? "font-semibold text-teal" : "font-semibold text-navy"}>
                              {item.passed ? "Passed" : "Not passed yet"} · {item.correct} of {item.questions}
                            </span>
                            <span className="text-muted">{when(item.at)}</span>
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Your knowledge check results will show here.
                    </p>
                  )}
                </section>

                {rewards && (
                  <section aria-labelledby="points-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
                    <h2 id="points-title" className="flex items-center gap-2 text-lg font-bold">
                      <span aria-hidden="true">⭐</span> Your points
                    </h2>
                    <dl className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-lavender p-3">
                        <dt className="text-xs font-semibold text-muted">This week</dt>
                        <dd className="text-2xl font-bold text-navy">{rewards.week}</dd>
                      </div>
                      <div className="rounded-xl bg-peach p-3">
                        <dt className="text-xs font-semibold text-ink">Days in a row</dt>
                        <dd className="flex items-center gap-1 text-2xl font-bold text-navy">
                          <span aria-hidden="true" className={rewards.streak ? "inline-block motion-safe:animate-[flame-flicker_1.6s_ease-in-out_infinite]" : "grayscale"}>
                            🔥
                          </span>
                          {rewards.streak}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <Badges badges={rewards.badges} compact />
                    </div>
                    <Link href="/leaderboard" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
                      See the leaderboard
                    </Link>
                  </section>
                )}

                {more.length > 0 && (
                  <section aria-labelledby="more-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
                    <h2 id="more-title" className="text-lg font-bold">
                      More courses
                    </h2>
                    <ul className="mt-3 grid gap-2">
                      {more.slice(0, 3).map((c) => (
                        <li key={c.id}>
                          <Link href={`/learn/${c.slug}`} className="block rounded-xl bg-canvas p-3 hover:bg-lavender">
                            <span className="block font-semibold text-ink">{c.title}</span>
                            <span className="block text-sm text-muted">{c.from ? `From ${c.from}` : "From Buggle Learn"}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/courses" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
                      See all courses
                    </Link>
                  </section>
                )}

                <section aria-labelledby="orgs-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
                  <h2 id="orgs-title" className="text-lg font-bold">
                    {orgs.length ? "Your organisations" : "Learning with a team?"}
                  </h2>
                  {orgs.length ? (
                    <ul className="mt-3 grid gap-2">
                      {orgs.map(({ org, role }) => (
                        <li key={org.id}>
                          <Link href={`/org/${org.slug}`} className="flex items-center gap-3 rounded-xl bg-canvas p-3 hover:bg-lavender">
                            <OrgLogo org={org} size="size-10" />
                            <span className="min-w-0">
                              <span className="block font-semibold text-ink">{org.name}</span>
                              <span className="block text-sm text-muted">{canManage(role) ? "You manage this" : "You're learning with them"}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Bring your company, school or team. Add your people and follow their progress.
                    </p>
                  )}
                  <Link href={orgs.length ? "/organisations/new" : "/organisations"} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
                    {orgs.length ? "Create another organisation" : "See plans for organisations"}
                  </Link>
                </section>

                <section aria-labelledby="settings-title" className="rounded-[1.75rem] bg-blush p-5 sm:p-6">
                  <h2 id="settings-title" className="text-lg font-bold">
                    Settings
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    Your name, how you log in, and your data.
                  </p>
                  <Link href="/account" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender">
                    Open settings <span aria-hidden="true">→</span>
                  </Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

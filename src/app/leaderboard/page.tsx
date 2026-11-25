import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { Avatar } from "@/components/Avatar";
import { BuggleSays } from "@/components/Buggle";
import { Badges } from "@/components/rewards/Badges";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { shortName } from "@/lib/people";
import { myOrganisations } from "@/server/organisations";
import { EARN, hiddenFromLeaderboard, leaderboard, myRewards, type Period } from "@/server/rewards";

export const metadata: Metadata = { title: "Leaderboard | Buggle Learn" };
type Props = { searchParams: Promise<{ period?: string; org?: string }> };

const MEDALS = ["🥇", "🥈", "🥉"];
const tab = (on: boolean) =>
  `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${on ? "bg-navy text-white" : "text-muted hover:bg-lavender hover:text-navy"}`;

export default async function LeaderboardPage({ searchParams }: Props) {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fleaderboard");
  const me = session.user.id;
  const q = await searchParams;
  const period: Period = q.period === "all" ? "all" : "week";
  const orgs = await myOrganisations(me).catch(() => []);
  const org = orgs.find((o) => o.org.slug === q.org)?.org ?? null;
  const [mine, board, hidden] = await Promise.all([myRewards(me), leaderboard(me, { period, orgId: org?.id ?? null }), hiddenFromLeaderboard(me)]);
  const href = (p: Period, o: string | null) => `/leaderboard?period=${p}${o ? `&org=${o}` : ""}`;
  const youOutside = board.you && !board.top.some((r) => r.you);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          <span aria-hidden="true" className="absolute -right-2 -top-2 text-[5.5rem] opacity-90 motion-safe:animate-[welcome-float_6s_ease-in-out_infinite] sm:right-6 sm:top-4 sm:text-[7rem]">
            🏆
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Rewards</p>
          <h1 className="mt-2 max-w-[18ch] text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">Leaderboard</h1>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-ink">
            Earn points by learning and by helping others in the forum. Points are just for fun: they never change your scores or certificates.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Points this week", value: mine.week, emoji: "⭐" },
              { label: "All-time points", value: mine.total, emoji: "✨" },
              { label: mine.streak === 1 ? "Day streak" : "Days in a row", value: mine.streak, emoji: "🔥", flame: true },
              { label: "Your place", value: board.you ? `#${board.you.rank}` : "–", emoji: "📍" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/85 p-4">
                <dt className="text-xs font-semibold text-muted">{s.label}</dt>
                <dd className="mt-1 flex items-center gap-2 text-2xl font-bold text-navy">
                  <span aria-hidden="true" className={s.flame && mine.streak > 0 ? "inline-block motion-safe:animate-[flame-flicker_1.6s_ease-in-out_infinite]" : ""}>
                    {s.emoji}
                  </span>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {hidden && (
          <p role="status" className="mt-6 rounded-2xl bg-peach p-4 text-sm text-ink">
            You&apos;re hidden from leaderboards, so other people don&apos;t see you here. You still earn points.{" "}
            <Link href="/account#profile" className="font-semibold underline underline-offset-4">
              Change this in Settings
            </Link>
          </p>
        )}

        <section aria-labelledby="board-title" className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="board-title" className="text-xl font-bold">
              {org ? `${org.name}: ` : ""}
              {period === "week" ? "This week" : "All time"}
            </h2>
            <nav aria-label="Time" className="flex gap-1 rounded-full border border-line/70 p-1">
              <Link href={href("week", org?.slug ?? null)} aria-current={period === "week" ? "page" : undefined} className={tab(period === "week")}>
                This week
              </Link>
              <Link href={href("all", org?.slug ?? null)} aria-current={period === "all" ? "page" : undefined} className={tab(period === "all")}>
                All time
              </Link>
            </nav>
          </div>
          {orgs.length > 0 && (
            <nav aria-label="Who" className="mt-3 overflow-x-auto">
              <ul className="flex w-max gap-1">
                <li>
                  <Link href={href(period, null)} aria-current={!org ? "page" : undefined} className={tab(!org)}>
                    Everyone
                  </Link>
                </li>
                {orgs.map(({ org: o }) => (
                  <li key={o.id}>
                    <Link href={href(period, o.slug)} aria-current={org?.id === o.id ? "page" : undefined} className={tab(org?.id === o.id)}>
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {board.top.length ? (
            <ol className="mt-5 grid gap-2">
              {board.top.map((r) => (
                <Entry key={r.id} row={r} />
              ))}
              {youOutside && (
                <>
                  <li aria-hidden="true" className="text-center text-muted">
                    ⋯
                  </li>
                  <Entry row={board.you!} />
                </>
              )}
            </ol>
          ) : (
            <div className="mt-5">
              <BuggleSays mood="cheer">
                No points {period === "week" ? "this week" : ""} yet. Pass a knowledge check or help someone in the forum to be first. 🚀
              </BuggleSays>
            </div>
          )}
        </section>

        <section aria-labelledby="badges-title" className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id="badges-title" className="text-xl font-bold">
            Your badges
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mine.badges.filter((b) => b.earned).length} of {mine.badges.length} earned
            {mine.bestStreak > 1 ? ` · best streak ${mine.bestStreak} days` : ""}
          </p>
          <div className="mt-4">
            <Badges badges={mine.badges} />
          </div>
        </section>

        <details className="group mt-6 rounded-3xl bg-mint p-5 sm:p-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <h2 className="text-xl font-bold">
              <span aria-hidden="true">⭐</span> How to earn points
            </h2>
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-navy transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <table className="mt-3 w-full text-left">
            <thead className="sr-only">
              <tr>
                <th>What you do</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {EARN.map((e) => (
                <tr key={e.what} className="border-b border-navy/10 last:border-0">
                  <td className="py-2 pr-3 text-ink">{e.what}</td>
                  <td className="w-[38%] py-2 text-right font-semibold text-navy sm:w-auto sm:whitespace-nowrap">+{e.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            Each check earns points once. Up to 6 forum posts a day earn points, and posts removed by moderators lose theirs. Practise as much as you like: it&apos;s
            about learning, not points.
          </p>
          <p className="mt-2 text-sm text-ink">
            Rather not be on the leaderboard?{" "}
            <Link href="/account#profile" className="font-semibold underline underline-offset-4">
              Hide yourself in Settings
            </Link>
            .
          </p>
        </details>
      </main>
      <SiteFooter />
    </>
  );
}

function Entry({ row }: { row: import("@/server/rewards").Row }) {
  return (
    <li className={`flex items-center gap-3 rounded-2xl p-3 ${row.you ? "bg-lavender ring-2 ring-brand-deep" : "bg-canvas"}`}>
      <span className="w-10 shrink-0 text-center text-lg font-bold text-navy">
        {row.rank <= 3 ? (
          <>
            <span aria-hidden="true">{MEDALS[row.rank - 1]}</span>
            <span className="sr-only">#{row.rank}</span>
          </>
        ) : (
          `#${row.rank}`
        )}
      </span>
      <Avatar name={row.name} image={row.image} size="md" />
      <span className="ph-mask min-w-0 flex-1 truncate font-semibold text-ink">
        {shortName(row.name)}
        {row.you && <span className="ml-2 rounded-full bg-navy px-2 py-0.5 text-xs text-white">You</span>}
      </span>
      <span className="shrink-0 font-bold text-navy">
        {row.points} <span className="text-sm font-normal text-muted">pts</span>
      </span>
    </li>
  );
}

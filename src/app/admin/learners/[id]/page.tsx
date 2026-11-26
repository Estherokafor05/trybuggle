import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { endAccessAction, giveAccessAction, grantTryAction, learnerProfileAction } from "@/app/admin/actions";
import { Avatar } from "@/components/Avatar";
import { button, input } from "@/components/admin/styles";
import { LOCALES } from "@/i18n/locales";
import { deepDiveCourses, learnerInsight } from "@/server/admin-insight";
import { money } from "@/server/pricing";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { card, certificateName, checkName, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { learnerDetail, requireAdmin } from "@/server/admin";
import { learnerDashboard } from "@/server/dashboard";
import { CertificateActions } from "@/components/admin/CertificateActions";

export const metadata: Metadata = { title: "Learner" };

export default async function AdminLearnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; message?: string }>;
}) {
  const admin = await requireAdmin();
  const id = decodeURIComponent((await params).id);
  const { notice, message } = await searchParams;
  const learner = await learnerDetail(id);
  if (!learner) notFound();
  const [progress, more, courses] = await Promise.all([learnerDashboard(id).catch(() => null), learnerInsight(id), deepDiveCourses()]);
  const back = `/admin/learners/${encodeURIComponent(id)}`;
  return (
    <AdminShell current="/admin/learners" email={admin.user.email}>
      <Link href="/admin/learners" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
        <span aria-hidden="true">←</span> All learners
      </Link>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <div className="mb-3">
        <Avatar name={learner.name} image={more.image} size="lg" alt={more.image ? `${learner.name}'s photo` : `${learner.name}'s initials`} />
      </div>
      <AdminHeading
        title={learner.name || "No name"}
        intro={
          <span className="ph-mask">
            {learner.email} · joined {shortDate(learner.joined)} · email {learner.confirmed ? "confirmed" : "not confirmed yet"}
          </span>
        }
      />
      {progress && (
        <section aria-label="Progress" className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-hero-lavender p-5">
            <p className="text-sm font-semibold text-navy">Essentials progress</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {progress.overall.done} of {progress.overall.total}
            </p>
            <p className="mt-1 text-sm text-ink">steps passed</p>
          </div>
          <div className="rounded-3xl bg-mint p-5">
            <p className="text-sm font-semibold text-navy">Up next</p>
            <p className="mt-2 font-semibold">{progress.next ? `Module ${progress.next.moduleOrder}, ${progress.next.label}` : "Everything open is passed"}</p>
          </div>
          <div className="rounded-3xl bg-peach p-5">
            <p className="text-sm font-semibold text-navy">Days learning</p>
            <p className="mt-2 font-display text-3xl font-bold">{progress.stats.daysLearning}</p>
          </div>
        </section>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section id="profile" aria-labelledby="profile-title" className={`${card} scroll-mt-24`}>
          <h2 id="profile-title" className="text-lg font-bold">
            Account and settings
          </h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Logs in with</dt>
              <dd className="font-semibold">{more.signIn.join(", ") || "Nothing linked"}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Signed in on</dt>
              <dd className="font-semibold">
                {more.sessions.active} {more.sessions.active === 1 ? "device" : "devices"}
                {more.sessions.lastSeen ? ` · last seen ${shortDate(more.sessions.lastSeen)}` : ""}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Language</dt>
              <dd className="font-semibold">{LOCALES.find((l) => l.code === more.locale)?.name ?? more.locale}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Leaderboards</dt>
              <dd className="font-semibold">{more.leaderboardHidden ? "Hidden" : "Shown"}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Organisations</dt>
              <dd className="font-semibold">
                {more.organisations.length
                  ? more.organisations.map((o, i) => (
                      <span key={o.id}>
                        {i > 0 && ", "}
                        <Link href={`/admin/organisations/${o.id}`} className="underline underline-offset-4">
                          {o.name}
                        </Link>{" "}
                        ({o.role})
                      </span>
                    ))
                  : "None"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ...(more.image ? [{ what: "photo", label: "Remove photo" }] : []),
              { what: more.leaderboardHidden ? "show" : "hide", label: more.leaderboardHidden ? "Show on leaderboards" : "Hide from leaderboards" },
              ...(more.sessions.active ? [{ what: "sign-out", label: "Sign out everywhere" }] : []),
              ...(learner.confirmed ? [] : [{ what: "confirm-email", label: "Mark email as confirmed" }]),
            ].map((a) => (
              <form key={a.what} action={learnerProfileAction}>
                <input type="hidden" name="learner" value={learner.id} />
                <input type="hidden" name="what" value={a.what} />
                <button type="submit" className={outline}>
                  {a.label}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section aria-labelledby="points-title" className={card}>
          <h2 id="points-title" className="text-lg font-bold">
            Points and forum
          </h2>
          {more.rewards && (
            <p className="mt-2 text-sm">
              <b>{more.rewards.total}</b> points ({more.rewards.week} this week) · streak {more.rewards.streak} days · badges:{" "}
              {more.rewards.badges.filter((b) => b.earned).map((b) => `${b.emoji} ${b.name}`).join(", ") || "none yet"}
            </p>
          )}
          <p className="mt-2 text-sm">
            {more.forum.threads} questions or discussions · {more.forum.posts} replies
            {more.forum.hidden ? ` · ${more.forum.hidden} hidden by moderators` : ""}
          </p>
          {more.recentPosts.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {more.recentPosts.map((p, i) => (
                <li key={i} className="rounded-xl bg-canvas p-3 text-sm">
                  <Link href={`/forum/t/${p.threadId}`} className="font-semibold underline-offset-4 hover:underline">
                    {p.kind === "question" ? "Asked" : "Replied to"}: {p.title}
                  </Link>
                  <span className="block text-muted">
                    {shortDate(p.at)}
                    {p.hidden ? " · hidden" : ""}
                  </span>
                  <span className="block whitespace-pre-line text-ink">{p.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm">
            <Link href="/admin/forum" className="font-semibold underline underline-offset-4">
              Moderate the forum
            </Link>
          </p>
        </section>

        <section id="access" aria-labelledby="access-title" className={`${card} scroll-mt-24`}>
          <h2 id="access-title" className="text-lg font-bold">
            Deep Dive access and purchases
          </h2>
          {more.access.length ? (
            <ul className="mt-3 grid gap-2">
              {more.access.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas p-3 text-sm">
                  <span>
                    <span className="block font-semibold">{a.what}</span>
                    <span className="block text-muted">
                      {{ purchase: "Bought", subscription: "Subscription", test: "Test purchase", admin: "Given by an admin", gift: "Gift" }[a.source] ?? a.source}
                      {" · "}
                      {a.active ? (a.ends ? `until ${shortDate(a.ends)}` : "for good") : `ended ${a.ends ? shortDate(a.ends) : ""}`}
                    </span>
                  </span>
                  {a.active && ["admin", "test", "gift"].includes(a.source) && (
                    <form action={endAccessAction}>
                      <input type="hidden" name="learner" value={learner.id} />
                      <input type="hidden" name="entitlement" value={a.id} />
                      <button type="submit" className={outline}>
                        End access<span className="sr-only">: {a.what}</span>
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No paid access.</p>
          )}
          <form action={giveAccessAction} className="mt-4 grid gap-2 rounded-xl bg-canvas p-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end">
            <input type="hidden" name="learner" value={learner.id} />
            <label className="text-sm font-semibold">
              Give access to
              <select name="course" className={`${input} mt-1`} defaultValue="all">
                <option value="all">All-access (every course)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Days
              <input name="days" type="number" min={1} max={3650} placeholder="For good" className={`${input} mt-1`} />
            </label>
            <button type="submit" className={button}>
              Give access
            </button>
          </form>
          <h3 className="mt-5 font-bold">Purchases</h3>
          {more.purchases.length ? (
            <ul className="mt-2 grid gap-1 text-sm">
              {more.purchases.map((p) => (
                <li key={p.id}>
                  {p.title} · {money(p.amount, p.currency)}
                  {p.discount ? ` (${p.discount})` : ""} · {shortDate(p.at)}
                  {p.status === "refunded" ? " · refunded" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted">Nothing bought.</p>
          )}
          <p className="mt-2 text-xs text-muted">Refunds of real payments are made in Stripe; the course locks again automatically.</p>
        </section>

        <section aria-labelledby="courses-title" className={card}>
          <h2 id="courses-title" className="text-lg font-bold">
            Other courses
          </h2>
          {more.courses.length ? (
            <ul className="mt-3 grid gap-1 text-sm">
              {more.courses.map((c) => (
                <li key={c.slug}>
                  {c.kind === "deep_dive" ? "Deep Dive: " : ""}
                  {c.title} · {c.done} of {c.total} done
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Not started any.</p>
          )}
          <h3 className="mt-5 font-bold">Latest activity</h3>
          {more.activity.length ? (
            <ol className="mt-2 grid gap-1 text-sm">
              {more.activity.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-20 shrink-0 text-muted">{shortDate(a.at)}</span>
                  <span>
                    {a.kind}
                    {a.what ? `: ${a.what}` : ""}
                    {a.passed === true && (a.kind.includes("check") || a.kind === "final") ? " · passed" : ""}
                    {a.passed === false && (a.kind.includes("check") || a.kind === "final") ? " · not passed" : ""}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 text-sm text-muted">Nothing yet.</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="results-title" className={card}>
          <h2 id="results-title" className="text-lg font-bold">
            Results
          </h2>
          <p className="mt-1 text-sm text-muted">
            If a check has a tries limit and the learner has used them all, you can give one more try.
          </p>
          {learner.results.length ? (
            <ul className="mt-4 space-y-2">
              {learner.results.map((r) => (
                <li key={`${r.kind}-${r.key}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block font-semibold">{checkName(r.kind, r.key)}</span>
                    <span className="block text-sm text-muted">
                      <span className={r.passed ? "font-semibold text-teal" : "font-semibold text-navy"}>{r.passed ? "Passed" : "Not passed yet"}</span>
                      {` · best ${r.best} of ${r.questions} · ${r.tries} ${r.tries === 1 ? "try" : "tries"}`}
                      {learner.extraTries[r.key] ? ` · ${learner.extraTries[r.key]} extra given` : ""}
                      {` · ${shortDate(r.last)}`}
                    </span>
                  </span>
                  {!r.passed && (
                    <form action={grantTryAction}>
                      <input type="hidden" name="learner" value={learner.id} />
                      <input type="hidden" name="key" value={r.key} />
                      <button type="submit" className={outline}>
                        Give one more try<span className="sr-only">: {checkName(r.kind, r.key)}</span>
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No checks taken yet.</p>
          )}
        </section>

        <section aria-labelledby="certs-title" className={card}>
          <h2 id="certs-title" className="text-lg font-bold">
            Certificates
          </h2>
          {learner.certificates.length ? (
            <ul className="mt-4 space-y-3">
              {learner.certificates.map((c) => (
                <li key={c.code} className="rounded-xl bg-canvas p-3">
                  <p className="font-semibold">{certificateName(c.kind, c.moduleSlug)}</p>
                  <p className="text-sm text-muted">
                    <Link href={`/verify/${c.code}`} className="font-mono text-navy underline underline-offset-4">
                      {c.code}
                    </Link>{" "}
                    · <span className="ph-mask">{c.name}</span> · {shortDate(c.issuedAt)}
                  </p>
                  <CertificateActions code={c.code} withdrawn={c.withdrawn} back={back} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No certificates yet.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

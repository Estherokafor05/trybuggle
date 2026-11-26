import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@course";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { card, certificateName, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { overview, requireAdmin } from "@/server/admin";
import { money } from "@/server/pricing";

export const metadata: Metadata = { title: "Overview" };

function Tile({ label, value, detail, tone = "bg-white border border-line" }: { label: string; value: number | string; detail?: string; tone?: string }) {
  return (
    <div className={`rounded-3xl p-5 ${tone}`}>
      <p className="text-sm font-semibold text-navy">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      {detail && <p className="mt-1 text-sm text-ink">{detail}</p>}
    </div>
  );
}

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const admin = await requireAdmin();
  const { notice } = await searchParams;
  const data = await overview();
  const passRate = data.checksTaken ? Math.round((data.checksPassed / data.checksTaken) * 100) : 0;
  return (
    <AdminShell current="/admin" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} />
      <AdminHeading title={`Hello, ${admin.user.name.split(" ")[0]}`} intro="How Buggle Learn is doing. Numbers are live." />
      <section aria-label="Key numbers" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Learners" value={data.learners} detail={`${data.newThisWeek} new this week, ${data.newThisMonth} this month`} tone="bg-hero-lavender" />
        <Tile label="Active this week" value={data.activeThisWeek} detail="Took at least one check" tone="bg-mint" />
        <Tile label="Checks taken" value={data.checksTaken} detail={`${passRate}% passed`} tone="bg-peach" />
        <Tile label="Essentials certificates" value={data.essentials} detail={`${data.withdrawn} withdrawn`} tone="bg-blush" />
      </section>
      <section aria-label="More numbers" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/organisations" className="rounded-3xl border border-line bg-white p-5 hover:bg-lavender">
          <p className="text-sm font-semibold text-navy">👥 Organisations</p>
          <p className="mt-2 font-display text-3xl font-bold">{data.organisations}</p>
        </Link>
        <Link href="/admin/payments" className="rounded-3xl border border-line bg-white p-5 hover:bg-lavender">
          <p className="text-sm font-semibold text-navy">💳 Paid, last 30 days</p>
          <p className="mt-2 font-display text-3xl font-bold">{money(data.revenueMonth)}</p>
          <p className="mt-1 text-sm text-ink">{data.paidLearners} learners with Deep Dive access</p>
        </Link>
        <Link href="/admin/forum" className="rounded-3xl border border-line bg-white p-5 hover:bg-lavender">
          <p className="text-sm font-semibold text-navy">💬 Forum this week</p>
          <p className="mt-2 font-display text-3xl font-bold">{data.forumWeek}</p>
          <p className="mt-1 text-sm text-ink">{data.openReports} reports waiting</p>
        </Link>
        <Link href="/admin/learners" className="rounded-3xl border border-line bg-white p-5 hover:bg-lavender">
          <p className="text-sm font-semibold text-navy">🔎 Find a learner</p>
          <p className="mt-2 text-sm text-ink">Everything about one person: progress, purchases, settings, forum, and changes you can make.</p>
        </Link>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="funnel-title" className={card}>
          <h2 id="funnel-title" className="text-lg font-bold">
            How far learners get
          </h2>
          <p className="mt-1 text-sm text-muted">Learners who have passed each module&apos;s final assessment.</p>
          <ul className="mt-4 space-y-3">
            <li>
              <Row label="Started learning" value={data.startedLearning} of={data.learners} />
            </li>
            {[...modules]
              .sort((a, b) => a.order - b.order)
              .filter((m) => m.slug in data.modulesPassed || m.lessons.length)
              .map((m) => (
                <li key={m.slug}>
                  <Row label={`Module ${m.order}: ${m.title}`} value={data.modulesPassed[m.slug] ?? 0} of={data.learners} />
                </li>
              ))}
          </ul>
        </section>

        <section aria-labelledby="recent-title" className={card}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="recent-title" className="text-lg font-bold">
              Latest certificates
            </h2>
            <Link href="/admin/certificates" className="text-sm font-semibold text-navy underline underline-offset-4">
              See all
            </Link>
          </div>
          {data.recentCertificates.length ? (
            <ul className="mt-4 space-y-2">
              {data.recentCertificates.map((c) => (
                <li key={c.code} className="rounded-xl bg-canvas px-3 py-2.5">
                  <p className="ph-mask font-semibold">{c.name}</p>
                  <p className="text-sm text-muted">
                    {certificateName(c.kind, c.moduleSlug)} · <span className="font-mono">{c.code}</span> · {shortDate(c.issuedAt)}
                    {c.withdrawn && " · Withdrawn"}
                  </p>
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

function Row({ label, value, of }: { label: string; value: number; of: number }) {
  const percent = of ? Math.round((value / of) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-muted">
          {value} ({percent}%)
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-canvas ring-1 ring-line/70" aria-hidden="true">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

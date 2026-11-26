import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminOrgAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { button, card, input, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { requireAdmin } from "@/server/admin";
import { organisationInsight } from "@/server/admin-insight";
import { isActive, planIncludes } from "@/server/organisations";
import { money } from "@/server/pricing";

export const metadata: Metadata = { title: "Organisation" };

const statusText = { none: "No plan", active: "Active", past_due: "Payment due", cancelled: "Cancelled", test: "Test plan" };

export default async function AdminOrganisationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; message?: string }>;
}) {
  const admin = await requireAdmin();
  const [{ id }, { notice, message }] = await Promise.all([params, searchParams]);
  const data = await organisationInsight(id);
  if (!data) notFound();
  const { org } = data;
  const has = planIncludes(org.plan);
  const f = (what: string) => (
    <>
      <input type="hidden" name="org" value={org.id} />
      <input type="hidden" name="what" value={what} />
    </>
  );
  return (
    <AdminShell current="/admin/organisations" email={admin.user.email}>
      <Link href="/admin/organisations" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
        <span aria-hidden="true">←</span> All organisations
      </Link>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title={org.name}
        intro={
          <span className="ph-mask">
            /org/{org.slug} · created {shortDate(data.created)}
            {data.creator ? ` by ${data.creator}` : ""}
          </span>
        }
      />
      <section aria-label="Plan" className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Plan", value: org.plan ? { content: "Buggle content", platform: "Own space", both: "Both" }[org.plan] : "None", tone: "bg-hero-lavender" },
          { label: "Status", value: isActive(org) ? statusText[org.status] : org.status === "none" ? "No plan" : "Not active", tone: "bg-mint" },
          { label: "Places used", value: `${org.members} of ${org.seats}`, tone: "bg-peach" },
          { label: "Renews or ends", value: org.periodEnd ? `${shortDate(org.periodEnd)} (${org.billingInterval === "month" ? "monthly" : "yearly"})` : "–", tone: "bg-blush" },
        ].map((s) => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.tone}`}>
            <p className="text-sm font-semibold text-navy">{s.label}</p>
            <p className="mt-2 font-semibold">{s.value}</p>
          </div>
        ))}
      </section>
      <p className="mb-6 text-sm text-muted">
        Includes: {[has.members && "members", has.dashboard && "team dashboard", has.deepDive && "every Deep Dive course", has.ownCourses && "own courses"].filter(Boolean).join(", ") || "nothing yet"}
        {org.stripeSubscriptionId ? " · pays through Stripe" : org.status === "active" ? " · given by an admin (no payment)" : ""}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="members-title" className={card}>
          <h2 id="members-title" className="text-lg font-bold">
            Members ({data.members.length})
          </h2>
          <ul className="mt-3 divide-y divide-line/70">
            {data.members.map((m) => (
              <li key={m.id} className="grid gap-2 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">
                    <Link href={`/admin/learners/${encodeURIComponent(m.id)}`} className="font-semibold underline-offset-4 hover:underline">
                      {m.name || "No name"}
                    </Link>
                    <span className="ph-mask block break-all text-sm text-muted">
                      {m.email} · {m.role} · {m.done} of {m.total} steps{m.certificate ? " · certificate" : ""}
                      {m.lastActive ? ` · active ${shortDate(m.lastActive)}` : ""}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={adminOrgAction} className="flex items-end gap-2">
                    {f("role")}
                    <input type="hidden" name="user" value={m.id} />
                    <label className="text-sm font-semibold">
                      <span className="sr-only">Role for {m.name}</span>
                      <select name="role" defaultValue={m.role} className={input}>
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                      </select>
                    </label>
                    <button type="submit" className={outline}>
                      Save role<span className="sr-only"> for {m.name}</span>
                    </button>
                  </form>
                  {m.role !== "owner" && (
                    <form action={adminOrgAction}>
                      {f("remove")}
                      <input type="hidden" name="user" value={m.id} />
                      <button type="submit" className={outline}>
                        Remove<span className="sr-only"> {m.name}</span>
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid content-start gap-6">
          <section aria-labelledby="give-title" className={card}>
            <h2 id="give-title" className="text-lg font-bold">
              Give a plan without payment
            </h2>
            <p className="mt-1 text-sm text-muted">For partners or pilots. It ends on its own after the days you choose. If they later pay through Stripe, that takes over.</p>
            <form action={adminOrgAction} className="mt-3 grid gap-3">
              {f("plan")}
              <label className="text-sm font-semibold">
                Plan
                <select name="plan" defaultValue={org.plan ?? "content"} className={`${input} mt-1`}>
                  <option value="content">Buggle content</option>
                  <option value="platform">Own space</option>
                  <option value="both">Both</option>
                  <option value="none">End the plan</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm font-semibold">
                  Places
                  <input name="seats" type="number" min={1} max={10000} defaultValue={Math.max(org.seats, org.members, 1)} className={`${input} mt-1`} />
                </label>
                <label className="text-sm font-semibold">
                  Days
                  <input name="days" type="number" min={1} max={3650} defaultValue={30} className={`${input} mt-1`} />
                </label>
              </div>
              <button type="submit" className={`${button} justify-self-start`}>
                Save plan
              </button>
            </form>
          </section>

          <section aria-labelledby="name-title" className={card}>
            <h2 id="name-title" className="text-lg font-bold">
              Name
            </h2>
            <form action={adminOrgAction} className="mt-3 flex flex-wrap items-end gap-2">
              {f("rename")}
              <label className="min-w-0 flex-1 text-sm font-semibold">
                Organisation name
                <input name="name" defaultValue={org.name} minLength={2} maxLength={80} required className={`${input} mt-1`} />
              </label>
              <button type="submit" className={outline}>
                Save name
              </button>
            </form>
          </section>

          <section aria-labelledby="oc-title" className={card}>
            <h2 id="oc-title" className="text-lg font-bold">
              Their own courses
            </h2>
            {data.courses.length ? (
              <ul className="mt-2 grid gap-1 text-sm">
                {data.courses.map((c) => (
                  <li key={c.id}>
                    {c.title} · {c.status} · {c.lessons} lessons
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">None.</p>
            )}
          </section>

          <section aria-labelledby="pay-title" className={card}>
            <h2 id="pay-title" className="text-lg font-bold">
              Payments
            </h2>
            {data.purchases.length ? (
              <ul className="mt-2 grid gap-1 text-sm">
                {data.purchases.map((p, i) => (
                  <li key={i}>
                    {shortDate(p.at)} · {money(p.amount, p.currency)} · {p.interval === "month" ? "monthly" : "yearly"}
                    {p.discount ? ` (${p.discount})` : ""}
                    {p.status === "refunded" ? " · refunded" : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No payments.</p>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { card, shortDate } from "@/components/admin/format";
import { requireAdmin } from "@/server/admin";
import { allPayments } from "@/server/admin-insight";
import { stripeConfigured, testMode } from "@/server/payments";
import { money } from "@/server/pricing";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const admin = await requireAdmin();
  const { totals, payments } = await allPayments();
  return (
    <AdminShell current="/admin/payments" email={admin.user.email}>
      <AdminHeading
        title="Payments"
        intro={`Every course, all-access and organisation payment. Amounts are what was charged in US dollars. ${
          stripeConfigured() ? (testMode() ? "Stripe test mode: no real money." : "Stripe live mode.") : "Stripe isn't set up yet."
        }`}
      />
      <section aria-label="Totals" className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Paid, all time", value: money(totals.paid), tone: "bg-hero-lavender" },
          { label: "Paid, last 30 days", value: money(totals.month), tone: "bg-mint" },
          { label: "All-access subscribers now", value: String(totals.subscribers), tone: "bg-peach" },
          { label: "Refunds", value: String(totals.refunds), tone: "bg-blush" },
        ].map((s) => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.tone}`}>
            <p className="text-sm font-semibold text-navy">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </section>
      <section aria-labelledby="list-title" className={card}>
        <h2 id="list-title" className="text-lg font-bold">
          Latest 200
        </h2>
        {payments.length ? (
          <ul className="mt-3 divide-y divide-line/70">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold">{p.what}</span>
                  <span className="ph-mask block break-all text-muted">
                    {p.learner ? (
                      <Link href={`/admin/learners/${encodeURIComponent(p.learner.id)}`} className="underline underline-offset-4">
                        {p.learner.email || "A learner"}
                      </Link>
                    ) : p.org ? (
                      <Link href={`/admin/organisations/${p.org.id}`} className="underline underline-offset-4">
                        {p.org.name}
                      </Link>
                    ) : (
                      "Deleted account"
                    )}{" "}
                    · {shortDate(p.at)}
                    {p.discount ? ` · discount: ${p.discount}` : ""}
                  </span>
                </span>
                <span className="font-semibold">
                  {money(p.amount, p.currency)}
                  {p.status === "refunded" ? " · refunded" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No payments yet.</p>
        )}
      </section>
    </AdminShell>
  );
}

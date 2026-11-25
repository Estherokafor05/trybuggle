import type { Metadata } from "next";
import { savePlanAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { button, card, input, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { requireAdmin } from "@/server/admin";
import { allOrganisations, listPlans, money } from "@/server/organisations";
import { stripeConfigured, testMode } from "@/server/payments";

export const metadata: Metadata = { title: "Organisations" };

const statusText = { none: "No plan", active: "Active", past_due: "Payment due", cancelled: "Cancelled", test: "Test plan" };

export default async function AdminOrganisationsPage({ searchParams }: { searchParams: Promise<{ notice?: string; message?: string }> }) {
  const admin = await requireAdmin();
  const { notice, message } = await searchParams;
  const [plans, orgs] = await Promise.all([listPlans(), allOrganisations()]);
  return (
    <AdminShell current="/admin/organisations" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading title="Organisations" intro="Set each plan's price per learner (yearly, and monthly if you offer it), switch plans on or off, and see every organisation. Prices for learners, offers and discount codes are under Pricing." />
      <p className="mb-6 rounded-2xl bg-lavender p-4 text-sm leading-relaxed">
        Payments:{" "}
        <b>{stripeConfigured() ? (testMode() ? "Stripe test mode (no real money)" : "Stripe live mode (real payments)") : "Stripe not set up: test sites can switch plans on without paying"}</b>
      </p>
      <section id="prices" aria-labelledby="prices-title" className={`${card} scroll-mt-24`}>
        <h2 id="prices-title" className="text-lg font-bold">
          Plans and prices
        </h2>
        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <li key={p.code} className="rounded-2xl bg-canvas p-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted">{p.description}</p>
              <form action={savePlanAction} className="mt-3 grid gap-3">
                <input type="hidden" name="code" value={p.code} />
                <div className="grid grid-cols-[1fr_6rem] gap-2">
                  <label className="text-sm font-semibold">
                    Price per learner, per year
                    <input name="price" inputMode="decimal" required defaultValue={(p.pricePerSeatYear / 100).toFixed(2)} className={`${input} mt-1`} />
                  </label>
                  <label className="text-sm font-semibold">
                    Currency
                    <input name="currency" required maxLength={3} defaultValue={p.currency.toUpperCase()} className={`${input} mt-1 uppercase`} />
                  </label>
                </div>
                <label className="text-sm font-semibold">
                  Price per learner, per month <span className="font-normal text-muted">(0 for yearly only)</span>
                  <input name="monthly" inputMode="decimal" defaultValue={(p.pricePerSeatMonth / 100).toFixed(2)} className={`${input} mt-1`} />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input name="active" type="checkbox" defaultChecked={p.active} className="size-5 accent-brand" /> Offer this plan
                </label>
                <p className="text-xs text-muted">
                  Now:{" "}
                  {p.active
                    ? `${money(p.pricePerSeatYear, p.currency)} per learner per year${p.pricePerSeatMonth ? ` or ${money(p.pricePerSeatMonth, p.currency)} per month` : ""}`
                    : "not offered"}
                </p>
                <button type="submit" className={`${button} justify-self-start`}>
                  Save<span className="sr-only"> {p.name}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="orgs-title" className={`${card} mt-6`}>
        <h2 id="orgs-title" className="text-lg font-bold">
          All organisations ({orgs.length})
        </h2>
        {orgs.length ? (
          <ul className="mt-3 divide-y divide-line/70">
            {orgs.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-semibold">{o.name}</span>
                  <span className="ph-mask block break-all text-sm text-muted">
                    Owner {o.owner ?? "none"} · created {shortDate(o.created)}
                  </span>
                </span>
                <span className="text-sm text-muted">
                  {statusText[o.status]} · {o.plan ?? "no plan"} · {o.members} of {o.seats} places
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No organisations yet.</p>
        )}
      </section>
    </AdminShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { saveCodeAction, saveLearnerPricesAction, saveOffersAction, toggleCodeAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { button, card, input, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { requireAdmin } from "@/server/admin";
import { stripeConfigured, testMode } from "@/server/payments";
import { learnerPrices, listCodes, money, offers, PRICE_NAMES, type PriceCode } from "@/server/pricing";

export const metadata: Metadata = { title: "Pricing" };

const FOR = { any: "Anything", course: "One course", all_access: "All-access", org: "Organisation plans" } as const;

export default async function AdminPricingPage({ searchParams }: { searchParams: Promise<{ notice?: string; message?: string }> }) {
  const admin = await requireAdmin();
  const { notice, message } = await searchParams;
  const [prices, o, codes] = await Promise.all([learnerPrices(), offers(), listCodes()]);
  return (
    <AdminShell current="/admin/pricing" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title="Pricing"
        intro="Prices are in US dollars. At checkout, Stripe shows them in the payer's own currency. Anything without a price stays switched off. Only the biggest discount applies to a payment."
      />
      <p className="mb-6 rounded-2xl bg-lavender p-4 text-sm leading-relaxed">
        Payments:{" "}
        <b>{stripeConfigured() ? (testMode() ? "Stripe test mode (no real money)" : "Stripe live mode (real payments)") : "Stripe not set up: test sites use test purchases"}</b>.
        Organisation plan prices are under{" "}
        <Link href="/admin/organisations#prices" className="font-semibold underline underline-offset-4">
          Organisations
        </Link>
        .
      </p>

      <section id="learners" aria-labelledby="learners-title" className={`${card} scroll-mt-24`}>
        <h2 id="learners-title" className="text-lg font-bold">
          💳 Learner prices
        </h2>
        <form action={saveLearnerPricesAction} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(PRICE_NAMES) as PriceCode[]).map((code) => (
              <fieldset key={code} className="grid gap-2 rounded-2xl bg-canvas p-4">
                <legend className="font-bold">{PRICE_NAMES[code]}</legend>
                <label className="text-sm font-semibold">
                  Price in USD
                  <input name={`${code}.amount`} inputMode="decimal" defaultValue={(prices[code].amount / 100).toFixed(2)} className={`${input} mt-1`} />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input name={`${code}.active`} type="checkbox" defaultChecked={prices[code].active} className="size-5 accent-brand" /> Offer this
                </label>
                <p className="text-xs text-muted">Now: {prices[code].active ? money(prices[code].amount) : "not offered"}</p>
              </fieldset>
            ))}
          </div>
          <p className="text-sm text-muted">One price for every Deep Dive course, including the paid part of &quot;What is AI&quot;.</p>
          <button type="submit" className={`${button} justify-self-start`}>
            Save learner prices
          </button>
        </form>
      </section>

      <section id="offers" aria-labelledby="offers-title" className={`${card} mt-6 scroll-mt-24`}>
        <h2 id="offers-title" className="text-lg font-bold">
          🎉 Launch offer and sales
        </h2>
        <form action={saveOffersAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <fieldset className="grid gap-2 rounded-2xl bg-canvas p-4">
            <legend className="font-bold">Launch offer</legend>
            <p className="text-sm text-muted">Off a person&apos;s or organisation&apos;s first purchase: their first course, or the first payment of a subscription.</p>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input name="launchOn" type="checkbox" defaultChecked={o.launchOn} className="size-5 accent-brand" /> Launch offer on
            </label>
            <label className="text-sm font-semibold">
              Percent off
              <input name="launchPercent" type="number" min={1} max={90} defaultValue={o.launchPercent} className={`${input} mt-1`} />
            </label>
          </fieldset>
          <fieldset className="grid gap-2 rounded-2xl bg-canvas p-4">
            <legend className="font-bold">Sale on everything</legend>
            <p className="text-sm text-muted">For example 25% off for a week. Set 0 for no sale.</p>
            <label className="text-sm font-semibold">
              Percent off
              <input name="salePercent" type="number" min={0} max={90} defaultValue={o.salePercent} className={`${input} mt-1`} />
            </label>
            <label className="text-sm font-semibold">
              Last day of the sale
              <input name="saleEndsAt" type="date" defaultValue={o.saleEndsAt?.slice(0, 10) ?? ""} className={`${input} mt-1`} />
            </label>
          </fieldset>
          <button type="submit" className={`${button} justify-self-start`}>
            Save offers
          </button>
        </form>
      </section>

      <section id="codes" aria-labelledby="codes-title" className={`${card} mt-6 scroll-mt-24`}>
        <h2 id="codes-title" className="text-lg font-bold">
          🏷️ Discount codes
        </h2>
        <form action={saveCodeAction} className="mt-4 grid gap-3 rounded-2xl bg-canvas p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="text-sm font-semibold">
            Code
            <input name="code" required maxLength={30} placeholder="LAUNCH20" className={`${input} mt-1 uppercase`} />
          </label>
          <label className="text-sm font-semibold">
            Percent off
            <input name="percent" type="number" min={1} max={100} required defaultValue={20} className={`${input} mt-1`} />
          </label>
          <label className="text-sm font-semibold">
            For
            <select name="appliesTo" className={`${input} mt-1`} defaultValue="any">
              {Object.entries(FOR).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Last day <span className="font-normal text-muted">(optional)</span>
            <input name="expiresAt" type="date" className={`${input} mt-1`} />
          </label>
          <label className="text-sm font-semibold">
            Most uses <span className="font-normal text-muted">(optional)</span>
            <input name="maxUses" type="number" min={1} className={`${input} mt-1`} />
          </label>
          <button type="submit" className={`${button} justify-self-start`}>
            Save code
          </button>
        </form>
        {codes.length ? (
          <ul className="mt-4 divide-y divide-line/70">
            {codes.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-mono font-semibold">{c.code}</span>
                  <span className="block text-sm text-muted">
                    {c.percent}% off · {FOR[c.appliesTo as keyof typeof FOR]} · used {c.uses}
                    {c.maxUses ? ` of ${c.maxUses}` : ""} times{c.expiresAt ? ` · until ${shortDate(c.expiresAt)}` : ""}
                    {c.active ? "" : " · switched off"}
                  </span>
                </span>
                <form action={toggleCodeAction}>
                  <input type="hidden" name="code" value={c.code} />
                  {!c.active && <input type="hidden" name="active" value="on" />}
                  <button type="submit" className={outline}>
                    {c.active ? "Switch off" : "Switch on"}
                    <span className="sr-only"> {c.code}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No codes yet.</p>
        )}
      </section>
    </AdminShell>
  );
}

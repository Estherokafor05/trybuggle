import type { Metadata } from "next";
import { checkoutAction, portalAction, seatsAction } from "@/app/org/actions";
import { OrgShell, orgButton, orgCard, orgInput, orgOutline } from "@/components/org/OrgShell";
import { isActive, listPlans, money, planIncludes } from "@/server/organisations";
import { loadOrg } from "@/server/org-page";
import { canSimulate, MAX_SEATS, stripeConfigured, testMode } from "@/server/payments";

export const metadata: Metadata = { title: "Plan and billing | Buggle Learn" };
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ notice?: string; error?: string; checkout?: string }> };

const statusText = {
  none: "No plan yet",
  active: "Active",
  past_due: "Payment due: please update your card",
  cancelled: "Cancelled",
  test: "Test plan (no payment taken)",
};

export default async function OrgBillingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const { org, role } = await loadOrg(slug, "/billing", { manage: true });
  const plans = await listPlans({ activeOnly: true });
  const current = plans.find((p) => p.code === org.plan) ?? (await listPlans()).find((p) => p.code === org.plan) ?? null;
  const owner = role === "owner";
  const active = isActive(org);
  const notice = q.checkout === "done" ? (active ? "Thank you. Your plan is active." : "Thank you. Your payment is being confirmed; this page updates in a moment.") : q.notice;
  const simulate = canSimulate();
  const has = planIncludes(org.plan);
  return (
    <OrgShell org={org} role={role} current="/billing" notice={notice} error={q.checkout === "cancelled" ? "Checkout was cancelled. Nothing was charged." : q.error}>
      <section aria-labelledby="current-title" className={orgCard}>
        <h2 id="current-title" className="text-lg font-bold">
          Your plan
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Plan</dt>
            <dd className="font-semibold">{active && current ? current.name : "None"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Status</dt>
            <dd className="font-semibold">{statusText[org.status]}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Places</dt>
            <dd className="font-semibold">{org.seats ? `${org.members} used of ${org.seats}` : "None yet"}</dd>
          </div>
        </dl>
        {active && org.periodEnd && (
          <p className="mt-3 text-sm text-muted">
            Paid {org.billingInterval === "month" ? "monthly" : "yearly"}. Renews on {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(org.periodEnd))}.
          </p>
        )}
        {active && (
          <ul className="mt-4 grid gap-1 text-sm">
            <li>✓ Add members and see their progress</li>
            <li>✓ Your name and logo on members&apos; dashboards</li>
            {has.deepDive && <li>✓ The Deep Dive for every member, when it launches</li>}
            {has.ownCourses && <li>✓ Your own courses: coming with the course builder</li>}
          </ul>
        )}
        {active && owner && (
          <div className="mt-5 grid gap-4 border-t border-line/70 pt-5 sm:grid-cols-2">
            <form action={seatsAction} className="grid gap-2">
              <input type="hidden" name="org" value={org.slug} />
              <label className="grid gap-1 text-sm font-semibold">
                Number of places
                <input name="seats" type="number" min={Math.max(1, org.members)} max={MAX_SEATS} defaultValue={org.seats} required className={orgInput} />
              </label>
              <p className="text-xs text-muted">Adding places charges the difference for the rest of the year. Removing them gives a credit.</p>
              <button type="submit" className={`${orgOutline} justify-self-start`}>
                Change places
              </button>
            </form>
            {org.stripeCustomerId && stripeConfigured() && (
              <form action={portalAction} className="grid content-start gap-2">
                <input type="hidden" name="org" value={org.slug} />
                <p className="text-sm font-semibold">Card, invoices and cancelling</p>
                <p className="text-xs text-muted">Opens Stripe&apos;s secure billing page.</p>
                <button type="submit" className={`${orgOutline} justify-self-start`}>
                  Manage billing
                </button>
              </form>
            )}
          </div>
        )}
        {!owner && <p className="mt-4 text-sm text-muted">Only the owner can choose or change the plan.</p>}
      </section>

      {owner && !active && (
        <section aria-labelledby="choose-title" className="mt-6">
          <h2 id="choose-title" className="text-2xl font-bold">
            Choose a plan
          </h2>
          {simulate && (
            <p className="mt-2 rounded-2xl bg-peach p-4 text-sm leading-relaxed">
              <b>Test site:</b> payments aren&apos;t set up here, so choosing a plan switches it on without paying.
            </p>
          )}
          {stripeConfigured() && testMode() && (
            <p className="mt-2 rounded-2xl bg-peach p-4 text-sm leading-relaxed">
              <b>Stripe test mode:</b> use card 4242 4242 4242 4242, any future date and any 3 digits. No real money is taken.
            </p>
          )}
          {plans.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-5 text-muted ring-1 ring-line/70">Plans and prices are being finalised. Please check back soon.</p>
          ) : (
            <form action={checkoutAction} className="mt-4 grid gap-5">
              <input type="hidden" name="org" value={org.slug} />
              <fieldset>
                <legend className="sr-only">Plan</legend>
                <div className="grid gap-3 md:grid-cols-3">
                  {plans.map((p, i) => (
                    <label key={p.code} className="flex cursor-pointer flex-col gap-2 rounded-3xl border-2 border-line bg-white p-5 has-[:checked]:border-brand has-[:checked]:bg-lavender">
                      <span className="flex items-center gap-2 font-bold">
                        <input type="radio" name="plan" value={p.code} required defaultChecked={i === 0} className="size-4 accent-brand" />
                        {p.name}
                      </span>
                      <span className="font-display text-2xl font-bold">
                        {money(p.pricePerSeatYear, p.currency)} <span className="font-sans text-sm font-semibold text-navy">per learner, per year</span>
                      </span>
                      {p.pricePerSeatMonth > 0 && (
                        <span className="text-sm font-semibold text-navy">or {money(p.pricePerSeatMonth, p.currency)} per learner, per month</span>
                      )}
                      <span className="text-sm leading-relaxed text-ink/85">{p.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {plans.some((p) => p.pricePerSeatMonth > 0) && (
                <fieldset className="grid gap-2">
                  <legend className="font-semibold">Pay</legend>
                  <label className="flex min-h-11 items-center gap-2">
                    <input type="radio" name="interval" value="year" defaultChecked className="size-5 accent-brand" /> Yearly
                  </label>
                  <label className="flex min-h-11 items-center gap-2">
                    <input type="radio" name="interval" value="month" className="size-5 accent-brand" /> Monthly (plans with a monthly price)
                  </label>
                </fieldset>
              )}
              <label className="grid max-w-xs gap-1 font-semibold">
                Discount code <span className="text-sm font-normal text-muted">(optional)</span>
                <input name="code" maxLength={30} autoComplete="off" className={`${orgInput} uppercase`} />
              </label>
              <label className="grid max-w-xs gap-1 font-semibold">
                Number of places
                <input name="seats" type="number" min={Math.max(1, org.members)} max={MAX_SEATS} defaultValue={Math.max(5, org.members)} required className={orgInput} />
                <span className="text-sm font-normal text-muted">One place per learner, including you if you&apos;ll learn too.</span>
              </label>
              <button type="submit" className={`${orgButton} justify-self-start`}>
                {simulate ? "Switch on test plan" : "Continue to secure payment"}
              </button>
            </form>
          )}
        </section>
      )}
    </OrgShell>
  );
}

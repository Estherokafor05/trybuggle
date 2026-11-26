import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkles } from "@/components/Sparkles";
import { listPlans } from "@/server/organisations";
import { learnerPrices, money, offers } from "@/server/pricing";

export const metadata: Metadata = {
  title: "Prices | Buggle Learn",
  description: "What's free and what's paid on Buggle Learn: the free Essentials, one Deep Dive course, all-access, and plans for organisations.",
};
export const dynamic = "force-dynamic";

const soon = <span className="font-display text-xl font-bold text-navy">Opening soon</span>;

export default async function PricingPage() {
  const [prices, plans, o] = await Promise.all([learnerPrices().catch(() => null), listPlans({ activeOnly: true }).catch(() => []), offers().catch(() => null)]);
  const sale = o && o.salePercent && o.saleEndsAt && new Date(o.saleEndsAt) > new Date() ? o : null;
  const lowest = plans.length ? plans.reduce((a, b) => (a.pricePerSeatYear <= b.pricePerSeatYear ? a : b)) : null;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          <Sparkles />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Prices</p>
          <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">Start free. Go deeper when you&apos;re ready.</h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink">
            Prices are shown in US dollars; at checkout you pay in your own currency.
            {o?.launchOn ? ` 🎉 ${o.launchPercent}% off your first purchase.` : ""}
            {sale ? ` 🏷️ Sale: ${sale.salePercent}% off everything until ${new Date(sale.saleEndsAt!).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.` : ""}
          </p>
        </header>

        <section aria-labelledby="free-title" className="mt-8 rounded-3xl bg-mint p-6">
          <h2 id="free-title" className="text-xl font-bold">
            ✅ Free for everyone
          </h2>
          <ul className="mt-3 grid gap-1.5 text-ink sm:grid-cols-2">
            {[
              "The Essentials: every module, with the Essentials certificate",
              'Chapter 1 of the Deep Dive course "What is AI"',
              "The forum, points, badges and the leaderboard",
              "Ask Buggle: why an answer is right or wrong",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-teal">
                  ✓
                </span>
                {x}
              </li>
            ))}
          </ul>
          <Link href="/curriculum" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-brand-deep">
            Start learning free
          </Link>
        </section>

        <h2 className="mt-10 text-2xl font-bold">💳 For you</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          <li className="flex flex-col rounded-3xl border border-line bg-white p-6">
            <h3 className="text-xl font-bold">One course</h3>
            <p className="mt-1 text-sm text-muted">Pay once, keep it for good</p>
            <p className="mt-3">{prices?.course.active ? <span className="font-display text-3xl font-bold">{money(prices.course.amount)}</span> : soon}</p>
            <ul className="mt-3 grid gap-1 text-sm text-ink">
              <li>✓ Every chapter and unit of one Deep Dive course</li>
              <li>✓ Its certificate</li>
              <li>✓ Ask AI: 20 questions a day</li>
              <li>✓ Refund until you start its paid chapters</li>
            </ul>
          </li>
          <li className="flex flex-col rounded-3xl border-2 border-brand/50 bg-lavender p-6">
            <h3 className="text-xl font-bold">All-access ⭐</h3>
            <p className="mt-1 text-sm text-ink">Every course, monthly or yearly</p>
            <p className="mt-3">
              {prices?.all_month.active || prices?.all_year.active ? (
                <>
                  {prices.all_month.active && (
                    <span className="block">
                      <span className="font-display text-3xl font-bold">{money(prices.all_month.amount)}</span>
                      <span className="text-sm font-semibold text-navy"> a month</span>
                    </span>
                  )}
                  {prices.all_year.active && (
                    <span className="block">
                      <span className="font-display text-3xl font-bold">{money(prices.all_year.amount)}</span>
                      <span className="text-sm font-semibold text-navy"> a year</span>
                    </span>
                  )}
                </>
              ) : (
                soon
              )}
            </p>
            <ul className="mt-3 grid gap-1 text-sm text-ink">
              <li>✓ Every Deep Dive course, including new ones</li>
              <li>✓ Every course certificate</li>
              <li>✓ Unlimited Ask AI while you&apos;re subscribed</li>
              <li>✓ Cancel any time</li>
            </ul>
          </li>
        </ul>

        <p className="mt-3 rounded-2xl bg-blush p-4 text-sm text-ink">🎁 Coming soon: buy a course or all-access as a gift for a friend.</p>

        <h2 className="mt-10 text-2xl font-bold">👥 For organisations</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { title: "Buggle content", text: "Every Buggle Learn course for your people, with team progress, your logo and name." },
            { title: "Your own space", text: "The course builder for your own courses, with team progress, your logo and name." },
            { title: "Both together", text: "Everything: our courses and your own." },
          ].map((p) => (
            <li key={p.title} className="rounded-3xl border border-line bg-white p-6">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{p.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-ink">
          Priced per learner, monthly or yearly{lowest ? `, from ${money(lowest.pricePerSeatYear, lowest.currency)} per learner per year` : ""}.{" "}
          <Link href="/organisations" className="font-semibold text-navy underline underline-offset-4">
            See organisation plans
          </Link>
        </p>
        <p className="mt-3 rounded-2xl bg-blush p-4 text-sm text-ink">🎁 Coming soon: organisations buying single courses for their colleagues, to keep for good.</p>
      </main>
      <SiteFooter />
    </>
  );
}

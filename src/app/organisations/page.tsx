import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listPlans, money, planIncludes } from "@/server/organisations";

export const metadata: Metadata = {
  title: "For organisations | Buggle Learn",
  description: "Bring Buggle Learn to your company, school or team: add your people, see their progress, and choose the plan that fits.",
};
export const dynamic = "force-dynamic";

const tones = ["bg-lavender", "bg-mint", "bg-peach"];
const features = [
  ["members", "Add your people by email or a join link"],
  ["dashboard", "See everyone's progress and certificates"],
  ["branding", "Your name and logo on their dashboard"],
  ["deepDive", "The Deep Dive for every member, when it launches"],
  ["ownCourses", "Your own courses in your own space (coming with the course builder)"],
] as const;

export default async function OrganisationsPage() {
  const plans = await listPlans({ activeOnly: true }).catch(() => []);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">For organisations</p>
          <h1 className="mt-3 max-w-[22ch] text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">
            Bring Buggle Learn to your team, school or company
          </h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink">
            Add your people, follow their progress, and help everyone understand and use AI safely. Plans are priced per
            learner, per year.
          </p>
          <Link href="/organisations/new" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
            Create an organisation <span aria-hidden="true">→</span>
          </Link>
        </header>
        <section aria-labelledby="plans-title" className="mt-8">
          <h2 id="plans-title" className="text-2xl font-bold">
            Plans
          </h2>
          {plans.length ? (
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {plans.map((plan, i) => {
                const has = planIncludes(plan.code);
                return (
                  <li key={plan.code} className={`flex flex-col rounded-3xl p-6 ${tones[i % tones.length]}`}>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="mt-2 font-display text-3xl font-bold">
                      {money(plan.pricePerSeatYear, plan.currency)}
                      <span className="ml-1 font-sans text-sm font-semibold text-navy">per learner, per year</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/85">{plan.description}</p>
                    <ul className="mt-4 grid gap-1.5 text-sm">
                      {features.map(([key, label]) => (
                        <li key={key} className={`flex gap-2 ${has[key] ? "text-ink" : "text-navy line-through decoration-navy/50"}`}>
                          <span aria-hidden="true" className="font-bold text-teal">
                            {has[key] ? "✓" : "–"}
                          </span>
                          <span>
                            {!has[key] && <span className="sr-only">Not included: </span>}
                            {label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl bg-white p-5 text-muted ring-1 ring-line/70">
              Plans and prices are being finalised. You can create your organisation now and choose a plan when they open.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

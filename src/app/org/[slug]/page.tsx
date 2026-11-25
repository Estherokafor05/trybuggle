import type { Metadata } from "next";
import Link from "next/link";
import { leaveAction } from "@/app/org/actions";
import { OrgShell, orgCard, orgOutline } from "@/components/org/OrgShell";
import { canManage, isActive, memberProgress, planIncludes } from "@/server/organisations";
import { loadOrg } from "@/server/org-page";

export const metadata: Metadata = { title: "Organisation | Buggle Learn" };
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ notice?: string; error?: string }> };

const when = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "Not yet";

export default async function OrgOverviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { notice, error } = await searchParams;
  const { org, role } = await loadOrg(slug);
  const manager = canManage(role);
  const has = planIncludes(org.plan);
  const members = manager ? await memberProgress(org.id) : [];
  const started = members.filter((m) => m.done > 0).length;
  const certified = members.filter((m) => m.certificate).length;
  return (
    <OrgShell org={org} role={role} current="" notice={notice} error={error}>
      {!isActive(org) && manager && (
        <p className="mb-6 rounded-2xl bg-peach p-4 text-sm leading-relaxed">
          <b>No active plan.</b> Choose a plan to add members.{" "}
          <Link href={`/org/${org.slug}/billing`} className="font-semibold text-navy underline underline-offset-4">
            Plan and billing
          </Link>
        </p>
      )}
      {!manager && (
        <section className={orgCard}>
          <h2 className="text-xl font-bold">You&apos;re learning with {org.name}</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Your managers can see your progress, results and certificates. {has.deepDive && "Your organisation includes the Deep Dive when it launches."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard" className={orgOutline}>
              Your dashboard
            </Link>
            <form action={leaveAction}>
              <input type="hidden" name="org" value={org.slug} />
              <button type="submit" className={orgOutline}>
                Leave {org.name}
              </button>
            </form>
          </div>
        </section>
      )}
      {manager && (
        <>
          <section aria-label="Team numbers" className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-hero-lavender p-5">
              <p className="text-sm font-semibold text-navy">Members</p>
              <p className="mt-2 font-display text-3xl font-bold">
                {org.members} <span className="text-base font-semibold text-ink">of {org.seats} places</span>
              </p>
            </div>
            <div className="rounded-3xl bg-mint p-5">
              <p className="text-sm font-semibold text-navy">Started learning</p>
              <p className="mt-2 font-display text-3xl font-bold">{started}</p>
            </div>
            <div className="rounded-3xl bg-peach p-5">
              <p className="text-sm font-semibold text-navy">Essentials certificates</p>
              <p className="mt-2 font-display text-3xl font-bold">{certified}</p>
            </div>
          </section>
          <section aria-labelledby="progress-title" className={`${orgCard} mt-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="progress-title" className="text-lg font-bold">
                Everyone&apos;s progress
              </h2>
              <Link href={`/org/${org.slug}/members`} className="text-sm font-semibold text-navy underline underline-offset-4">
                Add or manage members
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Progress</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Certificate</th>
                    <th scope="col" className="py-2 font-semibold">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-line/60">
                      <td className="py-3 pr-3">
                        <span className="ph-mask block font-semibold">{m.name}</span>
                        <span className="ph-mask block text-muted">{m.email}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <div
                          role="progressbar"
                          aria-label={`${m.name}'s progress`}
                          aria-valuemin={0}
                          aria-valuemax={m.total}
                          aria-valuenow={m.done}
                          aria-valuetext={`${m.done} of ${m.total} steps`}
                          className="h-2.5 w-32 overflow-hidden rounded-full bg-canvas ring-1 ring-line/70"
                        >
                          <div className="h-full rounded-full bg-brand" style={{ width: `${m.total ? (m.done / m.total) * 100 : 0}%` }} />
                        </div>
                        <span className="mt-1 block text-muted">
                          {m.done} of {m.total} steps
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {m.certificate ? (
                          <Link href={`/verify/${m.certificate}`} className="font-semibold text-navy underline underline-offset-4">
                            Earned
                          </Link>
                        ) : (
                          <span className="text-muted">Not yet</span>
                        )}
                      </td>
                      <td className="py-3 text-muted">{when(m.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </OrgShell>
  );
}

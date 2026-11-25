import type { Metadata } from "next";
import { removeAdminAction, revokeInviteAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { InviteForm } from "@/components/admin/InviteForm";
import { card, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { listTeam, requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage({ searchParams }: { searchParams: Promise<{ notice?: string; message?: string }> }) {
  const admin = await requireAdmin();
  const { notice, message } = await searchParams;
  const team = await listTeam();
  return (
    <AdminShell current="/admin/team" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title="Admin team"
        intro="Admin accounts are separate from learner accounts and need an authenticator app. New admins join by invite."
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="admins-title" className={card}>
          <h2 id="admins-title" className="text-lg font-bold">
            Admins
          </h2>
          <ul className="mt-3 divide-y divide-line/70">
            {team.admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="ph-mask block font-semibold">
                    {a.name}
                    {a.id === admin.user.id && " (you)"}
                  </span>
                  <span className="ph-mask block break-all text-sm text-muted">
                    {a.email} · since {shortDate(a.since)} · {a.twoFactor ? "app set up" : "app not set up yet"}
                  </span>
                </span>
                {a.id !== admin.user.id && (
                  <details>
                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-navy underline underline-offset-4">
                      Remove<span className="sr-only"> {a.name}</span>
                    </summary>
                    <form action={removeAdminAction} className="mt-2">
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className={outline}>
                        Yes, remove {a.name.split(" ")[0]}
                      </button>
                    </form>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
        <div className="grid content-start gap-6">
          <section aria-labelledby="invite-title" className={card}>
            <h2 id="invite-title" className="text-lg font-bold">
              Invite an admin
            </h2>
            <InviteForm />
          </section>
          {team.invites.length > 0 && (
            <section aria-labelledby="pending-title" className={card}>
              <h2 id="pending-title" className="text-lg font-bold">
                Waiting to join
              </h2>
              <ul className="mt-3 space-y-2">
                {team.invites.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2">
                    <span className="ph-mask min-w-0 break-all text-sm">
                      <b>{i.email}</b> · expires {shortDate(i.expires)}
                    </span>
                    <form action={revokeInviteAction}>
                      <input type="hidden" name="id" value={i.id} />
                      <button type="submit" className={outline}>
                        Cancel<span className="sr-only"> invite for {i.email}</span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

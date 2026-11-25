import type { Metadata } from "next";
import { cancelInviteAction, removeMemberAction, roleAction } from "@/app/org/actions";
import { InviteForm, JoinLinkForm } from "@/components/org/LinkForms";
import { OrgShell, orgButton, orgCard, orgInput, orgOutline } from "@/components/org/OrgShell";
import { isActive, memberProgress, pendingInvites } from "@/server/organisations";
import { loadOrg } from "@/server/org-page";

export const metadata: Metadata = { title: "Members | Buggle Learn" };
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
};

function Hidden(fields: Record<string, string>) {
  return (
    <>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </>
  );
}

export default async function OrgMembersPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const { org, role, user } = await loadOrg(slug, "/members", { manage: true });
  const [members, invites] = await Promise.all([memberProgress(org.id), pendingInvites(org.id)]);
  const free = Math.max(0, org.seats - org.members - invites.length);
  const active = isActive(org);
  return (
    <OrgShell org={org} role={role} current="/members" notice={q.notice} error={q.error}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="members-title" className={orgCard}>
          <h2 id="members-title" className="text-lg font-bold">
            Members ({org.members} of {org.seats} places)
          </h2>
          <ul className="mt-3 divide-y divide-line/70">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="ph-mask block font-semibold">
                    {m.name}
                    {m.id === user.id && " (you)"}
                  </span>
                  <span className="ph-mask block break-all text-sm text-muted">
                    {m.email} · {m.role}
                  </span>
                </span>
                {m.role !== "owner" && m.id !== user.id && (
                  <span className="flex flex-wrap gap-2">
                    {role === "owner" && (
                      <form action={roleAction}>
                        <Hidden org={org.slug} user={m.id} role={m.role === "manager" ? "member" : "manager"} />
                        <button type="submit" className={orgOutline}>
                          {m.role === "manager" ? "Make member" : "Make manager"}
                          <span className="sr-only">: {m.name}</span>
                        </button>
                      </form>
                    )}
                    {(role === "owner" || m.role === "member") && (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-semibold text-navy underline underline-offset-4">
                          Remove<span className="sr-only"> {m.name}</span>
                        </summary>
                        <form action={removeMemberAction} className="mt-2">
                          <Hidden org={org.slug} user={m.id} />
                          <button type="submit" className={orgOutline}>
                            Yes, remove {m.name.split(" ")[0]}
                          </button>
                        </form>
                      </details>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid content-start gap-6">
          <section aria-labelledby="invite-title" className={orgCard}>
            <h2 id="invite-title" className="text-lg font-bold">
              Invite by email
            </h2>
            {!active ? (
              <p className="mt-2 text-sm text-muted">Choose a plan first, then you can add members.</p>
            ) : free <= 0 ? (
              <p className="mt-2 text-sm text-muted">Every place is taken or invited. Add places on the Plan and billing page.</p>
            ) : (
              <InviteForm org={org.slug} owner={role === "owner"} free={free} />
            )}
          </section>

          <section aria-labelledby="link-title" className={orgCard}>
            <h2 id="link-title" className="text-lg font-bold">
              Join link
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Anyone with this link can join while there are free places. Share it in a staff email or class chat.
            </p>
            {active ? <JoinLinkForm org={org.slug} hasLink={org.hasJoinLink} /> : <p className="mt-2 text-sm text-muted">Choose a plan first.</p>}
          </section>

          {invites.length > 0 && (
            <section aria-labelledby="pending-title" className={orgCard}>
              <h2 id="pending-title" className="text-lg font-bold">
                Waiting to join
              </h2>
              <ul className="mt-3 grid gap-2">
                {invites.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2 text-sm">
                    <span className="ph-mask break-all">
                      <b>{i.email}</b> · {i.role}
                    </span>
                    <form action={cancelInviteAction}>
                      <Hidden org={org.slug} id={i.id} />
                      <button type="submit" className={orgOutline}>
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
    </OrgShell>
  );
}

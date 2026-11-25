// The frame for an organisation's pages: its name and logo, and tabs for
// owners and managers. Same look as the rest of Buggle Learn.
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { canManage, type Organisation, type Role } from "@/server/organisations";

export const orgNotices: Record<string, string> = {
  created: "Your organisation is ready. Choose a plan to start adding members.",
  invited: "Invite created.",
  "invite-cancelled": "Invite cancelled. Its link no longer works.",
  "link-made": "New join link made. Any older link has stopped working.",
  "link-stopped": "Join link switched off.",
  "role-saved": "Role saved.",
  "member-removed": "Member removed.",
  "settings-saved": "Settings saved.",
  simulated: "Test plan switched on. No payment was taken: this is a test site.",
  "seats-saved": "Places updated.",
  joined: "Welcome! You've joined.",
  "already-member": "You're already a member.",
};

export function OrgLogo({ org, size = "size-14" }: { org: Pick<Organisation, "id" | "name" | "hasLogo">; size?: string }) {
  return org.hasLogo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/api/orgs/${org.id}/logo`} alt={`${org.name} logo`} className={`${size} shrink-0 rounded-2xl bg-white object-contain p-1 ring-1 ring-line/70`} />
  ) : (
    <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-2xl bg-navy font-display text-xl font-bold text-white`}>
      {org.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

const TABS = [
  { path: "", label: "Overview" },
  { path: "/members", label: "Members" },
  { path: "/billing", label: "Plan and billing" },
  { path: "/settings", label: "Settings" },
];

export function OrgShell({
  org,
  role,
  current,
  notice,
  error,
  children,
}: {
  org: Organisation;
  role: Role;
  current: string;
  notice?: string;
  error?: string;
  children: ReactNode;
}) {
  const manager = canManage(role);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="flex flex-wrap items-center gap-4 rounded-[2rem] bg-hero-lavender p-6 sm:p-8">
          <OrgLogo org={org} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Organisation</p>
            <h1 className="mt-1 break-words text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">{org.name}</h1>
            <p className="mt-1 text-sm text-ink">
              You&apos;re {role === "owner" ? "the owner" : role === "manager" ? "a manager" : "a member"} · {org.members}{" "}
              {org.members === 1 ? "member" : "members"}
            </p>
          </div>
        </header>
        {manager && (
          <nav aria-label="Organisation" className="mt-5 overflow-x-auto">
            <ul className="flex w-max gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium">
              {TABS.map((t) => (
                <li key={t.path}>
                  <Link
                    href={`/org/${org.slug}${t.path}`}
                    aria-current={current === t.path ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full px-4 ${current === t.path ? "bg-navy text-white" : "text-muted hover:bg-lavender hover:text-navy"}`}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {(notice || error) && (
          <p role={error ? "alert" : "status"} className={`mt-5 rounded-2xl p-4 text-sm leading-relaxed ${error ? "bg-peach" : "bg-mint"}`}>
            {error ?? orgNotices[notice!] ?? notice}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

export { orgButton, orgCard, orgInput, orgOutline } from "./styles";

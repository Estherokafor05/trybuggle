// The frame for every admin page: the Buggle Learn look, an "Admin" label so
// it's never mistaken for the learner site, and the admin menu.
import Link from "next/link";
import type { ReactNode } from "react";
import { adminSignOutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/learners", label: "Learners" },
  { href: "/admin/course", label: "Course" },
  { href: "/admin/builder", label: "Builder" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/forum", label: "Forum" },
  { href: "/admin/organisations", label: "Organisations" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/activity", label: "Activity" },
];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy">
      <svg aria-hidden="true" viewBox="0 0 36 36" className="size-8 shrink-0">
        <rect width="36" height="36" rx="12" fill="#17243c" />
        <path d="M8 11.5c3.8-.9 6.8 0 10 2.1v12c-3.2-2.1-6.2-3-10-2.1v-12Z" fill="#d5c9f7" />
        <path d="M28 11.5c-3.8-.9-6.8 0-10 2.1v12c3.2-2.1 6.2-3 10-2.1v-12Z" fill="#f6a0d6" />
        <path d="M18 13.6v12" stroke="#17243c" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      Buggle Learn
      <span className="rounded-full bg-navy px-2.5 py-1 font-sans text-xs font-semibold text-white">Admin</span>
    </span>
  );
}

export function AdminShell({
  current,
  email,
  children,
}: {
  current?: string;
  email?: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
          <Link href="/admin" className="inline-flex min-h-11 items-center rounded-lg">
            <Logo />
          </Link>
          {email && (
            <form action={adminSignOutAction} className="flex items-center gap-3">
              <span className="ph-mask hidden text-sm text-muted md:inline">{email}</span>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
        {email && (
          <nav aria-label="Admin menu" className="mx-auto max-w-[1232px] overflow-x-auto px-4 pb-3 sm:px-7">
            <ul className="flex w-max gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current === item.href ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full px-4 ${
                      current === item.href ? "bg-navy text-white" : "text-muted hover:bg-lavender hover:text-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-[1232px] px-4 pb-14 pt-6 sm:px-7 sm:pt-8">{children}</main>
    </>
  );
}

/** Page title block used across admin pages. */
export function AdminHeading({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold leading-tight">{title}</h1>
        {intro && <p className="mt-2 max-w-[70ch] leading-relaxed text-muted">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

/** A notice or error from the address bar, after an action. */
export function AdminNotice({ notice, error }: { notice?: string | null; error?: string | null }) {
  if (!notice && !error) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-6 rounded-2xl p-4 text-sm leading-relaxed text-ink ${error ? "bg-peach" : "bg-mint"}`}
    >
      {error ?? notice}
    </p>
  );
}

/** A centred card for admin sign-in and set-up pages. */
export function AdminCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line/70 bg-canvas/95">
        <div className="mx-auto flex max-w-[1232px] items-center px-4 py-3 sm:px-7">
          <span className="inline-flex min-h-11 items-center">
            <Logo />
          </span>
        </div>
      </header>
      <main className="mx-auto flex min-h-[70vh] max-w-[560px] items-center px-4 py-10 sm:px-6 sm:py-14">
        <section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-teal">Admin area</p>
          <h1 className="mt-3 text-3xl font-bold">{title}</h1>
          {intro && <div className="mt-3 leading-relaxed text-muted">{intro}</div>}
          {children}
        </section>
      </main>
    </>
  );
}

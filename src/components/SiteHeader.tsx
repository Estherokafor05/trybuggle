"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/welcome",
    label: "Welcome",
    match: (p: string) => p === "/welcome",
  },
  {
    href: "/modules/ai-foundations",
    label: "Module 1",
    match: (p: string) => p.startsWith("/modules/ai-foundations"),
  },
  {
    href: "/curriculum",
    label: "All modules",
    match: (p: string) => p === "/curriculum",
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  // The phone menu is open only on the page where it was opened, so it
  // closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  // Read the session in the browser so public pages can stay static.
  // Re-checked on every navigation, so the header updates after signing out.
  const [account, setAccount] = useState<{ name: string } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((session) => {
        if (alive) setAccount(session?.user ? { name: session.user.name ?? "" } : null);
      })
      .catch(() => {
        if (alive) setAccount(null);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-7">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg font-display text-lg font-bold tracking-tight text-navy"
        >
          <svg aria-hidden="true" viewBox="0 0 36 36" className="size-8 shrink-0 sm:size-9">
            <rect width="36" height="36" rx="12" fill="#17243c" />
            <path d="M8 11.5c3.8-.9 6.8 0 10 2.1v12c-3.2-2.1-6.2-3-10-2.1v-12Z" fill="#d5c9f7" />
            <path d="M28 11.5c-3.8-.9-6.8 0-10 2.1v12c3.2-2.1 6.2-3 10-2.1v-12Z" fill="#f6a0d6" />
            <path d="M18 13.6v12" stroke="#17243c" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Buggle Learn
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium md:flex"
        >
          {NAV.map((item) => {
            const current = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-full px-4 py-2 transition-colors ${
                  current
                    ? "bg-navy text-white"
                    : "text-muted hover:bg-lavender hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {account && (
          <form action={signOutAction} className="hidden md:block">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
            >
              <SignOutIcon />
              Sign out
            </button>
          </form>
        )}

        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender md:hidden"
          aria-expanded={open}
          aria-controls="phone-menu"
          onClick={() => setOpen(!open)}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="m5 5 10 10M15 5 5 15" /> : <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />}
          </svg>
          Menu
        </button>
      </div>

      <nav
        id="phone-menu"
        aria-label="Main navigation"
        hidden={!open}
        className="border-t border-line/70 bg-white px-4 pb-4 pt-2 md:hidden"
      >
        <ul className="grid gap-1">
          {NAV.map((item) => {
            const current = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold ${
                    current ? "bg-navy text-white" : "text-navy hover:bg-lavender"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {account && (
          <form action={signOutAction} className="mt-3 border-t border-line/70 pt-3">
            {account.name && (
              <p className="px-4 pb-2 text-sm text-muted">Signed in as {account.name}</p>
            )}
            <button
              type="submit"
              className="flex min-h-12 w-full items-center gap-2 rounded-2xl px-4 text-base font-semibold text-navy hover:bg-lavender"
            >
              <SignOutIcon />
              Sign out
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}

function SignOutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 13.5 16.5 10 13 6.5M16.5 10H8" />
    </svg>
  );
}

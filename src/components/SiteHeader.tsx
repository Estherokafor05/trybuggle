"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCOUNT_CHANGED } from "@/components/account/AccountRefresh";
import { Avatar } from "@/components/Avatar";
import { ThemeButton } from "@/components/theme/ThemeControls";
import { useT } from "@/i18n/client";
import { shortName } from "@/lib/people";
import type { MessageKey } from "@/i18n/messages";

const NAV = [
  { href: "/", label: "nav.home" as MessageKey, match: (p: string) => p === "/" },
  {
    href: "/welcome",
    label: "nav.welcome" as MessageKey,
    match: (p: string) => p === "/welcome",
  },
  {
    href: "/modules/ai-foundations",
    label: "nav.module1" as MessageKey,
    match: (p: string) => p.startsWith("/modules/ai-foundations"),
  },
  {
    href: "/curriculum",
    label: "nav.modules" as MessageKey,
    match: (p: string) => p === "/curriculum",
  },
  {
    href: "/forum",
    label: "nav.forum" as MessageKey,
    match: (p: string) => p.startsWith("/forum"),
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const t = useT();
  // The phone menu is open only on the page where it was opened, so it
  // closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  // Read the session in the browser so public pages can stay static.
  // Re-checked on every navigation, so the header updates after signing out.
  // undefined while checking, so "Log in" does not flash for signed-in learners.
  const [account, setAccount] = useState<{ name: string; image: string | null } | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/get-session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((session) => {
        if (alive) setAccount(session?.user ? { name: session.user.name ?? "", image: session.user.image ?? null } : null);
      })
      .catch(() => {
        if (alive) setAccount(null);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);
  // Settings announces a new name or photo straight away.
  useEffect(() => {
    const changed = (e: Event) => {
      const { name, image } = (e as CustomEvent<{ name: string; image: string | null }>).detail;
      setAccount((a) => (a ? { name, image } : a));
    };
    window.addEventListener(ACCOUNT_CHANGED, changed);
    return () => window.removeEventListener(ACCOUNT_CHANGED, changed);
  }, []);

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
          aria-label={t("nav.main")}
          className="hidden items-center gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium lg:flex"
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
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeButton />
          {account && (
            <div className="hidden items-center gap-1 lg:flex">
              <Link
                href="/dashboard"
                aria-current={pathname === "/dashboard" ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold ${
                  pathname === "/dashboard" ? "bg-lavender text-navy" : "text-navy hover:bg-lavender"
                }`}
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/account"
                aria-current={pathname === "/account" ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold ${
                  pathname === "/account" ? "bg-lavender text-navy" : "text-navy hover:bg-lavender"
                }`}
              >
                <Avatar name={account.name} image={account.image} />
                <span className="sr-only">{t("nav.account")}: </span>
                <span className="ph-mask max-w-[12rem] truncate">{shortName(account.name) || t("nav.account")}</span>
              </Link>
            </div>
          )}
          {account === null && (
            <div className="hidden items-center gap-1 lg:flex">
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-navy hover:bg-lavender"
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href={`/sign-up?callbackUrl=${encodeURIComponent(pathname)}`}
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                {t("nav.signUp")}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender lg:hidden"
            aria-expanded={open}
            aria-controls="phone-menu"
            onClick={() => setOpen(!open)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="m5 5 10 10M15 5 5 15" /> : <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />}
            </svg>
            {t("nav.menu")}
          </button>
        </div>
      </div>

      <nav
        id="phone-menu"
        aria-label={t("nav.main")}
        hidden={!open}
        className="border-t border-line/70 bg-white px-4 pb-4 pt-2 lg:hidden"
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
                  {t(item.label)}
                </Link>
              </li>
            );
          })}
        </ul>
        {account === null && (
          <div className="mt-3 grid gap-2 border-t border-line/70 pt-3">
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold text-navy hover:bg-lavender"
            >
              {t("nav.logIn")}
            </Link>
            <Link
              href={`/sign-up?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-2xl bg-navy px-4 text-base font-semibold text-white hover:bg-brand-deep"
            >
              {t("nav.signUp")}
            </Link>
          </div>
        )}
        {account && (
          <div className="mt-3 border-t border-line/70 pt-3">
            <p className="ph-mask flex items-center gap-3 px-4 pb-2 text-sm text-muted">
              <Avatar name={account.name} image={account.image} size="md" />
              <span>
                {t("nav.signedInAs")} <span className="font-semibold text-navy">{shortName(account.name)}</span>
              </span>
            </p>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/dashboard" ? "page" : undefined}
              className="flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold text-navy hover:bg-lavender"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/account" ? "page" : undefined}
              className="flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold text-navy hover:bg-lavender"
            >
              {t("nav.account")}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}


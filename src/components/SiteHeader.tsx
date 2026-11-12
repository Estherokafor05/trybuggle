import Link from "next/link";

const NAV = [
  { href: "/#learn", label: "Learn" },
  { href: "/curriculum", label: "Learning path" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
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
        <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-muted transition-colors hover:bg-lavender hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/welcome"
          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep sm:px-5"
        >
          Start learning
        </Link>
      </div>
    </header>
  );
}

import Link from "next/link";

const NAV = [
  { href: "/#tracks", label: "Two tracks" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/#method", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1120px] items-center gap-5 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[1.15rem] font-bold tracking-[-0.02em] text-ink"
        >
          <span className="block h-[19px] w-[19px] flex-none rounded-[5px] bg-brand" />
          Buggle
        </Link>

        <nav className="ml-auto hidden gap-6 text-[0.9rem] sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#join"
          className="ml-auto rounded-[9px] bg-brand px-4 py-2.5 text-[0.87rem] font-semibold text-white transition-colors hover:bg-brand-deep sm:ml-0"
        >
          Get early access
        </Link>
      </div>
    </header>
  );
}

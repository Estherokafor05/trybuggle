import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-4 py-6 text-[0.85rem] text-muted sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-base font-bold tracking-[-0.02em] text-ink"
        >
          <span className="block h-4 w-4 flex-none rounded-[4px] bg-brand" />
          Buggle
        </Link>
        <span>AI for people who test software.</span>
        <nav className="ml-auto flex flex-wrap gap-[18px]">
          <Link href="/curriculum" className="hover:text-brand">
            Curriculum
          </Link>
          <Link href="/#method" className="hover:text-brand">
            How it works
          </Link>
          <Link href="/#join" className="hover:text-brand">
            Early access
          </Link>
        </nav>
      </div>
    </footer>
  );
}

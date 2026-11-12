import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-4 py-6 text-sm text-muted sm:px-6">
        <Link href="/" className="font-display font-bold text-navy">
          Buggle Learn
        </Link>
        <span>Understand AI. Learn how to use it.</span>
        <nav aria-label="Footer navigation" className="ml-auto flex flex-wrap gap-5">
          <Link href="/curriculum" className="hover:text-brand">
            All modules
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand">
            How it works
          </Link>
        </nav>
      </div>
    </footer>
  );
}

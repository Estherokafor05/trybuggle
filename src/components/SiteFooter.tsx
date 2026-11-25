"use client";
import Link from "next/link";
import { HtmlLang, useT } from "@/i18n/client";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <HtmlLang />
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-4 py-6 text-sm text-muted sm:px-6">
        <Link href="/" className="font-display font-bold text-navy">
          Buggle Learn
        </Link>
        <span>{t("footer.tagline")}</span>
        <nav aria-label={t("footer.nav")} className="ml-auto flex flex-wrap gap-5">
          <Link href="/curriculum" className="hover:text-brand">
            {t("footer.modules")}
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand">
            {t("footer.howItWorks")}
          </Link>
          <Link href="/organisations" className="hover:text-brand">
            {t("footer.organisations")}
          </Link>
          <Link href="/pricing" className="hover:text-brand">
            {t("footer.pricing")}
          </Link>
          <Link href="/verify" className="hover:text-brand">
            {t("footer.verify")}
          </Link>
          <Link href="/privacy" className="hover:text-brand">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { Module } from "@/content/modules";

const STATUS_LABEL: Record<Module["status"], string> = {
  open: "Out first",
  next: "Up next",
  planned: "Planned",
};

export function ModuleCard({ module: mod }: { module: Module }) {
  return (
    <article className="grid min-w-0 grid-cols-[auto_1fr] items-start gap-4 rounded-[13px] border border-line bg-surface p-5 sm:grid-cols-[auto_1fr_auto] sm:gap-5 sm:px-6">
      <span className="pt-0.5 font-mono text-[0.78rem] tabular-nums text-gold-ink">
        {String(mod.order).padStart(2, "0")}
      </span>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-[1.07rem] font-bold text-ink">
          <Link href={`/modules/${mod.slug}`} className="hover:text-brand">
            {mod.title}
          </Link>
        </h3>
        <p className="text-[0.93rem] text-muted">{mod.summary}</p>
        <p className="text-[0.86rem] text-ink">
          <span className="mr-2 font-mono text-[0.78rem] uppercase tracking-[0.06em] font-medium text-muted">
            You leave with
          </span>
          {mod.outcome}
        </p>
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-1.5 sm:col-start-3 sm:flex-col sm:items-end">
        <span
          className={
            mod.status === "open"
              ? "whitespace-nowrap rounded-full bg-brand px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-white"
              : "whitespace-nowrap rounded-full bg-brand-soft px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-brand"
          }
        >
          {STATUS_LABEL[mod.status]}
        </span>
        <span className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
          {mod.handsOn ? "Hands on" : "No code"}
        </span>
      </div>
    </article>
  );
}

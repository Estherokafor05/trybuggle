import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TRACK_LABELS, getModule, modules } from "@/content/modules";

export function generateStaticParams() {
  return modules.map((mod) => ({ slug: mod.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) return { title: "Module not found — Buggle Learn" };
  return {
    title: `${mod.title} — Buggle Learn`,
    description: mod.summary,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const next = modules.find((m) => m.order === mod.order + 1);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/curriculum"
          className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-muted hover:text-brand"
        >
          ← Curriculum
        </Link>

        <div className="mt-6 flex flex-col gap-4">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.13em] text-gold-ink">
            Module {String(mod.order).padStart(2, "0")} ·{" "}
            {TRACK_LABELS[mod.track]}
          </p>
          <h1 className="text-[clamp(1.9rem,4.2vw,2.7rem)] font-bold leading-[1.1]">
            {mod.title}
          </h1>
          <p className="text-[1.05rem] leading-relaxed text-muted">
            {mod.summary}
          </p>
          <p className="rounded-[11px] border border-line bg-surface px-5 py-4 text-[0.95rem] text-ink">
            <span className="mr-2 font-mono text-[0.75rem] uppercase tracking-[0.07em] font-medium text-muted">
              You leave with
            </span>
            {mod.outcome}
          </p>
        </div>

        <section className="mt-10 flex flex-col gap-4">
          <h2 className="text-[1.25rem] font-bold text-ink">Lessons</h2>
          <ol className="flex flex-col gap-3">
            {mod.lessons.map((lesson, index) => (
              <li
                key={lesson.slug}
                className="grid grid-cols-[auto_1fr] gap-4 rounded-[12px] border border-line bg-surface p-5"
              >
                <span className="pt-0.5 font-mono text-[0.78rem] tabular-nums text-gold-ink">
                  {mod.order}.{index + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="text-[1rem] font-bold text-ink">
                    {lesson.title}
                  </h3>
                  <p className="text-[0.92rem] text-muted">{lesson.summary}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-[0.88rem] text-muted">
            Lesson pages are not written yet. The outline is here so the shape of
            the module is visible while it gets built.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-7">
          <Link
            href="/#join"
            className="rounded-[9px] bg-brand px-5 py-2.5 text-[0.92rem] font-semibold text-white hover:bg-brand-deep"
          >
            Get early access
          </Link>
          {next && (
            <Link
              href={`/modules/${next.slug}`}
              className="text-[0.92rem] font-semibold text-brand hover:underline"
            >
              Next: {next.title} →
            </Link>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

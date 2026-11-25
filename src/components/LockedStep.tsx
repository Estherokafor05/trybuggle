import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JourneyProgress } from "@/components/JourneyProgress";
import { LockIcon } from "@/components/LockIcon";
import { finishFirstText, type PathStep } from "@/server/progression";

// Shown instead of a lesson, episode or final assessment the learner hasn't
// reached yet. Everything opens in order (FRD Version 2).
export function LockedStep({
  moduleSlug,
  moduleOrder,
  title,
  finishFirst,
  done,
  locked,
}: {
  moduleSlug: string;
  moduleOrder: number;
  title: string;
  finishFirst: PathStep;
  done?: string[];
  locked?: string[];
}) {
  const target =
    finishFirst.kind === "final" ? finishFirst.href : `${finishFirst.href}#knowledge-check`;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 py-10 sm:px-6 sm:py-14">
        <section
          aria-labelledby="locked-title"
          className="rounded-[2rem] bg-hero-lavender p-6 sm:p-10"
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            <LockIcon /> Not open yet
          </p>
          <h1 id="locked-title" className="mt-3 text-3xl font-bold">
            {title}
          </h1>
          <p className="mt-4 max-w-[60ch] leading-relaxed text-ink">
            Lessons open one at a time, in order, so each one builds on the last.{" "}
            {finishFirstText(finishFirst, moduleSlug)} to open this one.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={target}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Go to {finishFirst.label}
              {finishFirst.moduleSlug !== moduleSlug && ` in Module ${finishFirst.moduleOrder}`}{" "}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/modules/${moduleSlug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
            >
              Module {moduleOrder} overview
            </Link>
          </div>
        </section>
        <div className="mt-5">
          <JourneyProgress moduleSlug={moduleSlug} done={done} locked={locked} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

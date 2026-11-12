"use client";
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import type { ExploreGuide } from "@/content/explore-guides";
import type { Checkpoint } from "@/lib/learning-state";
import { Activity } from "./Activities";
import { activityButton } from "./MatchingActivity";
const primaryButton =
  activityButton
    .replace("bg-white", "bg-navy")
    .replace("hover:bg-lavender", "hover:bg-brand-deep") + " text-white";
export function ExploreJourney({
  guide,
  place,
  update,
  scope,
}: {
  guide: ExploreGuide;
  place: Checkpoint;
  update: (change: Partial<Checkpoint>) => void;
  scope: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const needsFocus = useRef(false);
  const step = guide.steps[place.step];
  useLayoutEffect(() => {
    if (needsFocus.current) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
      needsFocus.current = false;
    }
  }, [place.step]);
  function go(index: number) {
    needsFocus.current = index !== place.step;
    update({ step: index, visited: [...new Set([...place.visited, step.id])] });
  }
  return (
    <section
      aria-labelledby="explore-title"
      className="mt-5 overflow-hidden rounded-[2rem] border border-line bg-white shadow-sm"
    >
      <div className="border-b border-line bg-mint/40 p-5 sm:p-7">
        <div className="flex flex-wrap justify-between gap-3">
          <span className="text-sm font-semibold text-teal">
            Discover · Practise · Reflect
          </span>
          <span className="text-sm text-muted">
            Activity {place.step + 1} of {guide.steps.length}
          </span>
        </div>
        <progress
          aria-label="Guide activities visited"
          max={guide.steps.length}
          value={place.visited.length}
          className="mt-4 h-2 w-full accent-teal"
        />
        <h2
          id="explore-title"
          ref={heading}
          tabIndex={-1}
          className="mt-4 scroll-mt-24 text-2xl font-bold sm:text-3xl"
        >
          {step.title}
        </h2>
        <p className="mt-3 leading-relaxed">{step.goal}</p>
      </div>
      <div className="p-5 sm:p-7">
        <Activity
          key={step.id}
          id={step.id}
          slug={guide.slug}
          state={place.activities[step.id] ?? {}}
          change={(value) =>
            update({ activities: { ...place.activities, [step.id]: value } })
          }
          go={go}
          prompts={guide.reflections}
          scope={scope}
        />
        <details className="mt-6 rounded-2xl bg-ivory p-4">
          <summary className="cursor-pointer py-2 font-semibold">
            Read the full explanation for this activity
          </summary>
          <div className="mt-3 space-y-4 leading-relaxed">
            {step.reading.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="font-semibold text-teal">{step.takeaway}</p>
          </div>
        </details>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            className={activityButton + " disabled:opacity-40"}
            disabled={place.step === 0}
            onClick={() => go(place.step - 1)}
          >
            ← Previous
          </button>
          {place.step < guide.steps.length - 1 ? (
            <button
              className={primaryButton}
              onClick={() => go(place.step + 1)}
            >
              Continue →
            </button>
          ) : (
            <a
              href="#knowledge-check"
              className={primaryButton}
              onClick={() =>
                update({ visited: [...new Set([...place.visited, step.id])] })
              }
            >
              Go to the separate knowledge check
            </a>
          )}
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <details>
            <summary className="cursor-pointer py-2 font-semibold">
              Explore any activity
            </summary>
            <nav
              aria-label="Guide activities"
              className="mt-3 flex flex-wrap gap-2"
            >
              {guide.steps.map((s, i) => (
                <button
                  key={s.id}
                  className={activityButton}
                  aria-current={i === place.step ? "step" : undefined}
                  onClick={() => go(i)}
                >
                  {place.visited.includes(s.id) ? "✓ " : ""}
                  {i + 1}. {s.title}
                </button>
              ))}
            </nav>
          </details>
          <p className="mt-3 text-sm text-muted">
            Guide activities are unscored. Exploring them does not use an
            assessment attempt or award a lesson pass.
          </p>
          <Link
            href={`/modules/ai-foundations/lessons/${guide.slug}/reading`}
            className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            Open the complete reading alternative
          </Link>
        </div>
      </div>
    </section>
  );
}

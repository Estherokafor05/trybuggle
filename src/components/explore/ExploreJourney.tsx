"use client";
import { useLayoutEffect, useRef } from "react";
import type { ExploreGuide } from "@/content/explore-guides";
import type { Checkpoint } from "@/lib/learning-state";
import { Activity, activityButton } from "./Activities";
import { HistoryActivity } from "./HistoryActivities";

const primaryButton =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";

const activityFor: Record<string, typeof Activity> = {
  "before-chatgpt": HistoryActivity,
};
function StepActivity(props: Parameters<typeof Activity>[0]) {
  const Component = activityFor[props.slug] ?? Activity;
  return <Component {...props} />;
}

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
  const last = place.step === guide.steps.length - 1;
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
      className="mt-6 rounded-[2rem] border border-line bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold text-navy">
          <svg viewBox="0 0 24 24" className="size-6 text-brand" aria-hidden="true">
            <path
              d="M3 5.5c3-1 5.7-.6 9 1.6v12c-3.3-2.2-6-2.6-9-1.6v-12Zm18 0c-3-1-5.7-.6-9 1.6v12c3.3-2.2 6-2.6 9-1.6v-12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          {guide.title}
        </p>
        <p className="shrink-0 text-sm text-muted">
          Step {place.step + 1} of {guide.steps.length}
        </p>
      </div>
      <nav aria-label="Guide steps" className="mt-4">
        <ol className="flex gap-1.5">
          {guide.steps.map((s, i) => (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === place.step ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.title}${place.visited.includes(s.id) ? " (visited)" : ""}`}
                title={s.title}
                className="block w-full py-2"
              >
                <span
                  className={`block h-2 rounded-full transition-colors ${i === place.step ? "bg-brand" : i < place.step || place.visited.includes(s.id) ? "bg-brand/40" : "bg-line"}`}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <h2
        id="explore-title"
        ref={heading}
        tabIndex={-1}
        className="mt-3 scroll-mt-24 text-[clamp(1.6rem,3.5vw,2.25rem)] font-bold leading-tight"
      >
        {step.title}
      </h2>
      <p className="mt-2 text-muted">{step.goal}</p>
      <div className="mt-6">
        <StepActivity
          key={step.id}
          id={step.id}
          slug={guide.slug}
          state={place.activities[step.id] ?? {}}
          all={place.activities}
          change={(value) =>
            update({ activities: { ...place.activities, [step.id]: value } })
          }
          go={go}
          prompts={guide.reflections}
          scope={scope}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <button
          type="button"
          className={activityButton + " rounded-full px-5 disabled:invisible"}
          disabled={place.step === 0}
          onClick={() => go(place.step - 1)}
        >
          ← Back
        </button>
        {last ? (
          <a
            href="#knowledge-check"
            className={primaryButton}
            onClick={() =>
              update({ visited: [...new Set([...place.visited, step.id])] })
            }
          >
            Take the knowledge check →
          </a>
        ) : (
          <button
            type="button"
            className={primaryButton}
            onClick={() => go(place.step + 1)}
          >
            Continue →
          </button>
        )}
      </div>
    </section>
  );
}

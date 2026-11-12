"use client";
import Link from "next/link";
import type { PreviewLesson } from "@/content/preview-lessons";
import { stories } from "@/content/stories";
import { exploreGuides } from "@/content/explore-guides";
import { StoryPlayer, type NextStep } from "./story/StoryPlayer";
import { ExploreJourney } from "./explore/ExploreJourney";
import { Reflection } from "./explore/Activities";
import { useLearningPlace } from "./explore/useLearningPlace";
import { KnowledgeCheck } from "./assessment/KnowledgeCheck";

export function LessonPreview({
  lesson,
  scope = "guest",
  signedIn = false,
  next,
}: {
  lesson: PreviewLesson;
  scope?: string;
  signedIn?: boolean;
  next?: NextStep;
}) {
  const learning = useLearningPlace(lesson.slug, scope, signedIn);
  const { place, update } = learning;
  const guide = exploreGuides[lesson.slug];
  return (
    <>
      <div
        className="mt-7 flex flex-wrap gap-2 rounded-3xl border border-line bg-white p-2"
        role="group"
        aria-label="Choose your learning experience"
      >
        {[
          { id: "watch" as const, label: "Watch & Listen" },
          { id: "explore" as const, label: "Read & Explore" },
        ].map((route) => (
          <button
            key={route.id}
            type="button"
            disabled={!learning.ready}
            aria-pressed={place.route === route.id}
            className={`min-h-12 flex-1 rounded-full px-5 py-3 font-semibold disabled:opacity-50 ${place.route === route.id ? "bg-navy text-white" : "hover:bg-lavender"}`}
            onClick={() => update({ route: route.id })}
          >
            {route.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span role="status">{learning.status}</span>
        {signedIn && (
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() =>
              learning.conflict ? void learning.reload() : learning.retry()
            }
          >
            {learning.conflict ? "Reload the saved place" : "Retry saving"}
          </button>
        )}
        <Link
          className="inline-flex min-h-11 items-center underline"
          href={`/modules/ai-foundations/lessons/${lesson.slug}/reading`}
        >
          Complete reading alternative
        </Link>
      </div>
      {!learning.ready && (
        <p className="my-8">Preparing your learning experience…</p>
      )}
      {learning.ready && (
        <>
          <div hidden={place.route !== "watch"}>
            <StoryPlayer
              active={place.route === "watch"}
              {...stories[lesson.slug]}
              initialTime={place.videoTime}
              onPlace={(videoTime) => update({ videoTime })}
              next={next}
            />
            <details className="mt-4 rounded-2xl border border-line bg-white p-5">
              <summary className="cursor-pointer py-2 font-semibold">
                Try the reflection after the film
              </summary>
              <div className="mt-4">
                <Reflection
                  prompts={guide.reflections}
                  slug={lesson.slug}
                  scope={scope}
                />
              </div>
            </details>
          </div>
          <div hidden={place.route !== "explore"}>
            <ExploreJourney
              guide={guide}
              place={place}
              update={update}
              scope={scope}
            />
          </div>
        </>
      )}
      <noscript>
        <p className="mt-5 rounded-xl bg-peach p-5">
          The film and interactive activities need JavaScript. The complete
          reading alternative above covers all the learning outcomes without it.
        </p>
      </noscript>
      <KnowledgeCheck slug={lesson.slug} signedIn={signedIn} />
    </>
  );
}

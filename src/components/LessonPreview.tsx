"use client";
import Link from "next/link";
import {
  exploreGuides,
  reflectionExample,
  stories,
  type PreviewLesson,
} from "@course";
import { filmChoices } from "@course/ui";
import { StoryPlayer, type NextStep } from "./story/StoryPlayer";
import { ExploreJourney } from "./explore/ExploreJourney";
import { Reflection } from "./blocks/Blocks";
import { useLearningPlace } from "./explore/useLearningPlace";
import { KnowledgeCheck } from "./assessment/KnowledgeCheck";

export function LessonPreview({
  lesson,
  moduleSlug = "ai-foundations",
  checkIntro,
  scope = "guest",
  signedIn = false,
  next,
}: {
  lesson: PreviewLesson;
  moduleSlug?: string;
  /** How many questions, the pass mark and tries, from the check's settings. */
  checkIntro?: string;
  scope?: string;
  signedIn?: boolean;
  next?: NextStep;
}) {
  const learning = useLearningPlace(lesson.slug, scope, signedIn);
  const { place, update } = learning;
  const guide = exploreGuides[lesson.slug];
  return (
    <>
      <div className="mt-6 sm:mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
          Step 1 · Learn it
        </p>
        <h2 className="mt-1 text-xl font-bold sm:text-2xl">
          Watch or read: both cover the same ideas
        </h2>
      </div>
      <div
        className="mt-3 grid grid-cols-2 gap-2 rounded-3xl border border-line bg-white p-2"
        role="group"
        aria-label="Choose how to learn"
      >
        {[
          {
            id: "watch" as const,
            label: "Watch & Listen",
            detail: `Narrated film · ${lesson.duration.replace(" to watch", "")}`,
          },
          {
            id: "explore" as const,
            label: "Read & Explore",
            detail: `Interactive guide · ${guide.steps.length} short steps`,
          },
        ].map((route) => (
          <button
            key={route.id}
            type="button"
            disabled={!learning.ready}
            aria-pressed={place.route === route.id}
            className={`min-h-14 rounded-[1.25rem] px-2 py-3 text-center sm:px-5 disabled:opacity-50 ${place.route === route.id ? "bg-navy text-white" : "hover:bg-lavender"}`}
            onClick={() => update({ route: route.id })}
          >
            <span className="block font-semibold">{route.label}</span>
            <span
              className={`block text-sm ${place.route === route.id ? "text-white/75" : "text-muted"}`}
            >
              {route.detail}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        {signedIn || /could not|unavailable/i.test(learning.status) ? (
          <span role="status" className="flex items-center gap-2">
            {learning.status}
            {signedIn &&
              (learning.conflict ||
                /waiting|could not|retry/i.test(learning.status)) && (
              <button
                type="button"
                className="min-h-11 font-semibold underline"
                onClick={() =>
                  learning.conflict ? void learning.reload() : learning.retry()
                }
              >
                {learning.conflict ? "Load the newer place" : "Retry saving"}
              </button>
            )}
          </span>
        ) : (
          <span />
        )}
        <Link
          className="inline-flex min-h-11 items-center underline underline-offset-4"
          href={`/modules/${moduleSlug}/lessons/${lesson.slug}/reading`}
        >
          Prefer plain text? Read the text version
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
              choice={filmChoices[lesson.slug]}
            />
            <details className="mt-4 rounded-2xl border border-line bg-white p-5">
              <summary className="cursor-pointer py-2 font-semibold">
                After the film: put it in your own words (optional)
              </summary>
              <div className="mt-4">
                <Reflection
                  prompts={guide.reflections}
                  slug={lesson.slug}
                  scope={scope}
                  example={reflectionExample(lesson.slug)}
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
          The film and interactive guide need JavaScript. The text version
          covers everything in this lesson without it.
        </p>
      </noscript>
      <KnowledgeCheck
        slug={lesson.slug}
        signedIn={signedIn}
        intro={
          checkIntro ??
          `5 quick questions about this ${moduleSlug === "ai-foundations" ? "lesson" : "episode"}. Get 4 or more right to pass. You can try again as many times as you need.`
        }
        discuss={
          <p className="mt-5 rounded-xl bg-canvas p-4 text-sm leading-relaxed">
            Still curious? See what other learners asked, or ask your own question.{" "}
            <a href={`/forum/${moduleSlug}?lesson=${lesson.slug}`} className="font-semibold text-navy underline underline-offset-4">
              View the forum
            </a>
          </p>
        }
        afterPass={
          next?.available ? (
            <Link
              href={next.href}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              {next.label} is open: start it <span aria-hidden="true">→</span>
            </Link>
          ) : undefined
        }
      />
    </>
  );
}

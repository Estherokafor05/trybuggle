"use client";

import { useState } from "react";
import Image from "next/image";
import { MayaDayFilm } from "@/components/story/MayaDayFilm";
import {
  LessonPractice,
  GuideDiagram,
  DayActivity,
} from "@/components/walkthrough/LessonPractice";
import { FoundationsWalkthrough } from "@/components/walkthrough/FoundationsWalkthrough";
import type { PreviewLesson } from "@/content/preview-lessons";

const STEP_TONES = ["bg-lavender", "bg-peach", "bg-mint", "bg-blush"];
const FORMAT_BUTTON =
  "min-h-11 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function LessonPreview({ lesson }: { lesson: PreviewLesson }) {
  const [format, setFormat] = useState<"visual" | "guide" | "story">(
    lesson.visualFormat === "day" ? "story" : "visual",
  );
  function openGuide() {
    setFormat("guide");
  }

  return (
    <>
      {lesson.slug === "what-counts-as-ai" && (
        <section
          aria-labelledby="ai-start-title"
          className="mt-7 grid items-center gap-5 rounded-[2rem] bg-lavender p-5 sm:grid-cols-[1fr_0.55fr] sm:p-8"
        >
          <div>
            <h2 id="ai-start-title" className="text-2xl font-bold">
              What is AI?
            </h2>
            <p className="mt-3 leading-relaxed">
              AI is short for artificial intelligence. It is a broad name for
              computer systems designed to carry out tasks such as recognising
              speech, interpreting messages, making recommendations or creating
              a draft.
            </p>
            <p className="mt-3 leading-relaxed">
              Some use knowledge and rules supplied by people. Others learn
              patterns from examples. Systems can also combine these approaches.
            </p>
            <p className="mt-3 leading-relaxed">
              Doing something automatically does not necessarily make it AI. A
              basic reminder that rings at the time you set can work without AI.
            </p>
          </div>
          <Image
            src="/illustrations/ai-learning-hero.png"
            alt="A learner exploring something new on a laptop."
            width={1448}
            height={1086}
            sizes="(max-width: 639px) 220px, 300px"
            className="mx-auto h-auto w-full max-w-56 sm:max-w-none"
          />
        </section>
      )}
      <div
        className="mt-7 inline-flex flex-wrap gap-1 rounded-3xl border border-line bg-white p-1.5"
        role="group"
        aria-label="Choose a lesson format"
      >
        {lesson.visualFormat === "day" && (
          <button
            type="button"
            aria-pressed={format === "story"}
            onClick={() => setFormat("story")}
            className={`${FORMAT_BUTTON} ${format === "story" ? "bg-navy text-white" : "text-ink hover:bg-lavender"}`}
          >
            Watch the illustrated film
          </button>
        )}
        {lesson.visualFormat === "four-ways" && <button
          type="button"
          aria-pressed={format === "visual"}
          onClick={() => setFormat("visual")}
          className={`${FORMAT_BUTTON} ${format === "visual" ? "bg-navy text-white" : "text-ink hover:bg-lavender"}`}
        >
          Visual walkthrough
        </button>}
        <button
          type="button"
          aria-pressed={format === "guide"}
          onClick={openGuide}
          className={`${FORMAT_BUTTON} ${format === "guide" ? "bg-navy text-white" : "text-ink hover:bg-lavender"}`}
        >
          Read the guide
        </button>
      </div>

      {lesson.visualFormat === "day" && (
        <div hidden={format !== "story"}>
          <MayaDayFilm active={format === "story"} />
          <DayActivity />
        </div>
      )}
      {lesson.visualFormat === "four-ways" && <div hidden={format !== "visual"}>
        <FoundationsWalkthrough
          active={format === "visual"}
          title={lesson.visualTitle}
        />
      </div>}

      {format === "guide" && (
        <section aria-labelledby="guide-title" className="mt-5">
          <div className="rounded-[2rem] border border-line bg-white p-5 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
              Written learning guide
            </p>
            <h2 id="guide-title" className="mt-2 text-2xl font-bold">
              {lesson.title}
            </h2>
            <p className="mt-3 max-w-[68ch] leading-relaxed text-muted">
              Use these steps to connect the idea to a task you recognize.
            </p>
            <GuideDiagram kind={lesson.visualFormat} />
            <ol className="mt-6 flex flex-col gap-3">
              {lesson.guideSteps.map((step, index) => (
                <li
                  key={step.title}
                  className={`grid grid-cols-[2.5rem_1fr] gap-4 rounded-2xl p-4 ${STEP_TONES[index % STEP_TONES.length]}`}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/75 font-mono text-sm font-semibold text-navy">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-1 leading-relaxed text-ink">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-7 rounded-2xl bg-ivory p-4 leading-relaxed">
              <strong className="block">Key idea</strong>
              {lesson.takeaway}
            </p>
            <LessonPractice kind={lesson.visualFormat} />
          </div>
        </section>
      )}
      {lesson.visualFormat === "four-ways" && (
        <details className="mt-5 rounded-2xl border border-line bg-white p-4 text-sm">
          <summary className="cursor-pointer py-2 font-semibold">Sources and example notes</summary>
          <p className="mt-3">
            The situations, messages and journey times are fictional teaching examples.
            A feature’s appearance alone does not prove it uses AI.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {lesson.sources.map(source => <li key={source.url}>
              <a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.label}</a>: {source.claim}
            </li>)}
          </ul>
        </details>
      )}
    </>
  );
}

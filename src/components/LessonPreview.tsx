"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { LessonStepIllustration } from "@/components/diagrams/FoundationIllustrations";
import { FoundationsWalkthrough } from "@/components/walkthrough/FoundationsWalkthrough";
import type { PreviewLesson } from "@/content/preview-lessons";

const STEP_TONES = ["bg-lavender", "bg-peach", "bg-mint", "bg-blush"];
const subscribeToBrowser = () => () => {};
const speechSupported = () => "speechSynthesis" in window;
const serverSpeechSupported = () => false;

const FORMAT_BUTTON =
  "min-h-11 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function LessonPreview({ lesson }: { lesson: PreviewLesson }) {
  const hasScenePlayer = lesson.visualFormat === "four-ways";
  const [format, setFormat] = useState<"visual" | "guide">("visual");
  const [speaking, setSpeaking] = useState(false);
  const speechAvailable = useSyncExternalStore(subscribeToBrowser, speechSupported, serverSpeechSupported);

  useEffect(() => {
    if (hasScenePlayer) return;
    return () => window.speechSynthesis?.cancel();
  }, [hasScenePlayer]);

  function openGuide() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setFormat("guide");
  }

  function toggleNarration() {
    if (!speechAvailable || lesson.visualFormat !== "cards") return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lesson.narration);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <>
      {lesson.slug === "what-counts-as-ai" && (
        <section aria-labelledby="ai-start-title" className="mt-7 grid items-center gap-5 rounded-[2rem] bg-lavender p-5 sm:grid-cols-[1fr_0.55fr] sm:p-8">
          <div>
            <h2 id="ai-start-title" className="text-2xl font-bold">What is AI?</h2>
            <p className="mt-3 leading-relaxed">
              AI is short for artificial intelligence. It is a broad name for computer systems
              designed to carry out tasks such as recognising speech, interpreting messages,
              making recommendations or creating a draft.
            </p>
            <p className="mt-3 leading-relaxed">
              Some use knowledge and rules supplied by people. Others learn patterns from examples.
              Systems can also combine these approaches.
            </p>
            <p className="mt-3 leading-relaxed">
              Doing something automatically does not necessarily make it AI. A basic reminder
              that rings at the time you set can work without AI.
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
        <button
          type="button"
          aria-pressed={format === "visual"}
          onClick={() => setFormat("visual")}
          className={`${FORMAT_BUTTON} ${format === "visual" ? "bg-navy text-white" : "text-ink hover:bg-lavender"}`}
        >
          Visual walkthrough
        </button>
        <button
          type="button"
          aria-pressed={format === "guide"}
          onClick={openGuide}
          className={`${FORMAT_BUTTON} ${format === "guide" ? "bg-navy text-white" : "text-ink hover:bg-lavender"}`}
        >
          Read the guide
        </button>
      </div>

      {hasScenePlayer && (
        <div hidden={format !== "visual"}>
          <FoundationsWalkthrough active={format === "visual"} title={lesson.visualTitle} />
        </div>
      )}

      {!hasScenePlayer && format === "visual" && (
        <section
          aria-labelledby="visual-title"
          className="mt-5 rounded-[2rem] border border-line bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
                Visual explanation
              </p>
              <h2 id="visual-title" className="mt-2 text-2xl font-bold sm:text-3xl">
                {lesson.visualTitle}
              </h2>
            </div>
            {speechAvailable && (
              <button
                type="button"
                onClick={toggleNarration}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/25 bg-lavender px-4 py-2 text-sm font-semibold text-navy hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-pressed={speaking}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 shrink-0"
                >
                  <path
                    d="M3 8h3l4-4v12l-4-4H3zM13 7a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {speaking ? "Stop narration" : "Listen to the explanation"}
              </button>
            )}
          </div>

          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">
            The browser reads this explanation aloud. Voice availability and
            sound depend on your device.
          </p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {lesson.visualSteps.map((step, index) => (
              <li
                key={`${step.label}-${step.title}`}
                className={`rounded-3xl p-5 ${STEP_TONES[index % STEP_TONES.length]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <span className="rounded-full bg-white/70 px-2.5 py-1 font-mono text-xs font-semibold text-navy">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">
                      {step.label}
                    </span>
                  </div>
                  <LessonStepIllustration
                    everyday={lesson.slug === "ai-in-your-day"}
                    step={index}
                  />
                </div>
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-ink">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-2xl bg-lavender p-4 leading-relaxed text-navy">
            <strong className="block">Keep in mind</strong>
            {lesson.takeaway}
          </p>
        </section>
      )}

      {format === "guide" && (
        <section aria-labelledby="guide-title" className="mt-5">
          <div className="rounded-[2rem] border border-line bg-white p-5 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
              Step-by-step learning guide
            </p>
            <h2 id="guide-title" className="mt-2 text-2xl font-bold">
              {lesson.title}
            </h2>
            <p className="mt-3 max-w-[68ch] leading-relaxed text-muted">
              Use these steps to connect the idea to a task you recognize.
            </p>
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
                    <p className="mt-1 leading-relaxed text-ink">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-7 rounded-2xl bg-ivory p-4 leading-relaxed">
              <strong className="block">Key idea</strong>
              {lesson.takeaway}
            </p>
          </div>
        </section>
      )}
    </>
  );
}

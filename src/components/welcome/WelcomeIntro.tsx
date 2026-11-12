"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { firstLessonPath, welcomeScenes } from "@/content/welcome";

const control =
  "min-h-11 rounded-full border border-navy/25 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-lavender disabled:opacity-40";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

// Roughly comfortable reading time: a base pause plus time per word.
function sceneDuration(text: string) {
  return 2200 + text.split(/\s+/).length * 320;
}

export function WelcomeIntro() {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const last = welcomeScenes.length - 1;
  const scene = welcomeScenes[index];
  const finished = index === last;
  // Learners who ask for reduced motion step through at their own pace.
  const autoPlay = !paused && !reducedMotion && !finished;

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, last)),
      sceneDuration(scene.text),
    );
    return () => window.clearTimeout(timer);
  }, [autoPlay, scene.text, last]);

  return (
    <section
      aria-labelledby="welcome-title"
      className="relative isolate overflow-hidden rounded-[2rem] bg-hero-lavender sm:rounded-[2.5rem]"
    >
      <h1 id="welcome-title" className="sr-only">
        Welcome to Buggle Learn
      </h1>
      <div className="grid md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="px-6 pb-4 pt-8 sm:px-10 sm:pt-12 lg:px-14">
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-label="Welcome progress"
            aria-valuemin={1}
            aria-valuemax={welcomeScenes.length}
            aria-valuenow={index + 1}
            aria-valuetext={`Part ${index + 1} of ${welcomeScenes.length}`}
          >
            {welcomeScenes.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= index ? "bg-navy" : "bg-white/70"}`}
              />
            ))}
          </div>

          <div aria-live="polite" className="mt-8 min-h-[13rem] sm:min-h-[15rem]">
            <div key={scene.id} className="welcome-rise">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-xs font-semibold text-ink">
                <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
                {scene.kicker}
              </p>
              <p
                className={`mt-5 max-w-[22ch] font-display font-bold leading-[1.1] tracking-tight text-ink ${index === 0 ? "text-[clamp(2.6rem,6vw,4.4rem)]" : "text-[clamp(1.6rem,3.4vw,2.6rem)]"}`}
              >
                {scene.text}
              </p>
            </div>
          </div>

          {finished ? (
            <div className="welcome-rise mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={firstLessonPath}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Start Lesson 1: What is AI? <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="min-h-11 px-1 text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
                onClick={() => {
                  setIndex(0);
                  setPaused(false);
                }}
              >
                Replay welcome
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={control}
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              >
                <span aria-hidden="true">←</span> Back
              </button>
              {!reducedMotion && (
                <button
                  type="button"
                  className={control}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? "Play" : "Pause"}
                </button>
              )}
              <button
                type="button"
                className={control}
                onClick={() => setIndex((i) => Math.min(i + 1, last))}
              >
                Next <span aria-hidden="true">→</span>
              </button>
              <Link
                href={firstLessonPath}
                className="ml-auto inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
              >
                Skip to Lesson 1
              </Link>
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-[22rem] px-7 pb-6 pt-2 md:max-w-none md:px-6 md:py-10">
          <div
            aria-hidden="true"
            className="absolute inset-x-[12%] top-[8%] -z-10 aspect-square rounded-full border border-ink/15"
          />
          <Image
            src="/illustrations/ai-learning-hero.png"
            alt=""
            width={1448}
            height={1086}
            sizes="(min-width: 768px) 38vw, 80vw"
            priority
            className="welcome-float h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

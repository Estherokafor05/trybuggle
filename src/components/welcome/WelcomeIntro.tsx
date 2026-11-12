"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { firstLessonPath, welcome, welcomeMedia } from "@/content/welcome";

const control =
  "min-h-11 rounded-full border border-navy/25 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-lavender disabled:opacity-40";

const { scenes, cues, duration } = welcome;
const minutes = `${Math.floor(duration / 60)} min ${Math.round(duration % 60)} sec`;

function sceneAt(time: number) {
  let index = 0;
  scenes.forEach((scene, i) => {
    if (time >= scene.start) index = i;
  });
  return index;
}

export function WelcomeIntro() {
  const audio = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [failed, setFailed] = useState(false);

  const index = sceneAt(time);
  const scene = scenes[index];
  const last = scenes.length - 1;
  const cue = cues.find((c) => time >= c.start && time < c.end + 0.6);

  async function play() {
    const media = audio.current;
    if (!media) return;
    try {
      if (media.ended) media.currentTime = 0;
      setStarted(true);
      await media.play();
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  function seekTo(i: number) {
    const target = scenes[Math.max(0, Math.min(i, last))].start;
    setStarted(true);
    setTime(target);
    if (audio.current) audio.current.currentTime = target;
  }

  // While narration plays, items appear as they are spoken. When paused or
  // stepping through silently, the whole scene is shown.
  const itemVisible = (at: number) => !playing || time >= at;

  return (
    <section
      aria-labelledby="welcome-title"
      className="relative isolate overflow-hidden rounded-[2rem] bg-hero-lavender sm:rounded-[2.5rem]"
    >
      <h1 id="welcome-title" className="sr-only">
        Welcome to Buggle Learn
      </h1>
      <audio
        ref={audio}
        preload="metadata"
        src={welcomeMedia.root + "narration.mp3" + welcomeMedia.version}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(duration);
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onError={() => {
          setPlaying(false);
          setFailed(true);
        }}
      />
      <div className="grid md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="px-6 pb-6 pt-8 sm:px-10 sm:pt-12 lg:px-14">
          <div
            className="flex gap-1"
            role="progressbar"
            aria-label="Welcome progress"
            aria-valuemin={1}
            aria-valuemax={scenes.length}
            aria-valuenow={index + 1}
            aria-valuetext={`Part ${index + 1} of ${scenes.length}`}
          >
            {scenes.map((s) => {
              const fill = Math.max(
                0,
                Math.min(1, (time - s.start) / (s.end - s.start)),
              );
              return (
                <span
                  key={s.id}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70"
                >
                  <span
                    className="block h-full rounded-full bg-navy"
                    style={{ width: `${fill * 100}%` }}
                  />
                </span>
              );
            })}
          </div>

          <div className="mt-8 min-h-[15rem] sm:min-h-[17rem]">
            <div key={scene.id} className="welcome-rise">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-xs font-semibold text-ink">
                <span
                  className={`size-2 rounded-full bg-brand ${playing ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
                {scene.kicker}
              </p>
              <p
                className={`mt-5 max-w-[22ch] font-display font-bold leading-[1.1] tracking-tight text-ink ${index === 0 ? "text-[clamp(2.5rem,5.6vw,4.2rem)]" : "text-[clamp(1.6rem,3.3vw,2.5rem)]"}`}
              >
                {scene.headline}
              </p>
              {scene.items && scene.style === "list" && (
                <ol className="mt-5 grid max-w-[46ch] gap-2">
                  {scene.items.map((item, i) =>
                    itemVisible(item.at) ? (
                      <li
                        key={item.text}
                        className="welcome-rise flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink sm:text-base"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-xs text-white"
                        >
                          {i + 1}
                        </span>
                        {item.text}
                      </li>
                    ) : null,
                  )}
                </ol>
              )}
              {scene.items && scene.style === "chips" && (
                <ul className="mt-5 flex max-w-[48ch] flex-wrap gap-2">
                  {scene.items.map((item) =>
                    itemVisible(item.at) ? (
                      <li
                        key={item.text}
                        className="welcome-rise rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-navy"
                      >
                        {item.text}
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </div>
          </div>

          {!started ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={() => void play()}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4">
                  <path d="M6 4.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                </svg>
                Play the welcome ({minutes})
              </button>
              <Link
                href={firstLessonPath}
                className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
              >
                Skip to Lesson 1
              </Link>
            </div>
          ) : (
            <>
              <div
                aria-live="off"
                className="min-h-14 rounded-xl bg-navy px-4 py-3 text-sm leading-relaxed text-white sm:text-base"
              >
                {captions
                  ? (cue?.text ?? "")
                  : "Captions are hidden."}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={control}
                  disabled={index === 0}
                  onClick={() => seekTo(index - 1)}
                >
                  <span aria-hidden="true">←</span> Back
                </button>
                <button
                  type="button"
                  className={control}
                  onClick={() =>
                    playing ? audio.current?.pause() : void play()
                  }
                >
                  {playing ? "Pause" : time >= duration ? "Replay" : "Play"}
                </button>
                <button
                  type="button"
                  className={control}
                  disabled={index === last}
                  onClick={() => seekTo(index + 1)}
                >
                  Next <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className={control}
                  aria-pressed={captions}
                  onClick={() => setCaptions(!captions)}
                >
                  {captions ? "Hide captions" : "Show captions"}
                </button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={firstLessonPath}
                  className={
                    index === last
                      ? "welcome-rise inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
                      : "inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
                  }
                >
                  {index === last ? (
                    <>
                      Start Lesson 1: What is AI?{" "}
                      <span aria-hidden="true">→</span>
                    </>
                  ) : (
                    "Skip to Lesson 1"
                  )}
                </Link>
              </div>
            </>
          )}
          {failed && (
            <p role="alert" className="mt-4 rounded-xl bg-peach p-3 text-sm">
              The narration could not play. Use Next to step through, or read
              the whole welcome below.
            </p>
          )}
        </div>

        <div className="relative mx-auto hidden w-full max-w-[22rem] px-7 pb-6 pt-2 sm:block md:max-w-none md:px-6 md:py-10">
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
            className={`h-auto w-full object-contain ${playing ? "welcome-float" : ""}`}
          />
        </div>
      </div>
    </section>
  );
}

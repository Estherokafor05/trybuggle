"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { firstLessonPath, welcome, welcomeMedia } from "@/content/welcome";
import { WelcomeVisual } from "./WelcomeVisuals";

const iconControl =
  "grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-35";

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
      <div className="grid md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="order-last px-6 pb-7 pt-2 sm:px-10 md:order-first md:py-12 lg:px-12">
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

          <div className="mt-6 min-h-[7.5rem] sm:min-h-[8.5rem]">
            <div key={scene.id} className="welcome-rise">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-xs font-semibold text-ink">
                <span
                  className={`size-2 rounded-full bg-brand ${playing ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
                {scene.kicker}
              </p>
              <p className="mt-4 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-tight text-ink">
                {scene.headline}
              </p>
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
              {/* One compact player: captions above, previous / play / next below. */}
              <div className="rounded-2xl bg-navy p-3 text-white shadow-sm sm:p-4">
                <p
                  aria-live="off"
                  className="min-h-[4.75rem] px-1 text-[0.95rem] leading-relaxed sm:min-h-[3.5rem] sm:text-base"
                >
                  {cue?.text ?? ""}
                </p>
                <div className="mt-3 flex items-center justify-center border-t border-white/15 pt-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={iconControl}
                      aria-label="Previous part"
                      disabled={index === 0}
                      onClick={() => seekTo(index - 1)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
                        <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="grid size-12 place-items-center rounded-full bg-white text-navy transition-colors hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      aria-label={playing ? "Pause" : time >= duration ? "Replay" : "Play"}
                      onClick={() =>
                        playing ? audio.current?.pause() : void play()
                      }
                    >
                      {playing ? (
                        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
                          <path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 20 20" className="ml-0.5 size-5">
                          <path d="M6 4.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className={iconControl}
                      aria-label="Next part"
                      disabled={index === last}
                      onClick={() => seekTo(index + 1)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
                        <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
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

        <div className="relative mx-auto w-full max-w-[30rem] px-5 pt-6 md:max-w-none md:px-6 md:py-8 lg:px-10">
          <div key={scene.id} className="welcome-rise">
            <WelcomeVisual
              sceneId={scene.id}
              shown={(scene.items ?? []).map((item) => itemVisible(item.at))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

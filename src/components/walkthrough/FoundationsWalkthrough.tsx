"use client";

import { useEffect, useRef, useState } from "react";
import { FoundationRecap } from "@/components/walkthrough/FoundationRecap";
import { FoundationsScenes } from "@/components/walkthrough/FoundationsScenes";
import { foundationScenes } from "@/content/foundations-walkthrough";

import { dayScenes } from "@/content/day-walkthrough";
import { DayScenes } from "./DayScenes";

const secondaryButton =
  "min-h-11 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-lavender aria-disabled:cursor-default aria-disabled:opacity-45 aria-disabled:hover:bg-white";
const primaryButton =
  "min-h-11 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep aria-disabled:cursor-default aria-disabled:opacity-45 aria-disabled:hover:bg-navy";

type Cursor =
  | { mode: "slide"; slideIndex: number }
  | { mode: "narration"; sceneIndex: number; position: number };

function formatTime(seconds: number) {
  const wholeSeconds = Math.floor(seconds);
  return (
    String(Math.floor(wholeSeconds / 60)) +
    ":" +
    String(wholeSeconds % 60).padStart(2, "0")
  );
}

export function FoundationsWalkthrough({
  active,
  title,
  kind = "four-ways",
}: {
  active: boolean;
  title: string;
  kind?: "four-ways" | "day";
}) {
  const scenes = kind === "day" ? dayScenes : foundationScenes;
  const slides = scenes.flatMap((scene, sceneIndex) =>
    scene.cues.map((_, cueIndex) => ({ sceneIndex, cueIndex })),
  );
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sceneHeading = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);
  const [cursor, setCursor] = useState<Cursor>({
    mode: "slide",
    slideIndex: 0,
  });
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const manual = cursor.mode === "slide";
  const sceneIndex = manual
    ? slides[cursor.slideIndex].sceneIndex
    : cursor.sceneIndex;
  const scene = scenes[sceneIndex];
  const cueIndex = manual
    ? slides[cursor.slideIndex].cueIndex
    : Math.max(
        0,
        scene.cues.findLastIndex((cue) => cue.at <= cursor.position),
      );
  const cue = scene.cues[cueIndex];
  const slideIndex = manual
    ? cursor.slideIndex
    : slides.findIndex(
        (slide) =>
          slide.sceneIndex === sceneIndex && slide.cueIndex === cueIndex,
      );
  const position = manual ? cue.at : cursor.position;
  const elapsed = Math.min(position, scene.duration);
  const firstSlide = slideIndex === 0;
  const lastSlide = slideIndex === slides.length - 1;
  const slideNumber = `Slide ${slideIndex + 1} of ${slides.length}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!active) audio?.pause();
    return () => audio?.pause();
  }, [active, scene.id]);

  useEffect(() => {
    if (focusHeading.current) {
      focusHeading.current = false;
      sceneHeading.current?.focus();
    }
  }, [slideIndex]);

  function showSlide(index: number, moveFocus = false) {
    if (!slides[index]) return;
    audioRef.current?.pause();
    setPlaying(false);
    if (slides[index].sceneIndex !== sceneIndex) setAudioUnavailable(false);
    focusHeading.current = moveFocus;
    setCursor({ mode: "slide", slideIndex: index });
  }

  function openExample(id: string) {
    showSlide(
      slides.findIndex((slide) => scenes[slide.sceneIndex].id === id),
      true,
    );
  }

  function syncPosition(audio: HTMLAudioElement) {
    if (audio !== audioRef.current) return;
    const time = audio.currentTime;
    setCursor((current) =>
      current.mode === "narration" && current.sceneIndex === sceneIndex
        ? { ...current, position: time }
        : current,
    );
  }

  async function playFrom(seconds: number) {
    const audio = audioRef.current;
    if (!audio || !active) return;

    try {
      if (audio.error) audio.load();
      audio.currentTime = seconds;
      audio.playbackRate = rate;
      audio.volume = volume;
      setCursor({ mode: "narration", sceneIndex, position: seconds });
      setAudioUnavailable(false);
      await audio.play();
    } catch (error) {
      if (
        audio === audioRef.current &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        setPlaying(false);
        setAudioUnavailable(true);
      }
    }
  }

  function togglePlayback() {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      return;
    }
    void playFrom(!manual && audio?.ended ? 0 : position);
  }

  return (
    <section
      aria-labelledby="visual-title"
      className="mt-5 rounded-[2rem] border border-line bg-white p-4 shadow-sm sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
            Visual lesson
          </p>
          <h2 id="visual-title" className="mt-2 text-2xl font-bold sm:text-3xl">
            {title}
          </h2>
        </div>
        <p
          id="slide-number"
          className="rounded-full bg-lavender px-3 py-1.5 text-sm font-semibold text-navy"
        >
          {slideNumber}
        </p>
      </div>
      <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted">
        Click through the slides at your own pace, or play narration to hear
        this section from the current slide.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Slide navigation" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-disabled={firstSlide}
            onClick={() => showSlide(slideIndex - 1)}
            className={secondaryButton}
          >
            Previous slide
          </button>
          <button
            type="button"
            aria-disabled={lastSlide}
            onClick={() => showSlide(slideIndex + 1)}
            className={primaryButton}
          >
            Next slide
          </button>
        </nav>
        <button
          type="button"
          onClick={togglePlayback}
          className={secondaryButton}
        >
          {playing
            ? "Pause narration"
            : audioUnavailable
              ? "Retry narration"
              : "Play narration"}
        </button>
      </div>
      <p role="status" aria-atomic="true" className="sr-only">
        {manual
          ? `${slideNumber}. ${scene.title}. ${cue.visual} ${cue.text}`
          : ""}
      </p>

      <h3
        ref={sceneHeading}
        tabIndex={-1}
        aria-describedby="slide-number"
        className="mt-5 scroll-mt-24 text-xl font-bold sm:text-2xl"
      >
        {scene.title}
      </h3>
      <audio
        key={scene.id}
        ref={audioRef}
        src={scene.audioSrc}
        preload="metadata"
        onPlay={(event) => {
          if (
            event.currentTarget === audioRef.current &&
            !event.currentTarget.paused
          )
            setPlaying(true);
        }}
        onPause={(event) => {
          if (
            event.currentTarget !== audioRef.current ||
            !event.currentTarget.paused
          )
            return;
          setPlaying(false);
          syncPosition(event.currentTarget);
        }}
        onEnded={(event) => {
          if (event.currentTarget !== audioRef.current) return;
          setPlaying(false);
          syncPosition(event.currentTarget);
        }}
        onTimeUpdate={(event) => syncPosition(event.currentTarget)}
        onError={(event) => {
          if (event.currentTarget !== audioRef.current) return;
          setPlaying(false);
          setAudioUnavailable(true);
        }}
      />
      {audioUnavailable && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-peach px-4 py-3 text-sm text-ink"
        >
          The narration could not play. You can keep using the slide buttons or
          read the section transcript.
        </p>
      )}

      <div
        className="mt-4 min-w-0"
        onClickCapture={() => audioRef.current?.pause()}
      >
        {kind === "day" ? (
          <DayScenes
            key={scene.id + ":" + cueIndex}
            scene={scene.id}
            cue={cueIndex}
            onSelect={openExample}
          />
        ) : scene.id === "recap" ? (
          <FoundationRecap cue={cueIndex} onSelect={openExample} />
        ) : (
          <FoundationsScenes
            key={scene.id + ":" + cueIndex}
            scene={scene.id}
            cue={cueIndex}
          />
        )}
      </div>
      {manual || audioUnavailable ? (
        <div className="mt-3 rounded-2xl bg-ivory px-4 py-3 text-sm leading-relaxed text-navy sm:px-5 sm:text-base">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-deep">
            On this slide
          </p>
          <p className="mt-1">{cue.text}</p>
        </div>
      ) : (
        captions && (
          <div
            role="group"
            aria-label="Current caption"
            className="mt-3 rounded-2xl bg-navy px-4 py-3 text-sm leading-relaxed text-white sm:px-5 sm:text-base"
          >
            <p>{cue.text}</p>
          </div>
        )
      )}

      {!manual && (
        <div
          role="group"
          aria-label="Narration options"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <div className="flex min-w-40 flex-1 items-center gap-3">
            <input
              type="range"
              aria-label="Narration position"
              min={0}
              max={scene.duration}
              step={0.1}
              value={elapsed}
              onChange={(event) => {
                const time = Number(event.target.value);
                if (audioRef.current) audioRef.current.currentTime = time;
                setCursor({ mode: "narration", sceneIndex, position: time });
              }}
              className="min-h-11 min-w-0 flex-1 accent-brand"
            />
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {formatTime(elapsed)} / {formatTime(scene.duration)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void playFrom(0)}
            className={secondaryButton}
          >
            Replay section
          </button>
          <button
            type="button"
            aria-pressed={captions}
            onClick={() => setCaptions(!captions)}
            className={secondaryButton}
          >
            Captions
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label>
          Speed{" "}
          <select
            className="ml-2 min-h-11 rounded-lg border border-line bg-white px-2"
            value={rate}
            onChange={(event) => {
              const value = Number(event.target.value);
              setRate(value);
              if (audioRef.current) audioRef.current.playbackRate = value;
            }}
          >
            {[0.75, 1, 1.25, 1.5].map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Volume{" "}
          <input
            aria-label="Narration volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => {
              const value = Number(event.target.value);
              setVolume(value);
              if (audioRef.current) audioRef.current.volume = value;
            }}
            className="min-h-11 w-24 accent-brand"
          />
        </label>
      </div>
      {lastSlide && (
        <button
          type="button"
          onClick={() => showSlide(0, true)}
          className={`mt-4 ${secondaryButton}`}
        >
          Start walkthrough again
        </button>
      )}

      <details className="mt-5 rounded-2xl border border-line bg-canvas px-4 py-2">
        <summary className="cursor-pointer rounded-md py-2.5 text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep">
          Read the section transcript
        </summary>
        <ol className="mb-3 mt-1 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-ink">
          {scene.cues.map((item) => (
            <li key={item.at}>
              <p className="font-semibold">{item.visual}</p>
              <p className="mt-1">{item.text}</p>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

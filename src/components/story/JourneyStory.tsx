"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  chapterAt,
  journeyChapters,
  journeyEstimate,
  JOURNEY_DURATION,
} from "@/content/journey-story";
import narration from "../../../public/lessons/maya-journey/narration.json";
const root = "/lessons/maya-journey/";
const button =
  "min-h-11 rounded-full border border-navy/25 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep disabled:opacity-40";
function subscribeMotion(callback: () => void) {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", callback);
  return () => m.removeEventListener("change", callback);
}
function subscribeWidth(callback: () => void) {
  const m = window.matchMedia("(max-width: 600px)");
  m.addEventListener("change", callback);
  return () => m.removeEventListener("change", callback);
}
const no = () => false;
export function JourneyStory({ active }: { active: boolean }) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    no,
  );
  const mobile = useSyncExternalStore(
    subscribeWidth,
    () => window.matchMedia("(max-width: 600px)").matches,
    no,
  );
  const [choice, setChoice] = useState<"video" | "steps" | null>(null),
    mode = choice ?? (reduced ? "steps" : "video");
  const video = useRef<HTMLVideoElement>(null),
    audio = useRef<HTMLAudioElement>(null),
    position = useRef(0);
  const [time, setTime] = useState(0),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [captions, setCaptions] = useState(true),
    [failed, setFailed] = useState(false);
  const [traffic, setTraffic] = useState<"light" | "heavy">("heavy");
  const estimates = journeyEstimate(traffic);
  const cue = narration.cues.find((c) => time >= c.start && time < c.end);
  useEffect(() => {
    if (!active) {
      video.current?.pause();
      audio.current?.pause();
    }
  }, [active]);
  function stop() {
    video.current?.pause();
    audio.current?.pause();
    setPlaying(false);
  }
  function selectMode(next: "video" | "steps") {
    stop();
    setStep(chapterAt(time));
    setChoice(next);
    setFailed(false);
  }
  function openStep(index: number) {
    if (index < 0 || index >= journeyChapters.length) return;
    stop();
    setStep(index);
    position.current = journeyChapters[index].at;
    setTime(position.current);
  }
  async function play() {
    const media = mode === "video" ? video.current : audio.current;
    if (!media) return;
    if (!media.paused) {
      media.pause();
      return;
    }
    try {
      if (media.error) media.load();
      media.currentTime =
        position.current >= JOURNEY_DURATION - 0.1 ? 0 : position.current;
      await media.play();
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }
  function sync(media: HTMLMediaElement) {
    position.current = media.currentTime;
    setTime(media.currentTime);
    if (mode === "steps") setStep(chapterAt(media.currentTime));
  }
  function jump(at: number) {
    stop();
    position.current = at;
    setTime(at);
    setStep(chapterAt(at));
    if (video.current) video.current.currentTime = at;
    if (audio.current) audio.current.currentTime = at;
  }
  return (
    <section
      aria-labelledby="story-title"
      className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-white shadow-sm"
    >
      <div className="p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-deep">
          An animated story · 57 seconds
        </p>
        <h2 id="story-title" className="mt-2 text-2xl font-bold sm:text-3xl">
          Getting to the centre
        </h2>
        <p className="mt-2 text-muted">
          Follow Maya as she checks her journey before leaving home.
        </p>
        <div
          role="group"
          aria-label="Story format"
          className="mt-4 flex flex-wrap gap-2"
        >
          <button
            className={button}
            aria-pressed={mode === "video"}
            onClick={() => selectMode("video")}
          >
            Watch the animation
          </button>
          <button
            className={button}
            aria-pressed={mode === "steps"}
            onClick={() => selectMode("steps")}
          >
            Explore step by step
          </button>
        </div>
        {reduced && (
          <p className="mt-3 text-sm text-muted">
            Still images are available for reduced motion. You can choose to
            play the animation.
          </p>
        )}
      </div>
      <div className="bg-ivory">
        {mode === "video" ? (
          <video
            key={mobile ? "mobile" : "wide"}
            ref={video}
            className="block h-auto w-full"
            playsInline
            controls
            preload="metadata"
            poster={root + (mobile ? "poster-mobile.jpg" : "poster.jpg")}
            src={root + (mobile ? "story-mobile.mp4" : "story.mp4")}
            aria-label="Maya checks her journey to the community centre"
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = position.current;
            }}
            onPlay={() => {
              setPlaying(true);
              setFailed(false);
            }}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => sync(e.currentTarget)}
            onEnded={() => setPlaying(false)}
            onError={() => {
              setPlaying(false);
              setFailed(true);
            }}
          >
            <track
              kind="captions"
              src={root + "captions.vtt"}
              srcLang="en"
              label="English"
            />
          </video>
        ) : (
          <div>
            <picture>
              <source
                media="(max-width: 600px)"
                srcSet={root + `step-${step + 1}-mobile.jpg`}
              />
              <Image
                width={1920}
                height={1080}
                className="h-auto w-full"
                src={root + `step-${step + 1}.jpg`}
                alt={journeyChapters[step].description}
              />
            </picture>
            <audio
              ref={audio}
              src={root + "narration.m4a"}
              preload="none"
              onPlay={() => {
                setPlaying(true);
                setFailed(false);
              }}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => sync(e.currentTarget)}
              onEnded={() => setPlaying(false)}
              onError={() => {
                setPlaying(false);
                setFailed(true);
              }}
            />
            <div className="p-4" aria-live={playing ? "off" : "polite"}>
              <p className="font-semibold">
                {step + 1} of {journeyChapters.length}:{" "}
                {journeyChapters[step].title}
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {journeyChapters[step].description}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div
          aria-label="Current narration caption"
          className="min-h-20 rounded-xl bg-navy px-4 py-3 text-sm leading-relaxed text-white sm:text-base"
        >
          {captions
            ? (cue?.text ??
              (playing ? "" : "Captions appear here when narration plays."))
            : "Captions are hidden."}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={button} onClick={() => void play()}>
            {playing
              ? "Pause"
              : mode === "steps"
                ? "Listen with still images"
                : "Play story"}
          </button>
          <button className={button} onClick={() => jump(0)}>
            Back to the start
          </button>
          <button
            className={button}
            aria-pressed={captions}
            onClick={() => setCaptions(!captions)}
          >
            Captions
          </button>
          {mode === "steps" && (
            <>
              <button
                className={button}
                disabled={step === 0}
                onClick={() => openStep(step - 1)}
              >
                Previous moment
              </button>
              <button
                className={button}
                disabled={step === journeyChapters.length - 1}
                onClick={() => openStep(step + 1)}
              >
                Next moment
              </button>
            </>
          )}
        </div>
        {mode === "steps" && (
          <label className="mt-4 flex items-center gap-3 text-sm">
            Narration position
            <input
              type="range"
              className="min-h-11 min-w-0 flex-1 accent-brand"
              min={0}
              max={JOURNEY_DURATION}
              step={0.1}
              value={time}
              onChange={(e) => jump(Number(e.target.value))}
            />
          </label>
        )}
        {failed && (
          <p role="alert" className="mt-3 rounded-xl bg-peach p-3">
            The recording could not play. Try Play again, explore the still
            images or read the transcript below.
          </p>
        )}
        <details className="mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer py-2 font-semibold">
            Jump to a moment
          </summary>
          <ol className="mt-2 grid gap-2 sm:grid-cols-2">
            {journeyChapters.map((c, i) => (
              <li key={c.at}>
                <button
                  className="min-h-11 text-left text-sm underline underline-offset-4"
                  onClick={() => jump(c.at)}
                >
                  {i + 1}. {c.title}
                </button>
              </li>
            ))}
          </ol>
        </details>
        <details className="mt-2">
          <summary className="cursor-pointer py-2 font-semibold">
            Read the descriptive transcript
          </summary>
          <ol className="mt-3 space-y-4">
            {journeyChapters.map((c, i) => (
              <li key={c.at}>
                <h3 className="font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  On screen: {c.description}
                </p>
                {narration.cues
                  .filter(
                    (q) =>
                      q.start >= c.at &&
                      q.start <
                        (journeyChapters[i + 1]?.at ?? JOURNEY_DURATION),
                  )
                  .map((q) => (
                    <p key={q.start} className="mt-2 leading-relaxed">
                      {q.text}
                    </p>
                  ))}
              </li>
            ))}
          </ol>
        </details>
      </div>
      <section
        aria-labelledby="traffic-title"
        className="border-t border-line bg-mint p-5 sm:p-7"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-teal">
          Try it yourself
        </p>
        <h3 id="traffic-title" className="mt-2 text-xl font-bold">
          What changes when traffic builds up?
        </h3>
        <p className="mt-2 text-sm leading-relaxed">
          Keep the same two roads. Change the traffic on Maya’s usual route and
          compare the estimated times.
        </p>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">
            Traffic on the usual road
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(["light", "heavy"] as const).map((value) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-navy/25 bg-white px-4"
              >
                <input
                  type="radio"
                  name="journey-traffic"
                  checked={traffic === value}
                  onChange={() => setTraffic(value)}
                  className="accent-brand"
                />
                {value === "light" ? "Light traffic" : "Heavy traffic"}
              </label>
            ))}
          </div>
        </fieldset>
        <svg
          viewBox="0 0 640 220"
          role="img"
          aria-label={`The same roads: usual road estimated ${estimates.usual} minutes; other route 20 minutes.`}
          className="mt-5 w-full rounded-2xl bg-ivory"
        >
          <path
            d="M45 115H170V45H570V115M45 115V185H570V115"
            fill="none"
            stroke="#d7d9d1"
            strokeWidth="20"
            strokeLinejoin="round"
          />
          <path
            d="M45 115H170V45H570V115"
            fill="none"
            stroke={traffic === "heavy" ? "#9d492d" : "#7155d9"}
            strokeWidth="6"
          />
          <path
            d="M45 115V185H570V115"
            fill="none"
            stroke="#087f72"
            strokeWidth="6"
            strokeDasharray="14 7"
          />
          {Array.from({ length: traffic === "heavy" ? 7 : 2 }, (_, i) => (
            <rect
              key={i}
              x={245 + i * 32}
              y={38}
              width="23"
              height="14"
              rx="5"
              fill="#17243c"
            />
          ))}
          <circle cx="45" cy="115" r="16" fill="#17243c" />
          <circle cx="570" cy="115" r="16" fill="#087f72" />
          <text x="26" y="153" fontSize="19" fill="#17243c">
            Home
          </text>
          <text x="500" y="153" fontSize="19" fill="#17243c">
            Centre
          </text>
        </svg>
        <div role="status" aria-atomic="true" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            <p className="rounded-xl bg-white p-3 text-sm">
              Usual road
              <strong className="mt-1 block text-2xl">
                {estimates.usual} min
              </strong>
              estimated
            </p>
            <p className="rounded-xl bg-white p-3 text-sm">
              Other route<strong className="mt-1 block text-2xl">20 min</strong>
              estimated
            </p>
          </div>
          <p className="mt-3 font-semibold">
            {traffic === "heavy"
              ? "With heavier traffic, the other route is estimated to be quicker."
              : "With light traffic, the usual road is estimated to be quicker."}
          </p>
          <p className="mt-1 text-sm">
            The roads did not get longer. The traffic changed. Maya still needs
            to check that the suggested route suits her.
          </p>
        </div>
        <p className="mt-3 text-xs text-muted">
          Fictional journey and example times. This exercise demonstrates a
          concept; it does not predict real traffic.
        </p>
      </section>
    </section>
  );
}

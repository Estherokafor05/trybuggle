"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { StoryNarration } from "@/content/stories";
import type { FilmChoice } from "./filmChoices";

function subscribeWidth(callback: () => void) {
  const query = window.matchMedia("(max-width: 600px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const serverValue = () => false;

export type NextStep = {
  href: string;
  label: string;
  title: string;
  available: boolean;
};

export function StoryPlayer({
  active,
  root,
  mediaVersion,
  narration,
  title,
  introduction,
  initialTime = 0,
  onPlace,
  next,
  choice,
}: {
  active: boolean;
  root: string;
  mediaVersion: string;
  narration: StoryNarration;
  title: string;
  introduction: string;
  initialTime?: number;
  onPlace: (time: number) => void;
  next?: NextStep;
  /** A question the film stops to ask at the end of its "choice" scene. */
  choice?: FilmChoice;
}) {
  const mobile = useSyncExternalStore(
    subscribeWidth,
    () => window.matchMedia("(max-width: 600px)").matches,
    serverValue,
  );
  const video = useRef<HTMLVideoElement>(null);
  const position = useRef(initialTime);
  const lastSaved = useRef(initialTime);
  const [failed, setFailed] = useState(false);
  const [ended, setEnded] = useState(false);
  // The film pauses where the narrator says "make your choice".
  const choiceCues = narration.cues.filter((c) => c.scene === "choice");
  const pauseAt = choice && choiceCues.length ? choiceCues[choiceCues.length - 1].end : null;
  const asked = useRef(false);
  const [asking, setAsking] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const choiceHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (asking) choiceHeading.current?.focus();
  }, [asking]);
  const resume = () => {
    setAsking(false);
    setPicked(null);
    video.current?.play().catch(() => undefined);
    video.current?.focus();
  };
  const chosen = choice?.options.find((o) => o.id === picked);
  useEffect(() => {
    if (!active) video.current?.pause();
  }, [active]);
  useEffect(() => {
    video.current?.pause();
  }, [mobile]);
  return (
    <section
      aria-labelledby="film-title"
      className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-white shadow-sm"
    >
      <h2 id="film-title" className="sr-only">
        Film: {title}
      </h2>
      <div className="relative">
      <video
        key={mobile ? "mobile" : "desktop"}
        ref={video}
        controls
        playsInline
        preload="metadata"
        className="block h-auto w-full bg-ivory"
        poster={
          root + (mobile ? "poster-mobile.jpg" : "poster.jpg") + mediaVersion
        }
        src={root + (mobile ? "story-mobile.mp4" : "story.mp4") + mediaVersion}
        aria-label={`Narrated illustrated film: ${title}`}
        onLoadedMetadata={(e) => {
          // Resume only a real position, so the poster stays visible at 0:00.
          if (position.current > 0.5 && position.current < narration.duration - 1)
            e.currentTarget.currentTime = position.current;
        }}
        onPlay={() => {
          setFailed(false);
          setEnded(false);
        }}
        onPause={(e) =>
          onPlace(Math.min(narration.duration, e.currentTarget.currentTime))
        }
        onSeeked={(e) => {
          // Going back before the choice asks it again.
          if (pauseAt !== null && e.currentTarget.currentTime < pauseAt - 0.5) asked.current = false;
        }}
        onTimeUpdate={(e) => {
          const now = e.currentTarget.currentTime;
          if (pauseAt !== null && !asked.current && position.current < pauseAt && now >= pauseAt && now - pauseAt < 1.5) {
            asked.current = true;
            const v = e.currentTarget as HTMLVideoElement & { webkitDisplayingFullscreen?: boolean; webkitExitFullscreen?: () => void };
            v.pause();
            // The card cannot show over a phone's own full-screen player, so leave it first.
            if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
            if (v.webkitDisplayingFullscreen) v.webkitExitFullscreen?.();
            setAsking(true);
          }
          position.current = now;
          if (Math.abs(position.current - lastSaved.current) >= 5) {
            lastSaved.current = position.current;
            onPlace(Math.min(narration.duration, position.current));
          }
        }}
        onEnded={() => {
          setEnded(true);
          onPlace(narration.duration);
        }}
        onError={() => setFailed(true)}
      >
        <track
          kind="captions"
          src={root + "captions.vtt" + mediaVersion}
          srcLang="en"
          label="English"
          default
        />
      </video>
      {asking && choice && (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-navy/85 p-3 sm:p-6">
          <div role="dialog" aria-modal="false" aria-labelledby="film-choice-title" className="welcome-rise my-auto w-full max-w-xl rounded-2xl bg-white p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep">Your choice</p>
            <h3 id="film-choice-title" ref={choiceHeading} tabIndex={-1} className="mt-1 text-lg font-bold leading-snug outline-none sm:text-xl">
              {choice.question}
            </h3>
            <div className="mt-3 grid gap-2">
              {choice.options.map((o) => {
                const on = picked === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(o.id)}
                    className={`min-h-11 rounded-xl border-2 px-3 py-2 text-left text-sm leading-snug sm:text-base ${on ? (o.correct ? "border-teal bg-mint/70" : "border-orange-400 bg-peach/60") : "border-line hover:bg-canvas"}`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <p role="status" className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${chosen.correct ? "bg-mint/60" : "bg-peach/60"}`}>
                <b>{chosen.correct ? "✓ Right." : "↺ Not quite. Try another, or carry on."}</b> {chosen.feedback}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button type="button" onClick={resume} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
                Continue the film <span aria-hidden="true">▶</span>
              </button>
              {!chosen && <span className="text-xs text-muted">Choose an answer, or carry on without one.</span>}
            </div>
          </div>
        </div>
      )}
      </div>
      <div className="p-5 sm:p-6">
        <p className="leading-relaxed text-muted">{introduction}</p>
        {ended && (
          <div
            role="status"
            className="welcome-rise mt-4 rounded-2xl bg-mint p-5 sm:p-6"
          >
            <p className="text-xl font-bold">Nice work! What next?</p>
            <p className="mt-2 max-w-[60ch] leading-relaxed text-ink">
              Next is Step 2: take the knowledge check to see what stuck.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="#knowledge-check"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Take the knowledge check
              </a>
              {next &&
                (next.available ? (
                  <Link
                    href={next.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/25 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-lavender"
                  >
                    {next.label}: {next.title} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span className="text-sm text-muted">
                    {next.label}: {next.title} (coming soon)
                  </span>
                ))}
            </div>
          </div>
        )}
        {failed && (
          <p role="alert" className="mt-3 rounded-xl bg-peach p-3">
            The film couldn&apos;t play. Try again, or switch to Read &amp;
            Explore.
          </p>
        )}
        <details className="mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer py-2 font-semibold">
            Read the transcript
          </summary>
          <div className="mt-3 space-y-4">
            {narration.scenes.map((scene) => (
              <p key={scene.id} className="leading-relaxed">
                {narration.cues
                  .filter((c) => c.scene === scene.id)
                  .map((c) => c.text)
                  .join(" ")}
              </p>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { StoryNarration } from "@/content/stories";

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
        onTimeUpdate={(e) => {
          position.current = e.currentTarget.currentTime;
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

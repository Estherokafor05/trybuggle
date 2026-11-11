"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import narration from "../../../public/lessons/maya-day/narration.json";

const root = "/lessons/maya-day/";
const mediaVersion = "?v=a2cb24cf";
const control = "min-h-11 rounded-full border border-navy/25 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";
function subscribeWidth(callback: () => void) {
  const query = window.matchMedia("(max-width: 600px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const serverValue = () => false;
export function MayaDayFilm({ active }: { active: boolean }) {
  const mobile = useSyncExternalStore(subscribeWidth, () => window.matchMedia("(max-width: 600px)").matches, serverValue);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, serverValue);
  const video = useRef<HTMLVideoElement>(null);
  const position = useRef(0);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [failed, setFailed] = useState(false);
  const cue = narration.cues.find(c => time >= c.start && time < c.end);
  useEffect(() => { if (!active) video.current?.pause(); }, [active]);
  useEffect(() => { video.current?.pause(); }, [mobile]);
  async function play(restart = false) {
    const media = video.current;
    if (!media || !active) return;
    try {
      if (media.error) media.load();
      if (restart) {
        media.currentTime = 0;
        position.current = 0;
        setTime(0);
      } else if (media.ended) media.currentTime = 0;
      if (!started.current) {
        media.muted = false;
        media.volume = 1;
        started.current = true;
      }
      await media.play();
      setFailed(false);
    } catch { setFailed(true); }
  }
  return <section aria-labelledby="film-title" className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-white shadow-sm">
    <div className="p-5 sm:p-7">
      <h2 id="film-title" className="text-2xl font-bold sm:text-3xl">A day with Maya</h2>
      <p className="mt-2 max-w-[65ch] text-muted">Maya is preparing an evening photography club. Watch how she uses familiar tools and checks what they tell her.</p>
      {reducedMotion && <p className="mt-2 text-sm text-muted">The film stays paused until you choose to play it. You can use the written guide or transcript if you prefer.</p>}
    </div>
    <video
      key={mobile ? "mobile" : "desktop"}
      ref={video}
      controls
      playsInline
      preload="metadata"
      className="block h-auto w-full bg-ivory"
      poster={root + (mobile ? "poster-mobile.jpg" : "poster.jpg") + mediaVersion}
      src={root + (mobile ? "story-mobile.mp4" : "story.mp4") + mediaVersion}
      aria-label="Narrated illustrated story following Maya through a day at the community centre"
      onLoadedMetadata={e => { e.currentTarget.currentTime = position.current; setPlaying(false); }}
      onPlay={() => { setPlaying(true); setFailed(false); }}
      onPause={() => setPlaying(false)}
      onTimeUpdate={e => { position.current = e.currentTarget.currentTime; setTime(position.current); }}
      onVolumeChange={e => setMuted(e.currentTarget.muted || e.currentTarget.volume === 0)}
      onEnded={() => setPlaying(false)}
      onError={() => { setPlaying(false); setFailed(true); }}
    >
      <track kind="captions" src={root + "captions.vtt" + mediaVersion} srcLang="en" label="English" />
    </video>
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} onClick={() => playing ? video.current?.pause() : void play()}>{playing ? "Pause film" : "Play film with narration"}</button>
        <button type="button" className={control} onClick={() => void play(true)}>Replay film</button>
        <button type="button" className={control} aria-pressed={captions} onClick={() => setCaptions(!captions)}>{captions ? "Hide captions" : "Show captions"}</button>
        {muted && <button type="button" className={control} onClick={() => { if (video.current) { video.current.muted = false; video.current.volume = 1; } }}>Turn narration on</button>}
      </div>
      <div aria-label="Current narration caption" className="mt-4 min-h-16 rounded-xl bg-navy px-4 py-3 text-sm leading-relaxed text-white sm:text-base">
        {captions ? (cue?.text ?? (playing ? "" : "Narration appears here as the film plays.")) : "Captions are hidden."}
      </div>
      {failed && <p role="alert" className="mt-3 rounded-xl bg-peach p-3">The film could not play. Try again or read the guide or transcript below.</p>}
      <details className="mt-4 border-t border-line pt-3">
        <summary className="cursor-pointer py-2 font-semibold">Read the transcript</summary>
        <div className="mt-3 space-y-4">
          {narration.scenes.map(scene => <p key={scene.id} className="leading-relaxed">
            {narration.cues.filter(c => c.scene === scene.id).map(c => c.text).join(" ")}
          </p>)}
        </div>
      </details>
    </div>
  </section>;
}

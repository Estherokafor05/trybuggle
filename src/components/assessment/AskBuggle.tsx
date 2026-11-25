"use client";
// "Want to know why? Ask Buggle": the friendly helper pops up, thinks for a
// moment, then explains the answer. The explanation is written by the course
// team and says so: an AI literacy course must never pass people's writing off
// as AI. Asking a real AI model for more comes later, for premium learners.
import { useEffect, useId, useRef, useState } from "react";

function Robot({ thinking }: { thinking: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="-34 -70 68 100" className="wv-pop size-14 shrink-0">
      <g className="wv-bob">
        <line x1="0" y1="-46" x2="0" y2="-58" stroke="#17243c" strokeWidth="3" strokeLinecap="round" />
        <circle cy="-62" r="5" fill="#f6a0d6" className={thinking ? "wv-ring" : ""} />
        <rect x="-30" y="-46" width="60" height="46" rx="16" fill="#7155d9" />
        <rect x="-22" y="-38" width="44" height="28" rx="10" fill="#ffffff" />
        {thinking ? (
          <>
            <circle cx="-9" cy="-24" r="3.5" fill="#17243c" />
            <circle cx="9" cy="-24" r="3.5" fill="#17243c" />
            <path d="M-6 -15h12" stroke="#17243c" strokeWidth="2.4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="-9" cy="-25" r="4" fill="#17243c" />
            <circle cx="9" cy="-25" r="4" fill="#17243c" />
            <path d="M-7 -16Q0 -11 7 -16" stroke="#17243c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        )}
        <rect x="-20" y="4" width="40" height="22" rx="9" fill="#d5c9f7" />
        <circle cy="15" r="4" fill="#f6a0d6" />
      </g>
    </svg>
  );
}

export function AskBuggle({ correct, explanation }: { correct: boolean; explanation: string }) {
  const [state, setState] = useState<"closed" | "thinking" | "open">("closed");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function ask() {
    if (state !== "closed") return setState("closed");
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) return setState("open");
    setState("thinking");
    timer.current = setTimeout(() => setState("open"), 900);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={ask}
        aria-expanded={state !== "closed"}
        aria-controls={id}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/40 bg-lavender px-4 text-sm font-semibold text-navy hover:bg-hero-lavender"
      >
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">
          ?
        </span>
        {state === "closed"
          ? `${correct ? "Right!" : "Wrong."} Want to know why? Ask Buggle`
          : "Close Buggle's explanation"}
      </button>
      <div id={id} aria-live="polite">
        {state !== "closed" && (
          <div className="mt-3 flex items-start gap-3">
            <Robot thinking={state === "thinking"} />
            <div className="wv-pop relative min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm ring-1 ring-line">
              {state === "thinking" ? (
                <p className="text-sm font-semibold text-muted">
                  Buggle is thinking<span className="sr-only">…</span>
                  <span aria-hidden="true" className="ml-1 inline-flex gap-1 align-middle">
                    {[0, 0.2, 0.4].map((d) => (
                      <span key={d} className="wv-bob inline-block size-1.5 rounded-full bg-brand" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </span>
                </p>
              ) : (
                <>
                  <p className="text-sm font-bold text-navy">{correct ? "Here's why that's right" : "Here's why that's not quite right"}</p>
                  <p className="mt-1 leading-relaxed text-ink">{explanation}</p>
                  <p className="mt-3 text-xs text-muted">
                    Written by the Buggle Learn course team, not by AI.
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-navy">
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-3.5">
                      <rect x="3" y="7" width="10" height="7" rx="1.6" />
                      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                    </svg>
                    Ask AI for more: coming soon for premium learners
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

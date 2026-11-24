"use client";
// Reusable learning blocks shared by every course: buttons, story and idea
// panels, choices with feedback, timed phases, the typewriter effect and
// private reflection notes. Course-specific activities live under courses/.
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ActivityState } from "@/lib/learning-state";

export const activityButton =
  "min-h-11 rounded-xl border border-line bg-white px-4 py-3 text-left font-semibold hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";
export const primaryButton =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep disabled:opacity-40";

export type Change = (value: ActivityState) => void;
export type Props = {
  id: string;
  state: ActivityState;
  all: Record<string, ActivityState>;
  change: Change;
  go: (step: number) => void;
  slug: string;
  scope: string;
  prompts: string[];
};

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Steps through numbered phases on a timer. Reduced motion jumps to the end. */
export function usePhases(durations: number[], onDone?: () => void) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const timers = useRef<number[]>([]);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function play() {
    timers.current.forEach(clearTimeout);
    if (reduced) {
      setPhase(durations.length + 1);
      done.current?.();
      return;
    }
    setPhase(1);
    let at = 0;
    timers.current = durations.map((ms, i) => {
      at += ms;
      return window.setTimeout(() => {
        setPhase(i + 2);
        if (i === durations.length - 1) done.current?.();
      }, at);
    });
  }
  return { phase, play, setPhase };
}

export function Story({
  children,
  who,
  face,
}: {
  children: ReactNode;
  who: string;
  face?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-canvas p-5">
      <p className="flex items-center gap-3 font-semibold">
        {face}
        {who}&apos;s story
      </p>
      <div className="mt-3 space-y-2 text-lg leading-relaxed">{children}</div>
    </div>
  );
}

export function Idea({
  title = "New idea",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="welcome-rise mt-5 rounded-2xl border-l-4 border-brand bg-lavender p-5">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-brand-deep">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M10 2a6 6 0 0 0-3.5 10.9V15h7v-2.1A6 6 0 0 0 10 2Zm-2.5 15h5v1.2H7.5z"
            fill="currentColor"
          />
        </svg>
        {title}
      </p>
      <div className="mt-2 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}

export function Instruction({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 flex items-center gap-2 font-semibold text-navy">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-full bg-peach text-sm"
      >
        ☝
      </span>
      {children}
    </p>
  );
}

export function Feedback({
  tone = "info",
  title,
  children,
}: {
  tone?: "good" | "retry" | "info";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    good: "border-teal bg-mint/60",
    retry: "border-orange-400 bg-peach/60",
    info: "border-navy/30 bg-canvas",
  }[tone];
  return (
    <div
      role="status"
      className={`welcome-rise mt-4 rounded-2xl border-l-4 p-4 leading-relaxed ${styles}`}
    >
      {title && (
        <p className="mb-1 flex items-center gap-2 font-bold">
          {tone === "good" ? "✓" : tone === "retry" ? "↺" : "ℹ"} {title}
        </p>
      )}
      {children}
    </div>
  );
}

export type Option = { id: string; text: string; correct?: boolean; feedback: string };

export function Choice({
  name,
  question,
  options,
  value,
  onChange,
  goodTitle = "You got it!",
}: {
  name: string;
  question: string;
  options: Option[];
  value?: string;
  onChange: (id: string) => void;
  goodTitle?: string;
}) {
  const chosen = options.find((o) => o.id === value);
  const anyCorrect = options.some((o) => o.correct);
  return (
    <fieldset className="mt-6">
      <legend className="text-lg font-bold">{question}</legend>
      <div className="mt-3 space-y-3">
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors ${value === o.id ? "border-brand bg-lavender/60" : "border-line bg-white hover:bg-canvas"}`}
          >
            <input
              type="radio"
              name={name}
              className="size-5 shrink-0 accent-brand"
              checked={value === o.id}
              onChange={() => onChange(o.id)}
            />
            {o.text}
          </label>
        ))}
      </div>
      {chosen &&
        (anyCorrect ? (
          <Feedback
            tone={chosen.correct ? "good" : "retry"}
            title={chosen.correct ? goodTitle : "Not quite. Try another answer."}
          >
            {chosen.feedback}
          </Feedback>
        ) : (
          <Feedback>{chosen.feedback}</Feedback>
        ))}
    </fieldset>
  );
}

export function answer(state: ActivityState, key: string) {
  return state.matches?.[key];
}
export function withAnswer(state: ActivityState, key: string, value: string) {
  return { ...state, matches: { ...state.matches, [key]: value } };
}
export function correctAnswer(options: Option[], value?: string) {
  return Boolean(options.find((o) => o.id === value)?.correct);
}

export function Typewriter({
  text,
  instant,
  onDone,
}: {
  text: string;
  instant: boolean;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(instant || reduced ? text.length : 0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const reported = useRef(instant);
  useEffect(() => {
    if (shown >= text.length) {
      if (!reported.current) {
        reported.current = true;
        done.current?.();
      }
      return;
    }
    const t = window.setTimeout(() => setShown((n) => n + 2), 28);
    return () => clearTimeout(t);
  }, [shown, text.length]);
  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && (
        <span aria-hidden="true" className="ml-0.5 animate-pulse">
          ▍
        </span>
      )}
      <span className="sr-only">{shown < text.length ? text : ""}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Private notes (stay on this device)                                 */
/* ------------------------------------------------------------------ */

const noteMemory = new Map<string, string>();
function subscribeNotes(callback: () => void) {
  window.addEventListener("buggle-notes", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("buggle-notes", callback);
    window.removeEventListener("storage", callback);
  };
}
function Note({ name, label }: { name: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const value = useSyncExternalStore(
    subscribeNotes,
    () => {
      try {
        return window.localStorage.getItem(name) ?? noteMemory.get(name) ?? "";
      } catch {
        return noteMemory.get(name) ?? "";
      }
    },
    () => "",
  );
  return (
    <label className="block">
      <span className="font-semibold">{label}</span>
      <textarea
        value={value}
        maxLength={1500}
        rows={2}
        className="mt-2 w-full rounded-xl border border-line bg-white p-3 focus-visible:outline-2 focus-visible:outline-brand-deep"
        onChange={(e) => {
          noteMemory.set(name, e.target.value);
          try {
            localStorage.setItem(name, e.target.value);
            setFailed(false);
          } catch {
            setFailed(true);
          }
          window.dispatchEvent(new Event("buggle-notes"));
        }}
      />
      {failed && (
        <span role="status" className="text-sm">
          Your browser could not save this note. Copy it before leaving.
        </span>
      )}
    </label>
  );
}

export function Reflection({
  prompts,
  slug,
  scope,
  example,
}: {
  prompts: string[];
  slug: string;
  scope: string;
  /** A sample answer the learner can reveal; omitted when the course gives none. */
  example?: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Your notes are private and stay on this device. They aren&apos;t marked.
      </p>
      {prompts.map((p, i) => (
        <Note key={p} name={`buggle-notes:${scope}:${slug}:${i}`} label={p} />
      ))}
      {example && (
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            See an example answer
          </summary>
          <p className="mt-2 leading-relaxed">{example}</p>
        </details>
      )}
    </div>
  );
}

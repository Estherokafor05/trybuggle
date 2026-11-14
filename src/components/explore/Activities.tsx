"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ActivityState } from "@/lib/learning-state";
import { Animal, RouteMap, TaskIcon } from "./Illustrations";

export const activityButton =
  "min-h-11 rounded-xl border border-line bg-white px-4 py-3 text-left font-semibold hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";
const button = activityButton;
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
function usePhases(durations: number[], onDone?: () => void) {
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

function MayaFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#d8f4ec" />
      <path d="M8 40q0-12 12-12t12 12z" fill="#17867b" />
      <circle cx="20" cy="17" r="8" fill="#8d5a3b" />
      <path
        d="M11 17q-1-11 9-11t9 11q-2-6-9-6t-9 6z"
        fill="#21160f"
      />
      <circle cx="17" cy="17" r="1" fill="#17243c" />
      <circle cx="23" cy="17" r="1" fill="#17243c" />
      <path d="M17.5 20.5q2.5 2 5 0" stroke="#17243c" fill="none" />
    </svg>
  );
}

export function Story({
  children,
  who = "Maya",
  face = <MayaFace />,
}: {
  children: ReactNode;
  who?: string;
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
function correctAnswer(options: Option[], value?: string) {
  return Boolean(options.find((o) => o.id === value)?.correct);
}

function Typewriter({
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
/* Lesson 1: Help Maya understand AI                                   */
/* ------------------------------------------------------------------ */

const tools = [
  {
    id: "speech",
    name: "Speech to text",
    kind: "speech" as const,
    input: "A recording of someone talking",
    output: "Written words",
    verb: "recognises",
  },
  {
    id: "photo",
    name: "Photo search",
    kind: "photo" as const,
    input: "Photos and the word “dog”",
    output: "The photos that probably show dogs",
    verb: "recognises",
  },
  {
    id: "draft",
    name: "Writing helper",
    kind: "draft" as const,
    input: "A short request: “Invite the team to a meeting”",
    output: "A first draft of an invitation",
    verb: "creates",
  },
];
const meetQuestion: Option[] = [
  {
    id: "robot",
    text: "A robot that thinks and feels like a person",
    feedback:
      "AI tools can do useful tasks, but they do not think or feel like people. Most AI is software inside apps you already use.",
  },
  {
    id: "systems",
    text: "Computer systems that can recognise patterns, make predictions or create things like text",
    correct: true,
    feedback:
      "AI is a broad name for many kinds of computer systems. The three tools you just tried are all examples.",
  },
  {
    id: "anything",
    text: "Any machine that runs on electricity",
    feedback:
      "Lots of machines run on electricity without using AI, like a toaster or a basic calculator. AI is about tasks like recognising, predicting and creating.",
  },
];

function Meet({ state, change }: { state: ActivityState; change: Change }) {
  const explored = state.items ?? [];
  const active = tools.find((t) => t.id === state.selection);
  return (
    <>
      <Story>
        <p>
          Maya works at a community centre. Everyone at work keeps talking about
          AI. She nods along, but she isn&apos;t sure what it actually means.
        </p>
      </Story>
      <Idea>
        <p>
          <b>AI</b> stands for <b>artificial intelligence</b>. It&apos;s a name
          for computer systems that can do tasks like{" "}
          <b>recognising patterns</b>, <b>making predictions</b> or{" "}
          <b>creating text and pictures</b>.
        </p>
      </Idea>
      <Instruction>
        Tap each tool to see what goes in and what comes out.
      </Instruction>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={state.selection === t.id}
            className={`${button} relative flex flex-col items-center gap-1 text-center ${state.selection === t.id ? "border-brand bg-lavender ring-2 ring-brand" : ""}`}
            onClick={() =>
              change({
                ...state,
                selection: t.id,
                items: [...new Set([...explored, t.id])],
              })
            }
          >
            {explored.includes(t.id) && (
              <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-teal text-xs text-white">
                <span aria-hidden="true">✓</span>
                <span className="sr-only">(tried)</span>
              </span>
            )}
            <TaskIcon kind={t.kind} />
            {t.name}
          </button>
        ))}
      </div>
      {active && (
        <div
          key={active.id}
          className="welcome-rise mt-4 grid items-center gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-[1fr_auto_1fr]"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
              What goes in
            </p>
            <p className="mt-1 text-lg">{active.input}</p>
          </div>
          <span
            aria-hidden="true"
            className="wv-bob mx-auto grid size-12 place-items-center rounded-full bg-brand text-sm font-bold text-white"
          >
            AI
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
              What comes out
            </p>
            <p className="mt-1 text-lg">{active.output}</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-muted">
        {explored.length} of 3 tools tried
      </p>
      {explored.length === 3 && (
        <div className="welcome-rise">
          <Choice
            name="meet"
            question="So, which sentence describes AI best?"
            options={meetQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
        </div>
      )}
    </>
  );
}

const timerQuestion: Option[] = [
  {
    id: "yes",
    text: "Yes, because it works automatically",
    feedback:
      "It does work automatically, but the timer is just following an instruction Maya gave it: count five minutes, then ring. It doesn't need AI for that.",
  },
  {
    id: "no",
    text: "No, working automatically doesn’t necessarily mean AI",
    correct: true,
    feedback:
      "Exactly. A timer follows a simple instruction without needing AI.",
  },
];

function Automatic({
  state,
  change,
}: {
  state: ActivityState;
  change: Change;
}) {
  const stage = state.stage ?? 0;
  const reduced = useReducedMotion();
  const [left, setLeft] = useState(stage >= 1 ? 0 : 300);
  const running = useRef(false);
  function startTimer() {
    if (running.current) return;
    if (reduced) {
      setLeft(0);
      change({ ...state, stage: Math.max(stage, 1) });
      return;
    }
    running.current = true;
    setLeft(300);
    const started = performance.now();
    const tick = () => {
      const remaining = Math.max(
        0,
        300 - Math.round(((performance.now() - started) / 2400) * 300),
      );
      setLeft(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
      else {
        running.current = false;
        change({ ...state, stage: Math.max(stage, 1) });
      }
    };
    requestAnimationFrame(tick);
  }
  const timerAnswer = answer(state, "timer");
  const speech = usePhases([900, 1600], () =>
    change({ ...state, stage: 3 }),
  );
  const speechDone = stage >= 3 || speech.phase >= 3;
  return (
    <>
      <Story>
        <p>
          Maya sets a kitchen timer for five minutes. When the time is up, it
          rings.
        </p>
      </Story>
      <div
        className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl p-5"
        style={{
          backgroundImage:
            "linear-gradient(#fffdf8e6,#fffdf8e6),url('/lessons/what-is-ai/kitchen.png')",
          backgroundSize: "cover",
        }}
      >
        <div
          className={`grid size-28 place-items-center rounded-full border-[6px] border-navy bg-white font-mono text-2xl font-bold ${left === 0 && stage >= 1 ? "animate-[wv-wave_0.4s_ease-in-out_3] bg-peach" : ""}`}
          aria-live="polite"
        >
          {String(Math.floor(left / 60)).padStart(2, "0")}:
          {String(left % 60).padStart(2, "0")}
        </div>
        <div>
          {stage >= 1 ? (
            <p className="text-xl font-bold text-teal">⏰ Ring ring! Time&apos;s up.</p>
          ) : (
            <button type="button" className={primaryButton} onClick={startTimer}>
              ▶ Start the timer
            </button>
          )}
          <p className="mt-2 text-sm text-muted">
            We&apos;ve sped it up so you don&apos;t have to wait five minutes.
          </p>
        </div>
      </div>
      {stage >= 1 && (
        <div className="welcome-rise">
          <Choice
            name="timer"
            question="Does that mean the timer is using AI?"
            options={timerQuestion}
            value={timerAnswer}
            onChange={(id) =>
              change({ ...withAnswer(state, "timer", id), stage: Math.max(stage, 1) })
            }
          />
        </div>
      )}
      {correctAnswer(timerQuestion, timerAnswer) && (
        <div className="welcome-rise mt-8">
          <Story>
            <p>
              Next, Maya picks up her phone and says,{" "}
              <b>&ldquo;Bring a notebook.&rdquo;</b> Her words appear on the
              screen as text.
            </p>
          </Story>
          <div className="mt-5 rounded-2xl border-4 border-navy bg-white p-5">
            {stage < 3 && speech.phase === 0 ? (
              <button
                type="button"
                className={primaryButton}
                onClick={() => {
                  change({ ...state, stage: 2 });
                  speech.play();
                }}
              >
                🎙 Play Maya&apos;s voice note
              </button>
            ) : (
              <>
                <div className="flex h-12 items-end gap-1" aria-hidden="true">
                  {[3, 6, 9, 5, 8, 4, 7, 10, 6, 3, 8, 5].map((h, i) => (
                    <span
                      key={i}
                      className={`w-2 rounded-full bg-teal ${speechDone ? "opacity-30" : "wv-bob"}`}
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.08}s`, animationDuration: "0.6s" }}
                    />
                  ))}
                </div>
                <p className="mt-3 rounded-xl bg-mint p-3 text-lg font-semibold">
                  {speech.phase >= 2 || stage >= 3 ? (
                    <Typewriter text="Bring a notebook." instant={stage >= 3 && speech.phase === 0} />
                  ) : (
                    <span className="text-muted">Listening…</span>
                  )}
                </p>
              </>
            )}
          </div>
          {speechDone && (
            <Idea title="What's the difference?">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="font-bold">⏰ The timer</p>
                  <p className="mt-1">
                    Follows a fixed instruction. It doesn&apos;t need AI.
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="font-bold">🎙 The speech tool</p>
                  <p className="mt-1">
                    Recognises patterns in the sound of Maya&apos;s voice to work
                    out the words. Many speech tools use AI for this.
                  </p>
                </div>
              </div>
              <p>
                Both happen automatically, but they work differently. So
                &ldquo;automatic&rdquo; doesn&apos;t always mean &ldquo;AI&rdquo;.
              </p>
            </Idea>
          )}
        </div>
      )}
    </>
  );
}

const examples = [
  { cat: false, label: "Dog" },
  { cat: true, label: "Cat" },
  { cat: true, label: "Cat" },
  { cat: false, label: "Dog" },
];
const guessOptions = (truth: string): Option[] => [
  { id: "dog", text: "It will guess dog", feedback: truth },
  { id: "cat", text: "It will guess cat", feedback: truth },
];

function Learn({ state, change }: { state: ActivityState; change: Change }) {
  const stage = state.stage ?? 0;
  const training = usePhases([1800], () => change({ ...state, stage: 1 }));
  const trained = stage >= 1;
  const test1 = answer(state, "test1");
  const test2 = answer(state, "test2");
  return (
    <>
      <Story>
        <p>
          Maya types &ldquo;dog&rdquo; into her phone&apos;s photo search, and
          pictures of dogs appear. She never labelled them. How does the phone
          know what a dog looks like?
        </p>
      </Story>
      <Instruction>
        Let&apos;s find out by training a pretend computer to tell cats from
        dogs.
      </Instruction>
      <div className="mt-3 rounded-2xl bg-ivory p-5">
        <p className="font-bold">Step 1: Example pictures, each with a label</p>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {examples.map((e, i) => (
            <figure
              key={i}
              className={`rounded-xl bg-white p-2 transition-all duration-700 ${training.phase === 1 ? "translate-y-3 scale-90 opacity-50" : ""}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="h-16 sm:h-20">
                <Animal cat={e.cat} />
              </div>
              <figcaption className="mt-1 text-center text-sm font-bold">
                {e.label}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {!trained && training.phase === 0 && (
            <button type="button" className={primaryButton} onClick={training.play}>
              Train the computer with these examples
            </button>
          )}
          {training.phase === 1 && (
            <div className="w-full max-w-sm" role="status">
              <p className="font-semibold">Finding patterns…</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full w-full origin-left animate-[wv-open_1.8s_ease-out_both] rounded-full bg-brand" />
              </div>
            </div>
          )}
          {trained && (
            <p className="font-bold text-teal">✓ Trained on 4 examples</p>
          )}
        </div>
      </div>
      {trained && (
        <>
          <Idea>
            <p>
              The computer looked for patterns in the labelled examples, like
              ear shapes and fur. Learning patterns from examples is called{" "}
              <b>machine learning</b>. It&apos;s one common way to build AI.
            </p>
          </Idea>
          <div className="welcome-rise mt-6 grid gap-5 sm:grid-cols-[10rem_1fr]">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="h-28">
                <Animal novel />
              </div>
              <p className="text-center text-sm text-muted">
                A new picture it has never seen
              </p>
            </div>
            <div>
              <p className="font-bold">Step 2: Test it on a new picture</p>
              <Choice
                name="test1"
                question="What do you think the computer will guess?"
                options={guessOptions(
                  "The computer guessed: dog. ✓ Correct! It recognised the patterns of a dog, even in a picture it had never seen.",
                )}
                value={test1}
                onChange={(id) => change(withAnswer(state, "test1", id))}
              />
            </div>
          </div>
        </>
      )}
      {test1 && (
        <div className="welcome-rise mt-6 grid gap-5 sm:grid-cols-[10rem_1fr]">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="h-28">
              <Animal cat covered />
            </div>
            <p className="text-center text-sm text-muted">
              A tricky picture: an animal partly hidden
            </p>
          </div>
          <div>
            <p className="font-bold">Step 3: Try something trickier</p>
            <Choice
              name="test2"
              question="What do you think it will guess this time?"
              options={guessOptions(
                "The computer guessed: dog. ✗ Wrong! It's actually a cat hiding behind a box. With part of the animal hidden, the patterns didn't match what it had learned.",
              )}
              value={test2}
              onChange={(id) => change(withAnswer(state, "test2", id))}
            />
          </div>
        </div>
      )}
      {test2 && (
        <Idea title="Remember">
          <p>
            AI can learn from examples, but it can still get things wrong,
            especially with unusual or unclear examples. That&apos;s why its
            results need checking.
          </p>
        </Idea>
      )}
    </>
  );
}

const requestItems = [
  { id: "purpose", label: "What it's for: invite volunteers to a meeting", needed: true },
  { id: "details", label: "The details: Thursday, 6 pm, Room Three", needed: true },
  { id: "tone", label: "The tone: friendly and clear", needed: false },
  { id: "private", label: "Volunteers' private phone numbers", needed: false },
];
const draftText =
  "Hi everyone! Please join our volunteer meeting on Friday at 6 pm in Room Three. Parking is free. See you there!";

function Request({ state, change }: { state: ActivityState; change: Change }) {
  const chosen = state.items ?? [];
  const stage = state.stage ?? 0;
  const [tried, setTried] = useState(false);
  const hasPrivate = chosen.includes("private");
  const ready = chosen.includes("purpose") && chosen.includes("details");
  return (
    <>
      <Story>
        <p>
          Maya needs to invite volunteers to a meeting on{" "}
          <b>Thursday at 6 pm in Room Three</b>. She decides to try an AI
          writing tool that her workplace allows.
        </p>
      </Story>
      <Idea>
        <p>
          Tools that create new text or pictures are called{" "}
          <b>generative AI</b>. What you type in is called a{" "}
          <b>request</b> (or a <b>prompt</b>).
        </p>
      </Idea>
      <fieldset className="mt-6">
        <legend className="text-lg font-bold">
          What should Maya include in her request? Choose all that help.
        </legend>
        <div className="mt-3 space-y-3">
          {requestItems.map((f) => (
            <label
              key={f.id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 ${chosen.includes(f.id) ? "border-brand bg-lavender/60" : "border-line bg-white hover:bg-canvas"}`}
            >
              <input
                type="checkbox"
                className="size-5 shrink-0 accent-brand"
                checked={chosen.includes(f.id)}
                disabled={stage >= 1}
                onChange={() => {
                  setTried(false);
                  change({
                    ...state,
                    items: chosen.includes(f.id)
                      ? chosen.filter((x) => x !== f.id)
                      : [...chosen, f.id],
                  });
                }}
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>
      {stage === 0 && (
        <button
          type="button"
          className={`${primaryButton} mt-5`}
          onClick={() => {
            setTried(true);
            if (ready && !hasPrivate) change({ ...state, stage: 1 });
          }}
        >
          Send the request to the writing tool →
        </button>
      )}
      {tried && stage === 0 && (
        <Feedback tone="retry" title="Not quite ready">
          {hasPrivate
            ? "The writing tool doesn't need volunteers' phone numbers to write an invitation. Keep private information out of AI tools. Untick it and try again."
            : "The tool needs to know what the message is for and the meeting details. Without them, it can only guess."}
        </Feedback>
      )}
      {stage >= 1 && (
        <>
          <Feedback tone="good" title="Good request!">
            You gave the tool what it needed and kept private information out.
            {chosen.includes("tone") ? " Adding the tone helps too." : ""}
          </Feedback>
          <div className="welcome-rise mt-5 overflow-hidden rounded-2xl border-2 border-navy bg-white">
            <p className="flex items-center gap-2 bg-navy px-4 py-2 text-sm font-semibold text-white">
              <span className="grid size-6 place-items-center rounded-full bg-brand text-xs">
                AI
              </span>
              Writing tool
            </p>
            <p className="p-5 text-lg leading-relaxed">
              <Typewriter
                text={draftText}
                instant={stage >= 2}
                onDone={() => change({ ...state, stage: 2 })}
              />
            </p>
          </div>
          {stage >= 2 && (
            <Feedback title="It sounds great. But is it right?">
              The draft is friendly and confident. In the next step, you&apos;ll
              help Maya check it before she sends it.
            </Feedback>
          )}
        </>
      )}
    </>
  );
}

const draftParts = [
  {
    id: "day",
    text: "Friday",
    verdict: "wrong",
    note: "Maya's notes say Thursday. This is wrong and needs fixing.",
  },
  {
    id: "time",
    text: "6 pm",
    verdict: "ok",
    note: "This matches Maya's notes. Checking includes confirming what's right, too.",
  },
  {
    id: "room",
    text: "Room Three",
    verdict: "ok",
    note: "This matches Maya's notes.",
  },
  {
    id: "parking",
    text: "Parking is free.",
    verdict: "unknown",
    note: "Maya's notes don't mention parking. The tool made this up. It might be true, but there's no evidence, so Maya should remove it or check it first.",
  },
] as const;
const verdictStyle = {
  wrong: "bg-[#fde2e2] ring-[#e5484d]",
  ok: "bg-mint ring-teal",
  unknown: "bg-peach ring-orange-400",
};
const verdictLabel = { wrong: "✗ Wrong", ok: "✓ Matches", unknown: "? Not in notes" };

function Investigate({
  state,
  change,
}: {
  state: ActivityState;
  change: Change;
}) {
  const checked = state.items ?? [];
  const fixed = Boolean(state.revised);
  const last = draftParts.find((p) => p.id === state.selection);
  const part = (id: (typeof draftParts)[number]["id"]) => {
    const item = draftParts.find((p) => p.id === id)!;
    const done = checked.includes(id);
    return (
      <button
        type="button"
        aria-pressed={state.selection === id}
        key={id}
        aria-label={`Check “${item.text}”${done ? `: ${verdictLabel[item.verdict]}` : ""}`}
        className={`mx-0.5 rounded-lg px-1.5 py-0.5 font-semibold underline decoration-dotted underline-offset-4 ring-2 ${done ? verdictStyle[item.verdict] : "bg-lavender ring-brand/40 hover:bg-brand-soft"}`}
        onClick={() =>
          change({
            ...state,
            selection: id,
            items: [...new Set([...checked, id])],
          })
        }
      >
        {item.text}
        {done && (
          <span className="ml-1 text-xs font-bold">
            {verdictLabel[item.verdict]}
          </span>
        )}
      </button>
    );
  };
  return (
    <>
      <Story>
        <p>
          The draft sounds friendly and confident. Before sending it, Maya
          compares it with her meeting notes.
        </p>
      </Story>
      <div className="mt-5 grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl bg-mint/60 p-5">
          <p className="font-bold">📋 Maya&apos;s meeting notes</p>
          <dl className="mt-3 space-y-2">
            {[
              ["Day", "Thursday"],
              ["Time", "6 pm"],
              ["Place", "Room Three"],
              ["Parking", "Not mentioned"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-teal/20 pb-1">
                <dt className="font-semibold">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border-2 border-navy bg-white p-5">
          <p className="font-bold">
            {fixed ? "✅ Checked invitation" : "🤖 The AI draft"}
          </p>
          {fixed ? (
            <p className="welcome-rise mt-3 text-lg leading-loose">
              Hi everyone! Please join our volunteer meeting on{" "}
              <mark className="rounded bg-mint px-1 font-semibold">Thursday</mark>{" "}
              at 6 pm in Room Three. See you there!
            </p>
          ) : (
            <p className="mt-3 text-lg leading-loose">
              Hi everyone! Please join our volunteer meeting on{" "}
              {part("day")} at {part("time")} in {part("room")}.{" "}
              {part("parking")} See you there!
            </p>
          )}
        </div>
      </div>
      {!fixed && (
        <>
          <Instruction>
            Tap each highlighted part of the draft to check it against
            Maya&apos;s notes. ({checked.length} of 4 checked)
          </Instruction>
          {last && (
            <Feedback
              key={last.id}
              tone={last.verdict === "ok" ? "good" : "retry"}
              title={verdictLabel[last.verdict]}
            >
              {last.note}
            </Feedback>
          )}
        </>
      )}
      {checked.length === 4 && !fixed && (
        <button
          type="button"
          className={`${primaryButton} mt-5`}
          onClick={() => change({ ...state, revised: true })}
        >
          ✏️ Fix the draft: change the day and remove the parking claim
        </button>
      )}
      {fixed && (
        <>
          <Feedback tone="good" title="Ready to send">
            Maya fixed the wrong day and removed the claim she couldn&apos;t
            back up. Now she decides to send it.
          </Feedback>
          <Idea title="Remember">
            <p>
              AI can produce information that <b>sounds convincing but isn&apos;t
              true</b>. Asking the same tool &ldquo;are you sure?&rdquo; isn&apos;t
              a real check. Check important details against a reliable source,
              like Maya&apos;s notes.
            </p>
          </Idea>
        </>
      )}
    </>
  );
}

const healthQuestion: Option[] = [
  {
    id: "ask",
    text: "Ask the chatbot if it's sure",
    feedback:
      "A chatbot can sound just as confident the second time and still be wrong. Asking it again isn't an independent check.",
  },
  {
    id: "expert",
    text: "Check with a pharmacist or doctor",
    correct: true,
    feedback:
      "When a wrong answer could seriously affect someone, involve a qualified person. The bigger the risk, the more careful the check.",
  },
  {
    id: "trust",
    text: "Follow it, because it sounded clear and confident",
    feedback:
      "Sounding confident doesn't make something true, as you saw with Maya's draft. Health decisions need a qualified person.",
  },
];
const lesson1Recap = [
  "AI is a name for computer systems that can recognise, predict or create.",
  "Automatic doesn't always mean AI.",
  "Some AI learns from examples, and it can still get things wrong.",
  "Check important details before you use an AI result.",
];

function Reflect({
  state,
  change,
  slug,
  scope,
  prompts,
}: {
  state: ActivityState;
  change: Change;
  slug: string;
  scope: string;
  prompts: string[];
}) {
  return (
    <>
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="text-lg font-bold">What you&apos;ve learned</p>
        <ul className="mt-3 space-y-2">
          {lesson1Recap.map((r) => (
            <li key={r} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white"
              >
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>
      <Story>
        <p>
          Maya&apos;s friend asks an AI chatbot how much of a medicine she can
          safely take. The chatbot gives a clear, confident answer.
        </p>
      </Story>
      <Choice
        name="health"
        question="What should Maya's friend do?"
        options={healthQuestion}
        value={answer(state, "health")}
        onChange={(id) => change(withAnswer(state, "health", id))}
      />
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-lg font-bold">
          Explain AI in your own words{" "}
          <span className="text-sm font-normal text-muted">(optional)</span>
        </p>
        <div className="mt-3">
          <Reflection prompts={prompts} slug={slug} scope={scope} />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson 2: Explore AI in Maya's day                                  */
/* ------------------------------------------------------------------ */

type SceneObject = { id: string; icon: ReactNode; label: string; note: string };
type Place = {
  id: string;
  backdrop: string;
  intro: string;
  find: string;
  objects: SceneObject[];
  tool: { id: string; icon: ReactNode; label: string };
  foundNote: string;
  input: string;
  output: string;
  task: string;
  taskMeaning: string;
  question: string;
  options: Option[];
};

function Emoji({ children }: { children: string }) {
  return (
    <span aria-hidden="true" className="text-3xl leading-none">
      {children}
    </span>
  );
}

const places: Place[] = [
  {
    id: "home",
    backdrop: "/lessons/maya-day/hallway.png",
    intro:
      "It's 7 am. Maya's alarm goes off. Before leaving, she needs a dog photo for tonight's club poster, but she has hundreds of pictures and can't remember the file name.",
    find: "Tap things in Maya's home. Which one might use AI?",
    objects: [
      {
        id: "alarm",
        icon: <TaskIcon kind="timer" />,
        label: "Alarm clock",
        note: "Maya set it for 7:00 and it rang at 7:00. It follows her instruction, so it doesn't need AI.",
      },
      {
        id: "kettle",
        icon: <Emoji>☕</Emoji>,
        label: "Kettle",
        note: "It switches off when the water boils. That's a simple sensor, not AI.",
      },
    ],
    tool: { id: "photos", icon: <TaskIcon kind="photo" />, label: "Photo app" },
    foundNote:
      "Maya types “dog” into her photo app. Dog pictures appear, even though she never named the files.",
    input: "Maya's photos and the word “dog”",
    output: "Photos that probably show dogs",
    task: "Recognition",
    taskMeaning: "spotting patterns in pictures, like what a dog looks like",
    question: "The search found three dog photos. What should Maya check?",
    options: [
      {
        id: "first",
        text: "Nothing. Use the first result, the app found dogs",
        feedback:
          "The app found likely dog photos, but Maya needs one specific dog: the club's dog in its teal collar. The first result might not be it.",
      },
      {
        id: "right",
        text: "That it's the right dog, clear enough for a poster, and OK to use",
        correct: true,
        feedback:
          "Exactly. The app suggests likely matches. Maya opens the photo and checks it's the one she actually needs.",
      },
    ],
  },
  {
    id: "journey",
    backdrop: "",
    intro:
      "Maya is ready to leave for the community centre. Traffic is building on her usual road.",
    find: "Tap things on Maya's journey. Which one might use AI?",
    objects: [
      {
        id: "lights",
        icon: <Emoji>🚦</Emoji>,
        label: "Traffic lights",
        note: "Most traffic lights change on a fixed timer or a simple sensor. No AI needed.",
      },
      {
        id: "radio",
        icon: <Emoji>📻</Emoji>,
        label: "Car radio",
        note: "The radio just plays a station. It isn't making any predictions.",
      },
    ],
    tool: { id: "map", icon: <TaskIcon kind="predict" />, label: "Map app" },
    foundNote:
      "Maya's map app estimates how long each route will take, using live traffic and patterns from past journeys.",
    input: "Live traffic and patterns from past journeys",
    output: "An estimate of how long each route will take",
    task: "Prediction",
    taskMeaning: "making a best guess about something that hasn't happened yet",
    question: "The other route just changed from 20 to 35 minutes. What should Maya do?",
    options: [
      {
        id: "first",
        text: "Take it anyway, the app said 20 minutes first",
        feedback:
          "A prediction is a best guess based on what the app knows right now. When the information changes, so does the guess.",
      },
      {
        id: "right",
        text: "Treat the time as a guess, check the route suits her, and leave a little extra time",
        correct: true,
        feedback:
          "Exactly. Predictions can change. Maya uses the estimate to help her decide, not as a promise.",
      },
    ],
  },
  {
    id: "centre",
    backdrop: "/lessons/maya-day/community-centre.png",
    intro:
      "At the community centre, Maya checks her email for tonight's room booking confirmation. It isn't in her inbox.",
    find: "Tap things at the centre. Which one might use AI?",
    objects: [
      {
        id: "lights",
        icon: <Emoji>💡</Emoji>,
        label: "Light switch",
        note: "Flick it and the lights come on. A simple switch, no AI.",
      },
      {
        id: "printer",
        icon: <Emoji>🖨️</Emoji>,
        label: "Printer",
        note: "It prints exactly what it's sent. No AI needed for that.",
      },
    ],
    tool: { id: "email", icon: <TaskIcon kind="mail" />, label: "Email app" },
    foundNote:
      "Maya's email app sorts incoming messages into Inbox and Spam. Her booking confirmation was sorted into Spam.",
    input: "Each email's words, sender and other signals",
    output: "A folder: Inbox or Spam",
    task: "Classification",
    taskMeaning: "sorting things into groups",
    question: "Maya found the booking email in Spam. What should she do?",
    options: [
      {
        id: "trust",
        text: "Delete it. If it's in Spam, it must be fake",
        feedback:
          "Sorting can be wrong. Genuine emails sometimes land in Spam, and fake ones sometimes reach the Inbox.",
      },
      {
        id: "right",
        text: "Compare it with her booking record, and contact the venue directly if unsure",
        correct: true,
        feedback:
          "Exactly. The folder is the app's best guess. Maya checks the details herself, using contact details she already trusts.",
      },
    ],
  },
  {
    id: "shopping",
    backdrop: "",
    intro:
      "The club needs a bag for its camera. Maya browses a few bags online, and the shop suggests one for her.",
    find: "Tap things on the shopping site. Which one might use AI?",
    objects: [
      {
        id: "basket",
        icon: <Emoji>🛒</Emoji>,
        label: "Basket total",
        note: "It adds up prices. That's simple arithmetic, not AI.",
      },
      {
        id: "search",
        icon: <Emoji>🔢</Emoji>,
        label: "Price filter",
        note: "It hides bags above the price Maya chose. A simple rule, no AI needed.",
      },
    ],
    tool: { id: "suggest", icon: <TaskIcon kind="bag" />, label: "“You might like”" },
    foundNote:
      "The shop suggests a bag based on what Maya and other shoppers have viewed and bought.",
    input: "What Maya and other shoppers viewed and bought",
    output: "A suggested bag: fits cameras up to 25 cm, $38",
    task: "Recommendation",
    taskMeaning: "suggesting something you might like",
    question: "The club's camera is 28 cm long. Should Maya buy the suggested bag?",
    options: [
      {
        id: "buy",
        text: "Yes. The shop suggested it and it's within budget",
        feedback:
          "The price is fine, but the bag only fits cameras up to 25 cm. A suggestion can look relevant and still not meet your needs.",
      },
      {
        id: "right",
        text: "No. It only fits cameras up to 25 cm, so she keeps looking",
        correct: true,
        feedback:
          "Exactly. A recommendation is a suggestion. Maya checks the size and price, and makes the decision herself.",
      },
    ],
  },
];

function PhotoAnim({ phase }: { phase: number }) {
  const labels = [
    "Golden dog",
    "Blue sky",
    "Grey cat",
    "Club dog with teal collar",
    "Flowers",
    "Brown terrier",
  ];
  const dogs = [0, 3, 5];
  return (
    <div className="rounded-2xl border-4 border-navy bg-white p-3">
      <p className="mb-3 rounded-full bg-lavender px-4 py-2 font-semibold">
        ⌕ {phase >= 1 ? <Typewriter text="dog" instant={phase > 1} /> : <span className="text-muted">Search photos</span>}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {labels.map((label, i) => {
          const isDog = dogs.includes(i);
          const faded = phase >= 2 && !isDog;
          return (
            <div
              key={label}
              role="img"
              aria-label={label + (phase >= 2 ? (isDog ? ", found" : ", not a match") : "")}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-500 ${faded ? "scale-90 opacity-20" : ""} ${phase >= 2 && isDog ? "ring-4 ring-teal" : ""}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/lessons/maya-day/gallery-contact-sheet.png')",
                  backgroundSize: "300% 200%",
                  backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouteAnim({ phase }: { phase: number }) {
  return (
    <div className="relative">
      <RouteMap updated={phase >= 3} route={phase >= 2 ? "alternative" : ""} />
      {phase >= 3 && (
        <p className="welcome-rise absolute bottom-3 right-3 rounded-full bg-[#e5484d] px-3 py-1 text-sm font-bold text-white">
          ⚠ Traffic update
        </p>
      )}
    </div>
  );
}

function SpamAnim({ phase }: { phase: number }) {
  const mails = [
    { from: "Library newsletter", to: "inbox" },
    { from: "You've won a prize!!!", to: "spam" },
    { from: "Room booking confirmed", to: "spam", key: true },
    { from: "Club members", to: "inbox" },
  ];
  return (
    <div className="grid gap-3 rounded-2xl border-4 border-navy bg-white p-3 sm:grid-cols-[1fr_1fr]">
      {(["inbox", "spam"] as const).map((folder) => (
        <div key={folder} className={`min-h-36 rounded-xl p-3 ${folder === "spam" ? "bg-peach/60" : "bg-mint/60"}`}>
          <p className="font-bold">{folder === "inbox" ? "📥 Inbox" : "🚫 Spam"}</p>
          <ul className="mt-2 space-y-2">
            {mails.map((m, i) =>
              phase >= 2 + Math.floor(i / 2) && m.to === folder ? (
                <li
                  key={m.from}
                  className={`welcome-rise rounded-lg bg-white px-3 py-2 text-sm ${m.key ? "font-bold ring-2 ring-brand" : ""}`}
                >
                  ✉ {m.from}
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ))}
      {phase === 1 && (
        <p className="text-muted sm:col-span-2" role="status">
          Sorting new emails…
        </p>
      )}
    </div>
  );
}

function BagAnim({ phase }: { phase: number }) {
  return (
    <div className="rounded-2xl border-4 border-navy bg-white p-3">
      <p className="text-sm font-bold text-muted">Recently viewed</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {["Canvas bag", "Padded case", "Shoulder bag"].map((b, i) =>
          phase >= 1 ? (
            <div
              key={b}
              className="welcome-rise rounded-lg bg-canvas p-2 text-center text-xs font-semibold"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              <span aria-hidden="true" className="block text-2xl">👜</span>
              {b}
            </div>
          ) : (
            <div key={b} className="h-16 rounded-lg bg-canvas" />
          ),
        )}
      </div>
      {phase >= 2 && (
        <div className="wv-pop mt-3 flex items-center gap-3 rounded-xl bg-lavender p-3">
          <TaskIcon kind="bag" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-deep">
              ✨ You might like
            </p>
            <p className="font-bold">Compact camera bag · $38</p>
            <p className="text-sm">Fits cameras up to 25 cm</p>
          </div>
        </div>
      )}
    </div>
  );
}

const placeAnims: Record<string, { durations: number[]; Anim: (p: { phase: number }) => ReactNode }> = {
  home: { durations: [700, 900], Anim: PhotoAnim },
  journey: { durations: [600, 900, 1600], Anim: RouteAnim },
  centre: { durations: [700, 700, 700], Anim: SpamAnim },
  shopping: { durations: [900, 900], Anim: BagAnim },
};

function PlaceActivity({
  place,
  state,
  change,
  go,
}: {
  place: Place;
  state: ActivityState;
  change: Change;
  go: (step: number) => void;
}) {
  const found = state.selection === place.tool.id || (state.stage ?? 0) >= 1;
  const watched = (state.stage ?? 0) >= 2;
  const { durations, Anim } = placeAnims[place.id];
  const anim = usePhases(durations, () =>
    change({ ...state, selection: place.tool.id, stage: 2 }),
  );
  const shownPhase = watched && anim.phase === 0 ? durations.length + 1 : anim.phase;
  const tapped = place.objects.find((o) => o.id === state.selection);
  const done = Boolean(state.revised);
  const sceneObjects = [...place.objects, { ...place.tool, note: "" }];
  // Put the AI tool in the middle so it isn't always first or last.
  sceneObjects.splice(1, 0, sceneObjects.pop()!);
  return (
    <>
      <Story>
        <p>{place.intro}</p>
      </Story>
      <Instruction>{place.find}</Instruction>
      <div
        className="mt-3 rounded-3xl bg-[#e5eee5] bg-cover bg-center p-4 sm:p-6"
        style={
          place.backdrop
            ? { backgroundImage: `linear-gradient(#ffffffb3,#ffffffb3),url('${place.backdrop}')` }
            : undefined
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {sceneObjects.map((o) => {
            const isTool = o.id === place.tool.id;
            const selected = state.selection === o.id || (isTool && found);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-white/95 p-3 text-center font-semibold shadow-sm transition-transform hover:-translate-y-0.5 ${selected ? (isTool ? "border-teal ring-4 ring-teal/30" : "border-navy/40") : "border-white"}`}
                onClick={() =>
                  change(
                    isTool
                      ? { ...state, selection: o.id, stage: Math.max(state.stage ?? 0, 1) }
                      : { ...state, selection: o.id },
                  )
                }
              >
                <span className="grid h-16 place-items-center [&_svg]:h-16 [&_svg]:w-20">{o.icon}</span>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
      {tapped && !found && (
        <Feedback tone="retry" title={`${tapped.label}: probably not AI`}>
          {tapped.note} Try another one.
        </Feedback>
      )}
      {tapped && found && (
        <Feedback title={`${tapped.label}: probably not AI`}>{tapped.note}</Feedback>
      )}
      {found && (
        <div className="welcome-rise">
          <Feedback tone="good" title={`Found it: the ${place.tool.label.replace(/[“”]/g, "")}`}>
            {place.foundNote}
          </Feedback>
          <div className="mt-6 rounded-2xl bg-ivory p-5">
            <p className="text-lg font-bold">How does it work?</p>
            <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_1.6fr_1fr]">
              <div className="rounded-xl bg-white p-4">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                  Information it uses
                </p>
                <p className="mt-1">{place.input}</p>
              </div>
              <div>
                {shownPhase === 0 ? (
                  <button type="button" className={`${primaryButton} w-full justify-center py-8`} onClick={anim.play}>
                    ▶ Watch it work
                  </button>
                ) : (
                  <Anim phase={shownPhase} />
                )}
              </div>
              <div className={`rounded-xl bg-white p-4 transition-opacity ${watched || anim.phase > durations.length ? "" : "opacity-40"}`}>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                  What it gives back
                </p>
                <p className="mt-1">{place.output}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {watched && (
        <div className="welcome-rise">
          <Choice
            name={`check-${place.id}`}
            question={place.question}
            options={place.options}
            value={answer(state, "check")}
            onChange={(id) =>
              change({
                ...withAnswer(state, "check", id),
                revised: done || correctAnswer(place.options, id),
              })
            }
          />
        </div>
      )}
      {done && (
        <Idea title={`This is called ${place.task.toLowerCase()}`}>
          <p>
            <b>{place.task}</b> means {place.taskMeaning}. The tool helped, and
            Maya checked the result and made the decision.
          </p>
          <button type="button" className={`${button} mt-2`} onClick={() => go(0)}>
            ← Back to the map
          </button>
        </Idea>
      )}
    </>
  );
}

function DayMap({
  all,
  go,
}: {
  all: Record<string, ActivityState>;
  go: (step: number) => void;
}) {
  const stops = [
    { step: 1, id: "home", label: "Home", sub: "Finding a photo", x: 18, y: 70, icon: "🏠" },
    { step: 2, id: "journey", label: "The journey", sub: "Choosing a route", x: 40, y: 30, icon: "🚗" },
    { step: 3, id: "centre", label: "Community centre", sub: "A missing email", x: 66, y: 62, icon: "🏢" },
    { step: 4, id: "shopping", label: "Online shop", sub: "A suggested bag", x: 86, y: 24, icon: "🛍️" },
  ];
  const doneCount = stops.filter((s) => all[s.id]?.revised).length;
  return (
    <>
      <Story>
        <p>
          Maya is an administrator at a community centre. Tonight she&apos;s
          running a photography club, and a few everyday tools help her get
          ready. Some of them might use AI.
        </p>
      </Story>
      <Instruction>
        Pick a place to explore. In each one, find the tool that might use AI,
        watch how it works and decide what Maya should check.
      </Instruction>
      <div className="relative mt-4 overflow-hidden rounded-3xl bg-[#e5eee5]">
        <svg viewBox="0 0 100 60" className="block w-full" aria-hidden="true">
          <path d="M0 45Q20 40 35 48T70 40T100 35V60H0Z" fill="#d4e6d3" />
          <circle cx="8" cy="12" r="6" fill="#cfe3cf" />
          <circle cx="94" cy="52" r="7" fill="#cfe3cf" />
          <path
            d="M18 42Q28 10 40 18T66 37T86 14"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 42Q28 10 40 18T66 37T86 14"
            fill="none"
            stroke="#17243c"
            strokeOpacity=".35"
            strokeWidth=".6"
            strokeDasharray="1.5 1.5"
          />
        </svg>
        {stops.map((s) => {
          const done = Boolean(all[s.id]?.revised);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.step)}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span
                className={`wv-bob grid size-12 place-items-center rounded-full border-[3px] text-2xl shadow-md transition-transform group-hover:scale-110 sm:size-16 sm:text-3xl ${done ? "border-teal bg-mint" : "border-navy bg-white"}`}
                style={{ animationDelay: `${s.step * 0.3}s` }}
              >
                <span aria-hidden="true">{s.icon}</span>
              </span>
              <span className="mt-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-sm sm:text-sm">
                {done && <span className="text-teal">✓ </span>}
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stops.map((s) => {
          const done = Boolean(all[s.id]?.revised);
          return (
            <button
              key={s.id}
              type="button"
              className={`${button} flex items-center gap-3`}
              onClick={() => go(s.step)}
            >
              <span aria-hidden="true" className="text-2xl">{s.icon}</span>
              <span className="flex-1">
                {s.step}. {s.label}
                <span className="block text-sm font-normal text-muted">{s.sub}</span>
              </span>
              {done ? (
                <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-teal">
                  ✓ Done
                </span>
              ) : (
                <span aria-hidden="true">→</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted" role="status">
        {doneCount} of 4 places explored
      </p>
    </>
  );
}

function DayReflect({
  all,
  go,
  slug,
  scope,
  prompts,
}: {
  all: Record<string, ActivityState>;
  go: (step: number) => void;
  slug: string;
  scope: string;
  prompts: string[];
}) {
  return (
    <>
      <p className="text-lg leading-relaxed">
        Across her day, Maya used tools that may use AI in four different ways.
        In every case, <b>the tool helped and Maya decided</b>.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {places.map((p, i) => {
          const done = Boolean(all[p.id]?.revised);
          return (
            <div
              key={p.id}
              className={`rounded-2xl border-2 p-4 ${done ? "border-teal bg-mint/50" : "border-dashed border-line bg-white"}`}
            >
              <div className="flex items-center gap-3 [&_svg]:h-12 [&_svg]:w-14">
                {p.tool.icon}
                <div>
                  <p className="font-bold">{p.task}</p>
                  <p className="text-sm">{p.taskMeaning}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">
                {p.tool.label.replace(/[“”]/g, "")}: {p.output.toLowerCase()}
              </p>
              {!done && (
                <button type="button" className="mt-2 text-sm font-semibold underline" onClick={() => go(i + 1)}>
                  Explore this place →
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-lg font-bold">Now think about your own day</p>
        <p className="mt-1 text-muted">
          Pick a tool you use, like a music app that suggests songs.{" "}
          <span className="text-sm">(optional)</span>
        </p>
        <div className="mt-3">
          <Reflection prompts={prompts} slug={slug} scope={scope} />
        </div>
      </div>
    </>
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
const exampleAnswers: Record<string, string> = {
  "what-counts-as-ai":
    "AI is a name for computer systems that can recognise patterns, make predictions or create things like text. A writing tool could help me start an email. Before sending it, I would check the dates and names against my own notes.",
  "ai-in-your-day":
    "My music app suggests songs. It uses what I've listened to before. It gives me a playlist. Before playing it at a club event, I would listen to check the songs suit the audience.",
  "ai-or-software":
    "My phone's alarm follows set instructions. My music app's suggestions might learn from what I play. Before I call something AI, I would ask what it actually does and how it decides.",
  "what-ai-can-do":
    "AI could help me draft emails. I would always check names, dates and prices. A decision about someone's job or health is one I would keep for a person.",
  "thirty-pages-by-friday":
    "My phone contract is long. Before acting on an AI summary, I would read the parts about the monthly price, how long I am tied in and what it costs to leave early.",
  "three-tries-at-the-flyer":
    "My CV summary is close but too long. I would type: keep my job titles and dates, make it no more than three lines. To change how it sounds, I would type: make it sound confident but friendly.",
  "the-email-that-said-nothing":
    "I might ask AI to write a message to my child's teacher. I would tell it who it is for, that I want to ask about a parents' evening, when I am free, and that it should sound short and polite.",
  "a-new-helper":
    "I could ask a chat tool to draft a short message to a customer. Before sending it, I would check the dates, prices and names, because those are things someone else will rely on.",
  "before-chatgpt":
    "AI didn't start with ChatGPT because people have been building and studying it since the 1950s. My email's spam filter is an older AI tool I've used without noticing. What surprised me most was that the name artificial intelligence is about seventy years old.",
};
export function Reflection({
  prompts,
  slug,
  scope,
}: {
  prompts: string[];
  slug: string;
  scope: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Your notes are private and stay on this device. They aren&apos;t marked.
      </p>
      {prompts.map((p, i) => (
        <Note key={p} name={`buggle-notes:${scope}:${slug}:${i}`} label={p} />
      ))}
      <details>
        <summary className="cursor-pointer py-2 font-semibold">
          See an example answer
        </summary>
        <p className="mt-2 leading-relaxed">
          {exampleAnswers[slug] ?? exampleAnswers["ai-in-your-day"]}
        </p>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Activity(p: Props) {
  const common = { state: p.state, change: p.change };
  const place = places.find((x) => x.id === p.id);
  if (place)
    return <PlaceActivity place={place} {...common} go={p.go} />;
  switch (p.id) {
    case "meet":
      return <Meet {...common} />;
    case "automatic":
      return <Automatic {...common} />;
    case "learn":
      return <Learn {...common} />;
    case "request":
      return <Request {...common} />;
    case "investigate":
      return <Investigate {...common} />;
    case "reflect":
      return <Reflect {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    case "day-map":
      return <DayMap all={p.all} go={p.go} />;
    case "day-reflect":
      return <DayReflect all={p.all} go={p.go} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

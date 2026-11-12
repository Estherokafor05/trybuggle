"use client";
// Lesson 4: Step into Daniel's reception. Unscored, formative activities.
import { useId, type ReactNode } from "react";
import type { ActivityState } from "@/lib/learning-state";
import {
  Choice,
  Feedback,
  Idea,
  Instruction,
  Reflection,
  Story,
  activityButton,
  answer,
  primaryButton,
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "./Activities";

function DanielFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#dfe9fb" />
      <path d="M8 40q0-12 12-12t12 12z" fill="#2f6f8f" />
      <circle cx="20" cy="18" r="7.5" fill="#8a5a3c" />
      <path d="M12.6 16q0-8 7.4-8t7.4 8q-3-4-7.4-4t-7.4 4z" fill="#1d1715" />
      <path d="M13.5 19q2 7 6.5 7t6.5-7q-2 3-6.5 3t-6.5-3z" fill="#1d1715" />
      <circle cx="17" cy="17.5" r="1" fill="#fff" />
      <circle cx="23" cy="17.5" r="1" fill="#fff" />
    </svg>
  );
}
function DanielStory({ children }: { children: ReactNode }) {
  return (
    <Story who="Daniel" face={<DanielFace />}>
      {children}
    </Story>
  );
}
function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 rounded-2xl border-2 border-navy/15 bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      {children}
    </div>
  );
}
function Verdict({ right, children }: { right: boolean; children: ReactNode }) {
  return (
    <p role="status" className={`mt-2 rounded-xl p-3 text-sm leading-relaxed ${right ? "bg-mint/60" : "bg-peach/60"}`}>
      <b>{right ? "✓ Right." : "↺ Not quite."}</b> {children}
    </p>
  );
}
function RadioRow({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: ReactNode;
  options: { id: string; label: string }[];
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{legend}</legend>
      <div className={`mt-3 grid gap-2 ${options.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 ${value === o.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
          >
            <input
              type="radio"
              name={name}
              className="size-5 shrink-0 accent-brand"
              checked={value === o.id}
              onChange={() => onChange(o.id)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------- 1. Daniel's desk ---------- */
const tools = [
  { id: "calendar", icon: "📅", name: "Calendar", does: "Shows a reminder 15 minutes before each appointment." },
  { id: "tablet", icon: "📲", name: "Check-in tablet", does: "Visitors type their details; it saves them, prints a badge and messages the host." },
  { id: "inbox", icon: "📥", name: "Shared inbox", does: "Suggests which folder each new message should go in." },
  { id: "badge", icon: "🪪", name: "Badge printer", does: "Prints a visitor badge when the tablet tells it to." },
];
function Desk({ state, change }: { state: ActivityState; change: Change }) {
  const seen = state.items ?? [];
  const guesses = state.matches ?? {};
  const active = tools.find((t) => t.id === state.selection);
  return (
    <>
      <DanielStory>
        <p>
          Daniel is a receptionist at a busy company. A colleague says,
          “We&apos;ve got AI helping with almost everything now!” Daniel
          isn&apos;t so sure. Let&apos;s look at his desk.
        </p>
      </DanielStory>
      <Instruction>Tap each tool to see what it does.</Instruction>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={state.selection === t.id}
            className={`${activityButton} relative flex flex-col items-center gap-1 text-center ${state.selection === t.id ? "border-brand bg-lavender ring-2 ring-brand" : ""}`}
            onClick={() => change({ ...state, selection: t.id, items: [...new Set([...seen, t.id])] })}
          >
            {seen.includes(t.id) && (
              <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-teal text-xs text-white">
                <span aria-hidden="true">✓</span>
                <span className="sr-only">(seen)</span>
              </span>
            )}
            <span aria-hidden="true" className="text-3xl">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>
      {active && (
        <p key={active.id} className="welcome-rise mt-3 rounded-2xl bg-ivory p-4 text-lg">
          <b>{active.name}:</b> {active.does}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">{seen.length} of 4 tools seen</p>
      {seen.length === 4 && (
        <div className="welcome-rise mt-6">
          <p className="text-lg font-bold">Your first guess: which of these use AI?</p>
          <p className="text-sm text-muted">There&apos;s no wrong answer yet. You&apos;ll check your guesses at the end.</p>
          <ul className="mt-3 space-y-3">
            {tools.map((t) => (
              <li key={t.id}>
                <RadioRow
                  name={`guess-${t.id}`}
                  legend={`${t.icon} ${t.name}`}
                  options={[
                    { id: "ai", label: "Probably AI" },
                    { id: "not", label: "Probably not AI" },
                  ]}
                  value={guesses[t.id]}
                  onChange={(id) => change(withAnswer(state, t.id, id))}
                />
              </li>
            ))}
          </ul>
          {Object.keys(guesses).length === 4 && (
            <Feedback title="Guesses saved">Continue to find out how each tool actually works.</Feedback>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- 2. Set a reminder ---------- */
const times = [
  { id: "10:00", label: "10:00 am", mins: 600 },
  { id: "14:00", label: "2:00 pm", mins: 840 },
  { id: "16:30", label: "4:30 pm", mins: 990 },
];
const offsets = [5, 15, 30];
const clock = (m: number) => {
  const h = Math.floor(m / 60),
    mm = m % 60;
  return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};
const reminderQuestion: Option[] = [
  { id: "rule", text: "It followed an instruction: show a reminder a set time before", correct: true, feedback: "Exactly. Change the appointment and the reminder moves with it. Same input, same result, every time." },
  { id: "learned", text: "It learned when Daniel likes to be reminded", feedback: "It never learned anything. It used the exact time you chose, every time." },
  { id: "guessed", text: "It guessed a good moment to remind him", feedback: "There's no guessing here. The reminder time is worked out from a fixed instruction." },
];
function Reminder({ state, change }: { state: ActivityState; change: Change }) {
  const time = times.find((t) => t.id === state.selection);
  const offset = Number(answer(state, "offset") ?? 0);
  const runs = state.items ?? [];
  const ready = time && offset;
  return (
    <>
      <Idea title="How it works">
        <p>
          A calendar reminder follows an <b>instruction</b> someone wrote. Try it
          and see whether it ever does anything different.
        </p>
      </Idea>
      <Panel label="Daniel's calendar">
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <RadioRow
            name="appointment"
            legend="1. Book the visitor for"
            options={times.map((t) => ({ id: t.id, label: t.label }))}
            value={state.selection}
            onChange={(id) => change({ ...state, selection: id })}
          />
          <RadioRow
            name="offset"
            legend="2. Remind Daniel"
            options={offsets.map((o) => ({ id: String(o), label: `${o} min before` }))}
            value={offset ? String(offset) : undefined}
            onChange={(id) => change(withAnswer(state, "offset", id))}
          />
        </div>
        <button
          type="button"
          className={`${primaryButton} mt-4`}
          disabled={!ready}
          onClick={() =>
            time && change({ ...state, items: [...runs, `${time.id}|${offset}`].slice(-6) })
          }
        >
          ⏩ Fast-forward the clock
        </button>
        {runs.length > 0 && (
          <ol className="mt-4 space-y-2" aria-label="Reminders shown">
            {runs.map((r, i) => {
              const [id, off] = r.split("|");
              const t = times.find((x) => x.id === id)!;
              return (
                <li key={i} className="welcome-rise rounded-xl bg-mint/60 p-3">
                  🔔 At <b>{clock(t.mins - Number(off))}</b>: “Visitor at {t.label}”
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
      {runs.length === 1 && (
        <p className="mt-3 font-semibold text-navy">Now change the time or the reminder and fast-forward again.</p>
      )}
      {runs.length >= 2 && (
        <div className="welcome-rise">
          <div className="mt-5 rounded-2xl bg-navy p-5 font-mono text-white">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-white/70">Under the hood</p>
            <p className="mt-2">WHEN an appointment is {offset || "N"} minutes away</p>
            <p>THEN show a reminder</p>
          </div>
          <Choice
            name="reminder"
            question="Why did the reminder always appear at the right time?"
            options={reminderQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
        </div>
      )}
    </>
  );
}

/* ---------- 3. Welcome a visitor ---------- */
const checkinQuestion: Option[] = [
  { id: "steps", text: "It follows set steps and can't work out what you meant", correct: true, feedback: "Right. It saved, printed and messaged exactly as instructed, and stopped when the name didn't match." },
  { id: "understands", text: "It understands what visitors mean", feedback: "If it understood, it would have realised “Tom Red” meant Tom Reed. It only matches exact names." },
  { id: "learns", text: "It learns from every visitor", feedback: "Nothing changed between your two tries. It follows the same steps every time." },
];
function CheckIn({ state, change }: { state: ActivityState; change: Change }) {
  const inputId = useId();
  const typed = state.selection ?? "";
  const tries = state.items ?? [];
  const outcome = answer(state, "last");
  function signIn() {
    const ok = typed.trim().toLowerCase() === "tom reed";
    change({
      ...withAnswer(state, "last", ok ? "ok" : "missing"),
      items: [...new Set([...tries, ok ? "ok" : "missing"])],
    });
  }
  return (
    <>
      <DanielStory>
        <p>
          A visitor, Priya Shah, arrives for a meeting with <b>Tom Reed</b>. Help
          her sign in on the reception tablet.
        </p>
      </DanielStory>
      <div className="mt-4 rounded-[1.75rem] bg-navy p-3">
        <div className="rounded-2xl bg-white p-4 sm:p-5">
          <p className="text-lg font-bold">Welcome! Please sign in</p>
          <p className="mt-3 text-sm font-semibold text-muted">Your name</p>
          <p className="mt-1 rounded-xl border-2 border-line px-3 py-2">Priya Shah</p>
          <label htmlFor={inputId} className="mt-3 block text-sm font-semibold text-muted">
            Who are you meeting?
          </label>
          <input
            id={inputId}
            value={typed}
            maxLength={60}
            autoComplete="off"
            onChange={(e) => change({ ...state, selection: e.target.value })}
            className="mt-1 w-full rounded-xl border-2 border-navy/40 px-3 py-2 focus-visible:outline-2 focus-visible:outline-brand-deep"
          />
          <button type="button" className={`${primaryButton} mt-4`} disabled={!typed.trim()} onClick={signIn}>
            Sign in
          </button>
        </div>
      </div>
      {outcome === "ok" && (
        <ol className="welcome-rise mt-4 space-y-2" aria-label="What the system did">
          {["Saved Priya's details", "Printed a visitor badge", "Messaged Tom Reed: “Your visitor has arrived”"].map((x, i) => (
            <li key={x} className="flex items-center gap-3 rounded-xl bg-mint/60 p-3">
              <span className="text-xs font-bold text-brand-deep">INSTRUCTION {i + 1}</span> ✓ {x}
            </li>
          ))}
        </ol>
      )}
      {outcome === "missing" && (
        <Feedback tone="retry" title="Host not found. Please check the name.">
          The system compares the name with its staff list. It doesn&apos;t guess
          who you meant.
        </Feedback>
      )}
      {tries.length === 1 && (
        <p className="mt-3 font-semibold text-navy">
          {tries[0] === "ok"
            ? "Now try a small typo, like “Tom Red”, and sign in again."
            : "Now type the name exactly: Tom Reed."}
        </p>
      )}
      {tries.length === 2 && (
        <div className="welcome-rise">
          <Choice
            name="checkin"
            question="What does this show about the check-in system?"
            options={checkinQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
        </div>
      )}
    </>
  );
}

/* ---------- 4. Teach the inbox ---------- */
const folders = [
  { id: "parking", label: "Parking" },
  { id: "deliveries", label: "Deliveries" },
  { id: "it", label: "IT Support" },
];
const training = [
  { id: "m1", text: "Where can I park when I visit?", folder: "parking", word: "park" },
  { id: "m2", text: "A parcel arrived for Room 4", folder: "deliveries", word: "parcel" },
  { id: "m3", text: "My laptop won't connect to the Wi-Fi", folder: "it", word: "laptop" },
  { id: "m4", text: "Is there visitor parking on Friday?", folder: "parking", word: "parking" },
  { id: "m5", text: "Please sign for a delivery at the front desk", folder: "deliveries", word: "delivery" },
  { id: "m6", text: "The printer on floor 2 keeps jamming", folder: "it", word: "printer" },
];
const tests = [
  { text: "Can I park my car outside today?", word: "park", folder: "parking", matches: ["m1", "m4"] },
  { text: "When will my parcel be delivered?", word: "parcel", folder: "deliveries", matches: ["m2", "m5"] },
];
function Mark({ text, word }: { text: string; word: string }) {
  const i = text.toLowerCase().indexOf(word);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-[#ffe08a] px-0.5">{text.slice(i, i + word.length)}</mark>
      {text.slice(i + word.length)}
    </>
  );
}
function Inbox({ state, change }: { state: ActivityState; change: Change }) {
  const sorted = training.filter((m) => answer(state, m.id) === m.folder).length;
  const shown = state.stage ?? 0;
  return (
    <>
      <Idea>
        <p>
          The inbox tool wasn&apos;t given a rule for every message. It was{" "}
          <b>trained on examples</b> that people had already sorted. Be one of
          those people: sort these six messages.
        </p>
      </Idea>
      <ul className="mt-4 space-y-3">
        {training.map((m) => {
          const chosen = answer(state, m.id);
          return (
            <li key={m.id} className="rounded-2xl border border-line bg-white p-4">
              <RadioRow
                name={`train-${m.id}`}
                legend={`✉️ ${m.text}`}
                options={folders}
                value={chosen}
                onChange={(id) => change(withAnswer(state, m.id, id))}
              />
              {chosen && chosen !== m.folder && (
                <Verdict right={false}>Read it again. Which team would deal with this?</Verdict>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{sorted} of 6 sorted correctly</p>
      {sorted === 6 && (
        <div className="welcome-rise mt-4">
          <button
            type="button"
            className={primaryButton}
            disabled={shown >= tests.length}
            onClick={() => change({ ...state, stage: shown + 1 })}
          >
            📨 Send a new message to the tool
          </button>
          {tests.slice(0, shown).map((x) => (
            <Panel key={x.text} label="New message">
              <p className="mt-1 text-lg font-semibold">
                <Mark text={x.text} word={x.word} />
              </p>
              <p className="mt-2">
                Prediction: <b>{folders.find((f) => f.id === x.folder)!.label}</b>
              </p>
              <p className="mt-1 text-sm text-muted">
                Similar to the examples you sorted:{" "}
                {x.matches.map((id) => `“${training.find((m) => m.id === id)!.text}”`).join(" and ")}
              </p>
            </Panel>
          ))}
          {shown >= tests.length && (
            <Feedback tone="good" title="That's machine learning">
              The tool spotted patterns, like words, in the examples you sorted
              and used them to predict where new messages belong. A prediction is
              a best guess, so it can be wrong.
            </Feedback>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- 5. Spot the mistake ---------- */
const queue = [
  { id: "q1", text: "Is there parking for visitors on Monday?", ai: "parking", right: "parking", why: "A parking question, filed under Parking." },
  { id: "q2", text: "Two boxes were delivered to reception", ai: "deliveries", right: "deliveries", why: "A delivery, filed under Deliveries." },
  { id: "q3", text: "The visitor check-in tablet isn't working", ai: "visitor", right: "it", why: "It mentions “visitor” and “check-in”, words common in visitor questions, but someone is reporting a broken device. That's IT Support." },
  { id: "q4", text: "What time can visitors start arriving?", ai: "visitor", right: "visitor", why: "A question for visitors, filed under Visitor Information." },
];
const queueFolders = [
  { id: "visitor", label: "Visitor Information" },
  { id: "parking", label: "Parking" },
  { id: "deliveries", label: "Deliveries" },
  { id: "it", label: "IT Support" },
];
function Mistake({ state, change }: { state: ActivityState; change: Change }) {
  const done = queue.filter((m) => answer(state, m.id) === m.right).length;
  return (
    <>
      <DanielStory>
        <p>
          The inbox tool has suggested a folder for four new messages. Daniel
          checks each one before it&apos;s sent on.
        </p>
      </DanielStory>
      <Instruction>For each message, keep the tool&apos;s folder or choose a better one.</Instruction>
      <ul className="mt-3 space-y-3">
        {queue.map((m) => {
          const chosen = answer(state, m.id);
          const label = queueFolders.find((f) => f.id === m.ai)!.label;
          return (
            <li key={m.id} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="font-semibold">
                  ✉️ “{m.text}”
                  <span className="mt-1 block text-sm font-normal text-muted">Tool suggests: {label}</span>
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {queueFolders.map((f) => (
                    <label
                      key={f.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${chosen === f.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input
                        type="radio"
                        name={`queue-${m.id}`}
                        className="size-5 shrink-0 accent-brand"
                        checked={chosen === f.id}
                        onChange={() => change(withAnswer(state, m.id, f.id))}
                      />
                      {f.label}
                      {f.id === m.ai && <span className="sr-only">(tool&apos;s suggestion)</span>}
                    </label>
                  ))}
                </div>
                {chosen && <Verdict right={chosen === m.right}>{chosen === m.right ? m.why : "Read the whole message. What does the person actually need?"}</Verdict>}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of 4 checked correctly</p>
      {done === 4 && (
        <Feedback tone="good" title="You caught it!">
          The tool matched words. You understood the need. That&apos;s why
          predictions like these still need a person to check them.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 6. AI or ordinary software? ---------- */
const kinds = [
  { id: "ordinary", label: "Ordinary software" },
  { id: "ai", label: "AI" },
  { id: "unknown", label: "Not enough information" },
];
const finalTools = [
  { id: "calendar", text: "📅 The calendar reminder", kind: "ordinary", why: "It follows a fixed instruction." },
  { id: "tablet", text: "📲 The check-in tablet", kind: "ordinary", why: "It follows set steps, as the typo showed." },
  { id: "inbox", text: "📥 The shared inbox tool", kind: "ai", why: "It learned patterns from sorted examples and predicts." },
  { id: "sheet", text: "🧮 A spreadsheet that adds up expenses", kind: "ordinary", why: "It follows a formula someone set up." },
  { id: "chatbot", text: "💬 A website chatbot advertised as “smart”. The company doesn't say how it works.", kind: "unknown", why: "A label isn't evidence. Without reliable information, “not enough information” is the honest answer." },
];
function SortTools({
  state,
  change,
  all,
  slug,
  scope,
  prompts,
}: {
  state: ActivityState;
  change: Change;
  all: Record<string, ActivityState>;
  slug: string;
  scope: string;
  prompts: string[];
}) {
  const done = finalTools.filter((x) => answer(state, x.id) === x.kind).length;
  const guesses = all["rec-desk"]?.matches ?? {};
  const compared = ["calendar", "tablet", "inbox"].filter((id) => guesses[id]);
  return (
    <>
      <Instruction>Sort each tool. Use “Not enough information” when you can&apos;t tell.</Instruction>
      <ul className="mt-3 space-y-3">
        {finalTools.map((x) => {
          const chosen = answer(state, x.id);
          return (
            <li key={x.id} className="rounded-2xl border border-line bg-white p-4">
              <RadioRow name={`sort-${x.id}`} legend={x.text} options={kinds} value={chosen} onChange={(id) => change(withAnswer(state, x.id, id))} />
              {chosen && <Verdict right={chosen === x.kind}>{chosen === x.kind ? x.why : "Think about how it works, not how it looks."}</Verdict>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of 5 sorted correctly</p>
      {done === 5 && (
        <div className="welcome-rise">
          <Idea title="A twist">
            <p>
              Some AI uses rules too, like the <b>expert systems</b> from Lesson
              3, which captured experts&apos; knowledge to make judgments. So
              don&apos;t go by the label: ask what a system does and how it works.
            </p>
          </Idea>
          {compared.length > 0 && (
            <div className="mt-4 rounded-2xl bg-canvas p-5">
              <p className="font-bold">Your first guesses</p>
              <ul className="mt-2 space-y-1">
                {compared.map((id) => {
                  const tool = finalTools.find((x) => x.id === id)!;
                  const guessAi = guesses[id] === "ai";
                  const right = guessAi === (tool.kind === "ai");
                  return (
                    <li key={id}>
                      {tool.text}: you guessed <b>{guessAi ? "AI" : "not AI"}</b>{" "}
                      {right ? "✓ spot on" : "↺ now you know"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-lg font-bold">
          Put it in your own words <span className="text-sm font-normal text-muted">(optional)</span>
        </p>
        <div className="mt-3">
          <Reflection prompts={prompts} slug={slug} scope={scope} />
        </div>
      </div>
    </>
  );
}

export function OfficeActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "rec-desk":
      return <Desk {...common} />;
    case "rec-reminder":
      return <Reminder {...common} />;
    case "rec-checkin":
      return <CheckIn {...common} />;
    case "rec-inbox":
      return <Inbox {...common} />;
    case "rec-mistake":
      return <Mistake {...common} />;
    case "rec-sort":
      return <SortTools {...common} all={p.all} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

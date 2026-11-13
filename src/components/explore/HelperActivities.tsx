"use client";
// Episode 2.1: Maya's new helper. Unscored practice on scripted chats.
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
import { ScriptedChat } from "./ScriptedChat";

function Verdict({ right, children }: { right: boolean; children: React.ReactNode }) {
  return (
    <p role="status" className={`mt-2 rounded-xl p-3 text-sm leading-relaxed ${right ? "bg-mint/60" : "bg-peach/60"}`}>
      <b>{right ? "✓ Right." : "↺ Not quite."}</b> {children}
    </p>
  );
}

/* ---------- 1. Three weeks to an open day ---------- */
const jobs = [
  { id: "newsletter", text: "Write a paragraph for the newsletter", fits: true, why: "Writing a first draft is something chat tools do well." },
  { id: "rooms", text: "Book the rooms", fits: false, why: "A chat tool cannot book a room. Maya still needs the booking system or a phone call." },
  { id: "emails", text: "Draft replies to the waiting emails", fits: true, why: "Drafting replies is word work, which chat tools help with." },
  { id: "volunteers", text: "Call the volunteers", fits: false, why: "Calls need Maya. A chat tool could help her plan what to say, though." },
  { id: "ideas", text: "List ideas for open day activities", fits: true, why: "Brainstorming a list of ideas is a good use of a chat tool." },
];
function Busy({ state, change }: { state: ActivityState; change: Change }) {
  const done = jobs.filter((j) => answer(state, j.id) === (j.fits ? "yes" : "no")).length;
  return (
    <>
      <Story>
        <p>
          Maya runs the office at a busy community centre. Her manager, Rosa, asks her to
          organise an open day in <b>three weeks</b>, on top of everything else. Her colleague
          Leo suggests an AI chat tool, such as ChatGPT, Gemini, Claude or Copilot.
        </p>
      </Story>
      <Instruction>For each job on Maya&apos;s list, could a chat tool help?</Instruction>
      <ul className="mt-3 space-y-3">
        {jobs.map((j) => {
          const chosen = answer(state, j.id);
          const right = chosen === (j.fits ? "yes" : "no");
          return (
            <li key={j.id} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="font-semibold">{j.text}</legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { id: "yes", label: "A chat tool could help" },
                    { id: "no", label: "Maya does this herself" },
                  ].map((o) => (
                    <label
                      key={o.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${chosen === o.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input type="radio" name={`job-${j.id}`} className="size-5 shrink-0 accent-brand" checked={chosen === o.id} onChange={() => change(withAnswer(state, j.id, o.id))} />
                      {o.label}
                    </label>
                  ))}
                </div>
                {chosen && <Verdict right={right}>{right ? j.why : "Think about whether the job is about words, or about doing something in the world."}</Verdict>}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of {jobs.length} sorted</p>
      {done === jobs.length && (
        <Feedback tone="good" title="Chat tools help with words">
          Drafting, rewording and listing ideas: that is where a chat tool can save Maya time.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 2. Ask the chat tool ---------- */
const request = "Write a short, welcoming paragraph about our community centre for the open day newsletter.";
const draft = [
  { id: "welcome", text: "Our community centre is a warm, welcoming place for people of all ages." },
  { id: "fifty", text: "For over fifty years, our centre has brought people together." },
  { id: "everyone", text: "With activities, clubs and friendly faces, there is something for everyone." },
  { id: "hello", text: "Come along to our open day and say hello!" },
];
const draftText = draft.map((d) => d.text).join(" ");
function Ask({ state, change }: { state: ActivityState; change: Change }) {
  const sent = (state.stage ?? 0) >= 1;
  const shown = (state.stage ?? 0) >= 2;
  return (
    <>
      <Idea title="How it works">
        <p>
          You type a request in ordinary words, and the chat tool types an answer back. In this
          course, the chats are scripted examples, so nothing you do is sent to any AI tool.
        </p>
      </Idea>
      <Instruction>Send Maya&apos;s request and watch what comes back.</Instruction>
      <ScriptedChat
        messages={sent ? [{ from: "you", text: request }, { from: "ai", text: draftText }] : []}
        instant={shown}
        onReplyShown={() => !shown && change({ ...state, stage: 2 })}
      />
      {!sent && (
        <div className="mt-3 rounded-2xl border border-line bg-canvas p-3">
          <p className="text-sm text-muted">Maya&apos;s request</p>
          <p className="mt-1">{request}</p>
          <button type="button" className={`${primaryButton} mt-3`} onClick={() => change({ ...state, stage: 1 })}>
            Send
          </button>
        </div>
      )}
      {shown && (
        <Feedback tone="info" title="Warm, polished and quick">
          It took seconds, and it sounds professional. Maya can already picture it in the
          newsletter. Before she copies it, read it carefully in the next step.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 3. Which line needs checking? ---------- */
const lineFeedback: Record<string, string> = {
  welcome: "That is a general, friendly description Maya can judge for herself. Look for a line with a specific fact.",
  fifty: "Maya never told the tool when the centre opened. It fits the kind of newsletter she asked for, but that does not make it true.",
  everyone: "A general description of the centre. Maya knows whether it fits. Look for a specific claim.",
  hello: "That is an invitation, not a fact. Look for a line someone could rely on.",
};
function Check({ state, change }: { state: ActivityState; change: Change }) {
  const chosen = answer(state, "q");
  const noted = Boolean(state.revised);
  return (
    <>
      <Instruction>Tap the line Maya should check before it goes in the newsletter.</Instruction>
      <div className="mt-3 rounded-[1.5rem] border-2 border-navy/15 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">AI chat tool: first draft</p>
        <div className="mt-2 flex flex-col gap-2">
          {draft.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={chosen === d.id}
              onClick={() => change(withAnswer(state, "q", d.id))}
              className={`${activityButton} font-normal ${chosen === d.id ? (d.id === "fifty" ? "border-teal bg-mint/60 ring-2 ring-teal" : "border-orange-400 bg-peach/50") : ""}`}
            >
              {d.text}
            </button>
          ))}
        </div>
      </div>
      {chosen && <Verdict right={chosen === "fifty"}>{lineFeedback[chosen]}</Verdict>}
      {chosen === "fifty" && (
        <div className="welcome-rise mt-4">
          {!noted ? (
            <button type="button" className={primaryButton} onClick={() => change({ ...state, revised: true })}>
              ✏️ Add Maya&apos;s note
            </button>
          ) : (
            <Feedback tone="good" title="Note added">
              &ldquo;Check opening date with Rosa before printing.&rdquo; Maya keeps the parts she
              likes, and checks the one detail someone could rely on.
            </Feedback>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- 4. Why it sounds so sure ---------- */
const rounds = [
  {
    key: "w1",
    start: "Our centre has brought people",
    options: [
      { id: "together", text: "together", likely: 92 },
      { id: "closer", text: "closer", likely: 6 },
      { id: "pancakes", text: "pancakes", likely: 0 },
    ],
    best: "together",
    note: "“Together” is by far the most likely next word after “brought people”. That is why the tool's writing flows so smoothly.",
  },
  {
    key: "w2",
    start: "For over ___ years, our centre has brought people together.",
    options: [
      { id: "fifty", text: "fifty", likely: 41 },
      { id: "twenty", text: "twenty", likely: 33 },
      { id: "three", text: "three", likely: 4 },
    ],
    best: "fifty",
    note: "“Fifty” simply sounds likely in a sentence like this. The tool has no idea when Maya's centre opened. It is choosing words that sound right, not checking facts.",
  },
];
function Why({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Idea>
        <p>
          A chat tool writes by predicting which words are <b>most likely to come next</b>, based on
          patterns it learned from an enormous amount of text. Try it: pick the next word the way
          a chat tool would.
        </p>
      </Idea>
      {rounds.map((r, i) => {
        const chosen = answer(state, r.key);
        if (i > 0 && !answer(state, rounds[i - 1].key)) return null;
        return (
          <fieldset key={r.key} className="welcome-rise mt-5 rounded-2xl border border-line bg-white p-4">
            <legend className="px-1 font-semibold">
              {r.start.includes("___") ? r.start : `${r.start} …`}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {r.options.map((o) => (
                <label
                  key={o.id}
                  className={`flex min-h-11 cursor-pointer flex-col justify-center rounded-xl border-2 px-3 py-2 ${chosen === o.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                >
                  <span className="flex items-center gap-2">
                    <input type="radio" name={r.key} className="size-5 shrink-0 accent-brand" checked={chosen === o.id} onChange={() => change(withAnswer(state, r.key, o.id))} />
                    <b>{o.text}</b>
                  </span>
                  {chosen && (
                    <span className="mt-2 block">
                      <span className="block h-2 rounded-full bg-line">
                        <span className="block h-2 rounded-full bg-brand" style={{ width: `${o.likely}%` }} />
                      </span>
                      <span className="text-xs text-muted">{o.likely}% likely</span>
                    </span>
                  )}
                </label>
              ))}
            </div>
            {chosen && <p role="status" className="mt-3 rounded-xl bg-canvas p-3 text-sm leading-relaxed">{r.note}</p>}
          </fieldset>
        );
      })}
      {answer(state, "w2") && (
        <Feedback tone="good" title="Smooth is not the same as right">
          A chat tool chooses words that sound right. So it can sound exactly as confident when it is
          wrong as when it is right. (The percentages here are made up to show the idea.)
        </Feedback>
      )}
    </>
  );
}

/* ---------- 5. Your turn ---------- */
const habit: Option[] = [
  { id: "paste", text: "Paste the answer straight in, because it sounds professional", feedback: "Polished writing can still contain a made-up detail, like Maya's fifty years." },
  { id: "draft-check", text: "Use it as a first draft, then check the details someone else might rely on", correct: true, feedback: "That is the habit this whole module builds." },
  { id: "never", text: "Never use AI, because it can be wrong", feedback: "It saved Maya real time. The answer is to check it, not to avoid it." },
];
function Turn({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  return (
    <>
      <Choice
        name="habit"
        question="What is the best habit when a chat tool gives you an answer?"
        options={habit}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-lg font-bold">
          Your turn <span className="text-sm font-normal text-muted">(optional)</span>
        </p>
        <div className="mt-3">
          <Reflection prompts={prompts} slug={slug} scope={scope} />
        </div>
      </div>
    </>
  );
}

export function HelperActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "chat-busy":
      return <Busy {...common} />;
    case "chat-ask":
      return <Ask {...common} />;
    case "chat-check":
      return <Check {...common} />;
    case "chat-why":
      return <Why {...common} />;
    case "chat-turn":
      return <Turn {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

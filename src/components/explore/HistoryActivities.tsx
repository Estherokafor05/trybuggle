"use client";
// Lesson 3: The AI Time Machine. Unscored, formative activities.
import type { ReactNode } from "react";
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
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "./Activities";

function SarahFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#e3ddfa" />
      <path d="M8 40q0-12 12-12t12 12z" fill="#f6f7f9" />
      <path d="M17 28h6v12h-6z" fill="#2e4a7d" />
      <path d="M10 22q-1-15 10-15t10 15l-3 3h-14z" fill="#7b3a22" />
      <circle cx="20" cy="18" r="7.5" fill="#e2a984" />
      <path d="M12.5 17q1-8 7.5-8t7.5 8q-4-5-7.5-4t-7.5 4z" fill="#5f2b18" />
      <g fill="none" stroke="#2b3550" strokeWidth=".9">
        <rect x="14.2" y="16.3" width="4.6" height="3.4" rx="1.2" />
        <rect x="21.2" y="16.3" width="4.6" height="3.4" rx="1.2" />
      </g>
      <path d="M17.5 21.8q2.5 1.8 5 0" stroke="#8f4a43" fill="none" />
    </svg>
  );
}
function SarahStory({ children }: { children: ReactNode }) {
  return (
    <Story who="Sarah" face={<SarahFace />}>
      {children}
    </Story>
  );
}
function YearBadge({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-1.5 text-sm font-bold text-white">
      <span aria-hidden="true">⏱</span> Time machine: {children}
    </p>
  );
}

/* ---------- 1950: Turing's conversation game ---------- */
const turingQuestion: Option[] = [
  {
    id: "behaviour",
    text: "Whether machines could show intelligent behaviour, like using language",
    correct: true,
    feedback:
      "Turing asked whether machines could think. Because thinking is hard to define, he suggested judging by behaviour in conversation.",
  },
  {
    id: "size",
    text: "How to make computers small enough to carry",
    feedback:
      "Computers did get smaller later, but Turing's question was about what machines could do, not their size.",
  },
  {
    id: "network",
    text: "How to connect computers to each other",
    feedback:
      "Connecting computers came later. Turing was asking whether machines could think, or at least act as if they did.",
  },
];
const replies = [
  { id: "a", text: "I visited my sister and we baked bread. It didn't rise, but it tasted fine." },
  { id: "b", text: "I went for a walk. It started raining, so I came home early and read a book." },
];
function Turing({ state, change }: { state: ActivityState; change: Change }) {
  const guess = answer(state, "guess");
  return (
    <>
      <YearBadge>1950</YearBadge>
      <SarahStory>
        <p>
          Sarah is a pharmacist. At a team meeting, her manager said AI has been
          around for decades. Sarah thought it started with ChatGPT, so she
          sets the time machine to 1950 to find out.
        </p>
      </SarahStory>
      <Idea>
        <p>
          In 1950, the mathematician <b>Alan Turing</b> asked whether machines
          could think. He suggested a test: chat by text with two hidden
          partners, one a person and one a machine. Can you tell which is which?
        </p>
      </Idea>
      <Instruction>Read both replies. Which one do you think came from a machine?</Instruction>
      <div className="mt-3 rounded-2xl bg-ivory p-4 sm:p-5">
        <p className="w-fit max-w-[85%] rounded-2xl bg-white px-4 py-3">
          <span className="block text-xs font-bold uppercase tracking-[0.08em] text-muted">
            Your question
          </span>
          What did you do at the weekend?
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {replies.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={guess === r.id}
              className={`${activityButton} ${guess === r.id ? "border-brand bg-lavender ring-2 ring-brand" : ""}`}
              onClick={() => change(withAnswer(state, "guess", r.id))}
            >
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-muted">
                Partner {r.id.toUpperCase()}
                {guess === r.id && " · your guess: machine"}
              </span>
              <span className="mt-1 block font-normal">{r.text}</span>
            </button>
          ))}
        </div>
      </div>
      {guess && (
        <>
          <Feedback title="You can't be sure, and that's the point">
            This is a pretend example: both replies were written for this
            guide. Turing&apos;s idea was that if people can&apos;t reliably
            tell a machine&apos;s replies from a person&apos;s, that tells us
            something about what the machine can do. In 1950, no machine could
            chat like this.
          </Feedback>
          <Choice
            name="turing"
            question="So what was Turing's big question?"
            options={turingQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
        </>
      )}
    </>
  );
}

/* ---------- 1956: naming the field ---------- */
const nameQuestion: Option[] = [
  {
    id: "brains",
    text: "Electronic brains",
    feedback:
      "Newspapers at the time often called computers “electronic brains”, but the workshop used a different name.",
  },
  {
    id: "ai",
    text: "Artificial intelligence",
    correct: true,
    feedback:
      "The workshop was called the Dartmouth Summer Research Project on Artificial Intelligence, and the name stuck.",
  },
  {
    id: "ml",
    text: "Machine learning",
    feedback:
      "Machine learning is a name for one way of building AI, which grew later. The 1956 workshop named the whole field.",
  },
];
function Naming({ state, change }: { state: ActivityState; change: Change }) {
  const value = answer(state, "q");
  return (
    <>
      <YearBadge>1956</YearBadge>
      <SarahStory>
        <p>
          Next stop: summer 1956. Researchers have gathered for a workshop at
          Dartmouth College in the United States. They are about to give their
          new field a name.
        </p>
      </SarahStory>
      <Choice
        name="naming"
        question="Which name did the workshop give this new field?"
        options={nameQuestion}
        value={value}
        onChange={(id) => change(withAnswer(state, "q", id))}
        goodTitle="That's the one!"
      />
      {value === "ai" && (
        <Idea title="Older than you might think">
          <p>
            The term <b>artificial intelligence</b> is about{" "}
            <b>seventy years old</b>. Sarah is surprised: the name is decades
            older than ChatGPT.
          </p>
        </Idea>
      )}
    </>
  );
}

/* ---------- 1970s to 1980s: a rule-based printer helper ---------- */
type Node = { id: string; ask: string; yes: string; no: string };
const ruleNodes: Record<string, Node> = {
  power: { id: "power", ask: "Is the printer switched on?", yes: "paper", no: "end-power" },
  paper: { id: "paper", ask: "Is there paper in the tray?", yes: "jam", no: "end-paper" },
  jam: { id: "jam", ask: "Is the paper-jam light flashing?", yes: "end-jam", no: "end-stuck" },
};
const ruleEnds: Record<string, { text: string; sarah: boolean }> = {
  "end-power": { text: "Switch the printer on and try again.", sarah: false },
  "end-paper": { text: "Add paper to the tray and try again.", sarah: false },
  "end-jam": { text: "Open the cover and gently remove the stuck paper.", sarah: false },
  "end-stuck": { text: "Sorry, I don't have a rule for this problem.", sarah: true },
};
const stuckQuestion: Option[] = [
  {
    id: "rule",
    text: "Nobody had written a rule for this problem",
    correct: true,
    feedback:
      "A rule-based system can only follow the rules people gave it. A new kind of problem leaves it stuck.",
  },
  {
    id: "paper",
    text: "The printer needed more paper",
    feedback:
      "Sarah's printer had paper. The helper only knew the problems someone had written rules for.",
  },
  {
    id: "speed",
    text: "The helper needed a faster computer",
    feedback:
      "Speed wasn't the issue. However fast it ran, the helper had no rule for a grinding noise.",
  },
];
function Rules({ state, change }: { state: ActivityState; change: Change }) {
  const path = state.items ?? [];
  const current = path.length ? path[path.length - 1] : "power";
  const node = ruleNodes[current];
  const end = ruleEnds[current];
  const stuckSeen = Boolean(state.revised);
  function choose(next: string) {
    change({
      ...state,
      items: [...path, next],
      revised: stuckSeen || next === "end-stuck",
    });
  }
  return (
    <>
      <YearBadge>1970s to 1980s</YearBadge>
      <Idea>
        <p>
          For many years, a popular way to build AI was to write{" "}
          <b>rules</b>. Researchers asked experts how they made decisions and
          turned the answers into long lists of “if this, then that”
          instructions. These were often called <b>expert systems</b>.
        </p>
      </Idea>
      <SarahStory>
        <p>
          Sarah&apos;s pharmacy printer won&apos;t print. It <b>is switched on</b>,
          it <b>has paper</b>, and it&apos;s making a <b>grinding noise</b>. No
          lights are flashing. She tries a rule-based printer helper.
        </p>
      </SarahStory>
      <Instruction>Answer the helper&apos;s questions for Sarah&apos;s printer.</Instruction>
      <div className="mt-3 rounded-2xl border-2 border-navy/15 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
          Printer helper
        </p>
        {path
          .filter((step) => ruleNodes[ruleKeyBefore(path, step)] !== undefined)
          .map((step) => {
            const asked = ruleNodes[ruleKeyBefore(path, step)];
            return (
              <p key={step + asked.id} className="mt-2 text-muted">
                {asked.ask}{" "}
                <b className="text-ink">{asked.yes === step ? "Yes" : "No"}</b>
              </p>
            );
          })}
        {node && (
          <div className="mt-3">
            <p className="text-lg font-semibold">{node.ask}</p>
            <div className="mt-3 flex gap-3">
              <button type="button" className={activityButton} onClick={() => choose(node.yes)}>
                Yes
              </button>
              <button type="button" className={activityButton} onClick={() => choose(node.no)}>
                No
              </button>
            </div>
          </div>
        )}
        {end && (
          <p className={`welcome-rise mt-3 rounded-xl p-3 text-lg font-semibold ${end.sarah ? "bg-peach/70" : "bg-mint/60"}`}>
            <span aria-hidden="true">{end.sarah ? "⚠ " : "→ "}</span>
            {end.text}
          </p>
        )}
      </div>
      {end && !end.sarah && (
        <Feedback tone="retry" title="Good advice, wrong printer">
          That advice fits your answers, but Sarah&apos;s printer is switched
          on, has paper and has no flashing lights.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => change({ ...state, items: [] })}
          >
            Start again
          </button>
        </Feedback>
      )}
      {stuckSeen && (
        <div className="welcome-rise">
          <Choice
            name="stuck"
            question="Why did the helper get stuck?"
            options={stuckQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
          {answer(state, "q") === "rule" && (
            <Idea title="AI winters">
              <p>
                Rule-based systems were useful for narrow jobs, but every rule
                had to be written by hand. When results fell short of big
                promises, interest and funding dropped for a while. People call
                these quiet periods <b>“AI winters”</b>. Research carried on.
              </p>
            </Idea>
          )}
        </div>
      )}
    </>
  );
}
/** The question that was answered to reach `step` in the helper's path. */
function ruleKeyBefore(path: string[], step: string) {
  const index = path.indexOf(step);
  return index === 0 ? "power" : path[index - 1];
}

/* ---------- 1997 onwards: searching or learning? ---------- */
const sortItems = [
  {
    id: "chess",
    text: "Deep Blue checks millions of possible chess moves, scoring each one with rules written by people.",
    kind: "rules",
    why: "Deep Blue searched through moves using rules and scoring people wrote. It did not learn chess from examples.",
  },
  {
    id: "photos",
    text: "A photo app finds dog pictures after being trained on many labelled photos.",
    kind: "learn",
    why: "The app found patterns in labelled examples. That is machine learning.",
  },
  {
    id: "printer",
    text: "A printer helper follows a checklist that engineers wrote.",
    kind: "rules",
    why: "Every step was written by people, like the helper you just tried.",
  },
  {
    id: "speech",
    text: "A speech tool gets better at recognising words after studying lots of recordings.",
    kind: "learn",
    why: "It improved by finding patterns in many examples of speech.",
  },
];
const kinds = [
  { id: "rules", label: "Rules and searching" },
  { id: "learn", label: "Learning from examples" },
];
function Sort({ state, change }: { state: ActivityState; change: Change }) {
  const done = sortItems.filter((i) => answer(state, i.id) === i.kind).length;
  return (
    <>
      <YearBadge>1997 onwards</YearBadge>
      <SarahStory>
        <p>
          In 1997, Sarah watches IBM&apos;s <b>Deep Blue</b> beat the world
          chess champion Garry Kasparov. Over the next years, a different
          approach called <b>machine learning</b> grows.
        </p>
      </SarahStory>
      <Instruction>For each example, choose how it works.</Instruction>
      <ul className="mt-3 space-y-3">
        {sortItems.map((item) => {
          const chosen = answer(state, item.id);
          const right = chosen === item.kind;
          return (
            <li key={item.id} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="font-semibold">{item.text}</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {kinds.map((k) => (
                    <label
                      key={k.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 ${chosen === k.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input
                        type="radio"
                        name={`sort-${item.id}`}
                        className="size-5 shrink-0 accent-brand"
                        checked={chosen === k.id}
                        onChange={() => change(withAnswer(state, item.id, k.id))}
                      />
                      {k.label}
                    </label>
                  ))}
                </div>
                {chosen && (
                  <p role="status" className={`mt-2 rounded-xl p-3 text-sm leading-relaxed ${right ? "bg-mint/60" : "bg-peach/60"}`}>
                    <b>{right ? "✓ Right." : "↺ Not quite."}</b> {right ? item.why : "Think about whether people wrote the steps, or the system found patterns in examples."}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of 4 sorted correctly</p>
      {done === 4 && (
        <Feedback tone="good" title="All four sorted!">
          Both approaches are part of AI&apos;s history, and many tools today
          combine them. Machine learning made computers much better at
          recognising images, recognising speech and making predictions.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 2022: put the story in order ---------- */
const milestones = [
  { id: "turing", year: "1950", text: "Turing asks whether machines can think" },
  { id: "dartmouth", year: "1956", text: "A Dartmouth workshop names the field" },
  { id: "rules", year: "1970s to 1980s", text: "Rule-based expert systems spread" },
  { id: "chess", year: "1997", text: "Deep Blue beats Kasparov at chess" },
  { id: "ml", year: "2010s", text: "Machine learning powers everyday tools" },
  { id: "chat", year: "2022", text: "ChatGPT lets almost anyone chat with AI" },
];
const shuffled = ["chess", "chat", "turing", "ml", "rules", "dartmouth"];
const changeQuestion: Option[] = [
  {
    id: "invented",
    text: "AI was invented",
    feedback:
      "Your timeline shows decades of AI research before 2022, starting in the 1950s.",
  },
  {
    id: "chat",
    text: "Almost anyone could type a question in plain words and get a written reply",
    correct: true,
    feedback:
      "AI wasn't new. Chat tools made it far more visible and easy to use, which is why it can feel new.",
  },
  {
    id: "chess",
    text: "A computer beat a world chess champion for the first time",
    feedback: "That was Deep Blue, in 1997, twenty-five years earlier.",
  },
];
function Order({ state, change }: { state: ActivityState; change: Change }) {
  const placed = state.items ?? [];
  const wrong = state.selection;
  const nextExpected = milestones[placed.length]?.id;
  const complete = placed.length === milestones.length;
  function tap(id: string) {
    if (id === nextExpected) change({ ...state, items: [...placed, id], selection: undefined });
    else change({ ...state, selection: id });
  }
  const wrongItem = milestones.find((m) => m.id === wrong);
  return (
    <>
      <YearBadge>2022</YearBadge>
      <SarahStory>
        <p>
          Sarah&apos;s last stop is November 2022, when ChatGPT is released.
          Before heading home, she wants the whole story in the right order.
        </p>
      </SarahStory>
      <Instruction>Tap the milestones from earliest to latest.</Instruction>
      <ol className="mt-3 space-y-2" aria-label="Your timeline so far">
        {placed.map((id, i) => {
          const m = milestones.find((x) => x.id === id)!;
          return (
            <li key={id} className="welcome-rise flex items-center gap-3 rounded-xl bg-mint/60 p-3">
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-teal text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>
                <b>{m.year}</b> · {m.text}
              </span>
            </li>
          );
        })}
      </ol>
      {!complete && (
        <>
          <p className="mt-4 font-semibold">
            Which comes {placed.length ? "next" : "first"}?
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {shuffled
              .filter((id) => !placed.includes(id))
              .map((id) => {
                const m = milestones.find((x) => x.id === id)!;
                return (
                  <button key={id} type="button" className={activityButton} onClick={() => tap(id)}>
                    {m.text}
                  </button>
                );
              })}
          </div>
          {wrongItem && (
            <Feedback tone="retry" title="Not yet">
              “{wrongItem.text}” happened later. Which of the remaining
              milestones came before it?
            </Feedback>
          )}
        </>
      )}
      {complete && (
        <div className="welcome-rise">
          <Feedback tone="good" title="The story is in order">
            Seventy years of work, from a question in 1950 to chat tools in
            2022.
          </Feedback>
          <Choice
            name="change"
            question="So what changed in 2022?"
            options={changeQuestion}
            value={answer(state, "q")}
            onChange={(id) => change(withAnswer(state, "q", id))}
          />
        </div>
      )}
    </>
  );
}

/* ---------- Back to today ---------- */
const recap = [
  "In 1950, Turing asked whether machines could think.",
  "In 1956, a Dartmouth workshop named the field artificial intelligence.",
  "Rule-based systems worked for narrow jobs but got stuck when no rule fitted.",
  "Deep Blue searched using rules. Machine learning finds patterns in examples.",
  "In 2022, chat tools made AI easy for almost anyone to use.",
];
const replyQuestion: Option[] = [
  {
    id: "new",
    text: "“You're right, AI is brand new.”",
    feedback:
      "AI research goes back to the 1950s. Chat tools are new, but AI is not.",
  },
  {
    id: "decades",
    text: "“People have worked on AI since the 1950s. Chat tools just made it much easier to see and use.”",
    correct: true,
    feedback:
      "That's the story in one sentence: decades of work, and one recent chapter that put AI in everyone's hands.",
  },
  {
    id: "always",
    text: "“AI has always been able to chat like a person.”",
    feedback:
      "Early systems followed rules or searched through moves. Chatting in plain language is a recent development.",
  },
];
function Today({
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
          {recap.map((r) => (
            <li key={r} className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>
      <SarahStory>
        <p>
          Back at the pharmacy, a colleague says: “AI only arrived when
          ChatGPT came out.”
        </p>
      </SarahStory>
      <Choice
        name="reply"
        question="What's the best way for Sarah to reply?"
        options={replyQuestion}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-lg font-bold">
          Put it in your own words{" "}
          <span className="text-sm font-normal text-muted">(optional)</span>
        </p>
        <div className="mt-3">
          <Reflection prompts={prompts} slug={slug} scope={scope} />
        </div>
      </div>
    </>
  );
}

export function HistoryActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "time-1950":
      return <Turing {...common} />;
    case "time-1956":
      return <Naming {...common} />;
    case "time-rules":
      return <Rules {...common} />;
    case "time-1997":
      return <Sort {...common} />;
    case "time-2022":
      return <Order {...common} />;
    case "time-reflect":
      return <Today {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

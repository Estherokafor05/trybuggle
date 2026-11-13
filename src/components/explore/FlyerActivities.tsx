"use client";
// Episode 2.3: Maya's flyer. Unscored practice on scripted chats.
import type { ActivityState } from "@/lib/learning-state";
import {
  Choice,
  Feedback,
  Idea,
  Instruction,
  Reflection,
  Story,
  answer,
  primaryButton,
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "./Activities";
import { flyerSort } from "./completion";
import { ScriptedChat } from "./ScriptedChat";

/* ---------- 1. The first draft: keep or change? ---------- */
const draftParts = [
  {
    id: "opening",
    text: "We are delighted to announce that the community centre will be hosting its forthcoming open day",
    keep: "This is the long, formal opening. Nobody reads all that on their way out.",
    change: "Right. It is long and formal, and someone walking past has only a few seconds.",
  },
  {
    id: "date",
    text: "on Saturday the 21st, from 10 am to 3 pm,",
    keep: "Right. The date and time are what people need, and Maya has checked them.",
    change: "The date and time are exactly what people need. Maya keeps these.",
  },
  {
    id: "place",
    text: "in the main hall,",
    keep: "Right. People need to know where to go.",
    change: "People need to know where to go. Maya keeps this.",
  },
  {
    id: "ending",
    text: "where local clubs and groups will be presenting their activities…",
    keep: "It goes on and on. A flyer needs a few words that make people want to come.",
    change: "Right. It is wordy. A flyer needs a few words that make people want to come.",
  },
];
const firstDraft = draftParts.map((p) => p.text).join(" ");
function FirstDraft({ state, change }: { state: ActivityState; change: Change }) {
  const allRight = draftParts.every((p) => answer(state, p.id) === flyerSort[p.id]);
  return (
    <>
      <Story>
        <p>
          Maya imagines someone walking past the noticeboard on their way out. They have a few
          seconds to see what is happening. She tells the chat tool who the flyer is for, what is
          happening, when and where, and asks for a friendly tone.
        </p>
      </Story>
      <ScriptedChat
        instant
        messages={[
          { from: "you", text: "Write a short, friendly flyer for our community centre open day, for local people and families. It's on Saturday the 21st, 10 am to 3 pm, in the main hall. Local clubs and groups will be there." },
          { from: "ai", text: firstDraft },
        ]}
      />
      <Instruction>The details are right, but it is too long for a noticeboard. For each part, decide: keep it, or change it?</Instruction>
      <ul className="mt-3 space-y-3">
        {draftParts.map((p) => {
          const chosen = answer(state, p.id) as "keep" | "change" | undefined;
          const right = chosen === flyerSort[p.id];
          return (
            <li key={p.id} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="leading-relaxed">“{p.text}”</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["keep", "change"] as const).map((v) => (
                    <label
                      key={v}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2 font-semibold ${chosen === v ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input type="radio" name={`part-${p.id}`} className="size-5 accent-brand" checked={chosen === v} onChange={() => change(withAnswer(state, p.id, v))} />
                      {v === "keep" ? "Keep" : "Change"}
                    </label>
                  ))}
                </div>
                {chosen && (
                  <p role="status" className={`mt-2 rounded-xl p-3 text-sm ${right ? "bg-mint/60" : "bg-peach/60"}`}>
                    <b>{right ? "✓" : "↺ Think again."}</b> {p[chosen]}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      {allRight && (
        <Feedback tone="good" title="Keep the details, change the wording">
          The draft is close. Maya does not need to start again or write it herself. She can tell
          the tool exactly that.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 2. What would you say next? ---------- */
const nextMessages: Option[] = [
  { id: "again", text: "Start a new chat and type the whole request again", feedback: "She would lose a draft that is already close, and might get the same long opening again." },
  { id: "keep-change", text: "“Keep the date, time and place. Make it no more than fifty words.”", correct: true, feedback: "It says what to keep and what to change, in the same chat, so the tool can build on the draft it already wrote." },
  { id: "better", text: "“Make it better.”", feedback: "Better how? The tool would have to guess what Maya wants to change." },
];
function Next({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Idea>
        <p>
          Maya is about to write the flyer herself. But the draft already has the right details.
          It is just too long and too formal.
        </p>
      </Idea>
      <Choice
        name="next"
        question="What would you say to the chat tool next?"
        options={nextMessages}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 3. Change how it sounds ---------- */
const secondDraft =
  "Community centre open day. Saturday the 21st, 10 am to 3 pm, main hall. Meet local clubs and groups and discover opportunities for community engagement. All welcome.";
const thirdDraft =
  "Come and see what’s happening at your community centre! Open day, Saturday the 21st, 10 am to 3 pm, in the main hall. Meet local clubs, try something new and bring the family.";
const toneOptions = [
  { id: "longer", text: "Add more about the community centre.", why: "That would make it longer again. The problem now is how it sounds." },
  { id: "neighbour", text: "Make it sound like I’m inviting a neighbour.", why: "" },
  { id: "fix", text: "Fix it.", why: "Fix what? The tool would have to guess." },
];
function Tone({ state, change }: { state: ActivityState; change: Change }) {
  const pick = answer(state, "q");
  const chosen = toneOptions.find((o) => o.id === pick);
  const stage = state.stage ?? 0;
  return (
    <>
      <Story>
        <p>
          Maya stays in the same chat. The new version fits on the flyer, but one line still
          sounds stiff.
        </p>
      </Story>
      <ScriptedChat
        instant
        label="Same chat"
        messages={[
          { from: "you", text: "Keep the date, time and place. Make it no more than fifty words." },
          { from: "ai", text: secondDraft },
        ]}
      />
      <fieldset className="mt-5">
        <legend className="font-semibold">Which follow-up should Maya send to change how it sounds?</legend>
        <div className="mt-3 grid gap-2">
          {toneOptions.map((o) => (
            <label
              key={o.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 ${pick === o.id ? "border-brand bg-lavender/60" : "border-line bg-white hover:bg-canvas"}`}
            >
              <input type="radio" name="tone" className="size-5 shrink-0 accent-brand" checked={pick === o.id} disabled={stage >= 1} onChange={() => change(withAnswer(state, "q", o.id))} />
              “{o.text}”
            </label>
          ))}
        </div>
        {chosen && chosen.id !== "neighbour" && (
          <p role="status" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
            <b>↺ Try another.</b> {chosen.why}
          </p>
        )}
      </fieldset>
      {stage < 1 && (
        <button type="button" className={`${primaryButton} mt-4`} disabled={pick !== "neighbour"} onClick={() => change({ ...state, stage: 1 })}>
          Send the follow-up
        </button>
      )}
      {stage >= 1 && (
        <>
          <ScriptedChat
            label="Same chat"
            messages={[
              { from: "you", text: "Make it sound like I’m inviting a neighbour." },
              { from: "ai", text: thirdDraft },
            ]}
            instant={stage >= 2}
            onReplyShown={() => stage < 2 && change({ ...state, stage: 2 })}
          />
          {stage >= 2 && (
            <Feedback tone="good" title="Now it sounds like Maya">
              Three tries, one conversation. Each time, Maya said what to keep and what to change,
              and the tool built on its last draft.
            </Feedback>
          )}
        </>
      )}
    </>
  );
}

/* ---------- 4. Ask someone who can check ---------- */
const checks: Option[] = [
  { id: "post", text: "Put it up. Chat tools are good at languages.", feedback: "They often are, but not always. A word that sounds odd or wrong could confuse the very families Maya wants to reach." },
  { id: "ask-tool", text: "Ask the chat tool whether its translation is correct", feedback: "The tool checking itself is not a real check. It may simply say yes." },
  { id: "volunteer", text: "Ask a volunteer who speaks the language to read it first", correct: true, feedback: "That is what Maya did. The volunteer changed two words that sounded odd, then both versions went up." },
];
function Check({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Story>
        <p>
          Maya thinks of the families who would find the flyer easier to read in another
          language. She asks the chat tool for a translated version. But she cannot read that
          language herself.
        </p>
      </Story>
      <Choice
        name="check"
        question="What should Maya do before she puts the translated flyer up?"
        options={checks}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 5. Your turn ---------- */
const followUps: Option[] = [
  { id: "again", text: "“Write it again.”", feedback: "The tool does not know what was wrong, so it has to guess." },
  { id: "keep-change", text: "“Keep the thank-you for watering my plants. Make it three sentences and sound warm and casual.”", correct: true, feedback: "It says what to keep, how long it should be, and how it should sound." },
  { id: "perfect", text: "“Make it perfect.”", feedback: "Perfect means something different to everyone. The tool still has to guess." },
];
function Turn({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  return (
    <>
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="text-lg font-bold">If a draft is close, keep the conversation going:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {["Say what to keep", "Say what to change: length, tone or both", "Can’t check it yourself? Ask someone who can"].map((q, i) => (
            <li key={q} className="flex gap-3">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>
      </div>
      <Story>
        <p>
          You asked a chat tool for a thank-you note to a neighbour who watered your plants. The
          draft is right, but it is long and very formal.
        </p>
      </Story>
      <Choice
        name="follow-up"
        question="Which follow-up gives the tool the least to guess?"
        options={followUps}
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

export function FlyerActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "flyer-first":
      return <FirstDraft {...common} />;
    case "flyer-next":
      return <Next {...common} />;
    case "flyer-tone":
      return <Tone {...common} />;
    case "flyer-check":
      return <Check {...common} />;
    case "flyer-turn":
      return <Turn {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

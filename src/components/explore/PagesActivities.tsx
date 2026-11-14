"use client";
// Episode 2.4: Maya's safety checklist. Unscored practice on scripted chats.
import type { ActivityState } from "@/lib/learning-state";
import {
  Choice,
  Feedback,
  Idea,
  Instruction,
  Reflection,
  Story,
  answer,
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "./Activities";
import { pagesCheck } from "./completion";
import { ScriptedChat } from "./ScriptedChat";

const checklistText = [
  "Open day checklist",
  "1. Risk assessment (p.4)",
  "2. Room capacity (p.6)",
  "3. Fire exits kept clear (p.9)",
  "4. Emergency contacts (p.11)",
  "5. Stall layout (p.13)",
  "6. Electrical checks (p.15)",
  "7. Food hygiene (p.18)",
  "8. Step-free entrance (p.20)",
  "9. Lost children plan (p.22)",
  "10. Waste and cleaning (p.24)",
  "11. Insurance (p.26)",
  "12. Signs and directions (p.28)",
  "",
  "A risk assessment is where you work out what could go wrong and what you can do to reduce the risk.",
].join("\n");
const request =
  "Summarise this in plain language, then turn it into a checklist. Show me where each item comes from in the guide. [Attached: Running public events safely, 30 pages]";

/* ---------- 1. Thirty pages ---------- */
const parts: Option[] = [
  { id: "plain", text: "“Summarise this in plain language”", feedback: "Helpful for understanding the guide, but it does not help Maya check the list." },
  { id: "where", text: "“Show me where each item comes from in the guide”", correct: true, feedback: "Yes. With a page for each item, Maya can go straight to that part of the guide and check it." },
  { id: "checklist", text: "“Turn it into a checklist”", feedback: "That is what Rosa asked for, but on its own it gives Maya no way to check where each item came from." },
];
function Pages({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Story>
        <p>
          On Monday, Rosa forwards Maya a 30-page guide from the local authority about running
          public events safely. “Could you turn this into a checklist for the open day? I’ll need
          it by Friday.” Maya gives the public guide to the chat tool.
        </p>
      </Story>
      <ScriptedChat instant messages={[{ from: "you", text: request }, { from: "ai", text: checklistText }]} />
      <Choice
        name="pages-part"
        question="Which part of Maya’s request will help her most when she checks the checklist later?"
        options={parts}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 2. Would you send it? ---------- */
const sendOptions: Option[] = [
  { id: "send", text: "Send it to Rosa now. It looks complete.", feedback: "It does look complete. That is the problem: a list can look right and still leave something out." },
  { id: "ask", text: "Ask the chat tool “Is anything missing?” and send it if it says no", feedback: "The tool checking its own work is not a real check. It may simply say no." },
  { id: "check", text: "Open the guide and check the most important sections against the list first", correct: true, feedback: "That is what Maya does. She starts with the safety sections, because those matter most." },
];
function Send({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Idea>
        <p>
          The checklist has twelve points, each with a page number, and even the jargon is
          explained. It feels like something Maya could forward to Rosa right now.
        </p>
      </Idea>
      <Choice
        name="pages-send"
        question="Would you send it? What should Maya do?"
        options={sendOptions}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 3. Check against the guide ---------- */
const requirements = [
  { id: "fire", text: "Fire exits must be kept clear at all times." },
  { id: "contacts", text: "Have a list of emergency contacts for the day." },
  { id: "firstaid", text: "For this event, a trained first-aider must be on site for the whole day." },
];
function Check({ state, change }: { state: ActivityState; change: Change }) {
  const allRight = requirements.every((r) => answer(state, r.id) === pagesCheck[r.id]);
  return (
    <>
      <Instruction>
        These are the safety requirements in the guide. Look at the checklist from step 1, then
        decide: is each one on the list, or missing?
      </Instruction>
      <details className="mt-3 rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-semibold">Show the checklist again</summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{checklistText}</p>
      </details>
      <ul className="mt-3 space-y-3">
        {requirements.map((r) => {
          const chosen = answer(state, r.id) as "on" | "missing" | undefined;
          const right = chosen === pagesCheck[r.id];
          return (
            <li key={r.id} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="leading-relaxed">
                  <span className="text-sm font-semibold text-muted">The guide says: </span>“{r.text}”
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["on", "missing"] as const).map((v) => (
                    <label
                      key={v}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2 font-semibold ${chosen === v ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input type="radio" name={`req-${r.id}`} className="size-5 accent-brand" checked={chosen === v} onChange={() => change(withAnswer(state, r.id, v))} />
                      {v === "on" ? "On the list" : "Missing"}
                    </label>
                  ))}
                </div>
                {chosen && (
                  <p role="status" className={`mt-2 rounded-xl p-3 text-sm ${right ? "bg-mint/60" : "bg-peach/60"}`}>
                    {right ? <b>✓ Right.</b> : <b>↺ Look again.</b>}{" "}
                    {r.id === "firstaid"
                      ? right
                        ? "There is no first-aid item on the list at all."
                        : "Read the list again. Is there anything about first aid?"
                      : right
                        ? "It is on the list."
                        : "Look again: it is on the list."}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      {allRight && (
        <Feedback tone="good" title="Every line looked right">
          And the list still left out something important. Maya only found it by reading the
          parts of the guide that matter most.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 4. Fixed, and honest about it ---------- */
const notes: Option[] = [
  { id: "nothing", text: "Nothing about how she made it. It’s her checklist now.", feedback: "Rosa will rely on this list. Knowing how it was made, and what was checked, helps her trust it." },
  { id: "honest", text: "That she used AI to draft it and checked the safety requirements against the guide", correct: true, feedback: "That is what Maya wrote. It is honest, and it tells Rosa exactly what has been checked." },
  { id: "blame", text: "That the AI checked it, so any mistakes are not hers", feedback: "The AI did not check it, Maya did. And she is still responsible for what she sends." },
];
function Fix({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Story>
        <p>
          Maya adds the missing item, “A trained first-aider on site all day”, and confirms that
          a trained volunteer can cover the whole day. On Friday, she gives Rosa the checklist with
          a short note.
        </p>
      </Story>
      <Choice
        name="pages-note"
        question="What should Maya’s note tell Rosa?"
        options={notes}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 5. Your turn ---------- */
const rereads: Option[] = [
  { id: "summary", text: "None. The summary covers it.", feedback: "A summary can leave out the one part that matters most to you." },
  { id: "money", text: "The parts about rent, deposit, notice and what you are responsible for", correct: true, feedback: "These are the parts you would act on, so read them yourself and look for anything the summary missed." },
  { id: "first", text: "Just the first page", feedback: "The important parts are rarely all on the first page." },
];
function Turn({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  return (
    <>
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="text-lg font-bold">Using a summary to make a decision?</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {["Go back to the parts of the original that matter most", "Look for what is missing, as well as what is there"].map((q, i) => (
            <li key={q} className="flex gap-3">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>
      </div>
      <Story>
        <p>
          You are about to sign a rental agreement, and a chat tool has summarised it for you.
        </p>
      </Story>
      <Choice
        name="pages-reread"
        question="Which part would you read for yourself before signing?"
        options={rereads}
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

export function PagesActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "pages-first":
      return <Pages {...common} />;
    case "pages-send":
      return <Send {...common} />;
    case "pages-check":
      return <Check {...common} />;
    case "pages-fix":
      return <Fix {...common} />;
    case "pages-turn":
      return <Turn {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

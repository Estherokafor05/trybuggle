"use client";
// Episode 2.5: Maya's grant. Unscored practice on scripted chats.
// The made-up grant uses a reserved ".example" address, so it never points to a real site.
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

const fakeLink = "www.community-open-day-fund.example/apply";

/* ---------- 1. A grant made for them ---------- */
const replyParts = [
  { id: "yes", text: "Yes!", detail: false, why: "Just a friendly opening. There is nothing here to check." },
  { id: "name", text: "The Community Open Day Fund", detail: true, why: "A name can sound official and still be made up." },
  { id: "amount", text: "offers grants of up to 1,000 for local events like yours.", detail: true, why: "A figure can look precise and still be wrong or out of date." },
  { id: "link", text: `Apply here: ${fakeLink}`, detail: true, why: "A web address can look real and lead nowhere." },
];
function FirstTry({ state, change }: { state: ActivityState; change: Change }) {
  const found = state.items ?? [];
  const last = replyParts.find((p) => p.id === state.selection);
  const details = replyParts.filter((p) => p.detail);
  const done = details.every((p) => found.includes(p.id));
  return (
    <>
      <Story>
        <p>
          The flyer is up and the stalls are filling. But once they have paid for printing and
          supplies, there is hardly anything left in the budget. Maya opens the chat tool.
        </p>
      </Story>
      <ScriptedChat
        instant
        messages={[
          { from: "you", text: "Are there any small grants for community open days?" },
          { from: "ai", text: replyParts.map((p) => p.text).join(" ") },
        ]}
      />
      <Instruction>Maya wants to put this in her report for Rosa. Tap each detail she would need to check first.</Instruction>
      <div className="mt-3 flex flex-col gap-2">
        {replyParts.map((p) => {
          const tapped = found.includes(p.id) || state.selection === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={tapped}
              onClick={() => change({ ...state, selection: p.id, items: p.detail ? [...new Set([...found, p.id])] : found })}
              className={`${activityButton} break-words font-normal ${tapped ? (p.detail ? "border-teal bg-mint/60" : "border-orange-400 bg-peach/50") : ""}`}
            >
              {found.includes(p.id) && <span className="mr-2 font-bold text-teal">✓</span>}
              {p.text}
            </button>
          );
        })}
      </div>
      {last && (
        <p role="status" className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${last.detail ? "bg-mint/60" : "bg-peach/60"}`}>
          <b>{last.detail ? "✓ Check this." : "↺ Nothing to check."}</b> {last.why}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">{found.length} of {details.length} details found</p>
      {done && (
        <Feedback tone="good" title="Name, amount and link">
          All three sound convincing. That is exactly why they need checking before they go in a
          report someone else will rely on.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 2. What would you check? ---------- */
const checks: Option[] = [
  { id: "ask-tool", text: "Ask the chat tool “Is this grant real?”", feedback: "The tool checking itself is not a real check. It may simply say yes." },
  { id: "link", text: "Click the link, and keep the grant in the report if the page loads", feedback: "A good start, but a page loading is not enough. Maya needs to know it is the funder's own, official page." },
  { id: "official", text: "Look for the funder’s own official page, or ask someone who would know", correct: true, feedback: "Yes. Maya's link said “Page not found”, a search found nothing, and the local volunteer office had never heard of it." },
];
function Check({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Idea>
        <p>
          The grant sounds like it was made for events exactly like theirs. “Rosa will want to
          see this,” Maya thinks, and starts adding it to her report.
        </p>
      </Idea>
      <Choice
        name="grant-check"
        question="Before Maya sends her report, what would you check?"
        options={checks}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 3. The way you ask ---------- */
const questions = [
  { id: "right", text: "We qualify for this grant, right?", why: "This invites the tool to agree with you." },
  { id: "perfect", text: "This grant is perfect for us, isn’t it?", why: "This also invites agreement. It tells the tool the answer you want." },
  { id: "rules", text: "What are the eligibility rules, and where can I check them?", why: "" },
];
const rulesReply =
  "Small community grants often ask that you are a not-for-profit group, that your event is open to the public, and that you apply before a deadline. Rules differ for each funder and can change, so check the funder’s own website, or ask your local volunteer office which schemes are open now.";
function Steer({ state, change }: { state: ActivityState; change: Change }) {
  const pick = answer(state, "q");
  const chosen = questions.find((o) => o.id === pick);
  const stage = state.stage ?? 0;
  return (
    <>
      <Story>
        <p>
          The way you ask can steer the answer. Maya wants to find a real grant she can apply
          for.
        </p>
      </Story>
      <fieldset className="mt-5">
        <legend className="font-semibold">Which question gives Maya something she can check?</legend>
        <div className="mt-3 grid gap-2">
          {questions.map((o) => (
            <label
              key={o.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 ${pick === o.id ? "border-brand bg-lavender/60" : "border-line bg-white hover:bg-canvas"}`}
            >
              <input type="radio" name="steer" className="size-5 shrink-0 accent-brand" checked={pick === o.id} disabled={stage >= 1} onChange={() => change(withAnswer(state, "q", o.id))} />
              “{o.text}”
            </label>
          ))}
        </div>
        {chosen && chosen.id !== "rules" && (
          <p role="status" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
            <b>↺ Try another.</b> {chosen.why}
          </p>
        )}
      </fieldset>
      {stage < 1 && (
        <button type="button" className={`${primaryButton} mt-4`} disabled={pick !== "rules"} onClick={() => change({ ...state, stage: 1 })}>
          Ask the question
        </button>
      )}
      {stage >= 1 && (
        <>
          <ScriptedChat
            messages={[
              { from: "you", text: "What are the eligibility rules, and where can I check them?" },
              { from: "ai", text: rulesReply },
            ]}
            instant={stage >= 2}
            onReplyShown={() => stage < 2 && change({ ...state, stage: 2 })}
          />
          {stage >= 2 && (
            <Feedback tone="good" title="Something to verify">
              Instead of agreeing with Maya, the answer gives her rules to look for and places to
              check them.
            </Feedback>
          )}
        </>
      )}
    </>
  );
}

/* ---------- 4. The funder's own page ---------- */
const funderChecks: Option[] = [
  { id: "amount", text: "Only how much money it gives", feedback: "The amount matters, but Maya also needs to know whether they can apply, and by when." },
  { id: "criteria", text: "Who can apply and the deadline", correct: true, feedback: "That is what Maya checked on the funders’ own pages, before applying for one of the grants." },
  { id: "nothing", text: "Nothing. The volunteer office already checked.", feedback: "The office says the schemes are open. Maya still needs to check that the open day fits each funder's rules." },
];
function Funder({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Story>
        <p>
          Maya takes the made-up grant out of her report. The volunteer office sends her two
          schemes that are open right now. She opens each funder’s own page.
        </p>
      </Story>
      <Choice
        name="grant-funder"
        question="What should Maya check on each funder’s page before applying?"
        options={funderChecks}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 5. Your turn ---------- */
const refund: Option[] = [
  { id: "act", text: "Act on it straight away. It sounded sure.", feedback: "Sounding sure is not the same as being right, and the rules may differ where you live." },
  { id: "check", text: "Use it to learn what to ask, then check with an official advice service or a qualified adviser", correct: true, feedback: "AI can help you get familiar with the topic. Check before you act on anything about your money, health or legal rights." },
  { id: "again", text: "Ask the chat tool again until it says yes", feedback: "That steers the answer towards what you want to hear, not what is true." },
];
function Turn({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  return (
    <>
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="text-lg font-bold">If an answer could affect your money, health or legal rights:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {["Use AI to get familiar with the topic and work out what to ask", "Check with a reliable source or a qualified person before you act"].map((q, i) => (
            <li key={q} className="flex gap-3">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>
      </div>
      <Story>
        <p>
          Your new washing machine broke after a week. You ask a chat tool whether you are
          entitled to a refund, and it says yes, with a rule that sounds official.
        </p>
      </Story>
      <Choice
        name="grant-refund"
        question="What should you do with the answer?"
        options={refund}
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

export function GrantActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "grant-first":
      return <FirstTry {...common} />;
    case "grant-check":
      return <Check {...common} />;
    case "grant-steer":
      return <Steer {...common} />;
    case "grant-funder":
      return <Funder {...common} />;
    case "grant-turn":
      return <Turn {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

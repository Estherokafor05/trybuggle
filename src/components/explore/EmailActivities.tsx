"use client";
// Episode 2.2: Maya's invitation. Unscored practice on scripted chats.
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

/* ---------- 1. Maya's first try ---------- */
const vagueParts = [
  { id: "exciting", text: "Join us for an exciting event", problem: true, why: "“An exciting event” says nothing about what is actually happening." },
  { id: "family", text: "with fun for all the family!", problem: true, why: "Friendly, but vague. It does not tell the clubs what Maya wants from them." },
  { id: "date", text: "Our open day is on the twelfth.", problem: true, why: "Maya never gave a date. The tool guessed one." },
  { id: "see", text: "We can’t wait to see you there!", problem: false, why: "A friendly sign-off. Nothing wrong here, but nothing useful either." },
];
function FirstTry({ state, change }: { state: ActivityState; change: Change }) {
  const found = state.items ?? [];
  const last = vagueParts.find((p) => p.id === state.selection);
  const problems = vagueParts.filter((p) => p.problem);
  const done = problems.every((p) => found.includes(p.id));
  return (
    <>
      <Story>
        <p>
          Maya wants local clubs and groups at the open day. The gardening club could bring
          seedlings, and the chess club might run a quick game. She types a five-word request.
        </p>
      </Story>
      <ScriptedChat
        instant
        messages={[
          { from: "you", text: "Write an email about the open day." },
          { from: "ai", text: vagueParts.map((p) => p.text).join(" ") },
        ]}
      />
      <Instruction>Tap each part of the reply that would not work as an invitation.</Instruction>
      <div className="mt-3 flex flex-col gap-2">
        {vagueParts.map((p) => {
          const tapped = found.includes(p.id) || state.selection === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={tapped}
              onClick={() => change({ ...state, selection: p.id, items: p.problem ? [...new Set([...found, p.id])] : found })}
              className={`${activityButton} font-normal ${tapped ? (p.problem ? "border-teal bg-mint/60" : "border-orange-400 bg-peach/50") : ""}`}
            >
              {found.includes(p.id) && <span className="mr-2 font-bold text-teal">✓</span>}
              {p.text}
            </button>
          );
        })}
      </div>
      {last && (
        <p role="status" className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${last.problem ? "bg-mint/60" : "bg-peach/60"}`}>
          <b>{last.problem ? "✓ Good spot." : "↺ Not a problem."}</b> {last.why}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">{found.length} of {problems.length} problems found</p>
      {done && (
        <Feedback tone="good" title="All three found">
          Vague wording and a made-up date. And the chess club would have no idea Maya wanted
          them to run a stall.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 2. What was missing? ---------- */
const missing: Option[] = [
  { id: "longer", text: "Ask it to make the email longer", feedback: "A longer email would just say more of nothing. The tool still would not know who it is for or what Maya wants." },
  { id: "who-what", text: "Say who the email is for and what she wants them to do", correct: true, feedback: "That is the biggest gap. The tool only knows what Maya tells it." },
  { id: "please", text: "Add “please” to the request", feedback: "Being polite is fine, but it gives the tool no information to work with." },
];
function Missing({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Idea>
        <p>
          Maya knows what the open day is for and who she wants there. All she gave the tool
          was <b>“Write an email about the open day.”</b>
        </p>
      </Idea>
      <Choice
        name="missing"
        question="What could Maya add to make the biggest difference?"
        options={missing}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 3. Build a better request ---------- */
const slots = [
  {
    key: "who",
    label: "Who is it for?",
    options: [
      { id: "everyone", text: "Everyone" },
      { id: "leaders", text: "The people who run local clubs and community groups" },
    ],
    best: "leaders",
  },
  {
    key: "what",
    label: "What should it say or do?",
    options: [
      { id: "tell", text: "Tell them about the open day" },
      { id: "stall", text: "Invite them to run a stall so they can meet people who might want to join" },
    ],
    best: "stall",
  },
  {
    key: "when",
    label: "When and where?",
    options: [
      { id: "soon", text: "Sometime soon" },
      { id: "date", text: "Saturday the 21st, 10 am to 3 pm, in the main hall" },
    ],
    best: "date",
  },
  {
    key: "tone",
    label: "How should it sound?",
    options: [
      { id: "formal", text: "Formal and detailed" },
      { id: "friendly", text: "Short and friendly" },
    ],
    best: "friendly",
  },
];
const goodReply =
  "Hello! We’d love your club or group to run a stall at our community centre open day, so you can meet people who might want to join. It’s on Saturday the 21st, 10 am to 3 pm, in the main hall. Just reply to let us know!";
function Build({ state, change }: { state: ActivityState; change: Change }) {
  const allBest = slots.every((s) => answer(state, s.key) === s.best);
  const sent = (state.stage ?? 0) >= 1;
  const text = sent
    ? `Write a short, friendly email to the people who run local clubs and community groups. Invite them to run a stall at our open day so they can meet people who might want to join. It's on Saturday the 21st, 10 am to 3 pm, in the main hall.`
    : "";
  return (
    <>
      <Instruction>Build Maya&apos;s new request. Choose the clearest option for each part.</Instruction>
      <ul className="mt-3 space-y-3">
        {slots.map((s) => {
          const chosen = answer(state, s.key);
          return (
            <li key={s.key} className="rounded-2xl border border-line bg-white p-4">
              <fieldset>
                <legend className="font-semibold">{s.label}</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {s.options.map((o) => (
                    <label
                      key={o.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 ${chosen === o.id ? "border-brand bg-lavender/60" : "border-line hover:bg-canvas"}`}
                    >
                      <input type="radio" name={`slot-${s.key}`} className="size-5 shrink-0 accent-brand" checked={chosen === o.id} disabled={sent} onChange={() => change(withAnswer(state, s.key, o.id))} />
                      {o.text}
                    </label>
                  ))}
                </div>
                {chosen && chosen !== s.best && (
                  <p role="status" className="mt-2 rounded-xl bg-peach/60 p-3 text-sm">
                    <b>↺ Too vague.</b> The tool would still have to guess. Which option tells it more?
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      {!sent && (
        <button type="button" className={`${primaryButton} mt-4`} disabled={!allBest} onClick={() => change({ ...state, stage: 1 })}>
          Send the new request
        </button>
      )}
      {sent && (
        <>
          <ScriptedChat
            messages={[
              { from: "you", text },
              { from: "ai", text: goodReply },
            ]}
            instant={(state.stage ?? 0) >= 2}
            onReplyShown={() => (state.stage ?? 0) < 2 && change({ ...state, stage: 2 })}
          />
          {(state.stage ?? 0) >= 2 && (
            <Feedback tone="good" title="Now it actually invites them">
              It asks the groups to run a stall and says where and when. Maya still checks the
              date and place against the calendar, and tweaks the opening to sound like her.
            </Feedback>
          )}
        </>
      )}
    </>
  );
}

/* ---------- 4. Keep contact details out ---------- */
const contacts: Option[] = [
  { id: "paste", text: "Paste the whole list, so the email feels personal", feedback: "The tool does not need anyone's phone number to write an invitation. Those details belong to the group leaders." },
  { id: "describe", text: "Just say “local club and group leaders”", correct: true, feedback: "That is all the tool needs. Maya keeps their contact details out of the chat. Module 3 explains why this matters." },
  { id: "names", text: "Paste the names but not the phone numbers", feedback: "Better, but still more than the tool needs. A description of who it is for is enough." },
];
function Private({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <Story>
        <p>
          Maya has a list of the group leaders&apos; names and phone numbers open in another
          window. She almost pastes it into the chat too.
        </p>
      </Story>
      <Choice
        name="contacts"
        question="What should Maya do?"
        options={contacts}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
    </>
  );
}

/* ---------- 5. Your turn ---------- */
const rewrites: Option[] = [
  { id: "vague", text: "“Write a message to my landlord.”", feedback: "Who, what and tone are all missing, so the tool will guess." },
  { id: "clear", text: "“Write a short, polite message to my landlord asking them to fix the leaking kitchen tap this week, any weekday after 5 pm.”", correct: true, feedback: "It says who it is for, what it should do, when, and how it should sound." },
  { id: "long", text: "“Write a long, detailed and amazing message.”", feedback: "Long and amazing are not information. The tool still has to guess what the message is about." },
];
function Turn({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  return (
    <>
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="text-lg font-bold">Before you send a request, ask:</p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {["Who is it for?", "What should it say or do?", "When and where, if that matters?", "How should it sound?"].map((q, i) => (
            <li key={q} className="flex gap-3">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">{i + 1}</span>
              {q}
            </li>
          ))}
        </ol>
      </div>
      <Choice
        name="rewrite"
        question="Which request gives a chat tool the least to guess?"
        options={rewrites}
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

export function EmailActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "email-first":
      return <FirstTry {...common} />;
    case "email-missing":
      return <Missing {...common} />;
    case "email-build":
      return <Build {...common} />;
    case "email-private":
      return <Private {...common} />;
    case "email-turn":
      return <Turn {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

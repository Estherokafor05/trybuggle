"use client";
import { useState, useSyncExternalStore } from "react";
import type { ActivityState } from "@/lib/learning-state";
import { Animal, RouteMap, TaskIcon } from "./Illustrations";
import { MatchingActivity, activityButton as button } from "./MatchingActivity";

type Props = {
  id: string;
  state: ActivityState;
  change: (value: ActivityState) => void;
  go: (step: number) => void;
  slug: string;
  scope: string;
  prompts: string[];
};
function Feedback({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mt-5 rounded-2xl border-l-4 border-teal bg-mint/50 p-4 leading-relaxed"
    >
      {children}
    </div>
  );
}
function Reveal({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const examples = [
    {
      id: "speech",
      name: "Turn spoken words into notes",
      input: "A recording of someone speaking",
      output: "Written words",
      check: "Replay important details, especially names and dates.",
      kind: "speech" as const,
    },
    {
      id: "predict",
      name: "Plan for tomorrow’s visitors",
      input: "Past visitor counts and relevant current information",
      output: "An attendance estimate",
      check: "Allow for special events that could change attendance.",
      kind: "predict" as const,
    },
    {
      id: "draft",
      name: "Get an invitation started",
      input: "A request with the meeting details",
      output: "A possible first draft",
      check: "Compare the facts with the meeting record.",
      kind: "draft" as const,
    },
  ];
  const active = examples.find((e) => e.id === state.selection);
  return (
    <>
      <p className="mb-5 text-lg leading-relaxed">
        AI is short for <strong>artificial intelligence</strong>. It is a broad
        name for computer systems that can recognise patterns, make predictions,
        work through problems or create content.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((e) => (
          <button
            key={e.id}
            className={`${button} ${state.selection === e.id ? "ring-2 ring-brand-deep bg-lavender" : ""}`}
            aria-pressed={state.selection === e.id}
            onClick={() => change({ ...state, selection: e.id })}
          >
            <TaskIcon kind={e.kind} />
            {e.name}
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-5">
          <div className="grid items-center gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <b>Information in</b>
              <p className="mt-2">{active.input}</p>
            </div>
            <span aria-hidden="true" className="text-3xl text-teal">
              →
            </span>
            <div>
              <b>Result out</b>
              <p className="mt-2">{active.output}</p>
            </div>
          </div>
          <Feedback>
            <b>The human check:</b> {active.check} These tools can help with
            tasks without thinking or feeling like a person.
          </Feedback>
        </div>
      )}
    </>
  );
}
function Automation({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const stage = state.stage ?? 0;
  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl bg-[#e6ddcb] p-5 sm:p-8"
        style={{
          backgroundImage:
            "linear-gradient(#fffdf8dd,#fffdf8cc),url('/lessons/what-is-ai/kitchen.png')",
          backgroundSize: "cover",
        }}
      >
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div>
            <TaskIcon kind="timer" />
            <p className="font-mono text-4xl font-bold">
              {stage === 0 ? "05:00" : "00:00"}
            </p>
            <p className="my-3">Maya set a five-minute timer.</p>
            <button
              className={button}
              onClick={() => change({ ...state, stage: 1 })}
            >
              Advance five minutes
            </button>
            {stage > 0 && (
              <p className="mt-3 font-bold text-teal">
                Ring! The set time has passed.
              </p>
            )}
          </div>
          <div className="rounded-3xl border-4 border-navy bg-white p-5">
            <TaskIcon kind="speech" />
            <p className="my-3">Maya says, “Bring a notebook.”</p>
            <button
              className={button}
              onClick={() => change({ ...state, stage: 2 })}
            >
              See the speech-tool demonstration
            </button>
            {stage >= 2 && (
              <p className="mt-4 rounded-lg bg-mint p-3 font-semibold">
                Written reminder: Bring a notebook.
              </p>
            )}
          </div>
        </div>
      </div>
      <Feedback>
        {stage < 2
          ? "A timer follows a fixed instruction. It does not need AI to count down and ring."
          : "In some speech tools, AI recognises patterns in sound to produce written words. Both tasks happen automatically, but that does not make them the same. This is a demonstration, not a live speech tool."}
      </Feedback>
      <details className="mt-4">
        <summary className="cursor-pointer py-2 font-semibold">
          Can AI use rules too?
        </summary>
        <p className="mt-2 leading-relaxed">
          Yes. Some AI uses knowledge and rules supplied by people; some learns
          patterns from examples. A rule by itself does not prove a program is
          AI. Look for reliable information about how a particular tool works.
        </p>
      </details>
    </>
  );
}
function Learning({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const stage = state.stage ?? 0;
  return (
    <>
      <p className="mb-4 text-sm text-muted">
        A simplified, predetermined demonstration. We are not training a real
        model here.
      </p>
      <div className="grid items-center gap-5 rounded-3xl bg-ivory p-5 sm:grid-cols-[1fr_auto_1fr]">
        <div className="grid grid-cols-2 gap-3">
          {[false, true, true, false].map((cat, i) => (
            <figure key={i}>
              <div className="h-24">
                <Animal cat={cat} />
              </div>
              <figcaption className="mt-1 text-center font-semibold">
                {cat ? "Cat" : "Dog"}
              </figcaption>
            </figure>
          ))}
        </div>
        <span aria-hidden="true" className="text-4xl text-teal">
          →
        </span>
        <div className="text-center">
          <p className="font-semibold">
            {stage === 0 ? "Examples with labels" : "Try an unfamiliar picture"}
          </p>
          {stage === 0 ? (
            <TaskIcon kind="predict" />
          ) : (
            <div className="mx-auto my-3 h-40 max-w-52">
              <Animal
                cat={stage >= 2}
                covered={stage >= 2}
                novel={stage === 1}
              />
            </div>
          )}
          {stage > 0 && (
            <p className="font-semibold">
              {stage === 1
                ? "Prediction: dog"
                : "Prediction: dog? The animal is a cat."}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className={button}
          onClick={() => change({ ...state, stage: 1 })}
        >
          Try a new picture
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, stage: 2 })}
        >
          Try a partly hidden animal
        </button>
      </div>
      <Feedback>
        {stage === 0
          ? "During training, the system uses labelled examples to learn patterns. Learning patterns from data is called machine learning, one way to build AI."
          : stage === 1
            ? "This illustrated prediction is correct. Testing on pictures not used in training helps reveal whether learned patterns are useful in new situations."
            : "This prediction is wrong. Part of the animal is hidden, and the result needs checking. The examples used in training and the way a system handles unfamiliar situations both matter. A few successful examples do not prove a system is reliable."}
      </Feedback>
    </>
  );
}
const facts = [
  { id: "purpose", label: "Invite volunteers to a meeting" },
  { id: "details", label: "Thursday, 6 pm, Room Three" },
  { id: "tone", label: "Use friendly, clear language" },
  { id: "private", label: "Include volunteers’ private phone numbers" },
];
function Request({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const selected = state.items ?? [];
  return (
    <>
      <p className="mb-4 rounded-xl bg-lavender p-4">
        <b>Event brief:</b> A volunteer meeting on Thursday at 6 pm in Room
        Three.
      </p>
      <fieldset>
        <legend className="mb-3 font-semibold">
          Choose what belongs in the request.
        </legend>
        <div className="space-y-3">
          {facts.map((f) => (
            <label
              key={f.id}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line p-3"
            >
              <input
                type="checkbox"
                className="size-5 accent-teal"
                checked={selected.includes(f.id)}
                onChange={() =>
                  change({
                    ...state,
                    stage: 0,
                    items: selected.includes(f.id)
                      ? selected.filter((x) => x !== f.id)
                      : [...selected, f.id],
                  })
                }
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className={`${button} mt-4`}
        onClick={() => change({ ...state, stage: 1 })}
      >
        Preview the example draft
      </button>
      {state.stage === 1 && (
        <Feedback>
          {selected.includes("private") ? (
            <>
              The phone numbers are not needed to write this invitation. Remove
              them before sharing a request. No information was sent anywhere.
            </>
          ) : selected.includes("purpose") && selected.includes("details") ? (
            <>
              <b>Your request gives useful context.</b> A generative tool
              creates new content from a request. Here is a fictional draft to
              investigate next: “Join our volunteer meeting on Friday at 6 pm in
              Room Three. Parking is free.” Even with good instructions, a
              result can be wrong.
            </>
          ) : (
            <>
              Add the purpose and event details so the tool has useful
              information. Tone can help too. No information was sent to an AI
              service.
            </>
          )}
        </Feedback>
      )}
    </>
  );
}
function Evidence({
  state,
  change,
  repair = false,
}: {
  state: ActivityState;
  change: Props["change"];
  repair?: boolean;
}) {
  const checks: Record<string, string> = {
    day: "Friday conflicts with the brief. The meeting is on Thursday.",
    time: "6 pm agrees with the brief. This detail is supported.",
    room: "Room Three agrees with the brief. This detail is supported.",
    parking:
      "Free parking is not in the brief. Remove it or verify it with a reliable source; we cannot conclude it is true or false from this record.",
  };
  const fixed = Boolean(state.revised);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-mint/60 p-5">
          <TaskIcon kind="draft" />
          <h4 className="text-lg font-bold">The event brief</h4>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="font-semibold">Day</dt>
              <dd>Thursday</dd>
            </div>
            <div>
              <dt className="font-semibold">Time</dt>
              <dd>6 pm</dd>
            </div>
            <div>
              <dt className="font-semibold">Place</dt>
              <dd>Room Three</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm">No parking information is provided.</p>
        </div>
        <div className="rounded-2xl border border-line bg-[#fffdf8] p-5 shadow-sm">
          <h4 className="text-lg font-bold">
            {fixed ? "Checked invitation" : "The draft"}
          </h4>
          <p className="mt-4">Please join our volunteer meeting on</p>
          <div className="my-3 flex flex-wrap gap-2">
            {[
              ["day", fixed ? "Thursday" : "Friday"],
              ["time", "6 pm"],
              ["room", "Room Three"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={state.selection === id}
                className={`${button} ${state.selection === id ? "ring-2 ring-brand-deep" : ""}`}
                onClick={() => change({ ...state, selection: id })}
              >
                {label}
              </button>
            ))}
          </div>
          {!fixed && (
            <button
              type="button"
              className={button}
              aria-pressed={state.selection === "parking"}
              onClick={() => change({ ...state, selection: "parking" })}
            >
              Parking is free.
            </button>
          )}
          <p className="mt-5 text-sm text-muted">
            {fixed
              ? "Ready for a person’s final review."
              : "Select a detail to investigate it."}
          </p>
        </div>
      </div>
      {state.selection && (
        <Feedback>
          {fixed && state.selection === "day"
            ? "Thursday now matches the brief."
            : checks[state.selection]}
        </Feedback>
      )}
      {repair && (
        <>
          <button
            className={`${button} mt-5`}
            onClick={() => change({ ...state, revised: !fixed })}
          >
            {fixed
              ? "Compare with the original draft"
              : "Correct the day and remove unverified parking"}
          </button>
          <p className="mt-4 leading-relaxed">
            A final review checks that the message is accurate and fits the
            task. The person responsible decides whether to send it.
          </p>
          <fieldset className="mt-6">
            <legend className="font-semibold">
              What if the next AI answer is about someone’s health?
            </legend>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                className={button}
                onClick={() => change({ ...state, stage: 1 })}
              >
                Ask the same tool if it is sure
              </button>
              <button
                className={button}
                onClick={() => change({ ...state, stage: 2 })}
              >
                Involve a qualified health professional
              </button>
            </div>
          </fieldset>
          {state.stage && (
            <Feedback>
              {state.stage === 2
                ? "That matches the consequences of a mistake. A qualified person can consider the person’s actual situation and appropriate evidence."
                : "A confident second answer is not independent verification. For decisions that could seriously affect someone’s life, involve an appropriately qualified person."}
            </Feedback>
          )}
        </>
      )}
    </>
  );
}
function DayMap({ go }: { go: Props["go"] }) {
  return (
    <>
      <div className="rounded-3xl bg-[#e5eee5] p-5 sm:p-8">
        <RouteMap />
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { n: 1, t: "Home: alarm and photos", i: "photo" as const },
            { n: 2, t: "Journey: route estimates", i: "predict" as const },
            { n: 3, t: "Shopping: the camera bag", i: "bag" as const },
            { n: 4, t: "Centre: a missing message", i: "mail" as const },
          ].map((p) => (
            <button key={p.n} className={button} onClick={() => go(p.n)}>
              <TaskIcon kind={p.i} />
              {p.t}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 leading-relaxed">
        Maya is preparing an evening photography club. Explore what each tool
        receives, what it gives back, and the check Maya makes.
      </p>
    </>
  );
}
function Home({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const stage = state.stage ?? 0;
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={button}
          onClick={() => change({ ...state, selection: "alarm" })}
        >
          Inspect Maya’s 7:00 alarm
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, stage: 1, selection: "search" })}
        >
          Search the photos for “dog”
        </button>
      </div>
      <p className="my-4">
        <b>The poster needs:</b> a clear photo of the club’s dog wearing its
        teal collar.
      </p>
      <div className="rounded-3xl border-4 border-navy bg-white p-4">
        <p className="mb-3 rounded-full bg-lavender px-4 py-3 font-semibold">
          ⌕ {stage ? "dog" : "Maya’s photo library"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(stage ? [0, 3, 5] : [0, 1, 2, 3, 4, 5]).map((index) => (
            <button
              key={index}
              aria-label={
                [
                  "Golden dog portrait",
                  "Blue sky",
                  "Grey cat",
                  "Club dog wearing a teal collar",
                  "Flowers",
                  "Brown terrier",
                ][index]
              }
              aria-pressed={state.selection === String(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border-4 ${state.selection === String(index) ? "border-teal" : "border-transparent"}`}
              onClick={() => change({ ...state, selection: String(index) })}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-cover"
                style={{
                  backgroundImage:
                    "url('/lessons/maya-day/gallery-contact-sheet.png')",
                  backgroundSize: "300% 200%",
                  backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
      <Feedback>
        {state.selection === "alarm"
          ? "Maya set seven o’clock. A basic alarm can ring at that time without AI."
          : state.selection === "3"
            ? "This is the club’s dog with the teal collar. Maya has checked the actual picture against the poster’s needs. She should also make sure she has permission to use it."
            : state.selection && /^[0-5]$/.test(state.selection)
              ? "Open the picture and compare it with the task. A likely search match is not automatically the right photo for the club poster."
              : "Some photo apps recognise patterns in image content. They can find likely dog pictures even without named files. Maya still needs to check the result."}
      </Feedback>
    </>
  );
}
function Journey({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const updated = state.stage === 1;
  return (
    <>
      <RouteMap updated={updated} route={state.selection} />
      <p className="my-4">
        Maya wants a suitable route to the centre. These are estimates using the
        information available now.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className={button}
          aria-pressed={state.selection === "usual"}
          onClick={() => change({ ...state, selection: "usual" })}
        >
          Inspect usual route: 30 minutes
        </button>
        <button
          className={button}
          aria-pressed={state.selection === "alternative"}
          onClick={() => change({ ...state, selection: "alternative" })}
        >
          Inspect alternative: {updated ? 35 : 20} minutes
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, stage: updated ? 0 : 1 })}
        >
          {updated ? "Replay the earlier estimate" : "Show a traffic update"}
        </button>
      </div>
      <Feedback>
        {updated
          ? "New traffic information changes the alternative to 35 minutes. A prediction can change. Maya checks route suitability and leaves room for uncertainty before deciding."
          : state.selection === "alternative"
            ? "The alternative is estimated to be quicker now. Maya still checks whether it suits her journey. A travel-time estimate is not a guaranteed arrival time."
            : "Some navigation tools use current traffic and patterns from past journeys to predict travel time. Inspect both options, then see what a traffic update changes."}
      </Feedback>
    </>
  );
}
function Shopping({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  const fit = state.items?.includes("fit"),
    price = state.items?.includes("price");
  const toggle = (id: string) =>
    change({
      ...state,
      items: state.items?.includes(id)
        ? state.items.filter((x) => x !== id)
        : [...(state.items ?? []), id],
    });
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl bg-lavender p-6">
          <TaskIcon kind="bag" />
          <h4 className="mt-3 text-xl font-bold">Suggested camera bag</h4>
          <p className="mt-2">
            Maya has been browsing camera bags. The shop suggests this one.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className={button}
              aria-pressed={Boolean(fit)}
              onClick={() => toggle("fit")}
            >
              Inspect fit information
            </button>
            <button
              className={button}
              aria-pressed={Boolean(price)}
              onClick={() => toggle("price")}
            >
              Check the price
            </button>
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-bold">The club’s needs</h4>
          <p className="mt-3">
            Camera length: <b>28 cm</b>
            <br />
            Budget: <b>$40</b>
          </p>
          {fit && (
            <div className="mt-5">
              <div className="h-6 w-full rounded bg-navy" />
              <p className="mt-1 text-sm">Camera: 28 cm</p>
              <div className="mt-3 h-6 w-[89%] rounded bg-brand" />
              <p className="mt-1 text-sm">
                Bag’s stated maximum camera length: 25 cm
              </p>
            </div>
          )}
          {price && (
            <p className="mt-4 text-lg">
              Bag price: <b>$38</b>
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          className={button}
          onClick={() => change({ ...state, selection: "take" })}
        >
          Choose this bag
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, selection: "look" })}
        >
          Keep looking
        </button>
      </div>
      <Feedback>
        {state.selection === "take"
          ? "The price fits the budget, but the stated capacity does not fit the camera. A suggestion can be relevant without meeting all your needs. Check the product specifications."
          : state.selection === "look"
            ? "A sensible choice after checking the stated fit: 28 cm exceeds the bag’s maximum of 25 cm. Some shops use patterns in browsing and purchases to recommend items; Maya makes the decision."
            : "A recommendation is a suggestion. Inspect the fit and price before deciding."}
      </Feedback>
    </>
  );
}
function Messages({
  state,
  change,
}: {
  state: ActivityState;
  change: Props["change"];
}) {
  return (
    <>
      <div className="rounded-3xl border-4 border-navy bg-white p-5">
        <div className="flex gap-3">
          <button
            className={button}
            aria-pressed={state.selection === "inbox"}
            onClick={() => change({ ...state, selection: "inbox" })}
          >
            Inbox
          </button>
          <button
            className={button}
            aria-pressed={state.selection === "spam"}
            onClick={() => change({ ...state, selection: "spam" })}
          >
            Spam
          </button>
        </div>
        <div className="mt-5 min-h-28">
          {state.selection === "spam" ? (
            <>
              <h4 className="text-lg font-bold">
                Photography club booking confirmation
              </h4>
              <p className="mt-2">Tuesday evening · Room One</p>
              <p className="mt-2 text-sm text-muted">
                Found in Spam. The folder alone cannot tell us whether this
                message is genuine.
              </p>
            </>
          ) : (
            <p>The expected booking confirmation is missing from this inbox.</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className={button}
          onClick={() => change({ ...state, stage: 1 })}
        >
          Compare with Maya’s booking record
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, stage: 2 })}
        >
          Trust whichever folder it landed in
        </button>
        <button
          className={button}
          onClick={() => change({ ...state, stage: 3 })}
        >
          Verify through a known contact
        </button>
      </div>
      <Feedback>
        {state.stage === 1
          ? "Maya’s own record also says Tuesday evening, Room One. Matching details are useful evidence, but a folder label still cannot prove the message is safe."
          : state.stage === 2
            ? "Sorting can be wrong in either direction. A genuine message can go to Spam and a misleading one can reach the inbox. Look for evidence beyond the folder."
            : state.stage === 3
              ? "If unsure, Maya uses contact details she already trusts. She does not rely on a link or phone number in the unexpected message."
              : "Some email services use AI to classify messages using patterns and other signals. Find the confirmation, then consider how to check it."}
      </Feedback>
    </>
  );
}
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
        rows={3}
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
}: {
  prompts: string[];
  slug: string;
  scope: string;
}) {
  return (
    <div className="space-y-5">
      <p className="leading-relaxed text-muted">
        These notes are unscored and stay on this device. They are not uploaded
        or used as an assessment attempt. Please leave out personal or
        confidential information.
      </p>
      {prompts.map((p, i) => (
        <Note key={p} name={`buggle-notes:${scope}:${slug}:${i}`} label={p} />
      ))}
      <details>
        <summary className="cursor-pointer py-2 font-semibold">
          Read one possible response
        </summary>
        <p className="mt-3 leading-relaxed">
          {slug === "what-counts-as-ai"
            ? "AI can help recognise patterns, make predictions or create content. Some AI learns from examples, and some uses knowledge and rules. A draft can sound convincing and still get the date wrong. I would check the date against the event record before sending it."
            : "A music service may use my listening activity to suggest songs. I would listen before adding a song to a club playlist. I would check the service’s official information before saying exactly how its recommendations use AI."}
        </p>
      </details>
    </div>
  );
}
export function Activity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "meet":
      return <Reveal {...common} />;
    case "automatic":
      return <Automation {...common} />;
    case "match":
      return (
        <MatchingActivity
          state={p.state}
          onChange={p.change}
          pairs={[
            {
              id: "speech",
              from: "A meeting recording",
              to: "Written notes",
              why: "Speech recognition can turn sound into words. Check names and important details against the recording.",
            },
            {
              id: "predict",
              from: "Past visitor counts",
              to: "An attendance estimate",
              why: "Patterns can help estimate demand. Special events may change the result.",
            },
            {
              id: "draft",
              from: "Instructions for an invitation",
              to: "A first draft",
              why: "Generative AI can create a starting point. Check its facts and wording before using it.",
            },
          ]}
        />
      );
    case "learn":
      return <Learning {...common} />;
    case "request":
      return <Request {...common} />;
    case "investigate":
      return <Evidence {...common} />;
    case "repair":
      return <Evidence {...common} repair />;
    case "day-map":
      return <DayMap go={p.go} />;
    case "home":
      return <Home {...common} />;
    case "journey":
      return <Journey {...common} />;
    case "shopping":
      return <Shopping {...common} />;
    case "messages":
      return <Messages {...common} />;
    case "tasks":
      return (
        <MatchingActivity
          state={p.state}
          onChange={p.change}
          pairs={[
            {
              id: "recognise",
              from: "Find likely dog pictures",
              to: "Recognise",
              why: "Recognition identifies patterns in pictures. Maya checks the actual photo.",
            },
            {
              id: "predict",
              from: "Estimate journey time",
              to: "Predict",
              why: "Prediction estimates something not yet known. Traffic updates can change it.",
            },
            {
              id: "recommend",
              from: "Suggest a camera bag",
              to: "Recommend",
              why: "Recommendation suggests something potentially useful. Maya checks the fit and price.",
            },
            {
              id: "classify",
              from: "Put a message in Spam",
              to: "Classify",
              why: "Classification assigns a group. The folder does not prove safety. These tasks can overlap in the same system.",
            },
          ]}
        />
      );
    default:
      return <Reflection prompts={p.prompts} slug={p.slug} scope={p.scope} />;
  }
}

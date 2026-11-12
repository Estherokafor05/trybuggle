"use client";
// Lesson 5: Help Amina hire fairly. Unscored decision simulator.
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
  primaryButton,
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "./Activities";

function AminaFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#fbe9e4" />
      <path d="M8 40q0-12 12-12t12 12z" fill="#b8476a" />
      <circle cx="20" cy="6.5" r="4" fill="#1c1513" />
      <circle cx="20" cy="18" r="7.5" fill="#6e4330" />
      <path d="M12.4 17q0-8 7.6-8t7.6 8q-3-4.5-7.6-4.5t-7.6 4.5z" fill="#1c1513" />
      <g fill="none" stroke="#e0b25a" strokeWidth=".9">
        <circle cx="17" cy="18" r="2.2" />
        <circle cx="23" cy="18" r="2.2" />
      </g>
      <path d="M17.5 21.6q2.5 1.8 5 0" stroke="#3a1c18" fill="none" />
    </svg>
  );
}
function AminaStory({ children }: { children: ReactNode }) {
  return (
    <Story who="Amina" face={<AminaFace />}>
      {children}
    </Story>
  );
}
function Verdict({ right, children }: { right: boolean; children: ReactNode }) {
  return (
    <p role="status" className={`mt-2 rounded-xl p-3 text-sm leading-relaxed ${right ? "bg-mint/60" : "bg-peach/60"}`}>
      <b>{right ? "✓ Right." : "↺ Not quite."}</b> {children}
    </p>
  );
}
function TwoWay({
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
            <input type="radio" name={name} className="size-5 shrink-0 accent-brand" checked={value === o.id} onChange={() => onChange(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
const jobDescription = [
  "Office administrator",
  "Manage the team diary and bookings",
  "Answer phone and email enquiries",
  "Keep records up to date",
  "Based at head office",
];
function JobCard() {
  return (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Job description (public)</p>
      <ul className="mt-2 space-y-1">
        {jobDescription.map((x, i) => (
          <li key={x} className={i ? "" : "font-bold"}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 1. Brief the assistant ---------- */
const briefItems = [
  { id: "job", label: "The public job description", ok: true },
  { id: "title", label: "The role title: office administrator", ok: true },
  { id: "tone", label: "The tone: friendly and professional", ok: true },
  { id: "names", label: "The list of applicants' names", ok: false, why: "Applicants' names are personal information, and the assistant doesn't need them to write questions." },
  { id: "cv", label: "One candidate's CV, as an example", ok: false, why: "A CV is personal information shared for one purpose. It isn't needed for this task." },
];
function Brief({ state, change }: { state: ActivityState; change: Change }) {
  const chosen = state.items ?? [];
  const sent = state.stage === 1;
  const bad = briefItems.filter((x) => !x.ok && chosen.includes(x.id));
  const missing = briefItems.filter((x) => x.ok && !chosen.includes(x.id));
  return (
    <>
      <AminaStory>
        <p>
          Amina works in HR. Her team is hiring an office administrator, and she
          wants the company&apos;s <b>approved AI assistant</b> to draft interview
          questions and a short job summary.
        </p>
      </AminaStory>
      <Instruction>Choose what Amina should give the assistant.</Instruction>
      <ul className="mt-3 space-y-2">
        {briefItems.map((x) => {
          const on = chosen.includes(x.id);
          return (
            <li key={x.id}>
              <button
                type="button"
                aria-pressed={on}
                className={`${activityButton} flex w-full items-center gap-3 ${on ? "border-brand bg-lavender ring-2 ring-brand" : ""}`}
                onClick={() =>
                  change({ ...state, stage: 0, items: on ? chosen.filter((i) => i !== x.id) : [...chosen, x.id] })
                }
              >
                <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-brand bg-brand text-white" : "border-line"}`}>
                  {on ? "✓" : ""}
                </span>
                {x.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className={`${primaryButton} mt-4`} disabled={!chosen.length} onClick={() => change({ ...state, stage: 1 })}>
        Send to the assistant
      </button>
      {sent && bad.length > 0 && (
        <Feedback tone="retry" title="Take something out first">
          {bad.map((x) => x.why).join(" ")}
        </Feedback>
      )}
      {sent && !bad.length && missing.length > 0 && (
        <Feedback tone="retry" title="Add a little more">
          The assistant will do better with {missing.map((x) => x.label.toLowerCase()).join(" and ")}.
        </Feedback>
      )}
      {sent && !bad.length && !missing.length && (
        <div className="welcome-rise mt-4 rounded-2xl bg-mint/60 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">AI draft</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Tell us about a time you managed a busy diary.</li>
            <li>How do you keep records accurate?</li>
            <li>How would you handle a difficult phone call?</li>
          </ol>
          <p className="mt-3">
            <b>Summary:</b> Join our friendly office team. You&apos;ll manage the
            diary and keep records up to date. A full driving licence is
            required.
          </p>
          <p className="mt-3 text-sm text-muted">
            A useful first draft, created by generative AI. Next, Amina checks it.
          </p>
        </div>
      )}
    </>
  );
}

/* ---------- 2. Fact-check the summary ---------- */
const claims = [
  { id: "c1", text: "You'll manage the team diary and bookings.", inJob: true },
  { id: "c2", text: "You'll answer phone and email enquiries.", inJob: true },
  { id: "c3", text: "A full driving licence is required.", inJob: false },
  { id: "c4", text: "The role is based at head office.", inJob: true },
];
function Facts({ state, change }: { state: ActivityState; change: Change }) {
  const done = claims.filter((c) => answer(state, c.id) === (c.inJob ? "in" : "out")).length;
  return (
    <>
      <Instruction>Compare each claim in the AI summary with the job description.</Instruction>
      <div className="mt-3">
        <JobCard />
      </div>
      <ul className="mt-4 space-y-3">
        {claims.map((c) => {
          const chosen = answer(state, c.id);
          const right = chosen === (c.inJob ? "in" : "out");
          return (
            <li key={c.id} className="rounded-2xl border border-line bg-white p-4">
              <TwoWay
                name={`claim-${c.id}`}
                legend={`AI summary: “${c.text}”`}
                options={[
                  { id: "in", label: "In the job description" },
                  { id: "out", label: "Not in it" },
                ]}
                value={chosen}
                onChange={(id) => change(withAnswer(state, c.id, id))}
              />
              {chosen && (
                <Verdict right={right}>
                  {right
                    ? c.inJob
                      ? "This matches the job description."
                      : "The job description never mentions a licence. The assistant made it up, and it sounded completely confident."
                    : "Check the job description again, line by line."}
                </Verdict>
              )}
            </li>
          );
        })}
      </ul>
      {done === 4 && (
        <div className="welcome-rise mt-4">
          {!state.revised ? (
            <button type="button" className={primaryButton} onClick={() => change({ ...state, revised: true })}>
              Fix the summary
            </button>
          ) : (
            <Feedback tone="good" title="Summary corrected">
              “Join our friendly office team. You&apos;ll manage the team diary and
              bookings, answer phone and email enquiries and keep records up to
              date. The role is based at head office.” Every claim now matches
              the source.
            </Feedback>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- 3. Review the questions ---------- */
const draftQuestions = [
  { id: "q1", text: "Tell us about a time you managed a busy diary.", keep: true, why: "It's about a skill the job needs." },
  { id: "q2", text: "How do you keep records accurate?", keep: true, why: "Keeping records is in the job description." },
  { id: "q3", text: "Do you have children, or are you planning to?", keep: false, why: "It has nothing to do with the job and could treat candidates unfairly." },
  { id: "q4", text: "How would you handle a difficult phone call?", keep: true, why: "Answering the phone is part of the role." },
  { id: "q5", text: "What year did you leave school?", keep: false, why: "It can hint at a candidate's age, which has nothing to do with doing the job." },
  { id: "q6", text: "Which booking systems have you used?", keep: true, why: "Bookings are part of the job." },
];
function Questions({ state, change }: { state: ActivityState; change: Change }) {
  const done = draftQuestions.filter((q) => answer(state, q.id) === (q.keep ? "keep" : "remove")).length;
  return (
    <>
      <Instruction>Keep the questions about the job. Remove any that aren&apos;t.</Instruction>
      <ul className="mt-3 space-y-3">
        {draftQuestions.map((q, i) => {
          const chosen = answer(state, q.id);
          const right = chosen === (q.keep ? "keep" : "remove");
          return (
            <li key={q.id} className="rounded-2xl border border-line bg-white p-4">
              <TwoWay
                name={`question-${q.id}`}
                legend={
                  <span className={chosen === "remove" ? "line-through opacity-60" : ""}>
                    {i + 1}. {q.text}
                  </span>
                }
                options={[
                  { id: "keep", label: "Keep" },
                  { id: "remove", label: "Remove" },
                ]}
                value={chosen}
                onChange={(id) => change(withAnswer(state, q.id, id))}
              />
              {chosen && <Verdict right={right}>{right ? q.why : "Ask yourself: does this help judge whether someone can do the job?"}</Verdict>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of 6 reviewed correctly</p>
      {done === 6 && (
        <Feedback tone="good" title="A fairer list">
          AI suggestions can include unfair or inappropriate content. Amina also
          checks the final list against her company&apos;s approved interview
          guidance.
        </Feedback>
      )}
    </>
  );
}

/* ---------- 4. The CV idea ---------- */
const cvOptions: Option[] = [
  { id: "paste", text: "Paste all the CVs into a public AI website", feedback: "The CVs would leave the company's control, which could break its privacy rules and the trust of the people who applied." },
  { id: "approved", text: "Use the company's approved HR system and follow the privacy process", correct: true, feedback: "Personal information stays in a tool that's approved, secure and allowed for this purpose." },
  { id: "friend", text: "Email the CVs to a friend for a second opinion", feedback: "Applicants shared their details for this job only, not with people outside the hiring process." },
];
function Privacy({ state, change }: { state: ActivityState; change: Change }) {
  return (
    <>
      <AminaStory>
        <p>
          A colleague says: “Why don&apos;t we paste all the applicants&apos; CVs
          into an AI website and ask it to pick the best ones?” The CVs contain
          names, addresses and work histories.
        </p>
      </AminaStory>
      <Choice
        name="cv"
        question="What should Amina do?"
        options={cvOptions}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
        goodTitle="Good call!"
      />
      {answer(state, "q") === "approved" && (
        <Idea title="Before sharing personal information">
          <ul className="list-disc space-y-1 pl-5">
            <li>Is the tool approved?</li>
            <li>Is it secure?</li>
            <li>Do our privacy rules allow it?</li>
          </ul>
        </Idea>
      )}
    </>
  );
}

/* ---------- 5. Who decides? ---------- */
const rankingOptions: Option[] = [
  { id: "accept", text: "Accept the ranking and offer Candidate B the job", feedback: "The tool doesn't know the candidates, and its ranking could be unfair. A decision about someone's job needs people." },
  { id: "panel", text: "Have the panel assess every candidate against the agreed criteria", correct: true, feedback: "The same criteria for everyone, and people responsible for the decision." },
  { id: "top", text: "Only interview the tool's top two candidates", feedback: "That still lets the tool decide who gets a fair chance." },
];
function Ranking({ state, change }: { state: ActivityState; change: Change }) {
  const revealed = state.stage === 1;
  return (
    <>
      <div className="rounded-2xl border-2 border-navy/15 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Screening tool</p>
        <ol className="mt-2 space-y-1">
          <li>🥇 Candidate B: “Best match”</li>
          <li>🥈 Candidate D</li>
          <li>🥉 Candidate A</li>
          <li>4. Candidate C</li>
        </ol>
      </div>
      <Choice
        name="ranking"
        question="What should Amina's team do?"
        options={rankingOptions}
        value={answer(state, "q")}
        onChange={(id) => change(withAnswer(state, "q", id))}
      />
      {answer(state, "q") === "panel" && (
        <div className="welcome-rise mt-4">
          {!revealed ? (
            <button type="button" className={primaryButton} onClick={() => change({ ...state, stage: 1 })}>
              See how the ranking was made
            </button>
          ) : (
            <Idea title="Behind the ranking">
              <p>
                The tool scored each CV by how closely it matched{" "}
                <b>people the company hired before</b>. If past hiring was
                unfair, the tool can repeat that pattern. That&apos;s why the
                panel, not the tool, makes the decision.
              </p>
            </Idea>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- 6. How much checking? ---------- */
const levels = [
  { id: "light", label: "A quick read" },
  { id: "check", label: "Check against a source" },
  { id: "person", label: "A qualified or responsible person decides" },
];
const situations = [
  { id: "s1", text: "AI drafts a reminder about tomorrow's team meeting", level: "light", why: "Low stakes. A quick read for tone and the right time is enough." },
  { id: "s2", text: "AI summarises the company's holiday policy for staff", level: "check", why: "People will rely on it, so check it against the actual policy." },
  { id: "s3", text: "AI drafts a reply to a customer complaint", level: "check", why: "Check the facts and promises against your records before sending." },
  { id: "s4", text: "AI answers a question about which medicine dose to take", level: "person", why: "Health questions need a qualified person, such as a pharmacist or doctor." },
  { id: "s5", text: "AI suggests which candidate should get the job", level: "person", why: "Decisions about people's jobs stay with the responsible people." },
];
const recap = [
  "Give AI what the task needs, and nothing personal it doesn't.",
  "Check its claims against the source.",
  "Review its suggestions for fairness.",
  "Protect people's information.",
  "Keep people responsible for important decisions.",
];
function Checking({ state, change, slug, scope, prompts }: { state: ActivityState; change: Change; slug: string; scope: string; prompts: string[] }) {
  const done = situations.filter((s) => answer(state, s.id) === s.level).length;
  return (
    <>
      <Instruction>How much checking does each AI result need?</Instruction>
      <ul className="mt-3 space-y-3">
        {situations.map((s) => {
          const chosen = answer(state, s.id);
          return (
            <li key={s.id} className="rounded-2xl border border-line bg-white p-4">
              <TwoWay name={`level-${s.id}`} legend={s.text} options={levels} value={chosen} onChange={(id) => change(withAnswer(state, s.id, id))} />
              {chosen && <Verdict right={chosen === s.level}>{chosen === s.level ? s.why : "Think about what could go wrong, and who would be affected."}</Verdict>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{done} of 5 matched</p>
      {done === 5 && (
        <div className="welcome-rise mt-4 rounded-2xl bg-mint/60 p-5">
          <p className="text-lg font-bold">What you&apos;ve learned</p>
          <ul className="mt-3 space-y-2">
            {recap.map((r) => (
              <li key={r} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs text-white">✓</span>
                {r}
              </li>
            ))}
          </ul>
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

export function HiringActivity(p: Props) {
  const common = { state: p.state, change: p.change };
  switch (p.id) {
    case "hr-brief":
      return <Brief {...common} />;
    case "hr-facts":
      return <Facts {...common} />;
    case "hr-questions":
      return <Questions {...common} />;
    case "hr-privacy":
      return <Privacy {...common} />;
    case "hr-ranking":
      return <Ranking {...common} />;
    case "hr-checking":
      return <Checking {...common} slug={p.slug} scope={p.scope} prompts={p.prompts} />;
    default:
      return null;
  }
}

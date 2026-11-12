"use client";
import { useRef, useState } from "react";
import Link from "next/link";
type Question = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};
type Result = {
  id: string;
  correct_count: number;
  passed: boolean;
  created_at: string;
  feedback: {
    id: string;
    prompt: string;
    correct: boolean;
    answer: string;
    expected: string;
    explanation: string;
  }[];
};
const button =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-5 py-3 font-semibold text-white hover:bg-brand-deep disabled:opacity-50";
export function KnowledgeCheck({
  slug,
  signedIn,
}: {
  slug: string;
  signedIn: boolean;
}) {
  const [questions, setQuestions] = useState<Question[]>([]),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [result, setResult] = useState<Result | null>(null),
    [everPassed, setEverPassed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const key = useRef<string>("");
  const [submitted, setSubmitted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  async function load() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/assessments/${slug}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setResult(data.latest);
      setEverPassed(data.passed);
      setSubmitted(false);
      key.current = crypto.randomUUID();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not load the knowledge check.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setSubmitted(true);
    try {
      const response = await fetch(`/api/assessments/${slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: 1,
          submissionKey: key.current,
          answers,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
      if (data.passed) setEverPassed(true);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Could not confirm your result. Retry the same submission.",
      );
    } finally {
      setBusy(false);
    }
  }
  function retry() {
    setAnswers({});
    setResult(null);
    setMessage("");
    setSubmitted(false);
    key.current = crypto.randomUUID();
    requestAnimationFrame(() => heading.current?.focus());
  }
  return (
    <section
      id="knowledge-check"
      aria-labelledby="check-title"
      className="mt-7 scroll-mt-24 rounded-[2rem] border border-line bg-white p-5 sm:p-8"
    >
      <h2
        id="check-title"
        ref={heading}
        tabIndex={-1}
        className="text-2xl font-bold"
      >
        Your knowledge check
      </h2>
      <p className="mt-3 leading-relaxed">
        10 quick questions about this lesson. Get 7 or more right to pass. You
        can try again as many times as you need.
      </p>
      {!signedIn ? (
        <Link
          className={button + " mt-5"}
          href={`/sign-in?callbackUrl=${encodeURIComponent(`/modules/ai-foundations/lessons/${slug}#knowledge-check`)}`}
        >
          Sign in with Google to take the check
        </Link>
      ) : (
        <>
          {!questions.length && (
            <button
              className={button + " mt-5"}
              disabled={busy}
              onClick={() => void load()}
            >
              {busy ? "Loading…" : "Open the knowledge check"}
            </button>
          )}
          {everPassed && (
            <p className="mt-5 rounded-xl bg-mint p-4 font-semibold">
              ✓ You have passed this lesson’s knowledge check. Your verified
              pass stays recorded if you practise again.
            </p>
          )}
          {result ? (
            <div className="mt-5">
              <p className="text-xl font-bold">
                {result.passed
                  ? "Knowledge check passed"
                  : "Review the feedback and try again"}
              </p>
              <p className="mt-2">
                {result.correct_count} of 10 correct ·{" "}
                {result.correct_count * 10}%
              </p>
              <ol className="mt-5 space-y-4">
                {result.feedback.map((f, i) => (
                  <li key={f.id} className="rounded-xl border border-line p-4">
                    <h3 className="font-semibold">
                      {i + 1}. {f.prompt}
                    </h3>
                    <p className="mt-2 font-semibold">
                      {f.correct ? "✓ Correct" : "Review this answer"}
                    </p>
                    <p className="mt-2">Your answer: {f.answer}</p>
                    {!f.correct && (
                      <p className="mt-2">Expected answer: {f.expected}</p>
                    )}
                    <p className="mt-2 leading-relaxed">{f.explanation}</p>
                  </li>
                ))}
              </ol>
              <button className={button + " mt-5"} onClick={retry}>
                {result.passed
                  ? "Practise this check again"
                  : "Retry this assessment"}
              </button>
            </div>
          ) : (
            questions.length > 0 && (
              <form onSubmit={submit} className="mt-6">
                <fieldset disabled={busy || submitted} className="space-y-7">
                  {questions.map((q, i) => (
                    <fieldset key={q.id}>
                      <legend className="font-semibold">
                        {i + 1}. {q.prompt}
                      </legend>
                      <div className="mt-3 space-y-2">
                        {q.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:bg-lavender"
                          >
                            <input
                              className="mt-1 size-5 shrink-0 accent-teal"
                              required
                              type="radio"
                              name={q.id}
                              value={option.id}
                              checked={answers[q.id] === option.id}
                              onChange={() =>
                                setAnswers({ ...answers, [q.id]: option.id })
                              }
                            />
                            <span>{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </fieldset>
                <button
                  type="submit"
                  disabled={busy}
                  className={button + " mt-6"}
                >
                  {busy
                    ? "Saving and checking…"
                    : submitted
                      ? "Retry the same submission"
                      : "Submit knowledge check"}
                </button>
                {submitted && !busy && message && (
                  <p className="mt-3 text-sm">
                    Your answers are held while this submission is unresolved,
                    so retrying cannot accidentally change or duplicate it.
                  </p>
                )}
              </form>
            )
          )}
        </>
      )}
      {message && (
        <p role="alert" className="mt-4 rounded-xl bg-peach p-4">
          {message}
        </p>
      )}
    </section>
  );
}

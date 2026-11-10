"use client";
import { useState } from "react";
import { DayActivity } from "./DayScenes";

export function GuideDiagram({ kind }: { kind: "four-ways" | "day" }) {
  if (kind === "day")
    return (
      <figure className="mt-5 rounded-xl bg-mint p-4">
        <figcaption className="mb-3 text-sm font-semibold">
          Trace one task from start to finish
        </figcaption>
        <ol className="flex flex-wrap items-center gap-3 text-sm">
          {[
            "Your task",
            "Information received",
            "Result produced",
            "Your check",
          ].map((text, i) => (
            <li key={text} className="flex items-center gap-3">
              <span className="rounded-lg bg-white p-3">{text}</span>
              {i < 3 && <span aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
      </figure>
    );
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <caption className="pb-3 text-left font-semibold">
          Four questions about the same kiosk
        </caption>
        <thead>
          <tr>
            <th className="p-2">Look at</th>
            <th className="p-2">Compare with people</th>
            <th className="p-2">Check reasoning or choices</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-y border-line">
            <th className="p-2">Process</th>
            <td className="p-2">
              Similar problem-solving steps?
              <br />
              <strong>Thinking humanly</strong>
            </td>
            <td className="p-2">
              Does the conclusion follow the rule and facts?
              <br />
              <strong>Thinking rationally</strong>
            </td>
          </tr>
          <tr>
            <th className="p-2">Action</th>
            <td className="p-2">
              A reply like a person’s?
              <br />
              <strong>Acting humanly</strong>
            </td>
            <td className="p-2">
              A choice that serves the goal?
              <br />
              <strong>Acting rationally</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function LessonPractice({ kind }: { kind: "four-ways" | "day" }) {
  const [answer, setAnswer] = useState("");
  if (kind === "day") return <DayActivity />;
  const feedback: Record<string, string> = {
    "Thinking humanly":
      "You could compare its troubleshooting steps with the steps librarians actually use. The suggestion alone does not show its process.",
    "Thinking rationally":
      "You could ask whether the suggestion follows a rule and known facts, such as the second scanner being available and working.",
    "Acting humanly":
      "You could compare the way it offers help with how a librarian might respond. Similar wording does not prove human-like thinking.",
    "Acting rationally":
      "You could ask whether the available scanner is a sensible choice for the goal of borrowing the book.",
  };
  return (
    <section
      className="mt-5 rounded-2xl border border-line p-4"
      aria-labelledby="kiosk-practice"
    >
      <h4 id="kiosk-practice" className="text-lg font-bold">
        Try a question about the kiosk
      </h4>
      <p className="mt-2">
        The first scanner stops working. The kiosk suggests another. Which
        approach could you use to examine that suggestion?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.keys(feedback).map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={answer === label}
            onClick={() => setAnswer(label)}
            className="min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold hover:bg-lavender"
          >
            {label}
          </button>
        ))}
      </div>
      {answer && (
        <p role="status" className="mt-3 rounded-xl bg-mint p-3">
          {feedback[answer]}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        This is unscored practice. More than one approach can be useful if you
        explain the question you are asking.
      </p>
    </section>
  );
}

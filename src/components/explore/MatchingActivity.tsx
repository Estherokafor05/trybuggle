"use client";
import { useState } from "react";
import type { ActivityState } from "@/lib/learning-state";
export type MatchPair = { id: string; from: string; to: string; why: string };
export const activityButton =
  "min-h-11 rounded-xl border border-line bg-white px-4 py-3 text-left font-semibold hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";
export function MatchingActivity({
  pairs,
  state,
  onChange,
}: {
  pairs: MatchPair[];
  state: ActivityState;
  onChange: (value: ActivityState) => void;
}) {
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  function match(target: string, source = selected) {
    if (!source) {
      setMessage(
        "Choose an item on the left first, then a result on the right.",
      );
      return;
    }
    const pair = pairs.find((p) => p.id === source);
    if (!pair) return;
    if (source === target) {
      onChange({ ...state, matches: { ...state.matches, [source]: target } });
      setMessage(pair.why);
      setSelected("");
    } else
      setMessage(
        `Try another connection. ${pair.from} needs a result that fits that information. You can also read the worked example below.`,
      );
  }
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Choose an item, then its match. You can tap, use the keyboard, or drag
        an item to its result.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="space-y-3">
          {pairs.map((p) => (
            <button
              key={p.id}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", p.id);
                setSelected(p.id);
              }}
              aria-pressed={selected === p.id}
              onClick={() => setSelected(p.id)}
              className={`${activityButton} w-full ${selected === p.id ? "ring-2 ring-brand-deep" : ""}`}
            >
              <span className="block">{p.from}</span>
              {state.matches?.[p.id] && (
                <span className="mt-2 block text-sm text-teal">
                  ✓ Connected
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {[...pairs].reverse().map((p) => (
            <button
              key={p.id}
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                match(p.id, e.dataTransfer.getData("text/plain"));
              }}
              onClick={() => match(p.id)}
              className={`${activityButton} w-full bg-mint/40`}
            >
              {p.to}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="mt-4 min-h-12 leading-relaxed">
        {message ||
          (selected
            ? "Now choose the matching result."
            : "Each connection tells you something about the task.")}
      </p>
      <details className="mt-3 border-t border-line pt-3">
        <summary className="cursor-pointer py-2 font-semibold">
          See the worked connections
        </summary>
        <ul className="space-y-3 py-3">
          {pairs.map((p) => (
            <li key={p.id}>
              <strong>
                {p.from} → {p.to}.
              </strong>{" "}
              {p.why}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

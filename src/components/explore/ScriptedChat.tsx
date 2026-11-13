"use client";
// A scripted "AI chat tool" screen for lessons. No AI runs here: every message
// is written in advance, so learners can practise safely on example chats.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./Activities";

export type ChatMessage = { from: "you" | "ai"; text: string };

function Typing({ text, onDone }: { text: string; onDone?: () => void }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text.length : 0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (shown >= text.length) {
      done.current?.();
      return;
    }
    const t = window.setTimeout(() => setShown((n) => Math.min(text.length, n + 3)), 22);
    return () => clearTimeout(t);
  }, [shown, text.length]);
  return (
    <>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {shown < text.length && <span className="ml-0.5 animate-pulse">▍</span>}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

/**
 * Shows a chat. The last AI message types out once unless `instant` is set
 * (for example when the learner returns to a step they already completed).
 */
export function ScriptedChat({
  messages,
  instant = false,
  onReplyShown,
  label = "Example chat",
}: {
  messages: ChatMessage[];
  instant?: boolean;
  onReplyShown?: () => void;
  label?: string;
}) {
  const lastAi = messages.map((m) => m.from).lastIndexOf("ai");
  return (
    <figure className="mt-3 overflow-hidden rounded-[1.5rem] border-2 border-navy/15 bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-4 py-2.5">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
          AI
        </span>
        <span className="text-sm font-semibold">AI chat tool</span>
        <span className="ml-auto text-xs text-muted">{label}</span>
      </div>
      <ol className="space-y-3 p-4" aria-live="polite">
        {messages.map((m, i) => (
          <li key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed ${
                m.from === "you" ? "rounded-br-md bg-navy text-white" : "rounded-bl-md bg-lavender text-ink"
              }`}
            >
              <span className="sr-only">{m.from === "you" ? "You wrote: " : "The AI chat tool replied: "}</span>
              {m.from === "ai" && i === lastAi && !instant ? <Typing text={m.text} onDone={onReplyShown} /> : m.text}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="border-t border-line px-4 py-2 text-xs text-muted">
        A scripted example. Nothing you do here is sent to any AI tool.
      </figcaption>
    </figure>
  );
}

"use client";

import { useState } from "react";
import type { WaitlistResponse } from "@/app/api/waitlist/route";

const ROLES = [
  "Manual tester, no code",
  "Automation engineer",
  "QA lead or manager",
  "Developer who tests",
  "Something else",
];

const RESTING_NOTE = "One email when module 1 opens. Nothing else.";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [note, setNote] = useState(RESTING_NOTE);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const result: WaitlistResponse = await response.json();
      setNote(result.message);
    } catch {
      setNote("That did not go through. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-3">
      <label
        htmlFor="waitlist-email"
        className="flex flex-col gap-1.5 text-[0.82rem] font-semibold text-ink"
      >
        Email
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[9px] border border-line bg-canvas px-3.5 py-2.5 text-[0.95rem] font-normal text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </label>

      <label
        htmlFor="waitlist-role"
        className="flex flex-col gap-1.5 text-[0.82rem] font-semibold text-ink"
      >
        Where you&apos;re starting from
        <select
          id="waitlist-role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-[9px] border border-line bg-canvas px-3.5 py-2.5 text-[0.95rem] font-normal text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {ROLES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={sending}
        className="rounded-[9px] bg-brand px-5 py-2.5 text-[0.92rem] font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {sending ? "Sending…" : "Get early access"}
      </button>

      <p className="text-[0.8rem] text-muted" aria-live="polite">
        {note}
      </p>
    </form>
  );
}

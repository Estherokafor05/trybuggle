"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WaitlistResponse } from "@/app/api/waitlist/route";
import { WAITLIST_ROLES as ROLES } from "@/content/testers";

const RESTING_NOTE = "One email when module 1 opens. Nothing else.";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [note, setNote] = useState(RESTING_NOTE);
  const [sending, setSending] = useState(false);
  const [joined, setJoined] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Move focus (and the view) to the confirmation so it can't be missed.
    if (joined) doneRef.current?.focus();
  }, [joined]);

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
      if (result.ok && result.stored) {
        setJoined(email.trim());
      } else {
        setFailed(true);
        setNote(result.message);
      }
    } catch {
      setFailed(true);
      setNote("That did not go through. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  if (joined) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="scroll-mt-28 rounded-2xl border-2 border-teal bg-mint p-5 text-ink outline-none"
      >
        <p className="text-lg font-bold">You&apos;re on the list.</p>
        <p className="mt-1.5 leading-relaxed">
          We&apos;ll email <span className="font-semibold break-all">{joined}</span> once, when Module 1 opens.
        </p>
      </div>
    );
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
        className="min-h-11 rounded-[9px] bg-brand-deep px-5 py-2.5 text-[0.92rem] font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60"
      >
        {sending ? "Sending…" : "Get early access"}
      </button>

      <p
        className={failed ? "rounded-xl bg-peach/60 p-3 text-sm text-ink" : "text-[0.8rem] text-muted"}
        aria-live="polite"
      >
        {note}
      </p>
      <p className="text-[0.8rem] text-muted">
        We keep your email and role only to send that email. See our{" "}
        <Link href="/privacy#waitlist" className="font-semibold text-navy underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

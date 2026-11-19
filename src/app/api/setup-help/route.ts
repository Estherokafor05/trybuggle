import { after, NextResponse } from "next/server";
import { SETUP_HELP_SITUATIONS } from "@/content/use-ai";
import { db } from "@/server/database";
import { sendToSheet } from "@/server/waitlist-sheet";

/**
 * Interest list for personal AI setup help, offered after a learner completes
 * a module. Stores email + situation in waitlist_signups (list "ai-setup-help")
 * and copies it to the team's Google Sheet. No payment is taken here.
 */

export interface SetupHelpResponse {
  ok: boolean;
  message: string;
}

const LIST = "ai-setup-help";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<SetupHelpResponse>({ ok: false, message: "We could not read that request." }, { status: 400 });
  }

  const { email, situation } = (body ?? {}) as { email?: unknown; situation?: unknown };
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json<SetupHelpResponse>(
      { ok: false, message: "That email address looks incomplete. Check it and try again." },
      { status: 400 },
    );
  }
  const situations: readonly string[] = SETUP_HELP_SITUATIONS;
  const role = typeof situation === "string" && situations.includes(situation) ? situation : "other";

  try {
    const [row] = await db()<{ inserted: boolean }[]>`
      INSERT INTO waitlist_signups (list, email, role)
      VALUES (${LIST}, ${cleanEmail}, ${role})
      ON CONFLICT (list, email) DO UPDATE SET role = EXCLUDED.role, updated_at = now()
      RETURNING (xmax = 0) AS inserted
    `;
    after(() => sendToSheet({ list: LIST, email: cleanEmail, role, newSignup: Boolean(row?.inserted) }));
  } catch {
    return NextResponse.json<SetupHelpResponse>(
      { ok: false, message: "That did not go through on our side. Try again in a moment." },
      { status: 503 },
    );
  }

  return NextResponse.json<SetupHelpResponse>({ ok: true, message: "You're on the list." });
}

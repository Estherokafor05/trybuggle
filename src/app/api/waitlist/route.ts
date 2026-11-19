import { after, NextResponse } from "next/server";
import { db } from "@/server/database";
import { WAITLIST_ROLES } from "@/content/testers";
import { sendToSheet } from "@/server/waitlist-sheet";

/**
 * Early-access sign-up for AI for Testers. Stores email + role, then copies the
 * sign-up to the team's Google Sheet after responding. The form reads `stored`.
 */

export interface WaitlistSignup {
  email: string;
  role: string;
}

export interface WaitlistResponse {
  ok: boolean;
  stored: boolean;
  message: string;
}

const LIST = "ai-for-testers";

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<WaitlistResponse>(
      { ok: false, stored: false, message: "We could not read that request." },
      { status: 400 },
    );
  }

  const { email, role } = (body ?? {}) as Partial<WaitlistSignup>;
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : email;

  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        stored: false,
        message: "That email address looks incomplete. Check it and try again.",
      },
      { status: 400 },
    );
  }

  const roles: readonly string[] = WAITLIST_ROLES;
  const chosenRole = roles.includes(role ?? "") ? role! : roles[roles.length - 1];

  try {
    const [row] = await db()<{ inserted: boolean }[]>`
      INSERT INTO waitlist_signups (list, email, role)
      VALUES (${LIST}, ${cleanEmail}, ${chosenRole})
      ON CONFLICT (list, email) DO UPDATE SET role = EXCLUDED.role, updated_at = now()
      RETURNING (xmax = 0) AS inserted
    `;
    after(() => sendToSheet({ list: LIST, email: cleanEmail, role: chosenRole, newSignup: Boolean(row?.inserted) }));
  } catch {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        stored: false,
        message: "That did not go through on our side. Try again in a moment.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json<WaitlistResponse>({
    ok: true,
    stored: true,
    message: "You're on the list. We'll email you once, when Module 1 opens.",
  });
}

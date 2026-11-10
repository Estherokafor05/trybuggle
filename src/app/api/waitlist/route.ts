import { NextResponse } from "next/server";

/**
 * Waitlist signup.
 *
 * Nothing is stored yet. This route validates the request and returns a
 * `stored: false` response so the form can tell the truth to whoever fills
 * it in. Swap the marked section for a real write when you pick a store:
 * Postgres, Supabase, Airtable, a Google Sheet, whatever you want to own.
 *
 * Keep the shape of the response: the form reads `stored` to decide what
 * message to show.
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

const ROLES = [
  "Manual tester, no code",
  "Automation engineer",
  "QA lead or manager",
  "Developer who tests",
  "Something else",
];

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

  if (!isValidEmail(email)) {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        stored: false,
        message: "That email address looks incomplete. Check it and try again.",
      },
      { status: 400 },
    );
  }

  const chosenRole = ROLES.includes(role ?? "") ? role! : ROLES[ROLES.length - 1];

  // --- Replace this block with a real write. ---------------------------
  // await db.insert(waitlist).values({ email, role: chosenRole });
  // return NextResponse.json<WaitlistResponse>({
  //   ok: true,
  //   stored: true,
  //   message: "You're on the list. We'll email you when module 1 opens.",
  // });
  void chosenRole;
  // ---------------------------------------------------------------------

  return NextResponse.json<WaitlistResponse>({
    ok: true,
    stored: false,
    message:
      "Signups are not being stored yet. This form is not connected to anything.",
  });
}

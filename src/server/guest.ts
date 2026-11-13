// Anonymous guest learners for Module 1.
// Visitors can take knowledge checks and the final assessment without an
// account. Their answers are still scored and stored on the server, against a
// random ID kept in an httpOnly cookie (no personal details). When they sign
// up to get their certificate, those results move into their account.
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getModule } from "@/content/modules";
import { db } from "./database";

export const GUEST_COOKIE = "buggle_guest";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

/** Modules whose lessons and assessments are open without an account. */
const openModules = new Set(["ai-foundations"]);
export function openToGuests(moduleSlug: string) {
  return openModules.has(moduleSlug);
}
export function lessonOpenToGuests(lessonSlug: string) {
  return [...openModules].some((m) => getModule(m)?.lessons.some((l) => l.slug === lessonSlug));
}

/** The guest learner ID from the cookie, if any. Safe to call while rendering. */
export async function guestId() {
  const raw = (await cookies()).get(GUEST_COOKIE)?.value;
  return raw && UUID.test(raw) ? `guest:${raw}` : null;
}

/** Moves a guest's stored results into a signed-in account. Idempotent. */
export async function claimGuest(guest: string, account: string) {
  if (!guest.startsWith("guest:") || guest === account) return;
  await db().begin(async (tx) => {
    await tx`INSERT INTO learners(id) VALUES(${account}) ON CONFLICT DO NOTHING`;
    await tx`UPDATE assessment_attempts SET learner_id=${account} WHERE learner_id=${guest}`;
    await tx`UPDATE module_assessment_attempts SET learner_id=${account} WHERE learner_id=${guest}`;
    await tx`DELETE FROM learning_checkpoints WHERE learner_id=${guest}`;
    await tx`DELETE FROM learners WHERE id=${guest}`;
  });
}

/**
 * Who is taking an assessment, for Route Handlers (which may set cookies).
 * Signed-in learners use their account, after claiming any guest results.
 * Otherwise a guest ID is used, created on first submission when `create` is set.
 */
export async function assessmentLearner({ create }: { create: boolean }) {
  const session = await auth().catch(() => null);
  const account = session?.user?.id ?? null;
  const jar = await cookies();
  const guest = await guestId();
  if (account) {
    if (guest) {
      await claimGuest(guest, account).catch(() => undefined);
      jar.delete(GUEST_COOKIE);
    }
    return { id: account, signedIn: true };
  }
  if (guest) return { id: guest, signedIn: false };
  if (!create) return null;
  const id = randomUUID();
  jar.set(GUEST_COOKIE, id, cookieOptions);
  return { id: `guest:${id}`, signedIn: false };
}

/** Forget the guest on this device, for example after signing out. */
export async function forgetGuest() {
  (await cookies()).delete(GUEST_COOKIE);
}

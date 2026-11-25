// Learning needs an account (FRD Version 2). Guests can no longer take lessons
// or assessments, but anyone who earned results as a guest before keeps them:
// they move into the account on sign-in (see the session hook in src/auth.ts).
import { cookies } from "next/headers";
import { currentSession } from "@/auth";
import { GUEST_COOKIE, guestIdFromValue } from "./guest-cookie";

export { GUEST_COOKIE, guestIdFromCookieHeader } from "./guest-cookie";

/** No module is open without an account any more. Kept so callers read clearly. */
export function openToGuests(moduleSlug: string) {
  void moduleSlug;
  return false;
}
export function lessonOpenToGuests(lessonSlug: string) {
  void lessonSlug;
  return false;
}

/** The guest learner ID from the cookie, if any. Safe to call while rendering. */
export async function guestId() {
  return guestIdFromValue((await cookies()).get(GUEST_COOKIE)?.value);
}

/** Who is taking an assessment, for Route Handlers. Learning needs an account. */
export async function assessmentLearner(options: { create: boolean }) {
  void options;
  const session = await currentSession();
  return session ? { id: session.user.id, signedIn: true } : null;
}

/** Forget the guest on this device, for example after signing out. */
export async function forgetGuest() {
  (await cookies()).delete(GUEST_COOKIE);
}

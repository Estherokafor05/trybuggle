"use server";
import { signOut } from "@/auth";
import { forgetGuest } from "@/server/guest";

/** Ends the learner's session on this device and returns them to the home page. */
export async function signOutAction() {
  // Start fresh: results earned as a guest afterwards belong to whoever uses the device next.
  await forgetGuest();
  await signOut({ redirectTo: "/" });
}

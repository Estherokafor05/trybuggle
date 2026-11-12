"use server";
import { signOut } from "@/auth";

/** Ends the learner's session on this device and returns them to the home page. */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

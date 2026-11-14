"use server";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { deleteLearnerData } from "@/server/accounts";
import { forgetGuest } from "@/server/guest";

/** Deletes the signed-in learner's account and everything stored for it, then signs them out. */
export async function deleteAccountAction(formData: FormData) {
  const session = await auth();
  const learner = session?.user?.id;
  if (!learner) redirect("/sign-in?callbackUrl=%2Faccount");
  if (formData.get("confirm") !== "yes") redirect("/account?confirm=required#delete");
  await deleteLearnerData(learner);
  await forgetGuest();
  await signOut({ redirectTo: "/account/deleted" });
}

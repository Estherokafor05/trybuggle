"use server";
// Test purchases, on test sites only (no Stripe keys, not the live site), so
// testers can try the paid parts of the Deep Dive before payments are set up.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { endTestPurchases, testPurchase } from "@/server/deep-dive";

export async function testPurchaseAction(form: FormData) {
  const slug = String(form.get("course") ?? "");
  const back = /^[a-z0-9-]{1,80}$/.test(slug) ? `/learn/${slug}` : "/deep-dive";
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  const what = form.get("what") === "all" ? "all" : { courseId: String(form.get("courseId") ?? "") };
  await testPurchase(session.user.id, what);
  revalidatePath(back);
  redirect(`${back}?notice=test-unlocked`);
}

export async function endTestPurchasesAction(form: FormData) {
  const slug = String(form.get("course") ?? "");
  const back = /^[a-z0-9-]{1,80}$/.test(slug) ? `/learn/${slug}` : "/deep-dive";
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  await endTestPurchases(session.user.id);
  revalidatePath(back);
  redirect(`${back}?notice=test-ended`);
}

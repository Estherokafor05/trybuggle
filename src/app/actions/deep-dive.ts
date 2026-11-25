"use server";
// Buying the Deep Dive (one course, or all-access), refunds, and managing an
// all-access subscription. Test sites without Stripe keys use test purchases.
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { currentSession } from "@/auth";
import { endTestPurchases, testPurchase } from "@/server/deep-dive";
import { learnerPortal, requestRefund, startAllAccessCheckout, startCourseCheckout } from "@/server/learner-payments";
import { siteOrigin } from "@/server/site";

const slugOf = (form: FormData) => {
  const slug = String(form.get("course") ?? "");
  return /^[a-z0-9-]{1,80}$/.test(slug) ? slug : null;
};
const backOf = (form: FormData) => {
  const slug = slugOf(form);
  return slug ? `/learn/${slug}` : "/deep-dive";
};
async function learner(back: string) {
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  return session.user;
}
const withError = (back: string, error: string) => `${back}?error=${encodeURIComponent(error)}#unlock`;

export async function testPurchaseAction(form: FormData) {
  const back = backOf(form);
  const user = await learner(back);
  const what = form.get("what") === "all" ? "all" : { courseId: String(form.get("courseId") ?? "") };
  await testPurchase(user.id, what);
  revalidatePath(back);
  redirect(`${back}?notice=test-unlocked`);
}

export async function endTestPurchasesAction(form: FormData) {
  const back = backOf(form);
  const user = await learner(back);
  await endTestPurchases(user.id);
  revalidatePath(back);
  redirect(`${back}?notice=test-ended`);
}

export async function buyCourseAction(form: FormData) {
  const back = backOf(form);
  const user = await learner(back);
  let url: string;
  try {
    const out = await startCourseCheckout(user, slugOf(form) ?? "", form.get("code"), await siteOrigin());
    if ("error" in out) redirect(withError(back, out.error));
    url = out.url;
  } catch (error) {
    unstable_rethrow(error);
    redirect(withError(back, "Payments aren't working right now. Please try again shortly."));
  }
  redirect(url);
}

export async function buyAllAccessAction(form: FormData) {
  const back = backOf(form);
  const user = await learner(back);
  let url: string;
  try {
    const out = await startAllAccessCheckout(user, form.get("interval"), form.get("code"), await siteOrigin(), back);
    if ("error" in out) redirect(withError(back, out.error));
    url = out.url;
  } catch (error) {
    unstable_rethrow(error);
    redirect(withError(back, "Payments aren't working right now. Please try again shortly."));
  }
  redirect(url);
}

export async function refundAction(form: FormData) {
  const user = await learner("/account#purchases");
  let result: { error: string } | { ok: true };
  try {
    result = await requestRefund(user.id, String(form.get("purchase") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    result = { error: "The refund couldn't be made right now. Please try again shortly." };
  }
  revalidatePath("/account");
  redirect("error" in result ? `/account?s=purchases&error=REFUND&message=${encodeURIComponent(result.error)}#purchases` : "/account?s=purchases&notice=REFUNDED#purchases");
}

export async function learnerPortalAction() {
  const user = await learner("/account#purchases");
  let url: string;
  try {
    const out = await learnerPortal(user.id, await siteOrigin());
    if ("error" in out) redirect(`/account?s=purchases&error=PORTAL#purchases`);
    url = out.url;
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/account?s=purchases&error=PORTAL#purchases`);
  }
  redirect(url);
}

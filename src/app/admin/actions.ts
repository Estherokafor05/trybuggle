"use server";
// Everything an admin does. Each action checks the admin first (requireAdmin),
// and every change is written to the activity log.
import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { adminAuth } from "@/admin-auth";
import {
  acceptInvite,
  audit,
  createFirstAdmin,
  createInvite,
  grantTry,
  parseCheckSettings,
  removeAdmin,
  requireAdmin,
  revokeInvite,
  setCertificateWithdrawn,
  updateCheckSettings,
} from "@/server/admin";
import { sendAccountEmail } from "@/server/email";
import { resolveReports, saveSection, setForumHidden, setThreadFlags } from "@/server/forum";
import { savePlan } from "@/server/organisations";
import {
  adminRemoveMember,
  adminSetRole,
  confirmEmail,
  endAccess,
  giveAccess,
  removeLearnerPhoto,
  renameOrg,
  setLearnerLeaderboard,
  setOrgPlanByAdmin,
  signOutEverywhere,
} from "@/server/admin-insight";
import { saveCode, saveLearnerPrices, saveOffers, setCodeActive, type PriceCode } from "@/server/pricing";
import { parseQuestionForm, saveQuestions } from "@/server/question-editor";
import { siteOrigin } from "@/server/site";

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

function codeOf(error: unknown) {
  if (error instanceof APIError) return (error.body as { code?: string } | undefined)?.code ?? "UNKNOWN";
  return "UNKNOWN";
}

/** A local admin page to go back to, never anywhere else. */
function back(form: FormData, fallback: string) {
  const to = text(form, "back");
  return /^\/admin(\/[A-Za-z0-9/_%-]*)?(\?[A-Za-z0-9=&%_.-]*)?$/.test(to) ? to : fallback;
}
const withNotice = (path: string, key: string, value: string) =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;

// --- Signing in ------------------------------------------------------------

export async function adminSignInAction(form: FormData) {
  const email = text(form, "email");
  const password = form.get("password");
  if (!email || typeof password !== "string" || !password) redirect("/admin/sign-in?error=MISSING_FIELDS");
  let needsCode = false;
  try {
    const result = (await adminAuth.api.signInEmail({ body: { email, password }, headers: await headers() })) as {
      twoFactorRedirect?: boolean;
    };
    needsCode = Boolean(result?.twoFactorRedirect);
  } catch (error) {
    redirect(`/admin/sign-in?error=${codeOf(error)}`);
  }
  redirect(needsCode ? "/admin/sign-in/code" : "/admin");
}

export async function adminVerifyCodeAction(form: FormData) {
  const code = text(form, "code").replace(/\s+/g, "");
  const backup = form.get("method") === "backup";
  if (!code) redirect(`/admin/sign-in/code?error=MISSING_FIELDS${backup ? "&method=backup" : ""}`);
  try {
    const list = await headers();
    if (backup) await adminAuth.api.verifyBackupCode({ body: { code }, headers: list });
    else await adminAuth.api.verifyTOTP({ body: { code }, headers: list });
  } catch (error) {
    redirect(`/admin/sign-in/code?error=${codeOf(error)}${backup ? "&method=backup" : ""}`);
  }
  redirect("/admin");
}

export async function adminSignOutAction() {
  await adminAuth.api.signOut({ headers: await headers() }).catch(() => undefined);
  redirect("/admin/sign-in?notice=signed-out");
}

export async function acceptInviteAction(form: FormData) {
  const token = text(form, "token");
  const password = form.get("password");
  if (typeof password !== "string" || password !== form.get("confirmPassword"))
    redirect(`/admin/invite/${token}?error=PASSWORDS_DIFFER`);
  const result = await acceptInvite(token, text(form, "name"), password);
  if ("error" in result) redirect(`/admin/invite/${token}?message=${encodeURIComponent(result.error!)}`);
  redirect("/admin/sign-in?notice=joined");
}

export async function firstAdminAction(form: FormData) {
  const password = form.get("password");
  if (typeof password !== "string" || password !== form.get("confirmPassword"))
    redirect("/admin/setup?error=PASSWORDS_DIFFER");
  const result = await createFirstAdmin(text(form, "key"), text(form, "email"), text(form, "name"), password);
  if ("error" in result) redirect(`/admin/setup?message=${encodeURIComponent(result.error!)}`);
  redirect("/admin/sign-in?notice=joined");
}

// --- Authenticator app -----------------------------------------------------

export type TwoFactorSetup =
  | { step: "start"; error?: string }
  | { step: "scan"; qr: string; secret: string; backupCodes: string[]; error?: string };

/** Step 1: confirm the password, then show the QR code and backup codes. */
export async function startTwoFactorAction(_state: TwoFactorSetup, form: FormData): Promise<TwoFactorSetup> {
  await requireAdmin({ setup: true });
  const password = form.get("password");
  if (typeof password !== "string" || !password) return { step: "start", error: "Enter your password." };
  try {
    const result = await adminAuth.api.enableTwoFactor({
      body: { password, method: "totp" },
      headers: await headers(),
    });
    if (result.method !== "totp") throw new Error("Unexpected method");
    const { totpURI, backupCodes } = result;
    const secret = new URL(totpURI).searchParams.get("secret") ?? "";
    const qr = await QRCode.toDataURL(totpURI, { margin: 1, width: 220, color: { dark: "#17243c", light: "#ffffff" } });
    return { step: "scan", qr, secret, backupCodes };
  } catch (error) {
    return {
      step: "start",
      error: codeOf(error) === "INVALID_PASSWORD" ? "That password isn't right." : "That didn't work. Please try again.",
    };
  }
}

/** Step 2: the first code from the app switches it on. */
export async function confirmTwoFactorAction(state: TwoFactorSetup, form: FormData): Promise<TwoFactorSetup> {
  const admin = await requireAdmin({ setup: true });
  const code = text(form, "code").replace(/\s+/g, "");
  try {
    await adminAuth.api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch {
    return { ...state, error: "That code didn't match. Check the time on your phone is right and try the newest code." };
  }
  await audit(admin, "admin.two_factor_on", admin.user.email);
  redirect("/admin?notice=two-factor-on");
}

// --- Team ------------------------------------------------------------------

export type InviteState = { error?: string; link?: string; email?: string; emailed?: boolean };

export async function inviteAdminAction(_state: InviteState, form: FormData): Promise<InviteState> {
  const admin = await requireAdmin();
  const result = await createInvite(text(form, "email"), admin.user.id);
  if ("error" in result) return { error: result.error };
  const link = `${await siteOrigin()}${result.path}`;
  await audit(admin, "admin.invited", result.email);
  let emailed = false;
  if (process.env.RESEND_API_KEY) {
    emailed = await sendAccountEmail({
      to: result.email!,
      subject: "You're invited to be a Buggle Learn admin",
      heading: "You're invited to be a Buggle Learn admin",
      message: `${admin.user.name} invited you to help run Buggle Learn. The link works once and expires in 7 days.`,
      action: { label: "Accept the invite", url: link },
    })
      .then(() => true)
      .catch(() => false);
  }
  return { link, email: result.email, emailed };
}

export async function revokeInviteAction(form: FormData) {
  const admin = await requireAdmin();
  const email = await revokeInvite(text(form, "id"));
  if (email) await audit(admin, "admin.invite_cancelled", email);
  redirect("/admin/team?notice=invite-cancelled");
}

export async function removeAdminAction(form: FormData) {
  const admin = await requireAdmin();
  const result = await removeAdmin(admin.user.id, text(form, "id"));
  if ("error" in result) redirect(`/admin/team?message=${encodeURIComponent(result.error!)}`);
  await audit(admin, "admin.removed", result.email!);
  redirect("/admin/team?notice=admin-removed");
}

// --- Course, learners, certificates -----------------------------------------

export async function updateCheckSettingsAction(form: FormData) {
  const admin = await requireAdmin();
  const to = back(form, "/admin/course");
  const settings = parseCheckSettings(form);
  if ("error" in settings) redirect(withNotice(to, "message", settings.error));
  const changed = await updateCheckSettings(text(form, "id"), settings);
  if (!changed) redirect(withNotice(to, "message", "That check no longer exists."));
  await audit(admin, "check.settings_changed", changed.key, { before: changed.before, after: settings });
  redirect(withNotice(to, "notice", "settings-saved") + `#check-${changed.key}`);
}

export async function grantTryAction(form: FormData) {
  const admin = await requireAdmin();
  const learner = text(form, "learner");
  const key = text(form, "key");
  const extra = await grantTry(learner, key);
  const to = `/admin/learners/${encodeURIComponent(learner)}`;
  if (extra == null) redirect(withNotice(to, "message", "That learner no longer exists."));
  await audit(admin, "learner.extra_try", learner, { check: key, extraTries: extra });
  redirect(withNotice(to, "notice", "try-given"));
}

export async function withdrawCertificateAction(form: FormData) {
  const admin = await requireAdmin();
  const code = text(form, "code");
  const reason = text(form, "reason").slice(0, 300);
  const to = back(form, "/admin/certificates");
  if (!reason) redirect(withNotice(to, "message", "Write a short reason for withdrawing it."));
  if (await setCertificateWithdrawn(code, reason)) await audit(admin, "certificate.withdrawn", code, { reason });
  redirect(withNotice(to, "notice", "certificate-withdrawn"));
}

export async function restoreCertificateAction(form: FormData) {
  const admin = await requireAdmin();
  const code = text(form, "code");
  const to = back(form, "/admin/certificates");
  if (await setCertificateWithdrawn(code, null)) await audit(admin, "certificate.restored", code);
  redirect(withNotice(to, "notice", "certificate-restored"));
}

// --- Forum moderation ---------------------------------------------------------

const forumType = (form: FormData) => (text(form, "type") === "thread" ? "thread" : "post");

/** Act on a report: hide the post (with a reason), or keep it. Every open report on it closes. */
export async function resolveReportAction(form: FormData) {
  const admin = await requireAdmin();
  const type = forumType(form);
  const id = text(form, "id");
  const outcome = text(form, "outcome") === "hidden" ? "hidden" : "kept";
  if (outcome === "hidden") await setForumHidden(type, id, text(form, "reason").slice(0, 200) || "Breaks the community guidelines");
  await resolveReports(type, id, admin.user.id, outcome);
  await audit(admin, outcome === "hidden" ? "forum.hidden" : "forum.report_kept", `${type}:${id}`);
  redirect(`/admin/forum?notice=${outcome === "hidden" ? "forum-hidden" : "report-kept"}`);
}

export async function forumVisibilityAction(form: FormData) {
  const admin = await requireAdmin();
  const type = forumType(form);
  const id = text(form, "id");
  const hide = text(form, "hide") === "yes";
  await setForumHidden(type, id, hide ? text(form, "reason").slice(0, 200) || "Breaks the community guidelines" : null);
  await audit(admin, hide ? "forum.hidden" : "forum.shown", `${type}:${id}`);
  redirect(withNotice(back(form, "/admin/forum"), "notice", hide ? "forum-hidden" : "forum-shown"));
}

export async function threadFlagsAction(form: FormData) {
  const admin = await requireAdmin();
  const flag = text(form, "flag") === "pinned" ? "pinned" : "locked";
  const value = text(form, "value") === "on";
  const title = await setThreadFlags(text(form, "id"), { [flag]: value });
  if (title) await audit(admin, `forum.${flag === "pinned" ? (value ? "pinned" : "unpinned") : value ? "closed" : "reopened"}`, title);
  redirect(withNotice(back(form, "/admin/forum"), "notice", "forum-saved"));
}

export async function saveSectionAction(form: FormData) {
  const admin = await requireAdmin();
  const result = await saveSection({
    id: text(form, "id") || undefined,
    slug: form.get("slug"),
    title: form.get("title"),
    description: form.get("description"),
    position: form.get("position"),
    locked: form.get("locked") === "on",
  });
  if ("error" in result) redirect(`/admin/forum?message=${encodeURIComponent(result.error!)}#sections`);
  await audit(admin, text(form, "id") ? "forum.section_changed" : "forum.section_added", result.slug!);
  redirect("/admin/forum?notice=forum-saved#sections");
}

// --- Organisation plans -------------------------------------------------------

export async function savePlanAction(form: FormData) {
  const admin = await requireAdmin();
  const code = text(form, "code");
  const result = await savePlan(code, { price: form.get("price"), monthly: form.get("monthly"), currency: form.get("currency"), active: form.get("active") === "on" });
  if ("error" in result) redirect(`/admin/organisations?message=${encodeURIComponent(result.error)}#prices`);
  await audit(admin, "plan.changed", code, { price: text(form, "price"), monthly: text(form, "monthly"), currency: text(form, "currency"), on: form.get("active") === "on" });
  redirect("/admin/organisations?notice=plan-saved#prices");
}

// --- Question editor ------------------------------------------------------------

export type QuestionFormState = { error?: string };

export async function saveQuestionsAction(_state: QuestionFormState, form: FormData): Promise<QuestionFormState> {
  const admin = await requireAdmin();
  const id = text(form, "id");
  const parsed = parseQuestionForm(form);
  if ("error" in parsed) return { error: parsed.error };
  const result = await saveQuestions(id, admin.user.email, parsed.questions);
  if (!result) return { error: "That check no longer exists." };
  await audit(admin, "check.questions_changed", text(form, "key"), result);
  redirect(`/admin/course/check/${id}?notice=questions-saved`);
}

// --- Pricing ---------------------------------------------------------------------

// Same-page redirects only change the #part, so refresh the page first.
const pricingBack = (hash: string, error?: string) => (
  revalidatePath("/admin/pricing"),
  redirect(error ? `/admin/pricing?message=${encodeURIComponent(error)}#${hash}` : `/admin/pricing?notice=pricing-saved#${hash}`)
);

export async function saveLearnerPricesAction(form: FormData) {
  const admin = await requireAdmin();
  const input = Object.fromEntries(
    (["course", "all_month", "all_year"] as PriceCode[]).map((code) => [code, { amount: form.get(`${code}.amount`), active: form.get(`${code}.active`) === "on" }]),
  ) as Record<PriceCode, { amount: unknown; active: boolean }>;
  const result = await saveLearnerPrices(input);
  if ("error" in result) pricingBack("learners", result.error);
  await audit(admin, "pricing.learner_prices", null, Object.fromEntries(Object.entries(input).map(([k, v]) => [k, { amount: String(v.amount), on: v.active }])));
  pricingBack("learners");
}

export async function saveOffersAction(form: FormData) {
  const admin = await requireAdmin();
  const input = { launchOn: form.get("launchOn") === "on", launchPercent: form.get("launchPercent"), salePercent: form.get("salePercent"), saleEndsAt: form.get("saleEndsAt") };
  const result = await saveOffers(input);
  if ("error" in result) pricingBack("offers", result.error);
  await audit(admin, "pricing.offers", null, { launch: input.launchOn, launchPercent: String(input.launchPercent), sale: String(input.salePercent), until: String(input.saleEndsAt) });
  pricingBack("offers");
}

export async function saveCodeAction(form: FormData) {
  const admin = await requireAdmin();
  const result = await saveCode({ code: form.get("code"), percent: form.get("percent"), appliesTo: form.get("appliesTo"), expiresAt: form.get("expiresAt"), maxUses: form.get("maxUses") });
  if ("error" in result) pricingBack("codes", result.error);
  await audit(admin, "pricing.code_saved", (result as { code: string }).code, { percent: text(form, "percent"), for: text(form, "appliesTo") });
  pricingBack("codes");
}

export async function toggleCodeAction(form: FormData) {
  const admin = await requireAdmin();
  const code = text(form, "code");
  const on = form.get("active") === "on";
  await setCodeActive(code, on);
  await audit(admin, on ? "pricing.code_on" : "pricing.code_off", code);
  pricingBack("codes");
}

// --- Learners and organisations: the few changes admins can make ----------------

const learnerPage = (id: string, query: string) => (
  revalidatePath(`/admin/learners/${encodeURIComponent(id)}`),
  redirect(`/admin/learners/${encodeURIComponent(id)}?${query}`)
);

export async function giveAccessAction(form: FormData) {
  const admin = await requireAdmin();
  const learner = text(form, "learner");
  const result = await giveAccess(learner, { course: form.get("course"), days: form.get("days") });
  if ("error" in result) learnerPage(learner, `message=${encodeURIComponent(result.error)}#access`);
  await audit(admin, "learner.access_given", learner, { course: text(form, "course"), days: text(form, "days") || "for good" });
  learnerPage(learner, "notice=access-given#access");
}

export async function endAccessAction(form: FormData) {
  const admin = await requireAdmin();
  const learner = text(form, "learner");
  if (await endAccess(learner, text(form, "entitlement"))) await audit(admin, "learner.access_ended", learner, { entitlement: text(form, "entitlement") });
  learnerPage(learner, "notice=access-ended#access");
}

export async function learnerProfileAction(form: FormData) {
  const admin = await requireAdmin();
  const learner = text(form, "learner");
  const what = text(form, "what");
  if (what === "photo") await removeLearnerPhoto(learner);
  else if (what === "hide" || what === "show") await setLearnerLeaderboard(learner, what === "hide");
  else if (what === "sign-out") await signOutEverywhere(learner);
  else if (what === "confirm-email") await confirmEmail(learner);
  else learnerPage(learner, "message=Reload%20the%20page%20and%20try%20again.");
  await audit(admin, `learner.${what}`, learner);
  learnerPage(learner, `notice=learner-${what}#profile`);
}

const orgPage = (id: string, query: string) => (revalidatePath(`/admin/organisations/${id}`), redirect(`/admin/organisations/${id}?${query}`));

export async function adminOrgAction(form: FormData) {
  const admin = await requireAdmin();
  const org = text(form, "org");
  const what = text(form, "what");
  let result: { error: string } | { ok: true } = { error: "Reload the page and try again." };
  if (what === "plan") result = await setOrgPlanByAdmin(org, { plan: form.get("plan"), seats: form.get("seats"), days: form.get("days") });
  else if (what === "rename") result = await renameOrg(org, form.get("name"));
  else if (what === "remove") result = await adminRemoveMember(org, text(form, "user"));
  else if (what === "role") result = await adminSetRole(org, text(form, "user"), form.get("role"));
  if ("error" in result) orgPage(org, `message=${encodeURIComponent(result.error)}`);
  await audit(admin, `organisation.${what}`, org, { plan: text(form, "plan"), seats: text(form, "seats"), days: text(form, "days"), user: text(form, "user"), role: text(form, "role"), name: text(form, "name") });
  orgPage(org, `notice=org-${what}`);
}

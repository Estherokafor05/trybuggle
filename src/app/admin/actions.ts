"use server";
// Everything an admin does. Each action checks the admin first (requireAdmin),
// and every change is written to the activity log.
import { APIError } from "better-auth/api";
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

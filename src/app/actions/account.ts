"use server";
// Settings: name, password, linked sign-in methods, and deleting the account.
import { APIError } from "better-auth/api";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, currentSession } from "@/auth";
import { deleteLearnerData } from "@/server/accounts";
import { forgetGuest } from "@/server/guest";
import { db } from "@/server/database";
import { isLocale, LOCALE_COOKIE } from "@/i18n/locales";

async function requireSession() {
  const session = await currentSession();
  if (!session) redirect("/sign-in?callbackUrl=%2Faccount");
  return session;
}

function done(section: string, extra: Record<string, string>) {
  redirect(`/account?${new URLSearchParams(extra).toString()}#${section}`);
}

function errorCode(error: unknown) {
  if (error instanceof APIError) return (error.body as { code?: string } | undefined)?.code ?? "UNKNOWN";
  return "UNKNOWN";
}

export async function updateNameAction(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) done("details", { error: "MISSING_FIELDS" });
  try {
    await auth.api.updateUser({ body: { name }, headers: await headers() });
  } catch (error) {
    done("details", { error: errorCode(error) });
  }
  done("details", { notice: "NAME_SAVED" });
}

export async function changePasswordAction(formData: FormData) {
  await requireSession();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  if (typeof newPassword !== "string" || !newPassword) done("sign-in", { error: "MISSING_FIELDS" });
  if (newPassword !== formData.get("confirmPassword")) done("sign-in", { error: "PASSWORDS_DIFFER" });
  try {
    if (typeof currentPassword === "string" && currentPassword)
      await auth.api.changePassword({
        body: { currentPassword, newPassword: newPassword as string, revokeOtherSessions: true },
        headers: await headers(),
      });
    // Accounts made with Google have no password yet; this adds one.
    else await auth.api.setPassword({ body: { newPassword: newPassword as string }, headers: await headers() });
  } catch (error) {
    done("sign-in", { error: errorCode(error) });
  }
  done("sign-in", { notice: "PASSWORD_SAVED" });
}

export async function linkGoogleAction() {
  await requireSession();
  let url: string | undefined;
  try {
    const result = await auth.api.linkSocialAccount({
      body: {
        provider: "google",
        callbackURL: "/account?notice=GOOGLE_LINKED#sign-in",
        errorCallbackURL: "/account#sign-in",
        disableRedirect: true,
      },
      headers: await headers(),
    });
    url = result.url;
  } catch (error) {
    done("sign-in", { error: errorCode(error) });
  }
  if (!url) done("sign-in", { error: "GOOGLE_UNAVAILABLE" });
  redirect(url as string);
}

export async function unlinkAction(formData: FormData) {
  await requireSession();
  const accountId = String(formData.get("accountId") ?? "");
  try {
    // Better Auth refuses to remove the last way to sign in.
    await auth.api.unlinkAccount({ body: { accountId }, headers: await headers() });
  } catch (error) {
    done("sign-in", { error: errorCode(error) });
  }
  done("sign-in", { notice: "UNLINKED" });
}

/** Deletes the signed-in learner's account and everything stored for it, then signs them out. */
export async function deleteAccountAction(formData: FormData) {
  const session = await requireSession();
  if (formData.get("confirm") !== "yes") redirect("/account?confirm=required#delete");
  const learner = session.user.id;
  await deleteLearnerData(learner);
  const { internalAdapter } = await auth.$context;
  await internalAdapter.deleteUserSessions(learner);
  await internalAdapter.deleteAccounts(learner);
  await internalAdapter.deleteUser(learner);
  await forgetGuest();
  redirect("/account/deleted");
}

/** Saves the learner's language: on this device straight away, and on their account. */
export async function setLanguageAction(formData: FormData) {
  const session = await currentSession();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Faccount");
  const locale = formData.get("locale");
  if (!isLocale(locale)) redirect("/account?error=LANGUAGE#language");
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  await db()`INSERT INTO learners(id) VALUES(${session.user.id}) ON CONFLICT DO NOTHING`;
  await db()`INSERT INTO learner_preferences(learner_id, locale) VALUES(${session.user.id}, ${locale})
    ON CONFLICT (learner_id) DO UPDATE SET locale = EXCLUDED.locale, updated_at = now()`;
  redirect("/account?notice=language-saved#language");
}

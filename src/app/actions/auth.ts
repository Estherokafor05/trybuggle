"use server";
// Sign-up, login, password reset and sign-out. These run on the server, so the
// forms work without JavaScript and the age check cannot be skipped.
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { safeReturnPath } from "@/lib/paths";
import { forgetGuest } from "@/server/guest";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Builds a page address with the learner's return path and any extra query values. */
function page(path: string, returnTo: string, extra: Record<string, string> = {}) {
  const query = new URLSearchParams({ callbackUrl: returnTo, ...extra });
  return `${path}?${query.toString()}`;
}

/** The short code Better Auth gives an error, or a general one. */
function errorCode(error: unknown) {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code) return code;
  }
  return "UNKNOWN";
}

export async function signInWithEmailAction(formData: FormData) {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password)
    redirect(page("/sign-in", returnTo, { error: "MISSING_FIELDS" }));
  try {
    await auth.api.signInEmail({
      body: { email, password, callbackURL: returnTo },
      headers: await headers(),
    });
  } catch (error) {
    redirect(page("/sign-in", returnTo, { error: errorCode(error) }));
  }
  redirect(returnTo);
}

export async function signUpWithEmailAction(formData: FormData) {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  if (formData.get("age") !== "15-plus") redirect(page("/sign-up", returnTo, { error: "AGE_REQUIRED" }));
  const name = field(formData, "name");
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!name || !email || typeof password !== "string" || !password)
    redirect(page("/sign-up", returnTo, { error: "MISSING_FIELDS" }));
  if (password !== formData.get("confirmPassword"))
    redirect(page("/sign-up", returnTo, { error: "PASSWORDS_DIFFER" }));
  try {
    await auth.api.signUpEmail({
      body: { name: name.slice(0, 80), email, password, callbackURL: returnTo },
      headers: await headers(),
    });
  } catch (error) {
    redirect(page("/sign-up", returnTo, { error: errorCode(error) }));
  }
  redirect(page("/sign-up/check-email", returnTo));
}

/** Google from the sign-up page may create an account; from the login page it only signs in. */
async function continueWithGoogle(formData: FormData, mode: "sign-in" | "sign-up") {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  const from = mode === "sign-up" ? "/sign-up" : "/sign-in";
  if (mode === "sign-up" && formData.get("age") !== "15-plus")
    redirect(page("/sign-up", returnTo, { error: "AGE_REQUIRED" }));
  let url: string | undefined;
  try {
    const result = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: returnTo,
        errorCallbackURL: page(from, returnTo),
        requestSignUp: mode === "sign-up",
        disableRedirect: true,
      },
      headers: await headers(),
    });
    url = result.url;
  } catch (error) {
    redirect(page(from, returnTo, { error: errorCode(error) }));
  }
  if (!url) redirect(page(from, returnTo, { error: "GOOGLE_UNAVAILABLE" }));
  redirect(url);
}

export async function signInWithGoogleAction(formData: FormData) {
  await continueWithGoogle(formData, "sign-in");
}

export async function signUpWithGoogleAction(formData: FormData) {
  await continueWithGoogle(formData, "sign-up");
}

export async function resendVerificationAction(formData: FormData) {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  const email = field(formData, "email");
  if (email)
    await auth.api
      .sendVerificationEmail({ body: { email, callbackURL: returnTo }, headers: await headers() })
      .catch(() => undefined);
  // Same answer either way, so nobody can find out which emails have accounts.
  redirect(page("/sign-up/check-email", returnTo, { sent: "again" }));
}

export async function requestPasswordResetAction(formData: FormData) {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  const email = field(formData, "email");
  if (email)
    await auth.api
      .requestPasswordReset({
        body: { email, redirectTo: page("/reset-password", returnTo) },
        headers: await headers(),
      })
      .catch(() => undefined);
  redirect(page("/forgot-password", returnTo, { sent: "yes" }));
}

export async function resetPasswordAction(formData: FormData) {
  const returnTo = safeReturnPath(field(formData, "callbackUrl"));
  const token = field(formData, "token");
  const newPassword = formData.get("password");
  if (!token) redirect(page("/forgot-password", returnTo, { error: "INVALID_TOKEN" }));
  if (typeof newPassword !== "string" || !newPassword)
    redirect(page("/reset-password", returnTo, { token, error: "MISSING_FIELDS" }));
  if (newPassword !== formData.get("confirmPassword"))
    redirect(page("/reset-password", returnTo, { token, error: "PASSWORDS_DIFFER" }));
  try {
    await auth.api.resetPassword({ body: { newPassword, token }, headers: await headers() });
  } catch (error) {
    redirect(page("/reset-password", returnTo, { token, error: errorCode(error) }));
  }
  redirect(page("/sign-in", returnTo, { notice: "PASSWORD_RESET" }));
}

/** Ends the learner's session on this device and returns them to the home page. */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  await forgetGuest();
  redirect("/");
}

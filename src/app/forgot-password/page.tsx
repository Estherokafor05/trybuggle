import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormMessage, primaryButton, textLink, TextField } from "@/components/auth/fields";
import { authMessage } from "@/lib/auth-messages";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = { title: "Reset your password | Buggle Learn" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  const error = authMessage(params.error);
  return (
    <AuthLayout
      returnTo={returnTo}
      eyebrow="Forgot your password?"
      title="Reset your password"
      intro={"Enter the email you use for Buggle Learn and we'll send you a link to choose a new password."}
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {params.sent === "yes" ? (
        <FormMessage tone="success">
          If that email has a Buggle Learn account, we&apos;ve sent a link to reset the password. The link works for one hour.
        </FormMessage>
      ) : (
        <form action={requestPasswordResetAction} className="mt-7 grid gap-5">
          <input type="hidden" name="callbackUrl" value={returnTo} />
          <TextField id="email" label="Email" type="email" autoComplete="email" required />
          <button type="submit" className={primaryButton}>
            Send reset link
          </button>
        </form>
      )}
      <p className="mt-7 leading-relaxed text-ink">
        Remembered it?{" "}
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`} className={textLink}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

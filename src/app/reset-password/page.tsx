import type { Metadata } from "next";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormMessage, primaryButton, textLink, TextField } from "@/components/auth/fields";
import { authMessage } from "@/lib/auth-messages";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = { title: "Choose a new password | Buggle Learn" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  const error = authMessage(params.error);
  const query = `?callbackUrl=${encodeURIComponent(returnTo)}`;
  return (
    <AuthLayout returnTo={returnTo} eyebrow="Reset your password" title="Choose a new password">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {params.token ? (
        <form action={resetPasswordAction} className="mt-7 grid gap-5">
          <input type="hidden" name="callbackUrl" value={returnTo} />
          <input type="hidden" name="token" value={params.token} />
          <TextField id="password" label="New password" hint="At least 8 characters." type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <TextField id="confirmPassword" label="Type it again" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <button type="submit" className={primaryButton}>
            Save new password
          </button>
        </form>
      ) : (
        <p className="mt-7 leading-relaxed text-ink">
          This page needs the link from your reset email.{" "}
          <Link href={`/forgot-password${query}`} className={textLink}>
            Ask for a new link
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}

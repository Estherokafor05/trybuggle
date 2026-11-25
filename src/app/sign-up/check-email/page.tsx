import type { Metadata } from "next";
import Link from "next/link";
import { resendVerificationAction } from "@/app/actions/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormMessage, secondaryButton, textLink, TextField } from "@/components/auth/fields";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = { title: "Check your email | Buggle Learn" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  return (
    <AuthLayout
      returnTo={returnTo}
      eyebrow="One more step"
      title="Check your email"
      intro={"We've sent you a link to confirm your email address. Open it on this device to finish creating your account. The link works for one hour."}
    >
      {params.sent === "again" && (
        <FormMessage tone="success">If that email has an account waiting to be confirmed, we&apos;ve sent a new link.</FormMessage>
      )}
      <form action={resendVerificationAction} className="mt-7 grid gap-5">
        <input type="hidden" name="callbackUrl" value={returnTo} />
        <p className="leading-relaxed text-ink">No email? Check your spam folder, or send a new link.</p>
        <TextField id="email" label="Email" type="email" autoComplete="email" required />
        <button type="submit" className={secondaryButton}>
          Send a new link
        </button>
      </form>
      <p className="mt-7 leading-relaxed text-ink">
        Already confirmed?{" "}
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`} className={textLink}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

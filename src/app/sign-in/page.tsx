import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithEmailAction, signInWithGoogleAction } from "@/app/actions/auth";
import { currentSession } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Divider,
  FormMessage,
  GoogleIcon,
  primaryButton,
  secondaryButton,
  textLink,
  TextField,
} from "@/components/auth/fields";
import { authMessage, notices } from "@/lib/auth-messages";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Log in | Buggle Learn",
  description: "Log in to Buggle Learn to continue learning about AI.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  if (await currentSession()) redirect(returnTo);
  const error = authMessage(params.error);
  const notice = params.notice ? notices[params.notice] : null;
  const query = `?callbackUrl=${encodeURIComponent(returnTo)}`;

  return (
    <AuthLayout
      returnTo={returnTo}
      eyebrow="Welcome back"
      title="Log in"
      intro={"Log in to pick up where you left off. Your progress is saved on any device."}
    >
      {notice && <FormMessage tone="success">{notice}</FormMessage>}
      {error && (
        <FormMessage tone="error">
          {error}
          {params.error === "EMAIL_NOT_VERIFIED" && (
            <>
              {" "}
              <Link href={`/sign-up/check-email${query}`} className={textLink}>
                Send a new link
              </Link>
            </>
          )}
        </FormMessage>
      )}

      <form action={signInWithEmailAction} className="mt-7 grid gap-5">
        <input type="hidden" name="callbackUrl" value={returnTo} />
        <TextField id="email" label="Email" type="email" autoComplete="email" required />
        <div>
          <TextField id="password" label="Password" type="password" autoComplete="current-password" required />
          <p className="mt-2 text-sm">
            <Link href={`/forgot-password${query}`} className={textLink}>
              Forgot your password?
            </Link>
          </p>
        </div>
        <button type="submit" className={primaryButton}>
          Log in
        </button>
      </form>

      {googleAuthConfigured && (
        <>
          <Divider />
          <form action={signInWithGoogleAction}>
            <input type="hidden" name="callbackUrl" value={returnTo} />
            <button type="submit" className={secondaryButton}>
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
        </>
      )}

      <p className="mt-7 leading-relaxed text-ink">
        New to Buggle Learn?{" "}
        <Link href={`/sign-up${query}`} className={textLink}>
          Create a free account
        </Link>
      </p>
    </AuthLayout>
  );
}

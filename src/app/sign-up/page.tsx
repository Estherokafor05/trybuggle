import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signUpWithEmailAction, signUpWithGoogleAction } from "@/app/actions/auth";
import { currentSession } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  FormMessage,
  GoogleIcon,
  primaryButton,
  secondaryButton,
  textLink,
  TextField,
} from "@/components/auth/fields";
import { authMessage } from "@/lib/auth-messages";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { safeReturnPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Create your free account | Buggle Learn",
  description: "Create a free Buggle Learn account to start learning about AI.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.callbackUrl);
  if (await currentSession()) redirect(returnTo);
  const error = authMessage(params.error);
  const query = `?callbackUrl=${encodeURIComponent(returnTo)}`;

  return (
    <AuthLayout
      returnTo={returnTo}
      eyebrow="Start learning"
      title="Create your free account"
      intro={"Your progress, knowledge check results and certificates are saved to your account, on any device."}
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <form action={signUpWithEmailAction} className="mt-7 grid gap-5">
        <input type="hidden" name="callbackUrl" value={returnTo} />
        <label className="flex min-h-11 cursor-pointer items-start gap-3 leading-relaxed text-ink">
          <input type="checkbox" name="age" value="15-plus" required className="mt-1 size-5 shrink-0 accent-brand" />
          I am 15 or over
        </label>
        {googleAuthConfigured && (
          <>
            <button type="submit" formAction={signUpWithGoogleAction} formNoValidate className={secondaryButton}>
              <GoogleIcon />
              Continue with Google
            </button>
            <p className="-mb-1 text-center text-sm text-muted">or use your email</p>
          </>
        )}
        <TextField id="name" label="Your name" hint="This is the name on your certificates. You can change it later." autoComplete="name" maxLength={80} required />
        <TextField id="email" label="Email" type="email" autoComplete="email" required />
        <TextField id="password" label="Password" hint="At least 8 characters." type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
        <TextField id="confirmPassword" label="Type your password again" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
        <button type="submit" className={primaryButton}>
          Create my account
        </button>
      </form>

      <p className="mt-7 leading-relaxed text-ink">
        Already have an account?{" "}
        <Link href={`/sign-in${query}`} className={textLink}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { adminVerifyCodeAction } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { FormMessage, primaryButton, textLink, TextField } from "@/components/auth/fields";
import { adminErrors, adminMessage } from "@/lib/admin-messages";

export const metadata: Metadata = { title: "Admin sign-in code" };

// Second step of admin sign-in: a code from the authenticator app, or a backup code.
export default async function AdminCodePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; method?: string }>;
}) {
  const { error, method } = await searchParams;
  const backup = method === "backup";
  return (
    <AdminCard
      title={backup ? "Use a backup code" : "Enter your code"}
      intro={
        backup
          ? "Enter one of the backup codes you saved when you set up your authenticator app. Each works once."
          : "Open your authenticator app and enter the 6-digit code for Buggle Learn Admin."
      }
    >
      {error && <FormMessage tone="error">{adminMessage(adminErrors, error)}</FormMessage>}
      <form action={adminVerifyCodeAction} className="mt-6 grid gap-4">
        <input type="hidden" name="method" value={backup ? "backup" : "totp"} />
        <TextField
          id="code"
          label={backup ? "Backup code" : "6-digit code"}
          autoComplete="one-time-code"
          inputMode={backup ? "text" : "numeric"}
          pattern={backup ? undefined : "[0-9 ]{6,7}"}
          maxLength={backup ? 40 : 7}
          required
        />
        <button type="submit" className={primaryButton}>
          Sign in
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link className={textLink} href={backup ? "/admin/sign-in/code" : "/admin/sign-in/code?method=backup"}>
          {backup ? "Use my authenticator app instead" : "I can't use my app: use a backup code"}
        </Link>
      </p>
      <p className="mt-3 text-sm">
        <Link className={textLink} href="/admin/sign-in">
          Start again
        </Link>
      </p>
    </AdminCard>
  );
}

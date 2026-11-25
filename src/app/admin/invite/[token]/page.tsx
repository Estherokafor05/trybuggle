import type { Metadata } from "next";
import { acceptInviteAction } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { FormMessage, primaryButton, TextField } from "@/components/auth/fields";
import { adminErrors, adminMessage } from "@/lib/admin-messages";
import { findInvite } from "@/server/admin";

export const metadata: Metadata = { title: "Admin invite" };

// Accepting an admin invite: choose a name and password. The link works once.
export default async function AdminInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { token } = await params;
  const { error, message } = await searchParams;
  const invite = await findInvite(token).catch(() => null);
  if (!invite)
    return (
      <AdminCard title="This invite link doesn't work">
        <p className="mt-4 leading-relaxed text-ink">
          {message ?? "It may have expired or already been used. Ask an admin to send you a new invite."}
        </p>
      </AdminCard>
    );
  return (
    <AdminCard
      title="Join the Buggle Learn admin team"
      intro={
        <>
          This invite is for <b className="ph-mask text-ink">{invite.email}</b>. After this you&apos;ll sign in and set up
          an authenticator app, such as Google Authenticator or Microsoft Authenticator.
        </>
      }
    >
      {(error || message) && <FormMessage tone="error">{message ?? adminMessage(adminErrors, error)}</FormMessage>}
      <form action={acceptInviteAction} className="mt-6 grid gap-4">
        <input type="hidden" name="token" value={token} />
        <TextField id="name" label="Your name" autoComplete="name" maxLength={80} required />
        <TextField
          id="password"
          label="Choose a password"
          hint="At least 12 characters. Use a password you don't use anywhere else."
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
        <TextField id="confirmPassword" label="Type the password again" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <button type="submit" className={primaryButton}>
          Create my admin account
        </button>
      </form>
    </AdminCard>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { firstAdminAction } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { FormMessage, primaryButton, textLink, TextField } from "@/components/auth/fields";
import { adminErrors, adminMessage } from "@/lib/admin-messages";
import { adminCount, setupKeyConfigured } from "@/server/admin";

export const metadata: Metadata = { title: "Set up the first admin" };

// Creates the very first admin. Closed for good once any admin exists.
export default async function AdminSetupPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  const count = await adminCount().catch(() => null);
  if (count === null)
    return (
      <AdminCard title="Set-up isn't available">
        <p className="mt-4 leading-relaxed">The database can&apos;t be reached right now. Please try again shortly.</p>
      </AdminCard>
    );
  if (count > 0)
    return (
      <AdminCard title="Set-up is closed">
        <p className="mt-4 leading-relaxed">An admin account already exists. New admins join by invite from the Team page.</p>
        <p className="mt-6">
          <Link className={textLink} href="/admin/sign-in">
            Go to admin sign-in
          </Link>
        </p>
      </AdminCard>
    );
  if (!setupKeyConfigured())
    return (
      <AdminCard title="Set-up isn't switched on">
        <p className="mt-4 leading-relaxed">
          To create the first admin, add a setting called <span className="font-mono font-semibold">ADMIN_SETUP_KEY</span> in
          Vercel (at least 20 characters), redeploy, then come back here.
        </p>
      </AdminCard>
    );
  return (
    <AdminCard
      title="Set up the first admin"
      intro="This page works once. After the first admin exists, everyone else joins by invite."
    >
      {(error || message) && <FormMessage tone="error">{message ?? adminMessage(adminErrors, error)}</FormMessage>}
      <form action={firstAdminAction} className="mt-6 grid gap-4">
        <TextField id="key" label="Set-up key" hint="The ADMIN_SETUP_KEY value from Vercel." type="password" autoComplete="off" required />
        <TextField id="name" label="Your name" autoComplete="name" maxLength={80} required />
        <TextField id="email" label="Your email" type="email" autoComplete="username" required />
        <TextField id="password" label="Choose a password" hint="At least 12 characters." type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <TextField id="confirmPassword" label="Type the password again" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <button type="submit" className={primaryButton}>
          Create the first admin
        </button>
      </form>
    </AdminCard>
  );
}

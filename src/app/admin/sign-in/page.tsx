import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/admin-auth";
import { adminSignInAction } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { FormMessage, primaryButton, TextField } from "@/components/auth/fields";
import { adminErrors, adminMessage, adminNotices } from "@/lib/admin-messages";

export const metadata: Metadata = { title: "Admin sign-in" };

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  if (await currentAdmin()) redirect("/admin");
  const { error, notice } = await searchParams;
  return (
    <AdminCard
      title="Admin sign-in"
      intro="For the Buggle Learn team only. Learners sign in on the main site."
    >
      {adminMessage(adminNotices, notice) && <FormMessage tone="success">{adminNotices[notice!]}</FormMessage>}
      {error && <FormMessage tone="error">{adminMessage(adminErrors, error)}</FormMessage>}
      <form action={adminSignInAction} className="mt-6 grid gap-4">
        <TextField id="email" label="Email" type="email" autoComplete="username" required />
        <TextField id="password" label="Password" type="password" autoComplete="current-password" required />
        <button type="submit" className={primaryButton}>
          Continue
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        Admin accounts are by invite only. Ask another admin if you need one.
      </p>
    </AdminCard>
  );
}

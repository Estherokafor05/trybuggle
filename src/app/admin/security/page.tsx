import type { Metadata } from "next";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminShell";
import { TwoFactorSetupForm } from "@/components/admin/TwoFactorSetupForm";
import { textLink } from "@/components/auth/fields";
import { requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Set up your authenticator app" };

// Every admin must use an authenticator app. Admin pages send here until it's on.
export default async function AdminSecurityPage() {
  const admin = await requireAdmin({ setup: true });
  if (admin.user.twoFactorEnabled)
    return (
      <AdminCard title="Your authenticator app is on">
        <p className="mt-4 leading-relaxed text-ink">You need a code from it each time you sign in.</p>
        <p className="mt-6">
          <Link className={textLink} href="/admin">
            Go to the admin overview
          </Link>
        </p>
      </AdminCard>
    );
  return (
    <AdminCard
      title="Set up your authenticator app"
      intro="Admin accounts can change the course and people's results, so they need more than a password. You'll need a code from the app each time you sign in."
    >
      <TwoFactorSetupForm />
    </AdminCard>
  );
}

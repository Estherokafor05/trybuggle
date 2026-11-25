import type { Metadata } from "next";
import { settingsAction } from "@/app/org/actions";
import { OrgLogo, OrgShell, orgButton, orgCard, orgInput } from "@/components/org/OrgShell";
import { loadOrg } from "@/server/org-page";

export const metadata: Metadata = { title: "Organisation settings | Buggle Learn" };
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ notice?: string; error?: string }> };

export default async function OrgSettingsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const { org, role } = await loadOrg(slug, "/settings", { manage: true });
  return (
    <OrgShell org={org} role={role} current="/settings" notice={q.notice} error={q.error}>
      <section aria-labelledby="settings-title" className={`${orgCard} max-w-[640px]`}>
        <h2 id="settings-title" className="text-lg font-bold">
          Name and logo
        </h2>
        <p className="mt-1 text-sm text-muted">Members see these on their dashboard.</p>
        <form action={settingsAction} encType="multipart/form-data" className="mt-4 grid gap-4">
          <input type="hidden" name="org" value={org.slug} />
          <label className="grid gap-1 font-semibold">
            Organisation name
            <input name="name" required minLength={2} maxLength={80} defaultValue={org.name} className={orgInput} />
          </label>
          <div className="flex items-center gap-4">
            <OrgLogo org={org} size="size-16" />
            <label className="grid flex-1 gap-1 font-semibold">
              Logo <span className="text-sm font-normal text-muted">PNG, JPEG or WebP, up to 300 KB</span>
              <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />
            </label>
          </div>
          {org.hasLogo && (
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input name="removeLogo" type="checkbox" className="size-5 accent-brand" /> Remove the logo
            </label>
          )}
          <button type="submit" className={`${orgButton} justify-self-start`}>
            Save settings
          </button>
        </form>
      </section>
    </OrgShell>
  );
}

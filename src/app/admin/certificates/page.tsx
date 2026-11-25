import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { CertificateActions } from "@/components/admin/CertificateActions";
import { card, certificateName, input, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { listCertificates, requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Certificates" };

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; notice?: string; message?: string }>;
}) {
  const admin = await requireAdmin();
  const { q: raw = "", notice, message } = await searchParams;
  const q = raw.slice(0, 100);
  const list = await listCertificates(q);
  const back = q ? `/admin/certificates?q=${encodeURIComponent(q)}` : "/admin/certificates";
  return (
    <AdminShell current="/admin/certificates" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title="Certificates"
        intro="Find a certificate by ID or name. Withdrawing one makes its public check page say it no longer counts. You can restore it later."
      />
      <form className="mb-5 flex flex-col gap-2 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="q">
          Search certificates
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Certificate ID or name" className={input} />
        <button type="submit" className={outline}>
          Search
        </button>
      </form>
      <section className={card} aria-label="Certificates">
        {list.length ? (
          <ul className="divide-y divide-line/70">
            {list.map((c) => (
              <li key={c.code} className="py-3">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="ph-mask font-semibold">{c.name}</span>
                  <Link href={`/verify/${c.code}`} className="font-mono text-sm text-navy underline underline-offset-4">
                    {c.code}
                  </Link>
                </p>
                <p className="text-sm text-muted">
                  {certificateName(c.kind, c.moduleSlug)} · issued {shortDate(c.issuedAt)} ·{" "}
                  <Link href={`/admin/learners/${encodeURIComponent(c.learnerId)}`} className="underline underline-offset-4">
                    learner
                  </Link>
                </p>
                <CertificateActions code={c.code} withdrawn={c.withdrawn} back={back} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No certificates found.</p>
        )}
      </section>
    </AdminShell>
  );
}

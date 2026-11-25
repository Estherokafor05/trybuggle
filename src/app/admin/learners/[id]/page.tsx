import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grantTryAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { card, certificateName, checkName, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { learnerDetail, requireAdmin } from "@/server/admin";
import { learnerDashboard } from "@/server/dashboard";
import { CertificateActions } from "@/components/admin/CertificateActions";

export const metadata: Metadata = { title: "Learner" };

export default async function AdminLearnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; message?: string }>;
}) {
  const admin = await requireAdmin();
  const id = decodeURIComponent((await params).id);
  const { notice, message } = await searchParams;
  const learner = await learnerDetail(id);
  if (!learner) notFound();
  const progress = await learnerDashboard(id).catch(() => null);
  const back = `/admin/learners/${encodeURIComponent(id)}`;
  return (
    <AdminShell current="/admin/learners" email={admin.user.email}>
      <Link href="/admin/learners" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
        <span aria-hidden="true">←</span> All learners
      </Link>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title={learner.name || "No name"}
        intro={
          <span className="ph-mask">
            {learner.email} · joined {shortDate(learner.joined)} · email {learner.confirmed ? "confirmed" : "not confirmed yet"}
          </span>
        }
      />
      {progress && (
        <section aria-label="Progress" className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-hero-lavender p-5">
            <p className="text-sm font-semibold text-navy">Essentials progress</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {progress.overall.done} of {progress.overall.total}
            </p>
            <p className="mt-1 text-sm text-ink">steps passed</p>
          </div>
          <div className="rounded-3xl bg-mint p-5">
            <p className="text-sm font-semibold text-navy">Up next</p>
            <p className="mt-2 font-semibold">{progress.next ? `Module ${progress.next.moduleOrder}, ${progress.next.label}` : "Everything open is passed"}</p>
          </div>
          <div className="rounded-3xl bg-peach p-5">
            <p className="text-sm font-semibold text-navy">Days learning</p>
            <p className="mt-2 font-display text-3xl font-bold">{progress.stats.daysLearning}</p>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="results-title" className={card}>
          <h2 id="results-title" className="text-lg font-bold">
            Results
          </h2>
          <p className="mt-1 text-sm text-muted">
            If a check has a tries limit and the learner has used them all, you can give one more try.
          </p>
          {learner.results.length ? (
            <ul className="mt-4 space-y-2">
              {learner.results.map((r) => (
                <li key={`${r.kind}-${r.key}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block font-semibold">{checkName(r.kind, r.key)}</span>
                    <span className="block text-sm text-muted">
                      <span className={r.passed ? "font-semibold text-teal" : "font-semibold text-navy"}>{r.passed ? "Passed" : "Not passed yet"}</span>
                      {` · best ${r.best} of ${r.questions} · ${r.tries} ${r.tries === 1 ? "try" : "tries"}`}
                      {learner.extraTries[r.key] ? ` · ${learner.extraTries[r.key]} extra given` : ""}
                      {` · ${shortDate(r.last)}`}
                    </span>
                  </span>
                  {!r.passed && (
                    <form action={grantTryAction}>
                      <input type="hidden" name="learner" value={learner.id} />
                      <input type="hidden" name="key" value={r.key} />
                      <button type="submit" className={outline}>
                        Give one more try<span className="sr-only">: {checkName(r.kind, r.key)}</span>
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No checks taken yet.</p>
          )}
        </section>

        <section aria-labelledby="certs-title" className={card}>
          <h2 id="certs-title" className="text-lg font-bold">
            Certificates
          </h2>
          {learner.certificates.length ? (
            <ul className="mt-4 space-y-3">
              {learner.certificates.map((c) => (
                <li key={c.code} className="rounded-xl bg-canvas p-3">
                  <p className="font-semibold">{certificateName(c.kind, c.moduleSlug)}</p>
                  <p className="text-sm text-muted">
                    <Link href={`/verify/${c.code}`} className="font-mono text-navy underline underline-offset-4">
                      {c.code}
                    </Link>{" "}
                    · <span className="ph-mask">{c.name}</span> · {shortDate(c.issuedAt)}
                  </p>
                  <CertificateActions code={c.code} withdrawn={c.withdrawn} back={back} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No certificates yet.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

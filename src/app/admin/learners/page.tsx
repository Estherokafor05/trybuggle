import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { card, input, outline, shortDate } from "@/components/admin/format";
import { findLearners, requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Learners" };

export default async function AdminLearnersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin();
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const learners = await findLearners(q);
  return (
    <AdminShell current="/admin/learners" email={admin.user.email}>
      <AdminHeading title="Learners" intro="Find a learner by email or name to see their progress, results and certificates." />
      <form className="mb-5 flex flex-col gap-2 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="q">
          Search learners
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Email or name" className={input} />
        <button type="submit" className={outline}>
          Search
        </button>
      </form>
      <section className={card} aria-label="Learners">
        <p className="text-sm text-muted">
          {learners.length === 50 ? "Showing the newest 50." : `${learners.length} ${learners.length === 1 ? "learner" : "learners"}`}
          {q && ` matching "${q}"`}
        </p>
        {learners.length ? (
          <ul className="mt-3 divide-y divide-line/70">
            {learners.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/learners/${encodeURIComponent(l.id)}`}
                  className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 hover:bg-canvas sm:px-2"
                >
                  <span className="min-w-0">
                    <span className="ph-mask block font-semibold text-ink">{l.name || "No name"}</span>
                    <span className="ph-mask block break-all text-sm text-muted">{l.email}</span>
                  </span>
                  <span className="text-sm text-muted">
                    {l.checksPassed} checks passed · joined {shortDate(l.joined)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No learners found.</p>
        )}
      </section>
    </AdminShell>
  );
}

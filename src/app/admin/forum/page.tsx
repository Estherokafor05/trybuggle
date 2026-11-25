import type { Metadata } from "next";
import Link from "next/link";
import {
  forumVisibilityAction,
  resolveReportAction,
  saveSectionAction,
  threadFlagsAction,
} from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { button, card, input, outline, shortDate } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { requireAdmin } from "@/server/admin";
import { adminThreads, listSections, openReports } from "@/server/forum";

export const metadata: Metadata = { title: "Forum" };

function Flag({ id, flag, on, back, label }: { id: string; flag: "pinned" | "locked"; on: boolean; back: string; label: string }) {
  return (
    <form action={threadFlagsAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={on ? "off" : "on"} />
      <input type="hidden" name="back" value={back} />
      <button type="submit" className={outline}>
        {flag === "pinned" ? (on ? "Unpin" : "Pin") : on ? "Reopen" : "Close"}
        <span className="sr-only">: {label}</span>
      </button>
    </form>
  );
}

export default async function AdminForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; notice?: string; message?: string }>;
}) {
  const admin = await requireAdmin();
  const { q: raw = "", notice, message } = await searchParams;
  const q = raw.slice(0, 100);
  const [reports, threads, sections] = await Promise.all([openReports(), adminThreads(q), listSections()]);
  const back = q ? `/admin/forum?q=${encodeURIComponent(q)}` : "/admin/forum";
  return (
    <AdminShell current="/admin/forum" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading title="Forum" intro="Deal with reports, pin or close conversations, hide posts that break the guidelines, and manage sections." />

      <section aria-labelledby="reports-title" className={card}>
        <h2 id="reports-title" className="text-lg font-bold">
          Reports waiting ({reports.length})
        </h2>
        {reports.length ? (
          <ul className="mt-4 grid gap-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-2xl bg-canvas p-4">
                <p className="text-sm font-semibold text-navy">
                  {r.reason} · {r.type === "thread" ? "a question or discussion" : "an answer or comment"} · reported {shortDate(r.created)}
                </p>
                {r.note && <p className="mt-1 text-sm text-muted">&ldquo;{r.note}&rdquo;</p>}
                <p className="mt-2 text-sm">
                  In{" "}
                  {r.threadId ? (
                    <Link href={`/forum/t/${r.threadId}`} className="font-semibold text-navy underline underline-offset-4">
                      {r.threadTitle}
                    </Link>
                  ) : (
                    r.threadTitle
                  )}{" "}
                  · by <span className="ph-mask">{r.author}</span>
                </p>
                <blockquote className="ph-mask mt-2 max-h-40 overflow-auto whitespace-pre-line rounded-xl bg-white p-3 text-sm">{r.body || "(no text)"}</blockquote>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <form action={resolveReportAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="type" value={r.type} />
                    <input type="hidden" name="id" value={r.targetId} />
                    <input type="hidden" name="outcome" value="hidden" />
                    <label className="text-sm font-semibold">
                      Reason shown in the log
                      <input name="reason" defaultValue={r.reason} maxLength={200} className={`${input} mt-1`} />
                    </label>
                    <button type="submit" className={button}>
                      Hide it
                    </button>
                  </form>
                  <form action={resolveReportAction}>
                    <input type="hidden" name="type" value={r.type} />
                    <input type="hidden" name="id" value={r.targetId} />
                    <input type="hidden" name="outcome" value="kept" />
                    <button type="submit" className={outline}>
                      Keep it
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No reports. All clear.</p>
        )}
      </section>

      <section aria-labelledby="threads-title" className={`${card} mt-6`}>
        <h2 id="threads-title" className="text-lg font-bold">
          Conversations
        </h2>
        <form role="search" className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="q" className="sr-only">
            Search conversations
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by title" className={input} />
          <button type="submit" className={outline}>
            Search
          </button>
        </form>
        <ul className="mt-3 divide-y divide-line/70">
          {threads.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <Link href={`/forum/t/${t.id}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                  {t.title}
                </Link>
                <span className="block text-sm text-muted">
                  {t.section} · {t.kind} · {t.replies} replies · {shortDate(t.activity)}
                  {t.pinned && " · pinned"}
                  {t.locked && " · closed"}
                  {t.hidden && " · hidden"}
                </span>
              </span>
              <span className="flex flex-wrap gap-2">
                <Flag id={t.id} flag="pinned" on={t.pinned} back={back} label={t.title} />
                <Flag id={t.id} flag="locked" on={t.locked} back={back} label={t.title} />
                <form action={forumVisibilityAction}>
                  <input type="hidden" name="type" value="thread" />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="hide" value={t.hidden ? "no" : "yes"} />
                  <input type="hidden" name="back" value={back} />
                  <button type="submit" className={outline}>
                    {t.hidden ? "Show" : "Hide"}
                    <span className="sr-only">: {t.title}</span>
                  </button>
                </form>
              </span>
            </li>
          ))}
          {!threads.length && <li className="py-3 text-sm text-muted">No conversations found.</li>}
        </ul>
      </section>

      <section id="sections" aria-labelledby="sections-title" className={`${card} mt-6 scroll-mt-24`}>
        <h2 id="sections-title" className="text-lg font-bold">
          Sections
        </h2>
        <p className="mt-1 text-sm text-muted">Lower numbers show first. A read-only section takes no new posts.</p>
        <ul className="mt-4 grid gap-3">
          {[...sections, null].map((s) => (
            <li key={s?.id ?? "new"}>
              <details className="rounded-2xl bg-canvas p-3" open={!s ? false : undefined}>
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 font-semibold">
                  {s ? `${s.title}${s.locked ? " (read only)" : ""}` : "+ Add a section"}
                  {s && <span className="text-sm font-normal text-muted">{s.threads} posts</span>}
                </summary>
                <form action={saveSectionAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                  {s && <input type="hidden" name="id" value={s.id} />}
                  <label className="text-sm font-semibold">
                    Title
                    <input name="title" required maxLength={80} defaultValue={s?.title} className={`${input} mt-1`} />
                  </label>
                  <label className="text-sm font-semibold">
                    Web address (/forum/…)
                    <input name="slug" required maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={s?.slug} className={`${input} mt-1 font-mono`} />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Description
                    <input name="description" maxLength={300} defaultValue={s?.description} className={`${input} mt-1`} />
                  </label>
                  <label className="text-sm font-semibold">
                    Order
                    <input name="position" type="number" min={0} max={10000} required defaultValue={s ? s.position : (Math.max(0, ...sections.map((x) => x.position)) + 10)} className={`${input} mt-1`} />
                  </label>
                  <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold">
                    <input name="locked" type="checkbox" defaultChecked={s?.locked} className="size-5 accent-brand" /> Read only
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" className={button}>
                      {s ? "Save section" : "Add section"}
                      {s && <span className="sr-only"> {s.title}</span>}
                    </button>
                  </div>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}

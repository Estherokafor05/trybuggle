import type { Metadata } from "next";
import Link from "next/link";
import { updateCheckSettingsAction } from "@/app/admin/actions";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { button, card, input } from "@/components/admin/format";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { courseOutline, requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Course" };

type Check = NonNullable<NonNullable<Awaited<ReturnType<typeof courseOutline>>>["sections"][number]["final"]>;

function CheckSettings({ check, label }: { check: Check; label: string }) {
  const id = `check-${check.key}`;
  return (
    <details id={id} className="mt-2 rounded-xl bg-white ring-1 ring-line/70">
      <summary className="flex min-h-11 cursor-pointer flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
        <span className="font-semibold text-navy">
          {label}
          <span className="sr-only"> settings</span>
        </span>
        <span className="text-muted">
          {check.questions} questions · pass {check.passPercent}% · {check.maxAttempts == null ? "unlimited tries" : `${check.maxAttempts} tries`}
          {check.shuffle ? " · shuffled" : ""}
        </span>
      </summary>
      <form action={updateCheckSettingsAction} className="grid gap-3 border-t border-line/70 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="id" value={check.id} />
        <input type="hidden" name="back" value="/admin/course" />
        <label className="text-sm font-semibold">
          Pass mark (%)
          <input name="passPercent" type="number" min={1} max={100} required defaultValue={check.passPercent} className={`${input} mt-1`} />
        </label>
        <label className="text-sm font-semibold">
          Tries allowed (empty for unlimited)
          <input name="maxAttempts" type="number" min={1} max={50} defaultValue={check.maxAttempts ?? ""} className={`${input} mt-1`} />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input name="shuffle" type="checkbox" defaultChecked={check.shuffle} className="size-5 accent-brand" />
          Shuffle answers
        </label>
        <div className="sm:col-span-3">
          <button type="submit" className={button}>
            Save<span className="sr-only"> {label}</span>
          </button>
          <p className="mt-2 text-xs text-muted">Changes apply to the next attempt. Earlier results never change.</p>
        </div>
        <p className="sm:col-span-3">
          <Link href={`/admin/course/check/${check.id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
            Edit the questions and explanations<span className="sr-only">: {label}</span> <span aria-hidden="true">→</span>
          </Link>
        </p>
      </form>
    </details>
  );
}

export default async function AdminCoursePage({ searchParams }: { searchParams: Promise<{ notice?: string; message?: string }> }) {
  const admin = await requireAdmin();
  const { notice, message } = await searchParams;
  const outline = await courseOutline();
  return (
    <AdminShell current="/admin/course" email={admin.user.email}>
      <AdminNotice notice={adminMessage(adminNotices, notice)} error={message} />
      <AdminHeading
        title={outline?.title ?? "Course"}
        intro="Every module, lesson and check, as stored in the database. Open a check to change its pass mark, tries and answer shuffling."
      />
      <p className="mb-6 rounded-2xl bg-lavender p-4 text-sm leading-relaxed text-ink">
        <b>Questions and explanations</b> can be edited here: open a check, then choose &ldquo;Edit the questions&rdquo;. Once a
        check is edited here, the site uses this copy and the course files no longer change it. <b>Lesson films, guides and
        activities</b> are interactive, so the course team edits them in the course files.
      </p>
      {!outline ? (
        <p className="rounded-2xl bg-peach p-4">The course hasn&apos;t been loaded into the database yet.</p>
      ) : (
        <ol className="grid gap-4">
          {outline.sections.map((section, s) => (
            <li key={section.id} className={card}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">
                  Module {s + 1}: {section.title}
                </h2>
                <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-navy">
                  {section.level === "deep_dive" ? "Deep Dive" : "Essentials"} · {section.status}
                </span>
              </div>
              <ol className="mt-3 space-y-2">
                {section.items.map((item, i) => (
                  <li key={item.id} className="rounded-xl bg-canvas p-3">
                    <p className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">
                        {i + 1}. {item.title}
                      </span>
                      <span className="text-sm text-muted">{item.status}</span>
                    </p>
                    {item.check && <CheckSettings check={item.check} label="Knowledge check" />}
                  </li>
                ))}
                {!section.items.length && <li className="text-sm text-muted">No lessons yet.</li>}
              </ol>
              {section.final && <CheckSettings check={section.final} label="Final assessment" />}
            </li>
          ))}
        </ol>
      )}
    </AdminShell>
  );
}

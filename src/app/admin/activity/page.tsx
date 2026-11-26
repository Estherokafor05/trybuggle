import type { Metadata } from "next";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { card, dateTime } from "@/components/admin/format";
import { activity, requireAdmin } from "@/server/admin";

export const metadata: Metadata = { title: "Activity" };

const labels: Record<string, string> = {
  "admin.joined": "Joined the admin team",
  "admin.two_factor_on": "Set up their authenticator app",
  "admin.invited": "Invited an admin",
  "admin.invite_cancelled": "Cancelled an invite",
  "admin.removed": "Removed an admin",
  "check.settings_changed": "Changed check settings",
  "learner.extra_try": "Gave a learner one more try",
  "certificate.withdrawn": "Withdrew a certificate",
  "certificate.restored": "Restored a certificate",
  "forum.hidden": "Hid a forum post",
  "forum.shown": "Showed a forum post again",
  "forum.report_kept": "Kept a reported forum post",
  "forum.pinned": "Pinned a forum conversation",
  "forum.unpinned": "Unpinned a forum conversation",
  "forum.closed": "Closed a forum conversation",
  "forum.reopened": "Reopened a forum conversation",
  "forum.section_added": "Added a forum section",
  "forum.section_changed": "Changed a forum section",
  "plan.changed": "Changed an organisation plan's price",
  "check.questions_changed": "Edited a check's questions",
  "builder.course_created": "Created a course in the builder",
  "builder.course_saved": "Saved a builder course",
  "builder.course_deleted": "Deleted a builder course",
  "builder.course_type": "Changed a course's type",
  "builder.check_saved": "Saved a builder knowledge check",
  "pricing.learner_prices": "Changed learner prices",
  "pricing.offers": "Changed the launch offer or sale",
  "pricing.code_saved": "Saved a discount code",
  "pricing.code_on": "Switched a discount code on",
  "pricing.code_off": "Switched a discount code off",
  "learner.access_given": "Gave a learner Deep Dive access",
  "learner.access_ended": "Ended a learner's Deep Dive access",
  "learner.photo": "Removed a learner's photo",
  "learner.hide": "Hid a learner from leaderboards",
  "learner.show": "Showed a learner on leaderboards",
  "learner.sign-out": "Signed a learner out everywhere",
  "learner.confirm-email": "Confirmed a learner's email",
  "organisation.plan": "Gave or ended an organisation's plan",
  "organisation.rename": "Renamed an organisation",
  "organisation.remove": "Removed an organisation member",
  "organisation.role": "Changed an organisation member's role",
};

function summary(details: Record<string, unknown>) {
  const after = details.after as { passPercent?: number; maxAttempts?: number | null; shuffle?: boolean } | undefined;
  if (after)
    return `Pass ${after.passPercent}%, ${after.maxAttempts == null ? "unlimited tries" : `${after.maxAttempts} tries`}${after.shuffle ? ", shuffled" : ""}`;
  if (typeof details.reason === "string") return `Reason: ${details.reason}`;
  if (typeof details.check === "string") return `Check: ${details.check}`;
  return "";
}

// Every change made by an admin, newest first. Nothing here can be edited.
export default async function AdminActivityPage() {
  const admin = await requireAdmin();
  const entries = await activity();
  return (
    <AdminShell current="/admin/activity" email={admin.user.email}>
      <AdminHeading title="Activity" intro="Every change made in the admin area, newest first. The latest 100 are shown." />
      <section className={card} aria-label="Activity">
        {entries.length ? (
          <ol className="divide-y divide-line/70">
            {entries.map((e, i) => (
              <li key={i} className="py-3">
                <p className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{labels[e.action] ?? e.action}</span>
                  <span className="text-sm text-muted">{dateTime(e.at)}</span>
                </p>
                <p className="ph-mask break-all text-sm text-muted">
                  {e.admin}
                  {e.target && ` · ${e.target}`}
                  {summary(e.details) && ` · ${summary(e.details)}`}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">Nothing yet.</p>
        )}
      </section>
    </AdminShell>
  );
}

// What a learner needs to do to open a Deep Dive course: finish what comes
// first, or unlock the paid chapters. Plain about what's free and what's paid.
import Link from "next/link";
import { endTestPurchasesAction, testPurchaseAction } from "@/app/actions/deep-dive";
import { Buggle } from "@/components/Buggle";
import type { Access, Gate } from "@/server/deep-dive";

const primary = "inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";
const outline = "inline-flex min-h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy hover:bg-lavender";

/** Finish this first: the Essentials before "What is AI", "What is AI" before the rest. */
export function GateNotice({ gate }: { gate: NonNullable<Gate> }) {
  return (
    <section aria-labelledby="gate-title" className="flex flex-wrap items-center gap-4 rounded-3xl bg-peach p-5 sm:p-6">
      <Buggle mood="thinking" size="sm" />
      <div className="min-w-0 flex-1">
        <h2 id="gate-title" className="text-lg font-bold">
          🔒 {gate.kind === "essentials" ? "Finish the Essentials first" : `Start with ${gate.title}`}
        </h2>
        <p className="mt-1 leading-relaxed text-ink">
          {gate.kind === "essentials"
            ? "The Deep Dive builds on the Essentials. Finish every Essentials module, then this course opens."
            : `${gate.title} is the starting point for every AI course here. Finish it, and this course opens.`}
        </p>
        <Link href={gate.href} className={`${primary} mt-3`}>
          {gate.kind === "essentials" ? "Go to the Essentials" : `Start ${gate.title}`} <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>
    </section>
  );
}

/** The paid chapters: what's free, what unlocking gives, and (on test sites) a test purchase. */
export function UnlockPanel({
  course,
  access,
  testing,
  signedIn,
}: {
  course: { id: string; slug: string; title: string };
  access: Access;
  testing: boolean;
  signedIn: boolean;
}) {
  if (access.entitled)
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-mint p-5">
        <p className="font-semibold text-navy">
          ✓ Unlocked {access.via === "all" ? "with all-access" : access.via === "org" ? "through your organisation" : "for good"}: every chapter is open.
        </p>
        {testing && (
          <form action={endTestPurchasesAction}>
            <input type="hidden" name="course" value={course.slug} />
            <button type="submit" className={outline}>
              Undo test purchase
            </button>
          </form>
        )}
      </section>
    );
  return (
    <section aria-labelledby="unlock-title" className="rounded-3xl border-2 border-brand/40 bg-white p-5 sm:p-6">
      <h2 id="unlock-title" className="text-lg font-bold">
        💳 Unlock the whole course
      </h2>
      <p className="mt-1 leading-relaxed text-ink">
        {access.freeChapters
          ? `The first ${access.freeChapters === 1 ? "chapter is" : `${access.freeChapters} chapters are`} free. Unlock the rest, and the certificate, with either:`
          : "Unlock every chapter and the certificate with either:"}
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        <li className="rounded-2xl bg-lavender p-4">
          <p className="font-bold text-navy">This course</p>
          <p className="text-sm text-ink">Pay once, keep it for good. Includes Ask AI, 20 questions a day.</p>
        </li>
        <li className="rounded-2xl bg-lavender p-4">
          <p className="font-bold text-navy">All-access</p>
          <p className="text-sm text-ink">Every Deep Dive course, monthly or yearly. Includes unlimited Ask AI.</p>
        </li>
      </ul>
      <p className="mt-2 text-sm text-muted">Learning with an organisation? Its Buggle content plan includes every course.</p>
      {!signedIn ? (
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/learn/${course.slug}`)}`} className={`${primary} mt-4`}>
          Log in to unlock
        </Link>
      ) : testing ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-line p-4">
          <p className="text-sm font-semibold text-ink">Test site: no real payment is taken.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <form action={testPurchaseAction}>
              <input type="hidden" name="course" value={course.slug} />
              <input type="hidden" name="courseId" value={course.id} />
              <button type="submit" className={primary}>
                Test purchase: this course
              </button>
            </form>
            <form action={testPurchaseAction}>
              <input type="hidden" name="course" value={course.slug} />
              <input type="hidden" name="what" value="all" />
              <button type="submit" className={outline}>
                Test all-access (30 days)
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-canvas p-4 text-sm text-ink">Buying opens soon. 🚀</p>
      )}
    </section>
  );
}

// What a learner needs to do to open a Deep Dive course: finish what comes
// first, or unlock the paid chapters. Plain about what's free and what's paid.
import Link from "next/link";
import { buyAllAccessAction, buyCourseAction, endTestPurchasesAction, testPurchaseAction } from "@/app/actions/deep-dive";
import { Buggle } from "@/components/Buggle";
import type { Access, Gate } from "@/server/deep-dive";
import { money, type Quote } from "@/server/pricing";

type Options = { course: Quote | null; month: Quote | null; year: Quote | null };
const REASON = { launch: "launch offer", sale: "sale", code: "code" } as const;

function Price({ q, per }: { q: Quote; per?: string }) {
  return (
    <span className="block">
      {q.percent > 0 && <span className="mr-2 text-sm text-ink line-through">{money(q.base, q.currency)}</span>}
      <span className="font-display text-2xl font-bold text-navy">{money(q.total, q.currency)}</span>
      {per && <span className="text-sm font-semibold text-navy"> {per}</span>}
      {q.percent > 0 && (
        <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-navy">
          {q.percent}% off: {REASON[q.reason!]}
          {q.reason !== "sale" && per ? ", first payment" : ""}
        </span>
      )}
    </span>
  );
}

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
  buy,
  live = false,
}: {
  course: { id: string; slug: string; title: string };
  access: Access;
  testing: boolean;
  signedIn: boolean;
  /** Prices with any automatic discount, when buying is switched on. */
  buy?: Options;
  /** Stripe is set up, so real (or Stripe test mode) payments can be taken. */
  live?: boolean;
}) {
  const canBuy = live && buy && (buy.course || buy.month || buy.year);
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
    <section id="unlock" aria-labelledby="unlock-title" className="scroll-mt-24 rounded-3xl border-2 border-brand/40 bg-white p-5 sm:p-6">
      <h2 id="unlock-title" className="text-lg font-bold">
        💳 Unlock the whole course
      </h2>
      <p className="mt-1 leading-relaxed text-ink">
        {access.freeChapters
          ? `The first ${access.freeChapters === 1 ? "chapter is" : `${access.freeChapters} chapters are`} free. Unlock the rest, and the certificate, with either:`
          : "Unlock every chapter and the certificate with either:"}
      </p>
      {canBuy && signedIn ? (
        <form className="mt-3 grid gap-3">
          <input type="hidden" name="course" value={course.slug} />
          <div className="grid gap-2 sm:grid-cols-2">
            {buy.course && (
              <div className="flex flex-col gap-2 rounded-2xl bg-lavender p-4">
                <p className="font-bold text-navy">This course</p>
                <p className="text-sm text-ink">Pay once, keep it for good. Includes Ask AI, 20 questions a day.</p>
                <Price q={buy.course} />
                <button type="submit" formAction={buyCourseAction} className={`${primary} mt-auto self-start`}>
                  Buy this course
                </button>
              </div>
            )}
            {(buy.month || buy.year) && (
              <div className="flex flex-col gap-2 rounded-2xl bg-lavender p-4">
                <p className="font-bold text-navy">All-access</p>
                <p className="text-sm text-ink">Every Deep Dive course. Includes unlimited Ask AI. Cancel any time.</p>
                {buy.month && <Price q={buy.month} per="a month" />}
                {buy.year && <Price q={buy.year} per="a year" />}
                <div className="mt-auto flex flex-wrap gap-2">
                  {buy.month && (
                    <button type="submit" name="interval" value="month" formAction={buyAllAccessAction} className={outline}>
                      Monthly
                    </button>
                  )}
                  {buy.year && (
                    <button type="submit" name="interval" value="year" formAction={buyAllAccessAction} className={primary}>
                      Yearly
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <label className="grid max-w-xs gap-1 text-sm font-semibold">
            Discount code <span className="font-normal text-muted">(optional)</span>
            <input name="code" maxLength={30} autoComplete="off" className="min-h-11 rounded-xl border-2 border-navy/30 bg-white px-3 py-2 text-base uppercase text-ink" />
          </label>
          <p className="text-sm text-muted">
            You&apos;ll see the price in your own currency at checkout. A bought course can be refunded until you start its paid chapters.
          </p>
        </form>
      ) : (
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
      )}
      <p className="mt-2 text-sm text-muted">Learning with an organisation? Its Buggle content plan includes every course.</p>
      <p className="mt-1 text-sm text-muted">🎁 Buying for a friend, or for your colleagues? That&apos;s coming soon.</p>
      {canBuy && signedIn ? null : !signedIn ? (
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

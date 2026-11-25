// Learners paying for the Deep Dive: one course (pay once, keep for good) or
// all-access (monthly or yearly), through Stripe Checkout. Stripe shows the
// price in the payer's own currency (Adaptive Pricing). Payments are only
// trusted once Stripe's signed notification (webhook) arrives.
import type Stripe from "stripe";
import { db } from "./database";
import { stripe } from "./payments";
import { learnerPrices, quote, countCodeUse, type Quote } from "./pricing";

type Fail = { error: string };
type Buyer = { id: string; email: string };

/** A Stripe coupon for a discount size, made once and reused. */
export async function couponFor(percent: number) {
  const [row] = await db()`SELECT coupon_id FROM stripe_coupons WHERE percent = ${percent}`;
  if (row) return row.coupon_id as string;
  const coupon = await stripe().coupons.create({ percent_off: percent, duration: "once", name: `${percent}% off` });
  await db()`INSERT INTO stripe_coupons(percent, coupon_id) VALUES(${percent}, ${coupon.id}) ON CONFLICT DO NOTHING`;
  return coupon.id;
}

async function customerFor(learner: string) {
  const [row] = await db()`SELECT stripe_customer_id FROM learner_billing WHERE learner_id = ${learner}`;
  return (row?.stripe_customer_id as string) ?? null;
}

async function deepDiveCourse(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const [row] = await db()`SELECT id, slug, title FROM courses WHERE slug = ${slug} AND kind = 'deep_dive' AND status = 'published' AND source = 'builder'`;
  return row ? { id: row.id as string, slug: row.slug as string, title: row.title as string } : null;
}

async function alreadyHas(learner: string, courseId: string | null) {
  const [row] = await db()`SELECT 1 FROM course_entitlements WHERE learner_id = ${learner}
    AND (course_id IS NULL OR course_id = ${courseId}) AND (ends_at IS NULL OR ends_at > now()) LIMIT 1`;
  return Boolean(row);
}

const discountNote = (q: Quote) => (q.reason === "code" ? q.code : q.reason);

/** Gives a course straight away when a code makes it free; nothing goes to Stripe. */
async function grantFree(learner: string, course: { id: string; title: string }, q: Quote) {
  const sql = db();
  await sql.begin(async (tx) => {
    const [p] = await tx`INSERT INTO purchases(learner_id, kind, course_id, course_title, amount_paid, currency, discount)
      VALUES(${learner}, 'course', ${course.id}, ${course.title}, 0, ${q.currency}, ${discountNote(q)}) RETURNING id`;
    await tx`INSERT INTO course_entitlements(learner_id, course_id, source, reference) VALUES(${learner}, ${course.id}, 'purchase', ${`free:${p.id}`})`;
  });
  if (q.code) await countCodeUse(q.code);
}

export async function startCourseCheckout(buyer: Buyer, slug: string, code: unknown, origin: string): Promise<Fail | { url: string }> {
  const course = await deepDiveCourse(slug);
  if (!course) return { error: "That course isn't available." };
  if (await alreadyHas(buyer.id, course.id)) return { error: "You already have this course." };
  const prices = await learnerPrices();
  if (!prices.course.active) return { error: "Buying courses opens soon." };
  const q = await quote(prices.course, "course", { learner: buyer.id }, code);
  if ("error" in q) return q;
  await db()`INSERT INTO learners(id) VALUES(${buyer.id}) ON CONFLICT DO NOTHING`;
  if (q.total === 0) {
    await grantFree(buyer.id, course, q);
    return { url: `${origin}/learn/${course.slug}?checkout=done` };
  }
  const customer = await customerFor(buyer.id);
  const meta = { kind: "course", learner_id: buyer.id, course_id: course.id, discount: discountNote(q) ?? "" };
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: buyer.id,
    ...(customer ? { customer } : { customer_email: buyer.email, customer_creation: "always" }),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: prices.course.currency,
          unit_amount: prices.course.amount,
          product_data: { name: `Buggle Learn: ${course.title}`, description: "Deep Dive course. Pay once, keep it for good, with its certificate." },
        },
      },
    ],
    ...(q.percent ? { discounts: [{ coupon: await couponFor(q.percent) }] } : {}),
    adaptive_pricing: { enabled: true },
    metadata: meta,
    payment_intent_data: { metadata: meta },
    success_url: `${origin}/learn/${course.slug}?checkout=done`,
    cancel_url: `${origin}/learn/${course.slug}?checkout=cancelled`,
  });
  return { url: session.url! };
}

export async function startAllAccessCheckout(buyer: Buyer, interval: unknown, code: unknown, origin: string, back = "/deep-dive"): Promise<Fail | { url: string }> {
  const every = interval === "month" ? "month" : "year";
  if (await alreadyHas(buyer.id, null)) return { error: "You already have all-access." };
  const prices = await learnerPrices();
  const price = every === "month" ? prices.all_month : prices.all_year;
  if (!price.active) return { error: "All-access opens soon." };
  const q = await quote(price, "all_access", { learner: buyer.id }, code);
  if ("error" in q) return q;
  await db()`INSERT INTO learners(id) VALUES(${buyer.id}) ON CONFLICT DO NOTHING`;
  const customer = await customerFor(buyer.id);
  const meta = { kind: "all_access", learner_id: buyer.id, interval: every, discount: discountNote(q) ?? "" };
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: buyer.id,
    ...(customer ? { customer } : { customer_email: buyer.email }),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: price.currency,
          unit_amount: price.amount,
          recurring: { interval: every },
          product_data: { name: "Buggle Learn all-access", description: "Every Deep Dive course and certificate, with unlimited Ask AI." },
        },
      },
    ],
    ...(q.percent ? { discounts: [{ coupon: await couponFor(q.percent) }] } : {}),
    adaptive_pricing: { enabled: true },
    metadata: meta,
    subscription_data: { metadata: meta },
    success_url: `${origin}${back}?checkout=done`,
    cancel_url: `${origin}${back}?checkout=cancelled`,
  });
  return { url: session.url! };
}

// ---------------------------------------------------------------------------
// Stripe notifications for learner payments

function periodEnd(subscription: Stripe.Subscription) {
  const fromItem = (subscription.items?.data?.[0] as { current_period_end?: number } | undefined)?.current_period_end;
  const fromSub = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const seconds = fromItem ?? fromSub;
  return seconds ? new Date(seconds * 1000) : null;
}

/** Handles a learner payment event. Returns false if the event isn't about one. */
export async function handleLearnerEvent(event: Stripe.Event): Promise<boolean> {
  const sql = db();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    if (meta.kind !== "course" && meta.kind !== "all_access") return false;
    const learner = meta.learner_id;
    if (!learner) return true;
    await sql`INSERT INTO learners(id) VALUES(${learner}) ON CONFLICT DO NOTHING`;
    const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (customer)
      await sql`INSERT INTO learner_billing(learner_id, stripe_customer_id) VALUES(${learner}, ${customer})
        ON CONFLICT (learner_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id`;
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (!paid) return true;
    if (meta.kind === "course") {
      const [course] = await sql`SELECT id, title FROM courses WHERE id = ${meta.course_id ?? null}`;
      if (!course) return true;
      const intent = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
      await sql.begin(async (tx) => {
        const [p] = await tx`INSERT INTO purchases(learner_id, kind, course_id, course_title, amount_paid, currency, discount, stripe_session_id, stripe_payment_intent)
          VALUES(${learner}, 'course', ${course.id}, ${course.title}, ${session.amount_total ?? 0}, ${session.currency ?? "usd"}, ${meta.discount || null}, ${session.id}, ${intent})
          ON CONFLICT (stripe_session_id) DO NOTHING RETURNING id`;
        if (p) await tx`INSERT INTO course_entitlements(learner_id, course_id, source, reference) VALUES(${learner}, ${course.id}, 'purchase', ${session.id}) ON CONFLICT DO NOTHING`;
      });
    } else {
      const subscription = typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);
      await sql`INSERT INTO purchases(learner_id, kind, interval, amount_paid, currency, discount, stripe_session_id, stripe_subscription_id)
        VALUES(${learner}, 'all_access', ${meta.interval ?? null}, ${session.amount_total ?? 0}, ${session.currency ?? "usd"}, ${meta.discount || null}, ${session.id}, ${subscription})
        ON CONFLICT (stripe_session_id) DO NOTHING`;
    }
    const discount = meta.discount;
    if (discount && discount !== "launch" && discount !== "sale") await countCodeUse(discount);
    return true;
  }
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    if (subscription.metadata?.kind !== "all_access") return false;
    const learner = subscription.metadata.learner_id;
    if (!learner) return true;
    await sql`INSERT INTO learners(id) VALUES(${learner}) ON CONFLICT DO NOTHING`;
    const live = ["active", "trialing", "past_due"].includes(subscription.status) && event.type !== "customer.subscription.deleted";
    // Paid-up time is kept to the end of the period; a cancelled one ends then.
    const ends = live ? (periodEnd(subscription) ?? new Date(Date.now() + 86400_000)) : new Date();
    await sql`INSERT INTO course_entitlements(learner_id, course_id, source, reference, ends_at)
      VALUES(${learner}, NULL, 'subscription', ${subscription.id}, ${ends})
      ON CONFLICT (reference) WHERE reference IS NOT NULL DO UPDATE SET ends_at = EXCLUDED.ends_at`;
    return true;
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (!intent) return false;
    const [p] = await sql`UPDATE purchases SET status = 'refunded', refunded_at = now() WHERE stripe_payment_intent = ${intent} AND kind = 'course'
      RETURNING stripe_session_id`;
    if (!p) return false;
    await sql`UPDATE course_entitlements SET ends_at = now() WHERE reference = ${p.stripe_session_id as string}`;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// The learner's own purchases, refunds and subscription

export async function myPurchases(learner: string) {
  const rows = await db()`SELECT p.id, p.kind, p.course_title, c.slug, p.interval, p.amount_paid, p.currency, p.discount, p.status, p.created_at,
      (SELECT max(e.ends_at) FROM course_entitlements e WHERE e.reference = p.stripe_subscription_id) AS sub_ends
    FROM purchases p LEFT JOIN courses c ON c.id = p.course_id WHERE p.learner_id = ${learner} ORDER BY p.created_at DESC`;
  return Promise.all(
    rows.map(async (r) => ({
      id: r.id as string,
      kind: r.kind as "course" | "all_access",
      title: r.kind === "all_access" ? `All-access, ${r.interval === "month" ? "monthly" : "yearly"}` : ((r.course_title as string) ?? "A course"),
      slug: (r.slug as string | null) ?? null,
      amount: r.amount_paid as number,
      currency: r.currency as string,
      discount: (r.discount as string | null) ?? null,
      status: r.status as "paid" | "refunded",
      at: new Date(r.created_at as Date).toISOString(),
      subEnds: r.sub_ends ? new Date(r.sub_ends as Date).toISOString() : null,
      refundable: r.kind === "course" && r.status === "paid" && (r.amount_paid as number) > 0 ? await refundable(learner, r.id as string) : false,
    })),
  );
}

/**
 * The refund rule: a bought course can be refunded until the learner has
 * started its paid part, that is, finished a paid unit or answered a check in one.
 */
export async function refundable(learner: string, purchaseId: string) {
  const [row] = await db()`
    SELECT p.created_at, p.course_id, c.free_chapters FROM purchases p JOIN courses c ON c.id = p.course_id
    WHERE p.id = ${purchaseId} AND p.learner_id = ${learner} AND p.kind = 'course' AND p.status = 'paid' AND p.stripe_payment_intent IS NOT NULL`;
  if (!row) return false;
  const [used] = await db()`
    WITH paid_items AS (
      SELECT i.id FROM course_items i JOIN course_sections s ON s.id = i.section_id
      WHERE i.course_id = ${row.course_id as string}
        AND (SELECT count(*) FROM course_sections s2 WHERE s2.course_id = s.course_id AND s2.position < s.position) >= ${row.free_chapters as number}
    )
    SELECT EXISTS (SELECT 1 FROM builder_completions d WHERE d.learner_id = ${learner} AND d.item_id IN (SELECT id FROM paid_items) AND d.completed_at >= ${row.created_at as Date})
      OR EXISTS (SELECT 1 FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id
                 WHERE t.learner_id = ${learner} AND a.item_id IN (SELECT id FROM paid_items) AND t.created_at >= ${row.created_at as Date}) AS used`;
  return !used.used;
}

export async function requestRefund(learner: string, purchaseId: string): Promise<Fail | { ok: true }> {
  if (!(await refundable(learner, purchaseId))) return { error: "This course can't be refunded any more: you've started its paid chapters." };
  const [p] = await db()`SELECT stripe_payment_intent, stripe_session_id FROM purchases WHERE id = ${purchaseId}`;
  await stripe().refunds.create({ payment_intent: p.stripe_payment_intent as string, reason: "requested_by_customer", metadata: { learner_id: learner } });
  await db()`UPDATE purchases SET status = 'refunded', refunded_at = now() WHERE id = ${purchaseId}`;
  await db()`UPDATE course_entitlements SET ends_at = now() WHERE reference = ${p.stripe_session_id as string}`;
  return { ok: true };
}

/** Stripe's page for the all-access card, invoices and cancelling. */
export async function learnerPortal(learner: string, origin: string): Promise<Fail | { url: string }> {
  const customer = await customerFor(learner);
  if (!customer) return { error: "There's nothing to manage yet." };
  const session = await stripe().billingPortal.sessions.create({ customer, return_url: `${origin}/account#purchases` });
  return { url: session.url };
}

/** What a learner can buy right now, with any automatic discount (launch offer or sale). */
export async function buyOptions(learner: string | null) {
  const prices = await learnerPrices();
  const who = { learner: learner ?? undefined };
  const one = async (p: { amount: number; currency: string; active: boolean }, buying: "course" | "all_access") => {
    if (!p.active) return null;
    const q = await quote(p, buying, who);
    return "error" in q ? null : q;
  };
  return { course: await one(prices.course, "course"), month: await one(prices.all_month, "all_access"), year: await one(prices.all_year, "all_access") };
}

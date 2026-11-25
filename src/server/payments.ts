// Organisation plans through Stripe: checkout, changing the number of places,
// the billing page, and Stripe's notifications (webhooks).
//
// Settings (Vercel): STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Use test-mode
// keys (sk_test_…) until Buggle Learn is ready to take real payments.
// Without them, test sites can simulate a plan so testers can try everything.
import Stripe from "stripe";
import { db } from "./database";
import { listPlans, orgBySubscription, setSubscription, type Organisation, type PlanCode } from "./organisations";

let client: Stripe | undefined;
export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not set up");
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY, { appInfo: { name: "Buggle Learn" } }));
}
/** Test sites without Stripe keys can switch a plan on without paying. Never on the live site. */
export const canSimulate = () => !stripeConfigured() && process.env.VERCEL_ENV !== "production";
export const testMode = () => (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");

export const MAX_SEATS = 10000;
export function parseSeats(raw: unknown, members = 0) {
  const seats = Number(raw);
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) return { error: `Choose between 1 and ${MAX_SEATS.toLocaleString("en")} places.` } as const;
  if (seats < members) return { error: `You have ${members} members, so you need at least ${members} places. Remove members first to go lower.` } as const;
  return { seats } as const;
}

async function planFor(code: unknown) {
  const plan = (await listPlans({ activeOnly: true })).find((p) => p.code === code);
  return plan ?? null;
}

/** Starts Stripe Checkout for a yearly plan. Returns the page to send the buyer to. */
export async function startCheckout(org: Organisation, input: { plan: unknown; seats: unknown }, buyer: { email: string }, origin: string) {
  const plan = await planFor(input.plan);
  if (!plan) return { error: "Choose one of the plans shown." } as const;
  const seats = parseSeats(input.seats, org.members);
  if ("error" in seats) return { error: seats.error } as const;
  if (org.stripeSubscriptionId && org.status !== "cancelled")
    return { error: "This organisation already has a plan. Change its places or manage billing below." } as const;
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: org.id,
    ...(org.stripeCustomerId ? { customer: org.stripeCustomerId } : { customer_email: buyer.email }),
    line_items: [
      {
        quantity: seats.seats,
        price_data: {
          currency: plan.currency,
          unit_amount: plan.pricePerSeatYear,
          recurring: { interval: "year" },
          product_data: { name: `Buggle Learn: ${plan.name}`, description: "Per learner, per year" },
        },
      },
    ],
    metadata: { org_id: org.id, plan: plan.code },
    subscription_data: { metadata: { org_id: org.id, plan: plan.code } },
    allow_promotion_codes: true,
    success_url: `${origin}/org/${org.slug}/billing?checkout=done`,
    cancel_url: `${origin}/org/${org.slug}/billing?checkout=cancelled`,
  });
  return { url: session.url! } as const;
}

/** Changes the number of places. Stripe charges or credits the difference for the rest of the year. */
export async function changeSeats(org: Organisation, raw: unknown) {
  const seats = parseSeats(raw, org.members);
  if ("error" in seats) return { error: seats.error } as const;
  if (org.status === "test") {
    await setSubscription(org.id, { seats: seats.seats, status: "test" });
    return { seats: seats.seats } as const;
  }
  if (!org.stripeSubscriptionId) return { error: "Choose a plan first." } as const;
  const subscription = await stripe().subscriptions.retrieve(org.stripeSubscriptionId);
  const item = subscription.items.data[0];
  await stripe().subscriptions.update(org.stripeSubscriptionId, {
    items: [{ id: item.id, quantity: seats.seats }],
    proration_behavior: "create_prorations",
  });
  await setSubscription(org.id, { seats: seats.seats, status: org.status });
  return { seats: seats.seats } as const;
}

/** Stripe's own page for cards, invoices and cancelling. */
export async function billingPortal(org: Organisation, origin: string) {
  if (!org.stripeCustomerId) return { error: "There's no billing account yet." } as const;
  const session = await stripe().billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${origin}/org/${org.slug}/billing`,
  });
  return { url: session.url } as const;
}

/** On a test site without Stripe: switches a plan on (or off) without payment. */
export async function simulatePlan(org: Organisation, input: { plan: unknown; seats: unknown }) {
  if (!canSimulate()) return { error: "Plans can only be simulated on a test site." } as const;
  const plan = await planFor(input.plan);
  if (!plan) return { error: "Choose one of the plans shown." } as const;
  const seats = parseSeats(input.seats, org.members);
  if ("error" in seats) return { error: seats.error } as const;
  await setSubscription(org.id, { plan: plan.code, seats: seats.seats, status: "test", periodEnd: new Date(Date.now() + 365 * 86400_000) });
  return { ok: true } as const;
}

// ---------------------------------------------------------------------------
// Webhooks

const statusFrom = (s: Stripe.Subscription.Status): Organisation["status"] =>
  s === "active" || s === "trialing" ? "active" : s === "past_due" || s === "unpaid" || s === "incomplete" ? "past_due" : "cancelled";

function periodEnd(subscription: Stripe.Subscription) {
  const fromItem = (subscription.items?.data?.[0] as { current_period_end?: number } | undefined)?.current_period_end;
  const fromSub = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const seconds = fromItem ?? fromSub;
  return seconds ? new Date(seconds * 1000) : null;
}

async function applySubscription(subscription: Stripe.Subscription, orgHint?: string | null) {
  const orgId = (subscription.metadata?.org_id as string) || orgHint || (await orgBySubscription(subscription.id));
  if (!orgId) return;
  const plan = subscription.metadata?.plan as PlanCode | undefined;
  const status = statusFrom(subscription.status);
  await setSubscription(orgId, {
    plan: status === "cancelled" ? undefined : (plan ?? undefined),
    seats: subscription.items?.data?.[0]?.quantity ?? undefined,
    status,
    customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    subscriptionId: subscription.id,
    periodEnd: periodEnd(subscription),
  });
}

/** Checks a webhook really came from Stripe, then handles it once. */
export async function handleWebhook(payload: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return { status: 400, error: "Missing signature" };
  let event: Stripe.Event;
  try {
    event = await Stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return { status: 400, error: "Bad signature" };
  }
  const [fresh] = await db()`INSERT INTO stripe_events(id, type) VALUES(${event.id}, ${event.type}) ON CONFLICT DO NOTHING RETURNING id`;
  if (!fresh) return { status: 200, duplicate: true };
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.client_reference_id ?? (session.metadata?.org_id as string | undefined);
      if (orgId && session.subscription) {
        const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await applySubscription(await stripe().subscriptions.retrieve(id), orgId);
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await applySubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    // Let Stripe try again later.
    await db()`DELETE FROM stripe_events WHERE id = ${event.id}`;
    throw error;
  }
  return { status: 200 };
}

// Prices, offers, discount codes, and learner payments through Stripe's
// signed notifications, against a real in-memory Postgres.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import Stripe from "stripe";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 60000 + Math.floor(Math.random() * 900);
const SECRET = "whsec_test_secret_for_pricing_tests";
let db: PGlite;
let server: PGLiteSocketServer;
let pricing: typeof import("../../src/server/pricing");
let payments: typeof import("../../src/server/payments");
let learnerPay: typeof import("../../src/server/learner-payments");
let builder: typeof import("../../src/server/builder");
let deep: typeof import("../../src/server/deep-dive");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.VERCEL_ENV;
  pricing = await import("../../src/server/pricing");
  payments = await import("../../src/server/payments");
  learnerPay = await import("../../src/server/learner-payments");
  builder = await import("../../src/server/builder");
  deep = await import("../../src/server/deep-dive");
});
after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

const admin = { kind: "admin" as const, email: "admin@example.com" };
function ok<T extends object>(value: T | { error: string }): T {
  if ("error" in value && value.error) throw new Error(value.error);
  return value as T;
}
async function person() {
  const id = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, 'Ada Obi', $2, true)`, [id, `${id}@example.com`]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return { id, email: `${id}@example.com` };
}
async function paidCourse(title: string) {
  const { id } = ok(await builder.createCourse(admin, title));
  const outline = (await builder.courseOutlineFor(admin, id))!;
  const ch2 = ok(await builder.addSection(admin, id, "Chapter two"));
  const units: string[] = [];
  for (const section of [outline.sections[0].id, ch2.id]) {
    const unit = ok(await builder.addItem(admin, section, `A unit ${section.slice(0, 4)}`));
    const block = ok(await builder.addBlock(admin, unit.id, "text"));
    const f = new FormData();
    f.set("body", "Read this.");
    ok(await builder.updateBlock(admin, block.id, f));
    units.push(unit.id);
  }
  ok(await builder.updateCourseType(admin, id, { kind: "deep_dive", foundation: false, freeChapters: "1", position: "2" }));
  ok(await builder.updateCourse(admin, id, { title, summary: "", status: "published" }));
  return { id, slug: (await builder.courseOutlineFor(admin, id))!.slug, units };
}
const send = async (event: object) => {
  const payload = JSON.stringify({ id: `evt_${randomUUID()}`, object: "event", ...event });
  return payments.handleWebhook(payload, Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET }));
};

describe("prices and offers", () => {
  test("prices start off, need at least 50 cents to switch on, and save", async () => {
    const start = await pricing.learnerPrices();
    assert.equal(start.course.active, false);
    const refused = await pricing.saveLearnerPrices({ course: { amount: "0.10", active: true }, all_month: { amount: "", active: false }, all_year: { amount: "", active: false } });
    assert.ok("error" in refused);
    ok(await pricing.saveLearnerPrices({ course: { amount: "$29", active: true }, all_month: { amount: "9.99", active: true }, all_year: { amount: "79", active: true } }));
    const p = await pricing.learnerPrices();
    assert.deepEqual([p.course.amount, p.all_month.amount, p.all_year.amount], [2900, 999, 7900]);
  });

  test("the launch offer is 20% off the first purchase only, and the biggest discount wins", async () => {
    const ada = await person();
    const base = { amount: 2900, currency: "usd" };
    let q = ok(await pricing.quote(base, "course", { learner: ada.id }));
    assert.deepEqual([q.percent, q.reason, q.total], [20, "launch", 2320]);

    ok(await pricing.saveCode({ code: "friends50", percent: "50", appliesTo: "course", expiresAt: "", maxUses: "" }));
    q = ok(await pricing.quote(base, "course", { learner: ada.id }, " Friends50 "));
    assert.deepEqual([q.percent, q.reason, q.code, q.total], [50, "code", "FRIENDS50", 1450]);
    assert.match((await pricing.quote(base, "all_access", { learner: ada.id }, "FRIENDS50") as { error: string }).error, /for something else/);
    assert.match((await pricing.quote(base, "course", { learner: ada.id }, "NOPE") as { error: string }).error, /isn't right/);

    const tomorrow = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
    ok(await pricing.saveOffers({ launchOn: true, launchPercent: "20", salePercent: "30", saleEndsAt: tomorrow }));
    q = ok(await pricing.quote(base, "org", { org: randomUUID() }));
    assert.deepEqual([q.percent, q.reason], [30, "sale"]);
    ok(await pricing.saveOffers({ launchOn: true, launchPercent: "20", salePercent: "0", saleEndsAt: "" }));

    await db.query(`INSERT INTO purchases(learner_id, kind, amount_paid) VALUES($1, 'course', 2320)`, [ada.id]);
    q = ok(await pricing.quote(base, "course", { learner: ada.id }));
    assert.equal(q.percent, 0, "no launch offer after the first purchase");
  });

  test("codes end, run out, and can be switched off", async () => {
    ok(await pricing.saveCode({ code: "ONCE", percent: "10", appliesTo: "any", expiresAt: "", maxUses: "1" }));
    assert.ok(!("error" in (await pricing.checkCode("ONCE", "org"))!));
    await pricing.countCodeUse("ONCE");
    assert.match(((await pricing.checkCode("ONCE", "org")) as { error: string }).error, /used up/);
    ok(await pricing.saveCode({ code: "OLD", percent: "10", appliesTo: "any", expiresAt: "2020-01-01", maxUses: "" }));
    assert.match(((await pricing.checkCode("OLD", "course")) as { error: string }).error, /ended/);
    ok(await pricing.saveCode({ code: "OFF", percent: "10", appliesTo: "any", expiresAt: "", maxUses: "" }));
    await pricing.setCodeActive("OFF", false);
    assert.ok("error" in (await pricing.checkCode("OFF", "course"))!);
    assert.ok("error" in (await pricing.saveCode({ code: "no spaces!", percent: "10", appliesTo: "any", expiresAt: "", maxUses: "" })));
  });
});

describe("learner payments", () => {
  test("a 100% code gives the course straight away, without Stripe", async () => {
    const course = await paidCourse("Free with a code");
    const chi = await person();
    ok(await pricing.saveCode({ code: "GIFT100", percent: "100", appliesTo: "course", expiresAt: "", maxUses: "" }));
    const out = ok(await learnerPay.startCourseCheckout(chi, course.slug, "GIFT100", "https://example.com"));
    assert.equal(out.url, `https://example.com/learn/${course.slug}?checkout=done`);
    assert.equal(await deep.entitlement(chi.id, course.id), "course");
    assert.match((await learnerPay.startCourseCheckout(chi, course.slug, "", "https://example.com") as { error: string }).error, /already have/);
  });

  test("a paid course: Stripe's notification opens it; it can be refunded until the paid part is started", async () => {
    const course = await paidCourse("Bought course");
    const ben = await person();
    const session = {
      object: "checkout.session",
      id: `cs_test_${randomUUID()}`,
      mode: "payment",
      payment_status: "paid",
      amount_total: 2320,
      currency: "usd",
      customer: "cus_test_ben",
      payment_intent: `pi_test_${randomUUID()}`,
      metadata: { kind: "course", learner_id: ben.id, course_id: course.id, discount: "launch" },
    };
    const event = { type: "checkout.session.completed", data: { object: session } };
    assert.equal((await send(event)).status, 200);
    assert.equal((await send(event)).status, 200, "the same payment twice opens it once");
    assert.equal(await deep.entitlement(ben.id, course.id), "course");
    const [purchase] = await learnerPay.myPurchases(ben.id);
    assert.deepEqual([purchase.kind, purchase.amount, purchase.refundable], ["course", 2320, true]);
    assert.equal((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM purchases WHERE learner_id = $1`, [ben.id])).rows[0].n, 1);

    // Using the free chapter keeps the refund open; finishing a paid unit closes it.
    await db.query(`INSERT INTO builder_completions(learner_id, item_id) VALUES($1, $2)`, [ben.id, course.units[0]]);
    assert.equal(await learnerPay.refundable(ben.id, purchase.id), true);
    await db.query(`INSERT INTO builder_completions(learner_id, item_id) VALUES($1, $2)`, [ben.id, course.units[1]]);
    assert.equal(await learnerPay.refundable(ben.id, purchase.id), false);

    // A refund made in Stripe locks the course again.
    await send({ type: "charge.refunded", data: { object: { object: "charge", id: "ch_test", payment_intent: session.payment_intent } } });
    assert.equal(await deep.entitlement(ben.id, course.id), null);
    assert.equal((await learnerPay.myPurchases(ben.id))[0].status, "refunded");
  });

  test("all-access follows the subscription: open while paid, closed once it ends", async () => {
    const course = await paidCourse("Any course");
    const dee = await person();
    const end = Math.floor(Date.now() / 1000) + 30 * 86400;
    const sub = (status: string) => ({
      object: "subscription",
      id: "sub_test_dee",
      status,
      customer: "cus_test_dee",
      metadata: { kind: "all_access", learner_id: dee.id, interval: "month" },
      items: { object: "list", data: [{ object: "subscription_item", id: "si_1", quantity: 1, current_period_end: end }] },
    });
    await send({ type: "customer.subscription.created", data: { object: sub("active") } });
    assert.equal(await deep.entitlement(dee.id, course.id), "all");
    await send({ type: "customer.subscription.deleted", data: { object: sub("canceled") } });
    assert.equal(await deep.entitlement(dee.id, course.id), null);
    // Organisation subscriptions are left to the organisation code.
    const orgEvent = await send({ type: "customer.subscription.updated", data: { object: { ...sub("active"), id: "sub_org", metadata: { org_id: randomUUID(), plan: "content" } } } });
    assert.equal(orgEvent.status, 200);
  });

  test("buying needs a price that's switched on", async () => {
    ok(await pricing.saveLearnerPrices({ course: { amount: "29", active: false }, all_month: { amount: "", active: false }, all_year: { amount: "", active: false } }));
    const course = await paidCourse("Not on sale");
    const eve = await person();
    assert.match((await learnerPay.startCourseCheckout(eve, course.slug, "", "https://example.com") as { error: string }).error, /opens soon/);
    assert.match((await learnerPay.startAllAccessCheckout(eve, "month", "", "https://example.com") as { error: string }).error, /opens soon/);
    const options = await learnerPay.buyOptions(eve.id);
    assert.deepEqual([options.course, options.month, options.year], [null, null, null]);
  });
});

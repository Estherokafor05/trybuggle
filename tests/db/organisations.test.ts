// Organisations, places and Stripe webhooks (step 9), against a real
// in-memory Postgres served over a socket.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import Stripe from "stripe";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 61000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let orgs: typeof import("../../src/server/organisations");
let payments: typeof import("../../src/server/payments");
const WEBHOOK_SECRET = "whsec_test_secret_for_unit_tests";

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.VERCEL_ENV;
  orgs = await import("../../src/server/organisations");
  payments = await import("../../src/server/payments");
});

after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

async function person(name = "Ada Obi") {
  const id = randomUUID();
  const email = `${id}@example.com`;
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, $2, $3, true)`, [id, name, email]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return { id, name, email };
}
function ok<T extends object>(value: T | { error: string }): T {
  if ("error" in value && value.error) throw new Error(value.error);
  return value as T;
}
const token = (path: string) => path.split("/").at(-1)!;

async function priced() {
  ok(await orgs.savePlan("content", { price: "24", currency: "usd", active: true }));
}

async function activeOrg(seats = 3) {
  await priced();
  const owner = await person("Olu Owner");
  const { slug } = ok(await orgs.createOrganisation(owner.id, "Sunrise School"));
  const { org } = (await orgs.orgForMember(slug, owner.id))!;
  ok(await payments.simulatePlan(org, { plan: "content", seats }));
  return { owner, slug, org: (await orgs.orgForMember(slug, owner.id))!.org };
}

describe("plans", () => {
  test("plans start switched off and need a price to go on", async () => {
    assert.equal((await orgs.listPlans({ activeOnly: true })).length, 0);
    assert.ok("error" in (await orgs.savePlan("content", { price: "0", currency: "usd", active: true })));
    assert.ok("error" in (await orgs.savePlan("content", { price: "10", currency: "dollars", active: true })));
    ok(await orgs.savePlan("content", { price: "$24.50", currency: "USD", active: true }));
    const [plan] = await orgs.listPlans({ activeOnly: true });
    assert.deepEqual([plan.code, plan.pricePerSeatYear, plan.currency], ["content", 2450, "usd"]);
    assert.equal(orgs.money(2450, "usd"), "$24.50");
    assert.deepEqual(orgs.planIncludes("platform"), { members: true, dashboard: true, branding: true, deepDive: false, ownCourses: true });
  });
});

describe("organisations", () => {
  test("creating one makes you the owner, with a tidy unique address", async () => {
    const a = await person();
    const b = await person();
    const first = ok(await orgs.createOrganisation(a.id, "  Café Délice Ltd  "));
    assert.equal(first.slug, "cafe-delice-ltd");
    const second = ok(await orgs.createOrganisation(b.id, "Café Délice Ltd"));
    assert.notEqual(second.slug, first.slug);
    assert.equal((await orgs.orgForMember(first.slug, a.id))?.role, "owner");
    assert.equal(await orgs.orgForMember(first.slug, b.id), null, "not a member, no access");
    assert.ok("error" in (await orgs.createOrganisation(a.id, "X")));
  });

  test("no members can be added until a plan is active", async () => {
    const owner = await person();
    const { slug } = ok(await orgs.createOrganisation(owner.id, "No Plan Yet"));
    const { org } = (await orgs.orgForMember(slug, owner.id))!;
    assert.equal(orgs.isActive(org), false);
    assert.ok("error" in (await orgs.inviteMember(org.id, owner.id, "someone@example.com", "member")));
  });

  test("invites work once, only for their email, and respect places", async () => {
    const { owner, slug, org } = await activeOrg(3);
    const ben = await person("Ben Lee");
    const cy = await person("Cy Day");
    const invite = ok(await orgs.inviteMember(org.id, owner.id, ben.email.toUpperCase(), "member"));
    assert.equal(invite.email, ben.email);
    assert.ok("error" in (await orgs.acceptJoin(token(invite.path), { id: cy.id, email: cy.email })), "someone else can't use it");
    const joined = ok(await orgs.acceptJoin(token(invite.path), { id: ben.id, email: ben.email }));
    assert.deepEqual(joined, { slug, already: false });
    assert.ok("error" in (await orgs.acceptJoin(token(invite.path), { id: ben.id, email: ben.email })), "used up");
    assert.ok("error" in (await orgs.inviteMember(org.id, owner.id, ben.email, "member")), "already a member");

    // 3 places: owner + Ben, so one invite left; a second pending invite is refused.
    ok(await orgs.inviteMember(org.id, owner.id, "first@example.com", "member"));
    assert.ok("error" in (await orgs.inviteMember(org.id, owner.id, "second@example.com", "member")));
  });

  test("a join link fills places and stops when they're full or it's switched off", async () => {
    const { owner, org } = await activeOrg(2);
    const path = await orgs.newJoinLink(org.id);
    const ben = await person();
    const cy = await person();
    ok(await orgs.acceptJoin(token(path), { id: ben.id, email: ben.email }));
    const full = await orgs.acceptJoin(token(path), { id: cy.id, email: cy.email });
    assert.match((full as { error: string }).error, /no free places/);
    const newer = await orgs.newJoinLink(org.id);
    assert.equal(await orgs.findJoin(token(path)), null, "the old link stops working");
    await orgs.stopJoinLink(org.id);
    assert.equal(await orgs.findJoin(token(newer)), null);
    void owner;
  });

  test("only owners make managers; owners can't be removed; members can leave", async () => {
    const { owner, org } = await activeOrg(5);
    const mgr = await person("Mia Manager");
    const mem = await person("Max Member");
    for (const p of [mgr, mem]) ok(await orgs.acceptJoin(token(await orgs.newJoinLink(org.id)), { id: p.id, email: p.email }));
    ok(await orgs.setRole(org.id, "owner", mgr.id, "manager"));
    assert.ok("error" in (await orgs.setRole(org.id, "manager", mem.id, "manager")), "managers can't make managers");
    assert.ok("error" in (await orgs.setRole(org.id, "owner", owner.id, "member")), "the owner stays owner");
    assert.ok("error" in (await orgs.removeMember(org.id, { id: mgr.id, role: "manager" }, owner.id)));
    ok(await orgs.removeMember(org.id, { id: mem.id, role: "member" }, mem.id));
    assert.equal((await orgs.orgById(org.id))?.members, 2);
  });

  test("the team dashboard shows each member's progress and certificate", async () => {
    const { owner, org } = await activeOrg(5);
    const ben = await person("Ben Lee");
    ok(await orgs.acceptJoin(token(await orgs.newJoinLink(org.id)), { id: ben.id, email: ben.email }));
    await db.query(
      `INSERT INTO assessment_attempts(id,learner_id,lesson_slug,assessment_version,submission_key,answers,question_count,correct_count,feedback)
       VALUES(gen_random_uuid(),$1,'what-counts-as-ai',1,gen_random_uuid(),'{}',5,5,'[]')`,
      [ben.id],
    );
    await db.query(
      `INSERT INTO certificates(id,code,learner_id,kind,module_slug,learner_name,completed_on,requirements)
       VALUES(gen_random_uuid(),'BL-E-BENC-ERTS',$1,'essentials',NULL,'Ben Lee','2026-11-01','[]')`,
      [ben.id],
    );
    const rows = await orgs.memberProgress(org.id);
    assert.deepEqual(rows.map((r) => r.role), ["owner", "member"]);
    const benRow = rows.find((r) => r.id === ben.id)!;
    assert.equal(benRow.done, 1);
    assert.equal(benRow.total, 12);
    assert.equal(benRow.certificate, "BL-E-BENC-ERTS");
    assert.ok(benRow.lastActive);
    void owner;
  });

  test("content plans give members the Deep Dive; platform plans don't", async () => {
    const { org } = await activeOrg(5);
    const ben = await person();
    ok(await orgs.acceptJoin(token(await orgs.newJoinLink(org.id)), { id: ben.id, email: ben.email }));
    assert.equal(await orgs.deepDiveThroughOrg(ben.id), true);
    await orgs.setSubscription(org.id, { plan: "platform", status: "test" });
    assert.equal(await orgs.deepDiveThroughOrg(ben.id), false);
  });

  test("logos must really be images and small", async () => {
    const { org } = await activeOrg();
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])], "logo.png", { type: "image/png" });
    const fake = new File([new TextEncoder().encode("<svg onload=alert(1)>")], "logo.png", { type: "image/png" });
    assert.ok("error" in (await orgs.saveSettings(org.id, { name: "Sunrise School", logo: fake })));
    ok(await orgs.saveSettings(org.id, { name: "Sunrise School", logo: png }));
    assert.equal((await orgs.logo(org.id))?.type, "image/png");
    ok(await orgs.saveSettings(org.id, { name: "Sunrise School", removeLogo: true }));
    assert.equal(await orgs.logo(org.id), null);
  });

  test("places can't go below the number of members", async () => {
    const { org } = await activeOrg(3);
    assert.ok("error" in payments.parseSeats(0));
    assert.ok("error" in payments.parseSeats(2.5));
    assert.ok("error" in payments.parseSeats(1, 2));
    const changed = await payments.changeSeats(org, 10);
    assert.equal("seats" in changed && changed.seats, 10);
  });

  test("an owner with members can't just delete their account; an empty organisation goes with them", async () => {
    const { owner } = await activeOrg();
    assert.deepEqual(await orgs.soleOwnerOf(owner.id), ["Sunrise School"]);
    const solo = await person();
    const { slug } = ok(await orgs.createOrganisation(solo.id, "Just Me"));
    assert.deepEqual(await orgs.soleOwnerOf(solo.id), []);
    await orgs.deleteEmptyOrganisations(solo.id);
    assert.equal(await orgs.orgForMember(slug, solo.id), null);
  });
});

describe("Stripe webhooks", () => {
  const sign = (payload: string, secret = WEBHOOK_SECRET) => Stripe.webhooks.generateTestHeaderString({ payload, secret });
  const subscriptionEvent = (orgId: string, status: string, quantity: number, id = `evt_${randomUUID()}`) =>
    JSON.stringify({
      id,
      object: "event",
      type: status === "canceled" ? "customer.subscription.deleted" : "customer.subscription.updated",
      data: {
        object: {
          id: "sub_test_123",
          object: "subscription",
          status,
          customer: "cus_test_123",
          metadata: { org_id: orgId, plan: "content" },
          items: { data: [{ id: "si_1", quantity, current_period_end: Math.floor(Date.now() / 1000) + 365 * 86400 }] },
        },
      },
    });

  test("only signed events count", async () => {
    const owner = await person();
    const { slug } = ok(await orgs.createOrganisation(owner.id, "Webhook Co"));
    const { org } = (await orgs.orgForMember(slug, owner.id))!;
    const payload = subscriptionEvent(org.id, "active", 12);
    assert.equal((await payments.handleWebhook(payload, null)).status, 400);
    assert.equal((await payments.handleWebhook(payload, sign(payload, "whsec_wrong"))).status, 400);
    assert.equal((await orgs.orgById(org.id))?.status, "none");
  });

  test("a subscription turns the plan on, updates places, and cancelling turns it off; each event once", async () => {
    const owner = await person();
    const { slug } = ok(await orgs.createOrganisation(owner.id, "Paying Co"));
    const { org } = (await orgs.orgForMember(slug, owner.id))!;
    const started = subscriptionEvent(org.id, "active", 12);
    assert.equal((await payments.handleWebhook(started, sign(started))).status, 200);
    let now = (await orgs.orgById(org.id))!;
    assert.deepEqual([now.status, now.plan, now.seats, now.stripeSubscriptionId, now.stripeCustomerId], ["active", "content", 12, "sub_test_123", "cus_test_123"]);
    assert.ok(now.periodEnd);

    const again = await payments.handleWebhook(started, sign(started));
    assert.equal((again as { duplicate?: boolean }).duplicate, true, "the same event is handled once");

    const pastDue = subscriptionEvent(org.id, "past_due", 12);
    await payments.handleWebhook(pastDue, sign(pastDue));
    assert.equal((await orgs.orgById(org.id))!.status, "past_due");
    assert.equal(orgs.isActive((await orgs.orgById(org.id))!), true, "members keep learning while a payment is retried");

    const cancelled = subscriptionEvent(org.id, "canceled", 12);
    await payments.handleWebhook(cancelled, sign(cancelled));
    now = (await orgs.orgById(org.id))!;
    assert.equal(now.status, "cancelled");
    assert.equal(orgs.isActive(now), false);
  });

  test("plans can't be simulated on the live site", async () => {
    process.env.VERCEL_ENV = "production";
    try {
      assert.equal(payments.canSimulate(), false);
      const owner = await person();
      const { slug } = ok(await orgs.createOrganisation(owner.id, "Live Co"));
      const { org } = (await orgs.orgForMember(slug, owner.id))!;
      assert.ok("error" in (await payments.simulatePlan(org, { plan: "content", seats: 5 })));
    } finally {
      delete process.env.VERCEL_ENV;
    }
  });
});

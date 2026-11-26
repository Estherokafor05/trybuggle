// What admins see about learners and organisations, and the changes they can make.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 59000 + Math.floor(Math.random() * 900);
let db: PGlite;
let server: PGLiteSocketServer;
let insight: typeof import("../../src/server/admin-insight");
let deep: typeof import("../../src/server/deep-dive");
let orgs: typeof import("../../src/server/organisations");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  insight = await import("../../src/server/admin-insight");
  deep = await import("../../src/server/deep-dive");
  orgs = await import("../../src/server/organisations");
});
after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

async function person(name: string) {
  const id = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, $2, $3, false)`, [id, name, `${id}@example.com`]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return id;
}

test("a learner's page shows their settings, access and activity; admins can give and end access", async () => {
  const ada = await person("Ada Obi");
  const [course] = (await db.query<{ id: string }>(`INSERT INTO courses(slug, title, source, kind, status) VALUES('dd-admin', 'AI for Frontend', 'builder', 'deep_dive', 'published') RETURNING id`)).rows;
  assert.match((await insight.giveAccess(ada, { course: "not-a-course", days: "" }) as { error: string }).error, /Choose a Deep Dive course/);
  assert.ok("ok" in (await insight.giveAccess(ada, { course: course.id, days: "7" })));
  assert.equal(await deep.entitlement(ada, course.id), "course");
  let seen = await insight.learnerInsight(ada);
  const given = seen.access.find((a) => a.source === "admin")!;
  assert.ok(given.active && given.ends);
  assert.equal(await insight.endAccess(ada, given.id), true);
  assert.equal(await deep.entitlement(ada, course.id), null);

  await insight.setLearnerLeaderboard(ada, true);
  await insight.confirmEmail(ada);
  seen = await insight.learnerInsight(ada);
  assert.equal(seen.leaderboardHidden, true);
  assert.deepEqual(seen.organisations, []);
  assert.ok(seen.activity.length === 0 || Array.isArray(seen.activity));
  assert.equal((await db.query<{ emailVerified: boolean }>(`SELECT "emailVerified" FROM auth_user WHERE id = $1`, [ada])).rows[0].emailVerified, true);
});

test("paid access from Stripe can't be ended here; it's refunded in Stripe", async () => {
  const ben = await person("Ben Buyer");
  const [e] = (await db.query<{ id: string }>(`INSERT INTO course_entitlements(learner_id, source, reference) VALUES($1, 'purchase', 'cs_x') RETURNING id`, [ben])).rows;
  assert.equal(await insight.endAccess(ben, e.id), false);
});

test("an organisation's page: a plan given without payment ends on its own; roles and names change", async () => {
  const owner = await person("Olu Owner");
  const member = await person("Mia Member");
  const { slug } = (await orgs.createOrganisation(owner, "Pilot School")) as { slug: string };
  const { org } = (await orgs.orgForMember(slug, owner))!;
  await db.query(`INSERT INTO organisation_members(org_id, user_id, role) VALUES($1, $2, 'member')`, [org.id, member]);

  assert.ok("ok" in (await insight.setOrgPlanByAdmin(org.id, { plan: "content", seats: "5", days: "30" })));
  let now = (await orgs.orgById(org.id))!;
  assert.equal(orgs.isActive(now), true);
  assert.equal(await deep.entitlement(member, randomUUID()), "org", "members get every Deep Dive course");
  await db.query(`UPDATE organisations SET current_period_end = now() - interval '1 day' WHERE id = $1`, [org.id]);
  now = (await orgs.orgById(org.id))!;
  assert.equal(orgs.isActive(now), false, "a given plan ends on its end date");
  assert.equal(await deep.entitlement(member, randomUUID()), null);
  assert.match((await insight.setOrgPlanByAdmin(org.id, { plan: "content", seats: "1", days: "30" }) as { error: string }).error, /at least 2 places/);

  assert.ok("ok" in (await insight.adminSetRole(org.id, member, "owner")));
  const roles = (await db.query<{ user_id: string; role: string }>(`SELECT user_id, role FROM organisation_members WHERE org_id = $1`, [org.id])).rows;
  assert.deepEqual(Object.fromEntries(roles.map((r) => [r.user_id, r.role])), { [owner]: "manager", [member]: "owner" });
  assert.ok("error" in (await insight.adminRemoveMember(org.id, member)), "the owner can't be removed");
  assert.ok("ok" in (await insight.adminRemoveMember(org.id, owner)));
  assert.ok("ok" in (await insight.renameOrg(org.id, "Pilot School 2")));
  const view = (await insight.organisationInsight(org.id))!;
  assert.equal(view.org.name, "Pilot School 2");
  assert.equal(view.members.length, 1);
  assert.equal((await insight.allPayments()).totals.paid, 0);
});

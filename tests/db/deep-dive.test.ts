// The Deep Dive: what opens when, the free first chapter, paid chapters,
// test purchases, organisation access and course certificates.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 65000 + Math.floor(Math.random() * 400);
let db: PGlite;
let server: PGLiteSocketServer;
let builder: typeof import("../../src/server/builder");
let learn: typeof import("../../src/server/builder-learn");
let deep: typeof import("../../src/server/deep-dive");
let certs: typeof import("../../src/server/certificates");
let progression: typeof import("../../src/server/progression");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  delete process.env.VERCEL_ENV;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.ESSENTIALS_REQUIRE_ALL;
  builder = await import("../../src/server/builder");
  learn = await import("../../src/server/builder-learn");
  deep = await import("../../src/server/deep-dive");
  certs = await import("../../src/server/certificates");
  progression = await import("../../src/server/progression");
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
async function person(name = "Ada Obi") {
  const id = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, $2, $3, true)`, [id, name, `${id}@example.com`]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return id;
}
/** Passes every built Essentials step, so the Essentials is finished. */
async function finishEssentials(learner: string) {
  for (const step of progression.coursePath()) {
    if (step.kind === "final")
      await db.query(
        `INSERT INTO module_assessment_attempts(id, learner_id, module_slug, assessment_version, submission_key, answers, question_count, correct_count, feedback, pass_percent)
         VALUES($1, $2, $3, 1, $4, '{}', 5, 5, '[]', 70)`,
        [randomUUID(), learner, step.moduleSlug, randomUUID()],
      );
    else {
      await db.query(`INSERT INTO learning_lessons(slug, title) VALUES($1, $1) ON CONFLICT DO NOTHING`, [step.id]);
      await db.query(
        `INSERT INTO assessment_attempts(id, learner_id, lesson_slug, assessment_version, submission_key, answers, correct_count, question_count, feedback, pass_percent)
         VALUES($1, $2, $3, 1, $4, '{}', 5, 5, '[]', 70)`,
        [randomUUID(), learner, step.id, randomUUID()],
      );
    }
  }
}
/** A published Deep Dive course with two chapters of one unit each. */
async function deepCourse(title: string, { foundation = false, free = 0 } = {}) {
  const { id } = ok(await builder.createCourse(admin, title));
  const outline = (await builder.courseOutlineFor(admin, id))!;
  const ch2 = ok(await builder.addSection(admin, id, "Chapter two"));
  const units: string[] = [];
  for (const section of [outline.sections[0].id, ch2.id]) {
    const unit = ok(await builder.addItem(admin, section, `Unit in ${section.slice(0, 4)}`));
    const block = ok(await builder.addBlock(admin, unit.id, "text"));
    const f = new FormData();
    f.set("body", "Something to read.");
    ok(await builder.updateBlock(admin, block.id, f));
    units.push(unit.id);
  }
  ok(await builder.updateCourseType(admin, id, { kind: "deep_dive", foundation, freeChapters: String(free), position: "1" }));
  ok(await builder.updateCourse(admin, id, { title, summary: "", status: "published" }));
  const slug = (await builder.courseOutlineFor(admin, id))!.slug;
  return { id, slug, units };
}
type View = Exclude<Awaited<ReturnType<typeof import("../../src/server/builder-learn").courseForLearner>>, null | { signInNeeded: true }>;
const view = async (slug: string, user: string) => (await learn.courseForLearner(slug, user)) as View;

let whatIsAi: Awaited<ReturnType<typeof deepCourse>>;
let frontend: Awaited<ReturnType<typeof deepCourse>>;

describe("the Deep Dive", () => {
  test("only Buggle Learn admins set course types, and there is one 'What is AI'", async () => {
    whatIsAi = await deepCourse("What is AI", { foundation: true, free: 1 });
    frontend = await deepCourse("AI for Frontend");
    const team = { kind: "org" as const, orgId: randomUUID(), userId: randomUUID() };
    assert.match((await builder.updateCourseType(team, whatIsAi.id, { kind: "deep_dive", foundation: true, freeChapters: "1", position: "1" }) as { error: string }).error, /Only Buggle Learn/);
    const other = await deepCourse("Another start", { foundation: true });
    assert.equal((await deep.foundationCourse())?.slug, other.slug, "setting a new one replaces the old one");
    ok(await builder.updateCourseType(admin, whatIsAi.id, { kind: "deep_dive", foundation: true, freeChapters: "1", position: "1" }));
    ok(await builder.updateCourseType(admin, other.id, { kind: "deep_dive", foundation: false, freeChapters: "0", position: "5" }));
    assert.equal((await deep.foundationCourse())?.slug, whatIsAi.slug);
    // Deep Dive courses are listed in the Deep Dive, not with the free short courses.
    assert.ok(!(await learn.visibleCourses(null)).some((c) => c.slug === whatIsAi.slug));
    assert.equal((await deep.catalogue(null))[0].slug, whatIsAi.slug, "What is AI comes first");
  });

  test("What is AI opens after the Essentials; its first chapter is free and the rest is paid", async () => {
    const ada = await person();
    let v = await view(whatIsAi.slug, ada);
    assert.equal(v.access?.gate?.kind, "essentials");
    assert.deepEqual(v.lessons.map((l) => l.state), ["locked", "locked"]);

    await finishEssentials(ada);
    v = await view(whatIsAi.slug, ada);
    assert.equal(v.access?.gate, null);
    assert.deepEqual(v.lessons.map((l) => [l.state, l.paid]), [["open", false], ["locked", true]]);
    assert.equal(await learn.markDone(whatIsAi.slug, whatIsAi.units[0], ada), true);
    v = await view(whatIsAi.slug, ada);
    assert.deepEqual(v.lessons.map((l) => l.state), ["done", "paid"]);
    assert.equal(await learn.markDone(whatIsAi.slug, whatIsAi.units[1], ada), false, "the paid chapter can't be finished without unlocking");

    // Other AI courses wait for What is AI.
    const fe = await view(frontend.slug, ada);
    assert.equal(fe.access?.gate?.kind, "foundation");
    assert.equal(fe.access?.gate?.title, "What is AI");

    // A test purchase (test sites only) opens the rest for good.
    assert.equal(deep.canTestPurchase(), true);
    assert.equal(await deep.testPurchase(ada, { courseId: whatIsAi.id }), true);
    v = await view(whatIsAi.slug, ada);
    assert.equal(v.access?.via, "course");
    assert.deepEqual(v.lessons.map((l) => l.state), ["done", "open"]);
    assert.equal(await learn.markDone(whatIsAi.slug, whatIsAi.units[1], ada), true);
    assert.equal(await deep.finishedCourse(ada, whatIsAi.id), true);

    // Now the other courses open, but they're paid (no free chapters) until bought.
    const after = await view(frontend.slug, ada);
    assert.equal(after.access?.gate, null);
    assert.deepEqual(after.lessons.map((l) => l.state), ["paid", "locked"]);
    await deep.testPurchase(ada, "all");
    assert.equal((await view(frontend.slug, ada)).access?.via, "all");
    await deep.endTestPurchases(ada);
    assert.equal((await view(frontend.slug, ada)).access?.entitled, false);
  });

  test("an organisation's Buggle content plan opens every course for its members", async () => {
    const ben = await person("Ben Member");
    const [org] = (await db.query<{ id: string }>(`INSERT INTO organisations(slug, name, plan, seats, status) VALUES('content-org', 'Content Org', 'content', 5, 'test') RETURNING id`)).rows;
    await db.query(`INSERT INTO organisation_members(org_id, user_id, role) VALUES($1, $2, 'member')`, [org.id, ben]);
    assert.equal(await deep.entitlement(ben, frontend.id), "org");
  });

  test("test purchases never work on the live site", async () => {
    process.env.VERCEL_ENV = "production";
    try {
      assert.equal(deep.canTestPurchase(), false);
      assert.equal(await deep.testPurchase(await person(), "all"), false);
    } finally {
      delete process.env.VERCEL_ENV;
    }
  });

  test("each finished course gives its own certificate, which anyone can check", async () => {
    const chi = await person("Chi Learner");
    await finishEssentials(chi);
    await deep.testPurchase(chi, { courseId: whatIsAi.id });
    const early = await certs.issueCourseCertificate(chi, whatIsAi.slug, "Chi Learner");
    assert.match((early as { error: string }).error, /Finish every unit/);
    for (const unit of whatIsAi.units) assert.equal(await learn.markDone(whatIsAi.slug, unit, chi), true);
    const issued = await certs.issueCourseCertificate(chi, whatIsAi.slug, "Chi Learner");
    assert.ok("certificate" in issued);
    assert.match(issued.certificate!.code, /^BL-D-/);
    const again = await certs.issueCourseCertificate(chi, whatIsAi.slug, "Someone Else");
    assert.ok("certificate" in again && again.certificate!.code === issued.certificate!.code, "one per course");
    const check = await certs.verifyCertificate(issued.certificate!.code);
    assert.equal(check?.title, "What is AI");
    assert.equal(check?.learnerName, "Chi Learner");
    assert.equal(await certs.courseCertificateStatus(chi, "not-a-course"), null);
  });
});

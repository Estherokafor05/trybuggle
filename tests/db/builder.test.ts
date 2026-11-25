// The lesson builder and builder courses for learners, against a real
// in-memory Postgres served over a socket.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 62000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let builder: typeof import("../../src/server/builder");
let learn: typeof import("../../src/server/builder-learn");
let editor: typeof import("../../src/server/question-editor");
let orgs: typeof import("../../src/server/organisations");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  builder = await import("../../src/server/builder");
  learn = await import("../../src/server/builder-learn");
  editor = await import("../../src/server/question-editor");
  orgs = await import("../../src/server/organisations");
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
const form = (fields: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
async function textBlock(itemId: string, body: string, who: import("../../src/server/builder").Builder = admin) {
  const { id } = ok(await builder.addBlock(who, itemId, "text"));
  ok(await builder.updateBlock(who, id, form({ heading: "", body })));
  return id;
}
const question = (key: string) => ({
  key,
  prompt: `Which one is right for ${key}?`,
  options: [
    { id: "a", text: "The right one" },
    { id: "b", text: "A wrong one" },
  ],
  correct: "a",
  explanation: "Because it is the right one, as the lesson said.",
});

/** A published admin course: module 1 has a lesson with a check, then a plain lesson. */
async function publishedCourse(title = "Spotting scams") {
  const { id } = ok(await builder.createCourse(admin, title));
  const outline = (await builder.courseOutlineFor(admin, id))!;
  const sectionId = outline.sections[0].id;
  const first = ok(await builder.addItem(admin, sectionId, "What a scam looks like"));
  await textBlock(first.id, "Scams rush you.");
  const check = (await builder.ensureCheck(admin, first.id, 2))!;
  await editor.saveQuestions(check, admin.email, [question("q1"), question("q2")]);
  const second = ok(await builder.addItem(admin, sectionId, "What to do next"));
  await textBlock(second.id, "Stop and check.");
  ok(await builder.updateCourse(admin, id, { title, summary: "Stay safe.", status: "published" }));
  const slug = (await builder.courseOutlineFor(admin, id))!.slug;
  return { id, slug, first: first.id, second: second.id, check };
}

describe("building a course", () => {
  test("a new course is a draft with one module, and needs content before publishing", async () => {
    const { id } = ok(await builder.createCourse(admin, "Money and AI"));
    const outline = (await builder.courseOutlineFor(admin, id))!;
    assert.equal(outline.slug, "money-and-ai");
    assert.equal(outline.status, "draft");
    assert.deepEqual(outline.sections.map((s) => s.title), ["Module 1"]);
    const refused = await builder.updateCourse(admin, id, { title: "Money and AI", summary: "", status: "published" });
    assert.match((refused as { error: string }).error, /at least one lesson/);
    assert.ok("error" in (await builder.createCourse(admin, "ab")));
    // A second course with the same title still gets its own address.
    const again = ok(await builder.createCourse(admin, "Money and AI"));
    assert.notEqual((await builder.courseOutlineFor(admin, again.id))!.slug, "money-and-ai");
  });

  test("blocks are checked and stored as plain values", async () => {
    const { id } = ok(await builder.createCourse(admin, "Blocks course"));
    const section = (await builder.courseOutlineFor(admin, id))!.sections[0].id;
    const item = ok(await builder.addItem(admin, section, "All the blocks"));

    const video = ok(await builder.addBlock(admin, item.id, "video"));
    assert.match((await builder.updateBlock(admin, video.id, form({ url: "https://example.com/video" })) as { error: string }).error, /YouTube or Vimeo/);
    ok(await builder.updateBlock(admin, video.id, form({ url: "https://youtu.be/dQw4w9WgXcQ", title: "Intro" })));

    const link = ok(await builder.addBlock(admin, item.id, "link"));
    assert.ok("error" in (await builder.updateBlock(admin, link.id, form({ url: "javascript:alert(1)" }))));
    ok(await builder.updateBlock(admin, link.id, form({ url: "https://example.com/guide.pdf", label: "The guide" })));

    const image = ok(await builder.addBlock(admin, item.id, "image"));
    const fake = new File([new TextEncoder().encode("<svg onload=alert(1)>")], "x.png", { type: "image/png" });
    assert.match((await builder.updateBlock(admin, image.id, form({ alt: "A chart", file: fake })) as { error: string }).error, /PNG, JPEG/);
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])], "x.png", { type: "image/png" });
    assert.match((await builder.updateBlock(admin, image.id, form({ alt: "", file: png })) as { error: string }).error, /alt text/);
    ok(await builder.updateBlock(admin, image.id, form({ alt: "A chart", file: png })));

    const tip = ok(await builder.addBlock(admin, item.id, "tip"));
    ok(await builder.updateBlock(admin, tip.id, form({ tone: "warning", body: "Never share codes." })));

    const lesson = (await builder.lessonFor(admin, item.id))!;
    assert.deepEqual(lesson.blocks.map((b) => b.kind), ["video", "link", "image", "tip"]);
    assert.equal(lesson.blocks[0].data.embed, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    const media = (await builder.media(lesson.blocks[2].data.mediaId))!;
    assert.equal(media.type, "image/png");

    await builder.moveBlock(admin, tip.id, "up");
    assert.deepEqual((await builder.lessonFor(admin, item.id))!.blocks.map((b) => b.kind), ["video", "link", "tip", "image"]);
    await builder.deleteBlock(admin, image.id);
    assert.equal(await builder.media(lesson.blocks[2].data.mediaId), null, "the image goes with its block");
  });

  test("video links become privacy-friendly embeds", () => {
    assert.equal(builder.videoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    assert.equal(builder.videoEmbed("https://youtube.com/shorts/abcDEF12345"), "https://www.youtube-nocookie.com/embed/abcDEF12345");
    assert.equal(builder.videoEmbed("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
    assert.equal(builder.videoEmbed("https://evil.example/watch?v=dQw4w9WgXcQ"), null);
    assert.equal(builder.videoEmbed("not a link"), null);
  });

  test("modules and lessons can be reordered, and a course keeps at least one module", async () => {
    const { id } = ok(await builder.createCourse(admin, "Order course"));
    const first = (await builder.courseOutlineFor(admin, id))!.sections[0].id;
    assert.ok("error" in (await builder.deleteSection(admin, first)));
    const second = ok(await builder.addSection(admin, id, "Module 2"));
    await builder.moveSection(admin, second.id, "up");
    assert.deepEqual((await builder.courseOutlineFor(admin, id))!.sections.map((s) => s.title), ["Module 2", "Module 1"]);
    const a = ok(await builder.addItem(admin, first, "Lesson A"));
    ok(await builder.addItem(admin, first, "Lesson B"));
    await builder.moveItem(admin, a.id, "down");
    assert.deepEqual((await builder.courseOutlineFor(admin, id))!.sections[1].items.map((i) => i.title), ["Lesson B", "Lesson A"]);
    ok(await builder.deleteSection(admin, second.id));
  });

  test("the AI Literacy course from the files can't be changed in the builder", async () => {
    const [files] = (await db.query<{ id: string }>(`INSERT INTO courses(slug, title, source) VALUES('from-files', 'From files', 'files') RETURNING id`)).rows;
    assert.equal(await builder.courseOutlineFor(admin, files.id), null);
    assert.ok("error" in (await builder.updateCourse(admin, files.id, { title: "Hacked", summary: "", status: "draft" })));
    assert.equal(await builder.deleteCourse(admin, files.id), false);
    assert.ok(!(await builder.listBuilderCourses(admin)).some((c) => c.id === files.id));
  });
});

describe("organisation courses", () => {
  test("only that organisation's managers can build them, and only its members see them", async () => {
    const owner = await person("Olu Owner");
    const outsider = await person("Out Sider");
    const { slug } = ok(await orgs.createOrganisation(owner, "Sunrise School"));
    const { org } = (await orgs.orgForMember(slug, owner))!;
    const team = { kind: "org" as const, orgId: org.id, userId: owner };
    const { id } = ok(await builder.createCourse(team, "Staff training"));
    const section = (await builder.courseOutlineFor(team, id))!.sections[0].id;
    const item = ok(await builder.addItem(team, section, "Welcome to the team"));
    await textBlock(item.id, "Hello.", team);
    ok(await builder.updateCourse(team, id, { title: "Staff training", summary: "", status: "published" }));

    // Admins and other organisations don't see or change it in their builder.
    assert.equal(await builder.courseOutlineFor(admin, id), null);
    const other = ok(await orgs.createOrganisation(outsider, "Other Org"));
    const otherOrg = (await orgs.orgForMember(other.slug, outsider))!.org;
    assert.equal(await builder.courseOutlineFor({ kind: "org", orgId: otherOrg.id, userId: outsider }, id), null);

    const courseSlug = (await builder.courseOutlineFor(team, id))!.slug;
    assert.ok((await learn.visibleCourses(owner)).some((c) => c.slug === courseSlug && c.from === "Sunrise School"));
    assert.ok(!(await learn.visibleCourses(outsider)).some((c) => c.slug === courseSlug));
    assert.ok(!(await learn.visibleCourses(null)).some((c) => c.slug === courseSlug));
    assert.equal(await learn.courseForLearner(courseSlug, outsider), null);
    assert.deepEqual(await learn.courseForLearner(courseSlug, null), { signInNeeded: true });
  });

  test("an empty organisation that's removed takes its courses with it", async () => {
    const owner = await person("Solo Owner");
    const { slug } = ok(await orgs.createOrganisation(owner, "Short Lived"));
    const { org } = (await orgs.orgForMember(slug, owner))!;
    const { id } = ok(await builder.createCourse({ kind: "org", orgId: org.id, userId: owner }, "Gone soon"));
    await orgs.deleteEmptyOrganisations(owner);
    assert.equal((await db.query(`SELECT 1 FROM courses WHERE id = $1`, [id])).rows.length, 0);
  });
});

describe("learning a builder course", () => {
  test("drafts are hidden; published courses are open to everyone", async () => {
    const { id } = ok(await builder.createCourse(admin, "Still a draft"));
    const slug = (await builder.courseOutlineFor(admin, id))!.slug;
    assert.equal(await learn.courseForLearner(slug, null), null);
    const course = await publishedCourse("Open course");
    assert.ok((await learn.visibleCourses(null)).some((c) => c.slug === course.slug));
  });

  test("lessons open one at a time: a check to pass, or mark as done", async () => {
    const learner = await person();
    const course = await publishedCourse("In order course");
    let view = (await learn.courseForLearner(course.slug, learner)) as Exclude<Awaited<ReturnType<typeof learn.courseForLearner>>, null | { signInNeeded: true }>;
    assert.deepEqual(view.lessons.map((l) => l.state), ["open", "locked"]);

    // The second lesson can't be marked done yet, and the first needs its check.
    assert.equal(await learn.markDone(course.slug, course.second, learner), false);
    assert.equal(await learn.markDone(course.slug, course.first, learner), false);

    const loaded = await learn.loadBuilderCheck(course.check, learner);
    const data = loaded.data as { questions: { id: string; options: { id: string }[] }[]; passMark: number };
    assert.equal(data.questions.length, 2);
    assert.equal(data.passMark, 2);
    assert.ok(!JSON.stringify(data.questions).includes("correct"), "right answers are never sent");

    const wrong = await learn.submitBuilderCheck(course.check, learner, { version: 1, submissionKey: randomUUID(), answers: { q1: "a", q2: "b" } });
    assert.equal((wrong.data as { passed: boolean }).passed, false);
    view = (await learn.courseForLearner(course.slug, learner)) as typeof view;
    assert.deepEqual(view.lessons.map((l) => l.state), ["open", "locked"]);

    const key = randomUUID();
    const right = await learn.submitBuilderCheck(course.check, learner, { version: 1, submissionKey: key, answers: { q1: "a", q2: "a" } });
    assert.equal((right.data as { passed: boolean }).passed, true);
    // The same submission again is not a second attempt.
    await learn.submitBuilderCheck(course.check, learner, { version: 1, submissionKey: key, answers: { q1: "a", q2: "a" } });
    assert.equal((await db.query(`SELECT 1 FROM builder_attempts WHERE learner_id = $1`, [learner])).rows.length, 2);

    view = (await learn.courseForLearner(course.slug, learner)) as typeof view;
    assert.deepEqual(view.lessons.map((l) => l.state), ["done", "open"]);
    assert.equal(await learn.markDone(course.slug, course.second, learner), true);
    view = (await learn.courseForLearner(course.slug, learner)) as typeof view;
    assert.equal(view.done, 2);
  });

  test("a check in a locked lesson or a draft course can't be taken", async () => {
    const learner = await person();
    const course = await publishedCourse("Locked check course");
    const section = (await builder.courseOutlineFor(admin, course.id))!.sections[0].id;
    const third = ok(await builder.addItem(admin, section, "Third lesson"));
    const check = (await builder.ensureCheck(admin, third.id, 1))!;
    await editor.saveQuestions(check, admin.email, [question("only")]);
    const locked = await learn.submitBuilderCheck(check, learner, { version: 1, submissionKey: randomUUID(), answers: { only: "a" } });
    assert.equal(locked.failure?.status, 403);

    ok(await builder.updateCourse(admin, course.id, { title: "Locked check course", summary: "", status: "draft" }));
    assert.equal((await learn.loadBuilderCheck(course.check, learner)).failure?.status, 404);
  });

  test("tries limits are kept", async () => {
    const learner = await person();
    const course = await publishedCourse("Tries course");
    await db.query(`UPDATE assessments SET max_attempts = 1 WHERE id = $1`, [course.check]);
    const answers = { q1: "b", q2: "b" };
    assert.ok((await learn.submitBuilderCheck(course.check, learner, { version: 1, submissionKey: randomUUID(), answers })).data);
    const again = await learn.submitBuilderCheck(course.check, learner, { version: 1, submissionKey: randomUUID(), answers });
    assert.equal(again.failure?.status, 409);
  });

  test("removing a check means the lesson is finished with mark as done", async () => {
    const learner = await person();
    const course = await publishedCourse("Removed check course");
    await builder.removeCheck(admin, course.first);
    assert.equal(await learn.markDone(course.slug, course.first, learner), true);
  });
});

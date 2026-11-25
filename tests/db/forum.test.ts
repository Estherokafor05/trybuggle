// Forum rules (step 8) against a real in-memory Postgres served over a socket.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 60000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let forum: typeof import("../../src/server/forum");
let accounts: typeof import("../../src/server/accounts");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  forum = await import("../../src/server/forum");
  accounts = await import("../../src/server/accounts");
});

after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

async function person(name = "Ada Obi") {
  const id = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, $2, $3, true)`, [id, name, `${id}@example.com`]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return { id, name };
}

const question = (user: { id: string; name: string }, extra: Partial<{ title: string; body: string; kind: string; sectionSlug: string; lesson: string }> = {}) =>
  forum.createThread(user, {
    sectionSlug: "ai-foundations",
    kind: "question",
    title: "What does a language model actually do?",
    body: "I watched Lesson 1 and still don't get how it predicts words. Can someone explain?",
    ...extra,
  });

function ok<T extends object>(value: T | { error: string }): T {
  if ("error" in value) throw new Error(value.error);
  return value as T;
}

describe("forum", () => {
  test("starting sections exist, in order", async () => {
    const sections = await forum.listSections();
    assert.deepEqual(sections.slice(0, 3).map((s) => s.slug), ["introductions", "ai-foundations", "talking-to-ai"]);
  });

  test("public names show only a first name and an initial", () => {
    assert.equal(forum.displayName("Ada Ngozi Obi"), "Ada O.");
    assert.equal(forum.displayName("Ada"), "Ada");
    assert.equal(forum.displayName(null), "Deleted account");
  });

  test("a question needs a real title and details, and only links to real lessons", async () => {
    const ada = await person();
    assert.ok("error" in (await question(ada, { title: "Help" })));
    assert.ok("error" in (await question(ada, { body: "Why?" })));
    assert.ok("error" in (await question(ada, { sectionSlug: "nowhere" })));
    const { id } = ok(await question(ada, { lesson: "not-a-lesson", title: "  Lots   of   spaces in   this title " }));
    const thread = (await forum.getThread(id, ada.id))!;
    assert.equal(thread.title, "Lots of spaces in this title");
    assert.equal(thread.lesson, null);
    const linked = ok(await question(ada, { lesson: "ai-in-your-day" }));
    assert.match((await forum.getThread(linked.id, null))!.lesson!.label, /Lesson 2: AI Is Already in Your Day/);
  });

  test("text is stored as plain text, never HTML", async () => {
    const ada = await person();
    const { id } = ok(await question(ada, { body: "<script>alert(1)</script> is this safe to paste?​\n\n\n\nThanks" }));
    const thread = (await forum.getThread(id, null))!;
    assert.equal(thread.body, "<script>alert(1)</script> is this safe to paste?\n\nThanks", "stored as typed (shown as text), invisible characters removed");
  });

  test("answers, comments, helpful votes and the accepted answer", async () => {
    const ada = await person();
    const ben = await person("Ben Lee");
    const cy = await person("Cy Day");
    const { id } = ok(await question(ada));
    const first = ok(await forum.createPost(ben, id, { body: "It guesses the next word, again and again." }));
    const second = ok(await forum.createPost(cy, id, { body: "Think of very clever autocomplete." }));
    const comment = ok(await forum.createPost(ada, id, { body: "Thanks, that helps!", parentId: first.id }));
    assert.ok("error" in (await forum.createPost(ada, id, { body: "Nested?", parentId: comment.id })), "comments can't have comments");

    assert.ok("error" in (await forum.toggleHelpful(ben, "post", first.id)), "not your own");
    assert.equal(ok(await forum.toggleHelpful(ada, "post", second.id)).helpful, true);
    assert.equal(ok(await forum.toggleHelpful(cy, "thread", id)).helpful, true);

    assert.ok("error" in (await forum.acceptAnswer(ben, id, first.id)), "only the asker chooses");
    assert.ok("error" in (await forum.acceptAnswer(ada, id, comment.id)), "comments can't be the answer");
    assert.deepEqual(await forum.acceptAnswer(ada, id, first.id), { accepted: true });

    const thread = (await forum.getThread(id, ada.id))!;
    assert.equal(thread.answers.length, 2);
    assert.equal(thread.answers[0].id, first.id, "the accepted answer comes first");
    assert.equal(thread.answers[0].comments[0].body, "Thanks, that helps!");
    assert.equal(thread.answers[1].votedHelpful, true);
    assert.equal(thread.helpful, 1);
    const listed = (await forum.listThreads({ filter: "questions" })).threads.find((t) => t.id === id)!;
    assert.equal(listed.replies, 2, "comments don't count as answers");
    assert.equal(listed.answered, true);
    assert.equal(listed.author, "Ada O.");

    // Taking a vote back.
    assert.equal(ok(await forum.toggleHelpful(ada, "post", second.id)).helpful, false);
    assert.equal((await forum.getThread(id, ada.id))!.answers[1].helpful, 0);
  });

  test("only authors edit or delete, and deleting keeps other people's replies", async () => {
    const ada = await person();
    const ben = await person("Ben Lee");
    const { id } = ok(await question(ada));
    const reply = ok(await forum.createPost(ben, id, { body: "Here's how I think about it." }));
    assert.ok("error" in (await forum.editThread(ben, id, { title: "Changed by someone else", body: "Not allowed to do this at all." })));
    ok(await forum.editThread(ada, id, { title: "What does a model really do?", body: "Edited: I mean language models like chat tools." }));
    assert.equal(await forum.deleteOwn(ben, "thread", id), null);
    assert.equal(await forum.deleteOwn(ada, "thread", id), id);
    const thread = (await forum.getThread(id, null))!;
    assert.equal(thread.deleted, true);
    assert.equal(thread.body, null);
    assert.equal(thread.answers[0].body, "Here's how I think about it.");
    assert.ok("error" in (await forum.createPost(ben, id, { body: "More?" })), "no replies on deleted posts");
    assert.equal((await forum.listThreads({})).threads.some((t) => t.id === id), false, "deleted posts leave the lists");
    void reply;
  });

  test("closed conversations and read-only sections take no new posts", async () => {
    const ada = await person();
    const { id } = ok(await question(ada));
    await forum.setThreadFlags(id, { locked: true });
    assert.ok("error" in (await forum.createPost(ada, id, { body: "Can I still reply?" })));
    await db.query(`UPDATE forum_sections SET locked = true WHERE slug = 'feedback'`);
    assert.ok("error" in (await question(ada, { sectionSlug: "feedback" })));
    await db.query(`UPDATE forum_sections SET locked = false WHERE slug = 'feedback'`);
  });

  test("reports reach moderators once; hiding removes the post from view", async () => {
    const ada = await person();
    const ben = await person("Ben Lee");
    const { id } = ok(await question(ada));
    const bad = ok(await forum.createPost(ben, id, { body: "Buy cheap followers at my site!" }));
    assert.ok("error" in (await forum.report(ada, "post", bad.id, "made-up", null)));
    ok(await forum.report(ada, "post", bad.id, "spam", "advert"));
    ok(await forum.report(ada, "post", bad.id, "spam", "again"));
    const open = (await forum.openReports()).filter((r) => r.targetId === bad.id);
    assert.equal(open.length, 1, "one open report per person");
    assert.equal(open[0].reason, "Spam or advertising");
    assert.equal(await forum.setForumHidden("post", bad.id, "Spam"), true);
    await forum.resolveReports("post", bad.id, "admin-1", "hidden");
    assert.equal((await forum.openReports()).some((r) => r.targetId === bad.id), false);
    const thread = (await forum.getThread(id, null))!;
    assert.equal(thread.answers[0].state, "hidden");
    assert.equal(thread.answers[0].body, null, "hidden words are never sent to the page");
    // A hidden thread disappears completely.
    await forum.setForumHidden("thread", id, "Test");
    assert.equal(await forum.getThread(id, null), null);
  });

  test("posting very fast is slowed down", async () => {
    const ada = await person();
    for (let i = 0; i < 5; i++) ok(await question(ada, { title: `Question number ${i + 1} about AI` }));
    const sixth = await question(ada, { title: "Question number 6 about AI" });
    assert.ok("error" in sixth && /wait/.test(sixth.error));
  });

  test("search and filters", async () => {
    const ada = await person();
    ok(await question(ada, { title: "Unique zebra question title", sectionSlug: "talking-to-ai" }));
    ok(await question(await person(), { kind: "discussion", title: "My favourite prompt trick", sectionSlug: "talking-to-ai" }));
    const section = (await forum.getSection("talking-to-ai"))!;
    assert.equal((await forum.listThreads({ search: "zebra" })).threads.length, 1);
    assert.equal((await forum.listThreads({ search: "%" })).threads.length, 0, "% is plain text");
    const discussions = await forum.listThreads({ sectionId: section.id, filter: "discussions" });
    assert.ok(discussions.threads.every((t) => t.kind === "discussion") && discussions.threads.length >= 1);
    const unanswered = await forum.listThreads({ sectionId: section.id, filter: "unanswered" });
    assert.ok(unanswered.threads.every((t) => t.kind === "question" && t.replies === 0));
  });

  test("deleting an account removes the learner's name and words but keeps others' replies", async () => {
    const ada = await person();
    const ben = await person("Ben Lee");
    const { id } = ok(await question(ada));
    ok(await forum.createPost(ben, id, { body: "Ben's answer stays." }));
    const adaReply = ok(await forum.createPost(ada, id, { body: "Ada's own words go." }));
    ok(await forum.toggleHelpful(ada, "thread", (ok(await question(ben, { title: "Ben asks something else" }))).id));
    await accounts.deleteLearnerData(ada.id);
    const thread = (await forum.getThread(id, null))!;
    assert.equal(thread.deleted, true);
    assert.equal(thread.body, null);
    assert.equal(thread.answers.find((a) => a.id === adaReply.id)?.state, "deleted");
    assert.equal(thread.answers.find((a) => a.state === "visible")?.body, "Ben's answer stays.");
    const { rows } = await db.query(`SELECT 1 FROM forum_threads WHERE author_id = $1 UNION ALL SELECT 1 FROM forum_posts WHERE author_id = $1 UNION ALL SELECT 1 FROM forum_votes WHERE user_id = $1`, [ada.id]);
    assert.equal(rows.length, 0);
  });

  test("admins manage sections", async () => {
    assert.ok("error" in (await forum.saveSection({ slug: "Bad Slug", title: "X title", description: "", position: 5, locked: false })));
    const made = await forum.saveSection({ slug: "teachers-room", title: "Teachers' room", description: "For teachers", position: 70, locked: false });
    assert.deepEqual(made, { slug: "teachers-room" });
    assert.ok("error" in (await forum.saveSection({ slug: "teachers-room", title: "Again", description: "", position: 80, locked: false })));
    const section = (await forum.getSection("teachers-room"))!;
    assert.deepEqual(await forum.saveSection({ id: section.id, slug: "teachers-room", title: "Teachers' room", description: "", position: 70, locked: true }), { slug: "teachers-room" });
    assert.equal((await forum.getSection("teachers-room"))!.locked, true);
  });
});

// Points, badges, streaks and leaderboards, against a real in-memory Postgres.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 64000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let rewards: typeof import("../../src/server/rewards");
let section: string;

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  rewards = await import("../../src/server/rewards");
  section = (await db.query<{ id: string }>(`SELECT id FROM forum_sections LIMIT 1`)).rows[0]?.id
    ?? (await db.query<{ id: string }>(`INSERT INTO forum_sections(slug, title) VALUES('general', 'General') RETURNING id`)).rows[0].id;
});
after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

async function person(name: string) {
  const id = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, $2, $3, true)`, [id, name, `${id}@example.com`]);
  await db.query(`INSERT INTO learners(id) VALUES($1)`, [id]);
  return id;
}
async function attempt(learner: string, lesson: string, passed: boolean, at = "now()") {
  await db.query(`INSERT INTO learning_lessons(slug, title) VALUES($1, $1) ON CONFLICT DO NOTHING`, [lesson]);
  await db.query(
    `INSERT INTO assessment_attempts(id, learner_id, lesson_slug, assessment_version, submission_key, answers, correct_count, question_count, feedback, pass_percent, created_at)
     VALUES($1, $2, $3, 1, $4, '{}', $5, 5, '[]', 70, ${at})`,
    [randomUUID(), learner, lesson, randomUUID(), passed ? 5 : 1],
  );
}
async function question(author: string, at = "now()") {
  const r = await db.query<{ id: string }>(
    `INSERT INTO forum_threads(section_id, author_id, kind, title, body, created_at) VALUES($1, $2, 'question', 'How does it work?', 'Tell me more please.', ${at}) RETURNING id`,
    [section, author],
  );
  return r.rows[0].id;
}
async function answer(thread: string, author: string) {
  const r = await db.query<{ id: string }>(`INSERT INTO forum_posts(thread_id, author_id, body) VALUES($1, $2, 'Here is how.') RETURNING id`, [thread, author]);
  return r.rows[0].id;
}

describe("points", () => {
  test("checks: points once per lesson, more on the first try; retries don't add more", async () => {
    const ada = await person("Ada Obi");
    await attempt(ada, "lesson-a", true); // first try
    await attempt(ada, "lesson-a", true); // practice again: nothing extra
    await attempt(ada, "lesson-b", false);
    await attempt(ada, "lesson-b", true); // passed on the second try
    const mine = await rewards.myRewards(ada);
    assert.equal(mine.total, rewards.POINTS.checkFirstTry + rewards.POINTS.check);
    assert.ok(mine.badges.find((b) => b.id === "first-try")!.earned);
  });

  test("forum: asking, answering, helpful and chosen answers; hidden posts lose their points", async () => {
    const asker = await person("Bola Asker");
    const helper = await person("Chi Helper");
    const thread = await question(asker);
    const post = await answer(thread, helper);
    await db.query(`INSERT INTO forum_votes(target_type, target_id, user_id) VALUES('post', $1, $2)`, [post, asker]);
    await db.query(`UPDATE forum_threads SET accepted_post_id = $1 WHERE id = $2`, [post, thread]);
    assert.equal((await rewards.myRewards(asker)).total, rewards.POINTS.question);
    assert.equal((await rewards.myRewards(helper)).total, rewards.POINTS.answer + rewards.POINTS.helpful + rewards.POINTS.accepted);
    assert.ok((await rewards.myRewards(asker)).badges.find((b) => b.id === "first-question")!.earned);

    await db.query(`UPDATE forum_posts SET hidden_at = now(), hidden_reason = 'spam' WHERE id = $1`, [post]);
    assert.equal((await rewards.myRewards(helper)).total, 0, "a hidden post takes its points with it");
  });

  test("only a few forum posts a day earn points", async () => {
    const busy = await person("Dan Busy");
    for (let i = 0; i < rewards.FORUM_DAILY_LIMIT + 4; i++) await question(busy);
    assert.equal((await rewards.myRewards(busy)).total, rewards.FORUM_DAILY_LIMIT * rewards.POINTS.question);
  });
});

describe("streaks", () => {
  test("counts days in a row, kept alive until the end of the next day", () => {
    const today = new Date("2026-11-25T15:00:00Z");
    assert.deepEqual(rewards.streaks(["2026-11-23", "2026-11-24", "2026-11-25"], today), { current: 3, best: 3 });
    assert.deepEqual(rewards.streaks(["2026-11-23", "2026-11-24"], today), { current: 2, best: 2 });
    assert.deepEqual(rewards.streaks(["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-24"], new Date("2026-11-26T09:00:00Z")), { current: 0, best: 3 });
    assert.deepEqual(rewards.streaks([], today), { current: 0, best: 0 });
  });
});

describe("leaderboards", () => {
  test("ranks learners by points, shows the viewer, leaves out anyone who opted out, and can be just one organisation", async () => {
    const top = await person("Top Learner");
    const mid = await person("Mid Learner");
    const shy = await person("Shy Learner");
    for (const l of ["x1", "x2", "x3", "x4", "x5", "x6"]) await attempt(top, `${top}-${l}`, true);
    for (const l of ["y1", "y2"]) await attempt(mid, `${mid}-${l}`, true);
    for (const l of ["z1", "z2", "z3", "z4", "z5", "z6", "z7"]) await attempt(shy, `${shy}-${l}`, true);
    await rewards.setLeaderboardHidden(shy, true);
    assert.equal(await rewards.hiddenFromLeaderboard(shy), true);

    const board = await rewards.leaderboard(mid, { period: "all", limit: 50 });
    const names = board.top.map((r) => r.name);
    assert.ok(names.indexOf("Top Learner") < names.indexOf("Mid Learner"));
    assert.ok(!names.includes("Shy Learner"));
    assert.equal(board.you?.name, "Mid Learner");

    const tiny = await rewards.leaderboard(mid, { period: "all", limit: 1 });
    assert.equal(tiny.top.length, 1);
    assert.equal(tiny.you?.name, "Mid Learner", "the viewer is shown even outside the top");

    const [org] = (await db.query<{ id: string }>(`INSERT INTO organisations(slug, name) VALUES('points-org', 'Points Org') RETURNING id`)).rows;
    await db.query(`INSERT INTO organisation_members(org_id, user_id, role) VALUES($1, $2, 'member')`, [org.id, mid]);
    const team = await rewards.leaderboard(mid, { period: "all", orgId: org.id });
    assert.deepEqual(team.top.map((r) => r.name), ["Mid Learner"]);
  });

  test("this week only counts points earned since Monday", async () => {
    const old = await person("Old Timer");
    await attempt(old, "old-lesson", true, "now() - interval '30 days'");
    const week = await rewards.leaderboard(old, { period: "week" });
    assert.equal(week.you, null);
    assert.equal((await rewards.myRewards(old)).week, 0);
    assert.equal((await rewards.myRewards(old)).total, rewards.POINTS.checkFirstTry);
  });
});

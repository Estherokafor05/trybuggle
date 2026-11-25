// Points, badges, streaks and leaderboards. Points are just for fun: they never
// change scores, passes or certificates.
//
// Points are worked out from what learners have actually done (checks passed,
// forum posts, helpful marks), not stored separately. So when a post is hidden
// by a moderator, deleted, or a helpful mark is taken back, its points go too.
import { db } from "./database";

import { POINTS } from "@/lib/points";

export { POINTS };
/** Forum posts that earn points each day (UTC), so points can't be farmed. */
export const FORUM_DAILY_LIMIT = 6;

export const EARN = [
  { what: "Pass a lesson's knowledge check", points: `${POINTS.check}, or ${POINTS.checkFirstTry} on your first try` },
  { what: "Finish a module (pass its final assessment)", points: `${POINTS.module}` },
  { what: "Finish a lesson in another course", points: `${POINTS.lessonDone}` },
  { what: "Ask a question in the forum", points: `${POINTS.question}` },
  { what: "Answer or comment in the forum", points: `${POINTS.answer}` },
  { what: "Someone marks your post as helpful", points: `${POINTS.helpful}` },
  { what: "Your answer is chosen as the one that helped", points: `${POINTS.accepted}` },
];

type Sql = ReturnType<typeof db>;

/** Every point-earning thing, as rows of (learner_id, kind, points, at). */
const events = (sql: Sql) => sql`
  WITH forum_items AS (
    SELECT author_id AS learner_id, 'question' AS kind, created_at AS at FROM forum_threads
      WHERE author_id IS NOT NULL AND hidden_at IS NULL AND deleted_at IS NULL AND kind = 'question'
    UNION ALL
    SELECT author_id, 'answer', created_at FROM forum_threads
      WHERE author_id IS NOT NULL AND hidden_at IS NULL AND deleted_at IS NULL AND kind = 'discussion'
    UNION ALL
    SELECT author_id, CASE WHEN parent_id IS NULL THEN 'answer' ELSE 'comment' END, created_at FROM forum_posts
      WHERE author_id IS NOT NULL AND hidden_at IS NULL AND deleted_at IS NULL
  ),
  capped AS (
    SELECT *, row_number() OVER (PARTITION BY learner_id, (at AT TIME ZONE 'UTC')::date ORDER BY at) AS n FROM forum_items
  ),
  lesson_checks AS (
    SELECT learner_id, min(created_at) FILTER (WHERE passed) AS at, (array_agg(passed ORDER BY created_at))[1] AS first_try
    FROM assessment_attempts GROUP BY learner_id, lesson_slug HAVING bool_or(passed)
  ),
  builder_checks AS (
    SELECT learner_id, min(created_at) FILTER (WHERE passed) AS at, (array_agg(passed ORDER BY created_at))[1] AS first_try
    FROM builder_attempts GROUP BY learner_id, assessment_id HAVING bool_or(passed)
  )
  SELECT learner_id, kind, CASE kind WHEN 'question' THEN ${POINTS.question}::int ELSE ${POINTS.answer}::int END AS points, at
    FROM capped WHERE n <= ${FORUM_DAILY_LIMIT}
  UNION ALL
  SELECT coalesce(t.author_id, p.author_id), 'helpful', ${POINTS.helpful}::int, v.created_at
    FROM forum_votes v
    LEFT JOIN forum_threads t ON v.target_type = 'thread' AND t.id = v.target_id AND t.hidden_at IS NULL AND t.deleted_at IS NULL
    LEFT JOIN forum_posts p ON v.target_type = 'post' AND p.id = v.target_id AND p.hidden_at IS NULL AND p.deleted_at IS NULL
    WHERE coalesce(t.author_id, p.author_id) IS NOT NULL AND v.user_id <> coalesce(t.author_id, p.author_id)
  UNION ALL
  SELECT p.author_id, 'accepted', ${POINTS.accepted}::int, p.created_at
    FROM forum_threads t JOIN forum_posts p ON p.id = t.accepted_post_id
    WHERE p.author_id IS NOT NULL AND p.author_id IS DISTINCT FROM t.author_id
      AND p.hidden_at IS NULL AND p.deleted_at IS NULL AND t.hidden_at IS NULL AND t.deleted_at IS NULL
  UNION ALL
  SELECT learner_id, CASE WHEN first_try THEN 'check_first_try' ELSE 'check' END,
    CASE WHEN first_try THEN ${POINTS.checkFirstTry}::int ELSE ${POINTS.check}::int END, at FROM lesson_checks
  UNION ALL
  SELECT learner_id, CASE WHEN first_try THEN 'check_first_try' ELSE 'check' END,
    CASE WHEN first_try THEN ${POINTS.checkFirstTry}::int ELSE ${POINTS.check}::int END, at FROM builder_checks
  UNION ALL
  SELECT learner_id, 'module', ${POINTS.module}::int, min(created_at) FILTER (WHERE passed)
    FROM module_assessment_attempts GROUP BY learner_id, module_slug HAVING bool_or(passed)
  UNION ALL
  SELECT learner_id, 'lesson_done', ${POINTS.lessonDone}::int, completed_at FROM builder_completions`;

export type Period = "week" | "all";
const since = (sql: Sql, period: Period) => (period === "week" ? sql`at >= date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'` : sql`true`);

// ---------------------------------------------------------------------------
// One learner

export type Badge = { id: string; emoji: string; name: string; how: string; earned: boolean };

/** A learner's points, streak and badges. */
export async function myRewards(user: string) {
  const sql = db();
  const [counts, days] = await Promise.all([
    sql`SELECT kind, count(*)::int AS n, sum(points)::int AS points,
          sum(points) FILTER (WHERE ${since(sql, "week")})::int AS week
        FROM (${events(sql)}) e WHERE learner_id = ${user} GROUP BY kind`,
    activityDays(user),
  ]);
  const n = (kind: string) => (counts.find((c) => c.kind === kind)?.n as number) ?? 0;
  const total = counts.reduce((s, c) => s + ((c.points as number) ?? 0), 0);
  const week = counts.reduce((s, c) => s + ((c.week as number) ?? 0), 0);
  const { current, best } = streaks(days);
  const badges: Badge[] = [
    { id: "first-question", emoji: "🙋", name: "First question", how: "Ask a question in the forum", earned: n("question") >= 1 },
    { id: "first-try", emoji: "🎯", name: "Bullseye", how: "Pass a knowledge check on your first try", earned: n("check_first_try") >= 1 },
    { id: "helper", emoji: "💡", name: "Helper", how: "Get 5 helpful marks on your posts", earned: n("helpful") >= 5 },
    { id: "best-answer", emoji: "🏅", name: "Best answer", how: "Have your answer chosen as the one that helped", earned: n("accepted") >= 1 },
    { id: "module", emoji: "🎓", name: "Module master", how: "Finish a whole module", earned: n("module") >= 1 },
    { id: "streak-3", emoji: "🔥", name: "On a roll", how: "Learn 3 days in a row", earned: best >= 3 },
    { id: "streak-7", emoji: "⚡", name: "Week streak", how: "Learn 7 days in a row", earned: best >= 7 },
    { id: "century", emoji: "💯", name: "Century", how: "Earn 100 points", earned: total >= 100 },
  ];
  return { total, week, streak: current, bestStreak: best, badges };
}

/** Days (UTC) the learner did something: checks, lessons in other courses, or forum posts. */
async function activityDays(user: string) {
  const rows = await db()`SELECT DISTINCT (at AT TIME ZONE 'UTC')::date::text AS day FROM (
      SELECT created_at AS at FROM assessment_attempts WHERE learner_id = ${user}
      UNION ALL SELECT created_at FROM module_assessment_attempts WHERE learner_id = ${user}
      UNION ALL SELECT created_at FROM builder_attempts WHERE learner_id = ${user}
      UNION ALL SELECT completed_at FROM builder_completions WHERE learner_id = ${user}
      UNION ALL SELECT created_at FROM forum_threads WHERE author_id = ${user}
      UNION ALL SELECT created_at FROM forum_posts WHERE author_id = ${user}
    ) a WHERE at > now() - interval '400 days' ORDER BY day`;
  return rows.map((r) => r.day as string);
}

/** The current streak (alive if the learner was active today or yesterday) and the best one. */
export function streaks(days: string[], today = new Date()) {
  const toNum = (d: string) => Math.round(Date.parse(`${d}T00:00:00Z`) / 86_400_000);
  const nums = [...new Set(days.map(toNum))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const now = Math.floor(today.getTime() / 86_400_000);
  const last = nums.at(-1);
  const current = last !== undefined && now - last <= 1 ? run : 0;
  return { current, best };
}

// ---------------------------------------------------------------------------
// Leaderboards

export type Row = { rank: number; id: string; name: string; image: string | null; points: number; you: boolean };

/**
 * The top learners for a period, everyone or one organisation's members, and
 * where the viewer is. Learners who turned the leaderboard off are left out.
 */
export async function leaderboard(viewer: string, { period, orgId = null, limit = 20 }: { period: Period; orgId?: string | null; limit?: number }) {
  const sql = db();
  const rows = await sql`
    WITH totals AS (
      SELECT learner_id, sum(points)::int AS points FROM (${events(sql)}) e
      WHERE ${since(sql, period)} AND learner_id IS NOT NULL
      ${orgId ? sql`AND learner_id IN (SELECT user_id FROM organisation_members WHERE org_id = ${orgId})` : sql``}
      GROUP BY learner_id
    ),
    ranked AS (
      SELECT t.learner_id, t.points, u.name, u.image,
        rank() OVER (ORDER BY t.points DESC) AS rank,
        row_number() OVER (ORDER BY t.points DESC, u."createdAt") AS place
      FROM totals t JOIN auth_user u ON u.id = t.learner_id
      LEFT JOIN learner_preferences p ON p.learner_id = t.learner_id
      WHERE t.points > 0 AND NOT coalesce(p.leaderboard_hidden, false)
    )
    SELECT * FROM ranked WHERE place <= ${limit} OR learner_id = ${viewer} ORDER BY place`;
  const toRow = (r: Record<string, unknown>): Row => ({
    rank: Number(r.rank),
    id: r.learner_id as string,
    name: r.name as string,
    image: (r.image as string | null) ?? null,
    points: r.points as number,
    you: r.learner_id === viewer,
  });
  const all = rows.map(toRow);
  return { top: all.filter((_, i) => Number(rows[i].place) <= limit), you: all.find((r) => r.you) ?? null };
}

export async function hiddenFromLeaderboard(user: string) {
  const [row] = await db()`SELECT leaderboard_hidden FROM learner_preferences WHERE learner_id = ${user}`;
  return Boolean(row?.leaderboard_hidden);
}

export async function setLeaderboardHidden(user: string, hidden: boolean) {
  const sql = db();
  await sql`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO learner_preferences(learner_id, leaderboard_hidden) VALUES(${user}, ${hidden})
    ON CONFLICT (learner_id) DO UPDATE SET leaderboard_hidden = EXCLUDED.leaderboard_hidden, updated_at = now()`;
}

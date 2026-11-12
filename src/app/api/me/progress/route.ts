import { db } from "@/server/database";
import { learnerId, privateHeaders } from "@/server/request";
export async function GET() {
  const user = await learnerId();
  if (!user)
    return Response.json(
      { error: "Sign in required" },
      { status: 401, headers: privateHeaders },
    );
  try {
    const lessons =
      await db()`SELECT l.slug,COALESCE(bool_or(a.passed),false) AS passed,COALESCE(max(a.correct_count)*10,0) AS best_score,count(a.id)::int AS attempts FROM learning_lessons l LEFT JOIN assessment_attempts a ON a.lesson_slug=l.slug AND a.learner_id=${user} GROUP BY l.slug ORDER BY l.slug`;
    return Response.json({ lessons }, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "Progress temporarily unavailable" },
      { status: 503, headers: privateHeaders },
    );
  }
}

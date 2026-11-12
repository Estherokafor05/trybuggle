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
    const results =
      await db()`SELECT id,lesson_slug,correct_count,passed,created_at FROM assessment_attempts WHERE learner_id=${user} ORDER BY created_at DESC LIMIT 50`;
    return Response.json(
      { results, description: "Your 50 most recent assessment results" },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "Results temporarily unavailable" },
      { status: 503, headers: privateHeaders },
    );
  }
}

import { assessmentBank } from "@/server/assessment-bank";
import { learnerId, privateHeaders } from "@/server/request";
import { db } from "@/server/database";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await learnerId();
  if (!user)
    return Response.json(
      { error: "Sign in to take the knowledge check." },
      { status: 401, headers: privateHeaders },
    );
  const { id } = await params;
  const questions = Object.hasOwn(assessmentBank, id)
    ? assessmentBank[id]
    : null;
  if (!questions)
    return Response.json({ error: "Assessment not found" }, { status: 404 });
  try {
    const attempts =
      await db()`SELECT id,correct_count,passed,feedback,created_at FROM assessment_attempts WHERE learner_id=${user} AND lesson_slug=${id} ORDER BY created_at DESC LIMIT 1`;
    const passed =
      await db()`SELECT EXISTS(SELECT 1 FROM assessment_attempts WHERE learner_id=${user} AND lesson_slug=${id} AND passed) AS passed`;
    return Response.json(
      {
        version: 1,
        questions: questions.map(({ id, prompt, options }) => ({
          id,
          prompt,
          options,
        })),
        latest: attempts[0] ?? null,
        passed: passed[0].passed,
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      {
        error:
          "The knowledge check is temporarily unavailable. Your learning place is unchanged.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}

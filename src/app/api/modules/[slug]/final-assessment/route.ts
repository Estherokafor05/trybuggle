import { moduleAssessmentBank } from "@/server/assessment-bank";
import { hasFinalAssessment } from "@/server/certificates";
import { db } from "@/server/database";
import { learnerId, privateHeaders } from "@/server/request";

// Serves a module's final assessment without correct answers.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await learnerId();
  if (!user)
    return Response.json({ error: "Sign in to take the final assessment." }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!hasFinalAssessment(slug))
    return Response.json({ error: "Assessment not found" }, { status: 404 });
  const questions = moduleAssessmentBank[slug];
  try {
    const sql = db();
    const attempts = await sql`SELECT id,correct_count,question_count,passed,feedback,created_at FROM module_assessment_attempts WHERE learner_id=${user} AND module_slug=${slug} ORDER BY created_at DESC LIMIT 1`;
    const passed = await sql`SELECT EXISTS(SELECT 1 FROM module_assessment_attempts WHERE learner_id=${user} AND module_slug=${slug} AND passed) AS passed`;
    return Response.json(
      {
        version: 1,
        questions: questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
        latest: attempts[0] ?? null,
        passed: passed[0].passed,
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "The final assessment is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: privateHeaders },
    );
  }
}

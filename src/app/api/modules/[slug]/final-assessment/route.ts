import { privateHeaders } from "@/server/request";
import { assessmentLearner } from "@/server/guest";
import { finalCheck, loadCheck } from "@/server/checks";

// Serves a module's final assessment without correct answers.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ref = finalCheck(slug);
  if (!ref) return Response.json({ error: "Assessment not found" }, { status: 404 });
  const learner = await assessmentLearner({ create: false });
  if (!learner)
    return Response.json({ error: "Sign in to take the final assessment." }, { status: 401, headers: privateHeaders });
  try {
    const out = await loadCheck(ref, learner.id);
    if (out.failure)
      return Response.json({ error: out.failure.error, locked: out.failure.locked }, { status: out.failure.status, headers: privateHeaders });
    return Response.json(out.data, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "The final assessment is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: privateHeaders },
    );
  }
}

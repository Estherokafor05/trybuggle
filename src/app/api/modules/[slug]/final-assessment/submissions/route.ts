import { assessmentLearner } from "@/server/guest";
import { privateHeaders, sameOrigin, smallJSON } from "@/server/request";
import { finalCheck, submitCheck } from "@/server/checks";

// Marks a final assessment on the server and stores it once per submission key.
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { slug } = await params;
  const ref = finalCheck(slug);
  if (!ref) return Response.json({ error: "Assessment not found" }, { status: 404 });
  const learner = await assessmentLearner({ create: false });
  if (!learner)
    return Response.json({ error: "Please sign in again before submitting." }, { status: 401 });
  let body: unknown;
  try {
    body = await smallJSON(request);
  } catch {
    return Response.json({ error: "Invalid submission. Reload the final assessment." }, { status: 400 });
  }
  try {
    const out = await submitCheck(ref, learner.id, body);
    if (out.failure)
      return Response.json({ error: out.failure.error, locked: out.failure.locked }, { status: out.failure.status, headers: privateHeaders });
    return Response.json(out.data, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "Your result could not be confirmed. Retry this submission; it will not create a duplicate attempt." },
      { status: 503, headers: privateHeaders },
    );
  }
}

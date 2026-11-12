import {
  cleanName,
  getCertificate,
  hasFinalAssessment,
  issueCertificate,
  moduleRequirements,
  renameCertificate,
} from "@/server/certificates";
import { learnerId, privateHeaders, sameOrigin, smallJSON } from "@/server/request";

type Context = { params: Promise<{ slug: string }> };
const unavailable = () =>
  Response.json(
    { error: "Certificates are temporarily unavailable. Please try again shortly." },
    { status: 503, headers: privateHeaders },
  );

// The signed-in learner's own requirements and certificate. Never another learner's.
export async function GET(_request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!hasFinalAssessment(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const status = await moduleRequirements(user, slug);
    return Response.json(
      {
        requirements: status.requirements,
        eligible: status.eligible,
        certificate: await getCertificate(user, slug),
      },
      { headers: privateHeaders },
    );
  } catch {
    return unavailable();
  }
}

async function nameFrom(request: Request) {
  if (!sameOrigin(request)) return { response: Response.json({ error: "Invalid request origin" }, { status: 403 }) };
  try {
    const body = await smallJSON(request);
    if (!body || Object.keys(body).some((k) => k !== "name"))
      return { response: Response.json({ error: "Invalid request" }, { status: 400 }) };
    const clean = await cleanName(body.name);
    if ("error" in clean) return { response: Response.json({ error: clean.error }, { status: 400 }) };
    return { name: clean.name };
  } catch {
    return { response: Response.json({ error: "Invalid request" }, { status: 400 }) };
  }
}

// Issues the certificate once, after the server confirms every requirement.
export async function POST(request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!hasFinalAssessment(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  const input = await nameFrom(request);
  if ("response" in input) return input.response;
  try {
    const result = await issueCertificate(user, slug, input.name);
    if ("error" in result) return Response.json({ error: result.error }, { status: 403, headers: privateHeaders });
    return Response.json({ certificate: result.certificate }, { headers: privateHeaders });
  } catch {
    return unavailable();
  }
}

// Corrects the name on an issued certificate. The ID and date stay the same.
export async function PATCH(request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!hasFinalAssessment(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  const input = await nameFrom(request);
  if ("response" in input) return input.response;
  try {
    const certificate = await renameCertificate(user, slug, input.name);
    if (!certificate) return Response.json({ error: "No certificate to update" }, { status: 404, headers: privateHeaders });
    return Response.json({ certificate }, { headers: privateHeaders });
  } catch {
    return unavailable();
  }
}

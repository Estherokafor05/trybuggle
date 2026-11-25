import {
  cleanName,
  ESSENTIALS,
  essentialsStatus,
  getCertificate,
  getEssentialsCertificate,
  hasFinalAssessment,
  issueEssentialsCertificate,
  moduleRequirements,
  renameCertificate,
  renameEssentialsCertificate,
} from "@/server/certificates";
import { learnerId, privateHeaders, sameOrigin, smallJSON } from "@/server/request";

// The signed-in learner's own certificates. Never another learner's.
// "essentials" is the Essentials certificate. A module slug reads a module
// certificate issued before step 6; new module certificates are not issued.
type Context = { params: Promise<{ slug: string }> };
const unavailable = () =>
  Response.json(
    { error: "Certificates are temporarily unavailable. Please try again shortly." },
    { status: 503, headers: privateHeaders },
  );
const known = (slug: string) => slug === ESSENTIALS || hasFinalAssessment(slug);

export async function GET(_request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!known(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    if (slug === ESSENTIALS) {
      const status = await essentialsStatus(user);
      return Response.json(
        { modules: status.modules, eligible: status.eligible, certificate: await getEssentialsCertificate(user) },
        { headers: privateHeaders },
      );
    }
    const status = await moduleRequirements(user, slug);
    return Response.json(
      { requirements: status.requirements, eligible: status.eligible, certificate: await getCertificate(user, slug) },
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

// Issues the Essentials certificate once, after the server confirms every module.
export async function POST(request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  if (!known(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  if (slug !== ESSENTIALS)
    return Response.json(
      { error: "Modules no longer have their own certificate. Complete every module to earn the Essentials certificate." },
      { status: 410, headers: privateHeaders },
    );
  const input = await nameFrom(request);
  if ("response" in input) return input.response;
  try {
    const result = await issueEssentialsCertificate(user, input.name);
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
  if (!known(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  const input = await nameFrom(request);
  if ("response" in input) return input.response;
  try {
    const certificate =
      slug === ESSENTIALS
        ? await renameEssentialsCertificate(user, input.name)
        : await renameCertificate(user, slug, input.name);
    if (!certificate) return Response.json({ error: "No certificate to update" }, { status: 404, headers: privateHeaders });
    return Response.json({ certificate }, { headers: privateHeaders });
  } catch {
    return unavailable();
  }
}

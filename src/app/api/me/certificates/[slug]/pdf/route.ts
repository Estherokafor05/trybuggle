import { certificatePdf } from "@/server/certificate-pdf";
import { getCertificate, hasFinalAssessment } from "@/server/certificates";
import { getModule } from "@/content/modules";
import { learnerId, privateHeaders } from "@/server/request";

// Downloads the signed-in learner's own certificate as a PDF.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod || !hasFinalAssessment(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const certificate = await getCertificate(user, slug);
    if (!certificate)
      return Response.json({ error: "No certificate has been issued yet." }, { status: 404, headers: privateHeaders });
    const bytes = await certificatePdf({
      learnerName: certificate.learnerName,
      moduleTitle: mod.title,
      completedOn: new Date(certificate.completedOn),
      code: certificate.code,
    });
    return new Response(Buffer.from(bytes), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Buggle-Learn-${mod.title.replace(/[^A-Za-z0-9]+/g, "-")}-Certificate.pdf"`,
      },
    });
  } catch {
    return Response.json({ error: "Your certificate could not be created. Please try again." }, { status: 503, headers: privateHeaders });
  }
}

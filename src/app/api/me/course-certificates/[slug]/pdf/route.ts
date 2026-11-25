import { certificatePdf } from "@/server/certificate-pdf";
import { courseCertificateStatus } from "@/server/certificates";
import { learnerId, privateHeaders } from "@/server/request";
import { siteOrigin, verifyPath } from "@/server/site";

// Downloads the signed-in learner's certificate for a Deep Dive course.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await learnerId();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401, headers: privateHeaders });
  const { slug } = await params;
  try {
    const status = await courseCertificateStatus(user, slug);
    if (!status?.certificate) return Response.json({ error: "No certificate has been issued yet." }, { status: 404, headers: privateHeaders });
    const { certificate, course } = status;
    const bytes = await certificatePdf({
      learnerName: certificate.learnerName,
      moduleTitle: course.title,
      completedOn: new Date(certificate.completedOn),
      code: certificate.code,
      verifyUrl: `${await siteOrigin()}${verifyPath(certificate.code)}`,
    });
    return new Response(Buffer.from(bytes), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Buggle-Learn-${course.title.replace(/[^A-Za-z0-9]+/g, "-")}-Certificate.pdf"`,
      },
    });
  } catch {
    return Response.json({ error: "Your certificate could not be created. Please try again." }, { status: 503, headers: privateHeaders });
  }
}

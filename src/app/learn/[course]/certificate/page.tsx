import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { Buggle } from "@/components/Buggle";
import { CertificatePanel } from "@/components/certificate/CertificatePanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { courseCertificateStatus } from "@/server/certificates";
import { siteOrigin } from "@/server/site";

export const metadata: Metadata = { title: "Your certificate | Buggle Learn" };

export default async function CourseCertificatePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/learn/${slug}/certificate`)}`);
  const status = await courseCertificateStatus(session.user.id, slug);
  if (!status) notFound();
  const origin = await siteOrigin();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <p>
          <Link href={`/learn/${slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
            ← Back to the course
          </Link>
        </p>
        <header className="flex flex-wrap items-center gap-4 rounded-[2rem] bg-hero-lavender p-6 sm:p-10">
          <Buggle mood={status.eligible ? "cheer" : "thinking"} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Deep Dive certificate</p>
            <h1 className="mt-2 break-words text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">{status.course.title}</h1>
          </div>
        </header>
        {status.eligible ? (
          <CertificatePanel
            slug={slug}
            moduleTitle={status.course.title}
            profileName={session.user.name ?? ""}
            initial={status.certificate}
            origin={origin}
            api={`/api/me/course-certificates/${slug}`}
          />
        ) : (
          <p className="mt-6 rounded-2xl bg-canvas p-5 leading-relaxed text-ink">
            Finish every unit in this course, and your certificate will be ready here. 🎓
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

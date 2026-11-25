import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LessonPreviewView } from "@/components/builder/BuilderViews";
import { OrgShell } from "@/components/org/OrgShell";
import { lessonFor } from "@/server/builder";
import { blocksFor } from "@/server/builder-learn";
import { loadOrgBuilder } from "@/server/org-page";
import { checkForEditing } from "@/server/question-editor";

export const metadata: Metadata = { title: "Preview lesson | Buggle Learn" };
type Props = { params: Promise<{ slug: string; courseId: string; itemId: string }> };

export default async function OrgPreviewPage({ params }: Props) {
  const { slug, courseId, itemId } = await params;
  const { org, role, builder } = await loadOrgBuilder(slug, `/courses/${courseId}/lessons/${itemId}/preview`);
  if (!builder) redirect(`/org/${slug}/courses`);
  const lesson = await lessonFor(builder, itemId);
  if (!lesson || lesson.course.id !== courseId) notFound();
  const [blocks, check] = await Promise.all([blocksFor(itemId), lesson.assessmentId ? checkForEditing(lesson.assessmentId) : null]);
  return (
    <OrgShell org={org} role={role} current="/courses">
      <LessonPreviewView
        heading="h2"
        backHref={`/org/${org.slug}/courses/${courseId}/lessons/${itemId}`}
        title={lesson.title}
        summary={lesson.summary}
        minutes={lesson.minutes}
        blocks={blocks}
        questions={check?.questions.length ?? 0}
      />
    </OrgShell>
  );
}

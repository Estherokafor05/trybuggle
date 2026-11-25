import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuilderNotice, LessonEditorView } from "@/components/builder/BuilderViews";
import { OrgShell } from "@/components/org/OrgShell";
import { lessonFor } from "@/server/builder";
import { loadOrgBuilder } from "@/server/org-page";
import { checkForEditing } from "@/server/question-editor";

export const metadata: Metadata = { title: "Edit lesson | Buggle Learn" };
type Props = { params: Promise<{ slug: string; courseId: string; itemId: string }>; searchParams: Promise<{ notice?: string }> };

export default async function OrgLessonPage({ params, searchParams }: Props) {
  const [{ slug, courseId, itemId }, { notice }] = await Promise.all([params, searchParams]);
  const { org, role, builder } = await loadOrgBuilder(slug, `/courses/${courseId}/lessons/${itemId}`);
  if (!builder) redirect(`/org/${slug}/courses`);
  const lesson = await lessonFor(builder, itemId);
  if (!lesson || lesson.course.id !== courseId) notFound();
  const check = lesson.assessmentId ? await checkForEditing(lesson.assessmentId) : null;
  return (
    <OrgShell org={org} role={role} current="/courses">
      <h2 className="mb-4 break-words text-2xl font-bold">{lesson.title}</h2>
      <BuilderNotice notice={notice} />
      <LessonEditorView actor={org.slug} base={`/org/${org.slug}/courses`} courseId={courseId} lesson={lesson} questions={check?.questions ?? []} />
    </OrgShell>
  );
}

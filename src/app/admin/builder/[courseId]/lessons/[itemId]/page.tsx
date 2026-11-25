import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { BuilderNotice, LessonEditorView } from "@/components/builder/BuilderViews";
import { requireAdmin } from "@/server/admin";
import { lessonFor } from "@/server/builder";
import { checkForEditing } from "@/server/question-editor";

export const metadata: Metadata = { title: "Edit lesson" };
type Props = { params: Promise<{ courseId: string; itemId: string }>; searchParams: Promise<{ notice?: string }> };

export default async function BuilderLessonPage({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  const [{ courseId, itemId }, { notice }] = await Promise.all([params, searchParams]);
  const lesson = await lessonFor({ kind: "admin", email: admin.user.email }, itemId);
  if (!lesson || lesson.course.id !== courseId) notFound();
  const check = lesson.assessmentId ? await checkForEditing(lesson.assessmentId) : null;
  return (
    <AdminShell current="/admin/builder" email={admin.user.email}>
      <AdminHeading title={lesson.title} />
      <BuilderNotice notice={notice} />
      <LessonEditorView actor="admin" base="/admin/builder" courseId={courseId} lesson={lesson} questions={check?.questions ?? []} />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { LessonPreviewView } from "@/components/builder/BuilderViews";
import { requireAdmin } from "@/server/admin";
import { lessonFor } from "@/server/builder";
import { blocksFor } from "@/server/builder-learn";
import { checkForEditing } from "@/server/question-editor";

export const metadata: Metadata = { title: "Preview lesson" };
type Props = { params: Promise<{ courseId: string; itemId: string }> };

export default async function BuilderPreviewPage({ params }: Props) {
  const admin = await requireAdmin();
  const { courseId, itemId } = await params;
  const lesson = await lessonFor({ kind: "admin", email: admin.user.email }, itemId);
  if (!lesson || lesson.course.id !== courseId) notFound();
  const [blocks, check] = await Promise.all([blocksFor(itemId), lesson.assessmentId ? checkForEditing(lesson.assessmentId) : null]);
  return (
    <AdminShell current="/admin/builder" email={admin.user.email}>
      <LessonPreviewView
        backHref={`/admin/builder/${courseId}/lessons/${itemId}`}
        title={lesson.title}
        summary={lesson.summary}
        minutes={lesson.minutes}
        blocks={blocks}
        questions={check?.questions.length ?? 0}
      />
    </AdminShell>
  );
}

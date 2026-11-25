import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { BuilderNotice, CourseEditorView } from "@/components/builder/BuilderViews";
import { requireAdmin } from "@/server/admin";
import { courseOutlineFor } from "@/server/builder";

export const metadata: Metadata = { title: "Edit course" };
type Props = { params: Promise<{ courseId: string }>; searchParams: Promise<{ notice?: string }> };

export default async function BuilderCoursePage({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  const [{ courseId }, { notice }] = await Promise.all([params, searchParams]);
  const course = await courseOutlineFor({ kind: "admin", email: admin.user.email }, courseId);
  if (!course) notFound();
  return (
    <AdminShell current="/admin/builder" email={admin.user.email}>
      <AdminHeading title={course.title} />
      <BuilderNotice notice={notice} />
      <CourseEditorView actor="admin" base="/admin/builder" course={course} />
    </AdminShell>
  );
}

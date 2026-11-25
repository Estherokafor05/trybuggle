import type { Metadata } from "next";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { BuilderNotice, CourseListView } from "@/components/builder/BuilderViews";
import { requireAdmin } from "@/server/admin";
import { listBuilderCourses } from "@/server/builder";

export const metadata: Metadata = { title: "Lesson builder" };

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const admin = await requireAdmin();
  const { notice } = await searchParams;
  const courses = await listBuilderCourses({ kind: "admin", email: admin.user.email });
  return (
    <AdminShell current="/admin/builder" email={admin.user.email}>
      <AdminHeading
        title="Lesson builder"
        intro="Make new courses without code: modules, lessons, blocks of text, images and video, and knowledge checks. Published courses appear for every learner under More courses. The AI Literacy course stays in the course files."
      />
      <BuilderNotice notice={notice} />
      <CourseListView actor="admin" base="/admin/builder" courses={courses} />
    </AdminShell>
  );
}

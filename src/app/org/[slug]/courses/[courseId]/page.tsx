import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuilderNotice, CourseEditorView } from "@/components/builder/BuilderViews";
import { OrgShell } from "@/components/org/OrgShell";
import { courseOutlineFor } from "@/server/builder";
import { loadOrgBuilder } from "@/server/org-page";

export const metadata: Metadata = { title: "Edit course | Buggle Learn" };
type Props = { params: Promise<{ slug: string; courseId: string }>; searchParams: Promise<{ notice?: string }> };

export default async function OrgCoursePage({ params, searchParams }: Props) {
  const [{ slug, courseId }, { notice }] = await Promise.all([params, searchParams]);
  const { org, role, builder } = await loadOrgBuilder(slug, `/courses/${courseId}`);
  if (!builder) redirect(`/org/${slug}/courses`);
  const course = await courseOutlineFor(builder, courseId);
  if (!course) notFound();
  return (
    <OrgShell org={org} role={role} current="/courses">
      <h2 className="mb-4 break-words text-2xl font-bold">{course.title}</h2>
      <BuilderNotice notice={notice} />
      <CourseEditorView actor={org.slug} base={`/org/${org.slug}/courses`} course={course} />
    </OrgShell>
  );
}

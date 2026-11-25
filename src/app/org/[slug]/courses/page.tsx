import type { Metadata } from "next";
import Link from "next/link";
import { BuilderNotice, CourseListView } from "@/components/builder/BuilderViews";
import { OrgShell, orgButton, orgCard } from "@/components/org/OrgShell";
import { listBuilderCourses } from "@/server/builder";
import { loadOrgBuilder } from "@/server/org-page";

export const metadata: Metadata = { title: "Your courses | Buggle Learn" };
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ notice?: string }> };

export default async function OrgCoursesPage({ params, searchParams }: Props) {
  const [{ slug }, { notice }] = await Promise.all([params, searchParams]);
  const { org, role, builder } = await loadOrgBuilder(slug);
  return (
    <OrgShell org={org} role={role} current="/courses">
      {builder ? (
        <>
          <BuilderNotice notice={notice} />
          <CourseListView
            actor={org.slug}
            base={`/org/${org.slug}/courses`}
            courses={await listBuilderCourses(builder)}
            intro={
              <p className="max-w-[70ch] leading-relaxed text-muted">
                Build your own courses for your members: modules, lessons, text, images, video and knowledge checks. Only members of {org.name} can see them, once
                you publish them.
              </p>
            }
          />
        </>
      ) : (
        <section className={`${orgCard} max-w-[640px]`}>
          <h2 className="text-lg font-bold">Build your own courses</h2>
          <p className="mt-2 leading-relaxed text-ink">Your own courses come with the Platform plan, or Platform and Content together.</p>
          <Link href={`/org/${org.slug}/billing`} className={`${orgButton} mt-4`}>
            See plans
          </Link>
        </section>
      )}
    </OrgShell>
  );
}

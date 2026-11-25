import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeading, AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { adminMessage, adminNotices } from "@/lib/admin-messages";
import { requireAdmin } from "@/server/admin";
import { checkForEditing } from "@/server/question-editor";

export const metadata: Metadata = { title: "Edit questions" };

export default async function EditQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const admin = await requireAdmin();
  const check = await checkForEditing((await params).id);
  if (!check) notFound();
  const { notice } = await searchParams;
  return (
    <AdminShell current="/admin/course" email={admin.user.email}>
      <Link href={`/admin/course#check-${check.key}`} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
        <span aria-hidden="true">←</span> Course
      </Link>
      <AdminNotice notice={adminMessage(adminNotices, notice)} />
      <AdminHeading
        title={check.title}
        intro={
          <>
            {check.questions.length} questions. Changes apply from each learner&apos;s next attempt; earlier results never change.{" "}
            {check.editedAt
              ? `Last edited here by ${check.editedBy ?? "an admin"}, so the course files no longer change these questions.`
              : "Not edited here yet: until you save, these come from the course files."}
          </>
        }
      />
      <QuestionEditor id={check.id} checkKey={check.key} questions={check.questions} />
    </AdminShell>
  );
}

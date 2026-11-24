// Loads the course in courses/ into the course tables (migrations/005_courses.sql).
// Safe to run more than once: rows are matched by slug or key and updated in place,
// and anything no longer in the course files is archived, never deleted.
import {
  builtLessons,
  course,
  exploreGuides,
  finalQuestionCount,
  modules,
  reflectionExample,
  stories,
} from "@course";
import { assessmentBank, moduleAssessmentBank } from "@course/assessments";
import type { Question } from "@/lib/assessment-scoring";

export type Status = "draft" | "published" | "archived";

export interface BlockPlan {
  type: "story_film" | "course_component" | "reflection";
  data: Record<string, unknown>;
}

export interface AssessmentPlan {
  legacyKey: string;
  questionCount: number;
  passPercent: number;
  questions: Question[];
  status: Status;
}

export interface ItemPlan {
  slug: string;
  title: string;
  summary: string;
  objective: string;
  estimatedMinutes: number;
  sources: unknown[];
  status: Status;
  blocks: BlockPlan[];
  assessment?: AssessmentPlan;
}

export interface SectionPlan {
  level: "essentials" | "deep_dive";
  position: number;
  slug: string;
  title: string;
  summary: string;
  outcome: string;
  status: Status;
  items: ItemPlan[];
  assessment?: AssessmentPlan;
}

export interface CoursePlan {
  slug: string;
  title: string;
  summary: string;
  status: Status;
  sections: SectionPlan[];
}

/** "4 minutes to watch" → 4. */
export function minutesFrom(duration: string): number {
  const match = /(\d+)\s*min/i.exec(duration);
  return match ? Number(match[1]) : 0;
}

/** Turns the course files into rows for the course tables. Pure: no database access. */
export function planCourse(): CoursePlan {
  const sections = modules.map((module): SectionPlan => {
    const sectionStatus: Status = module.status === "planned" ? "draft" : "published";
    const items = module.lessons.map((lesson): ItemPlan => {
      const built = builtLessons.find((b) => b.slug === lesson.slug);
      const guide = exploreGuides[lesson.slug];
      const story = stories[lesson.slug];
      const bank = assessmentBank[lesson.slug];
      const ready = sectionStatus === "published" && !!built && !!guide && !!bank;
      const status: Status = ready ? "published" : "draft";
      const blocks: BlockPlan[] = [];
      if (story)
        blocks.push({
          type: "story_film",
          data: {
            root: story.root,
            mediaVersion: story.mediaVersion,
            title: story.title,
            introduction: story.introduction,
          },
        });
      if (guide) {
        blocks.push({
          type: "course_component",
          data: {
            component: "LessonActivity",
            guide: { title: guide.title, steps: guide.steps },
          },
        });
        blocks.push({
          type: "reflection",
          data: { prompts: guide.reflections, example: reflectionExample(lesson.slug) },
        });
      }
      return {
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        objective: built?.objective ?? "",
        estimatedMinutes: built ? minutesFrom(built.duration) : 0,
        sources: built?.sources ?? [],
        status,
        blocks,
        assessment: bank
          ? {
              legacyKey: lesson.slug,
              questionCount: bank.length,
              passPercent: 70,
              questions: bank,
              status,
            }
          : undefined,
      };
    });
    const finalBank = moduleAssessmentBank[module.slug];
    return {
      level: "essentials",
      position: module.order,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      outcome: module.outcome,
      status: sectionStatus,
      items,
      assessment: finalBank
        ? {
            legacyKey: module.slug,
            questionCount: finalQuestionCount[module.slug] ?? finalBank.length,
            passPercent: 70,
            questions: finalBank,
            status: sectionStatus,
          }
        : undefined,
    };
  });
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    status: "published",
    sections,
  };
}

/** Runs one SQL statement with numbered parameters ($1, $2...) and returns its rows. */
export interface SqlRunner {
  query(text: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
}

export interface ImportSummary {
  courseId: string;
  sections: number;
  items: number;
  blocks: number;
  assessments: number;
  questions: number;
}

/** Writes a course plan. Call it inside one transaction so a failure changes nothing. */
export async function writeCourse(run: SqlRunner, plan: CoursePlan): Promise<ImportSummary> {
  const one = async (text: string, params: unknown[]) => (await run.query(text, params))[0];
  const summary: ImportSummary = {
    courseId: "",
    sections: 0,
    items: 0,
    blocks: 0,
    assessments: 0,
    questions: 0,
  };

  const courseRow = await one(
    `INSERT INTO courses(slug, title, summary, status) VALUES($1, $2, $3, $4)
     ON CONFLICT(slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, status = EXCLUDED.status
     RETURNING id`,
    [plan.slug, plan.title, plan.summary, plan.status],
  );
  const courseId = String(courseRow.id);
  summary.courseId = courseId;

  const writeAssessment = async (
    assessment: AssessmentPlan,
    scope: "item" | "section",
    ownerId: string,
  ) => {
    const row = await one(
      `INSERT INTO assessments(course_id, scope, item_id, section_id, legacy_key, question_count, pass_percent, status)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT(course_id, legacy_key) WHERE legacy_key IS NOT NULL DO UPDATE SET
         scope = EXCLUDED.scope, item_id = EXCLUDED.item_id, section_id = EXCLUDED.section_id,
         question_count = EXCLUDED.question_count, pass_percent = EXCLUDED.pass_percent, status = EXCLUDED.status
       RETURNING id`,
      [
        courseId,
        scope,
        scope === "item" ? ownerId : null,
        scope === "section" ? ownerId : null,
        assessment.legacyKey,
        assessment.questionCount,
        assessment.passPercent,
        assessment.status,
      ],
    );
    const assessmentId = String(row.id);
    summary.assessments++;
    for (const [index, question] of assessment.questions.entries()) {
      await run.query(
        `INSERT INTO assessment_questions(assessment_id, key, position, prompt, options, correct_option, explanation)
         VALUES($1, $2, $3, $4, $5::text::jsonb, $6, $7)
         ON CONFLICT(assessment_id, key) DO UPDATE SET position = EXCLUDED.position, prompt = EXCLUDED.prompt,
           options = EXCLUDED.options, correct_option = EXCLUDED.correct_option, explanation = EXCLUDED.explanation`,
        [
          assessmentId,
          question.id,
          index + 1,
          question.prompt,
          JSON.stringify(question.options),
          question.correct,
          question.explanation,
        ],
      );
      summary.questions++;
    }
    await run.query(
      `DELETE FROM assessment_questions WHERE assessment_id = $1
       AND key NOT IN (SELECT jsonb_array_elements_text($2::text::jsonb))`,
      [assessmentId, JSON.stringify(assessment.questions.map((q) => q.id))],
    );
  };

  for (const section of plan.sections) {
    const sectionRow = await one(
      `INSERT INTO course_sections(course_id, level, position, slug, title, summary, outcome, status)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT(course_id, slug) DO UPDATE SET level = EXCLUDED.level, position = EXCLUDED.position,
         title = EXCLUDED.title, summary = EXCLUDED.summary, outcome = EXCLUDED.outcome, status = EXCLUDED.status
       RETURNING id`,
      [courseId, section.level, section.position, section.slug, section.title, section.summary, section.outcome, section.status],
    );
    const sectionId = String(sectionRow.id);
    summary.sections++;

    for (const [index, item] of section.items.entries()) {
      const itemRow = await one(
        `INSERT INTO course_items(course_id, section_id, position, slug, title, summary, objective, estimated_minutes, sources, status)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9::text::jsonb, $10)
         ON CONFLICT(course_id, slug) DO UPDATE SET section_id = EXCLUDED.section_id, position = EXCLUDED.position,
           title = EXCLUDED.title, summary = EXCLUDED.summary, objective = EXCLUDED.objective,
           estimated_minutes = EXCLUDED.estimated_minutes, sources = EXCLUDED.sources, status = EXCLUDED.status
         RETURNING id`,
        [
          courseId,
          sectionId,
          index + 1,
          item.slug,
          item.title,
          item.summary,
          item.objective,
          item.estimatedMinutes,
          JSON.stringify(item.sources),
          item.status,
        ],
      );
      const itemId = String(itemRow.id);
      summary.items++;

      await run.query(`DELETE FROM content_blocks WHERE item_id = $1`, [itemId]);
      for (const [blockIndex, block] of item.blocks.entries()) {
        await run.query(
          `INSERT INTO content_blocks(item_id, position, type, data) VALUES($1, $2, $3, $4::text::jsonb)`,
          [itemId, blockIndex + 1, block.type, JSON.stringify(block.data)],
        );
        summary.blocks++;
      }
      if (item.assessment) await writeAssessment(item.assessment, "item", itemId);
    }
    if (section.assessment) await writeAssessment(section.assessment, "section", sectionId);
  }

  // Archive anything this course no longer contains, so removed content disappears
  // for learners without losing anything that might refer to it.
  const sectionSlugs = JSON.stringify(plan.sections.map((s) => s.slug));
  const itemSlugs = JSON.stringify(plan.sections.flatMap((s) => s.items.map((i) => i.slug)));
  await run.query(
    `UPDATE course_sections SET status = 'archived' WHERE course_id = $1
     AND slug NOT IN (SELECT jsonb_array_elements_text($2::text::jsonb)) AND status <> 'archived'`,
    [courseId, sectionSlugs],
  );
  await run.query(
    `UPDATE course_items SET status = 'archived' WHERE course_id = $1
     AND slug NOT IN (SELECT jsonb_array_elements_text($2::text::jsonb)) AND status <> 'archived'`,
    [courseId, itemSlugs],
  );
  return summary;
}

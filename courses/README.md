# Courses

Buggle Learn is split into two parts:

- **The platform** (`src/`): pages, accounts, saving progress, knowledge checks, certificates and the reusable learning blocks.
- **Courses** (`courses/`): the content learners read, watch and answer. Today there is one, `courses/ai-literacy/`.

The platform reaches a course only through three entry points, set in `tsconfig.json`:

| Import | Holds | Used by |
| --- | --- | --- |
| `@course` | Course data: modules, lessons, films, guides, completion rules | Any platform code |
| `@course/ui` | The course's own screens and illustrations | Platform pages and components |
| `@course/assessments` | Questions and correct answers | Server code only, so answers never reach the browser |

Lint enforces the boundary:

- Code in `src/` may not import a course's internal files.
- Code in `courses/` may use the platform's building blocks (`@/components/blocks/...`, `@/lib/...`) but never its pages or routes (`@/app/...`).

## Shared learning blocks

`src/components/blocks/` holds the blocks any course can use: story and idea panels, instructions, multiple-choice questions with feedback, timed phases, the typewriter effect, a scripted chat and private reflection notes. Each course adds its own defaults on top. For example, `courses/ai-literacy/activities/shared.tsx` makes Maya the storyteller and adds this course's sample reflection answers.

## What comes next

This is step 1 of the platform build on the `lms-platform` branch. Later steps move course data into the database and replace the lesson-specific activity files with general content blocks that the admin course editor can arrange, so a new course needs no code.

## Course tables (step 2)

`migrations/005_courses.sql` stores courses as data, so the admin course editor can manage them without code changes:

| Table | Holds |
| --- | --- |
| `courses` | One row per course: slug, title, summary, owner (Buggle or an organisation) and status |
| `course_sections` | Modules (Essentials) and chapters (Deep Dive), in order |
| `course_items` | Lessons (Essentials) and units (Deep Dive), in order, with estimated minutes and sources |
| `content_blocks` | The ordered pieces of each lesson or unit: text, image, video, short, audio, animation, film, activity, reflection, practice quiz, download, embed |
| `assessments` | Knowledge checks, module or chapter assessments, and final assessments, each with its own question count, pass mark, retry limit and shuffle setting |
| `assessment_questions` | Questions and correct answers (server code only) |

Every row has a status of `draft`, `published` or `archived`. Positions can be swapped inside one save. The database itself refuses a correct answer that is not one of the options, two items in the same place, and an assessment attached to nothing.

`course_component` blocks render a screen from the course's own code (`@course/ui`). They carry today's lesson-specific activities until those are rebuilt as general blocks.

To load this course into a database after running the migrations:

```
npm run db:import-course
```

It is safe to run more than once: rows are matched by slug and updated, and anything removed from the course files is archived, not deleted.

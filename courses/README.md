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

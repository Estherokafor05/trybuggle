# Buggle Learn

AI literacy for people with no technical background, across everyday life and work.

## Current release

Lessons 1 and 2 each offer **Watch & Listen** and **Read & Explore**. Lesson 1 has a new six-scene film using the user's supplied recording. Lesson 2 preserves the existing Maya film, voice, illustrations and captions. The old 39-slide Lesson 1 player has been removed.

Both lessons include independent interactive guides, complete reading alternatives that work without JavaScript, locally saved reflections and separate official knowledge checks. Each check has 10 questions, a 70% passing threshold, helpful feedback and unlimited assessment-only retries. Only server-verified results count as a pass; guide activity and playback never do.

Visitors can use both previews and resume on the same device. Google sign-in enables learning places and assessment results saved to PostgreSQL across devices. All five Module 1 lessons, the Module 1 final assessment and the Certificate of Completion are live. Buggle Learn is completely free: there are no payments, paid tiers or subscriptions. The first two previews remain open access; their availability is not a claim of completed progression.

## Run and check

Use Node.js 24 or later. Copy `.env.example` to `.env.local` and configure the required values without committing them.

```sh
npm ci
npm run db:migrate
npm run dev
```

In another terminal:

```sh
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

Browser integration checks need the app running on localhost:3000, a valid local AUTH_SECRET and a configured test database. `PLAYWRIGHT_BASE_URL` can select another local port. They exercise real authenticated routes using isolated signed test sessions, create uniquely named test learners and remove only their records afterwards. They do not test the external Google consent screen. Do not run these fixtures against a public website. Automated accessibility checks are supported by keyboard, responsive layout and visual review; they do not establish complete WCAG certification.

## Google sign-in and learning storage

Use `AUTH_SECRET`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. Local callback: `http://localhost:3000/api/auth/callback/google`.

For Vercel, configure those credentials as sensitive production settings, set `AUTH_URL` to the production origin, and authorize that origin followed by `/api/auth/callback/google` in Google Cloud. Preview deployments should not receive production secrets.

Learning identity uses the verified Google provider account identifier, not a display name, email address or Auth.js's temporary user ID. Sessions created before saved learning was introduced need a fresh Google sign-in before account storage is available.

Neon PostgreSQL is connected to Vercel. Use the pooled `DATABASE_URL` for requests and optional `DATABASE_URL_UNPOOLED` for migrations. Never expose these as public browser variables. `npm run db:migrate` applies the additive, repeatable schema in `migrations/001_learning.sql`; it does not delete existing records.

The database stores learners, lesson metadata, versioned learning checkpoints and immutable assessment attempts. Account-scoped routes enforce ownership and validate inputs. Optimistic checkpoint revisions reject stale saves from another tab or device. Submission keys make retries idempotent, and the database enforces the 7-of-10 pass rule. Reflection text is kept on the learner's device and is never uploaded.

## Application structure

- `src/content/`: approved lesson metadata, independent guides and film cue data.
- `src/components/story/StoryPlayer.tsx`: reusable responsive film playback, captions and transcript.
- `src/components/explore/`: purposeful React activities, worked explanations and resumable learning state.
- `src/components/assessment/`: separate official knowledge checks.
- `src/server/`: database access, protected answer banks and authenticated request helpers.
- `src/app/api/me/learning/[slug]`: GET/POST learning checkpoints.
- `src/app/api/assessments/[id]`: GET questions without answer keys.
- `src/app/api/assessments/[id]/submissions`: POST server-graded, idempotent submissions.
- `src/app/api/me/progress` and `assessment-results`: account-owned verified results.
- `src/app/modules/[slug]/lessons/[lessonSlug]/reading`: complete server-rendered reading access.

The four classical approaches remain editorial material in `src/content/foundations-walkthrough.ts` and `scripts/narration-scripts.json` for later curriculum approval. They are not part of the current Lesson 1 UI. Reference slide decks remain local source material and are not deployed.

## Illustrated film production

Before producing a new narrated film, present the script and request the user's recording. Use that recording unchanged. Do not generate, clone or substitute a voice without an explicit request. The latest supplied Lesson 1 recording is the 12 November 2026 00:19:14 file; its checksum is recorded in `animation/assets.json`.

Remotion is isolated production tooling. The application serves rendered desktop and phone MP4s, posters, aligned WebVTT captions and spoken transcripts. There is no browser speech engine or runtime AI service.

```sh
npm ci --prefix animation
npm --prefix animation run typecheck
npm --prefix animation run render:foundations
# Rebuild Lesson 2 only when its content is approved for change:
npm --prefix animation run render
```

Lesson 1's script is `animation/foundations-script.json`; Lesson 2 uses `animation/day-script.json`. Their aligned sentence cues live alongside the films in `public/lessons/what-is-ai/` and `public/lessons/maya-day/`. Reuse the layered Maya character and approved backgrounds. Original generated artwork and narration provenance are recorded in `animation/assets.json`. The user confirmed Remotion licence eligibility for an individual or team of up to three.

Examples describe features that some products implement with AI. Timers illustrate ordinary automation. Situations, records, prices and route estimates are fictional. Evidence links remain in editorial lesson data, with no source-notes panel on the lesson pages. Transcripts contain the spoken text without scene numbering or production labels.

## Release and recovery

Run lint, types, unit/integration checks, a production build and relevant media review before merging. Apply additive migrations before deploying code that needs them. Never put credentials or learner records in Git or logs.

After approved work is merged to main, deploy to Vercel at https://trybuggle.vercel.app and verify both lesson routes, readings, captions, film assets and authenticated storage. If a release fails, promote the previous verified deployment in Vercel. Keep the additive tables and existing learner records when rolling back application code; do not drop data to recover an earlier release. Review function logs without exposing learner information.

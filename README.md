# Buggle Learn

AI literacy for people with no technical background, across everyday life and work.

## Current release

Lessons 1 and 2 each offer **Watch & Listen** and **Read & Explore**. Lesson 1 has a new six-scene film using the user's supplied recording. Lesson 2 preserves the existing Maya film, voice, illustrations and captions. The old 39-slide Lesson 1 player has been removed.

Both lessons include independent interactive guides, complete reading alternatives that work without JavaScript, locally saved reflections and separate official knowledge checks. Each check has helpful feedback and only server-verified results count as a pass; guide activity and playback never do.

**Order and check settings.** Lessons, final assessments and modules open strictly in order: a learner opens a step only after passing every step before it, across modules (`src/server/progression.ts`). Each check's pass mark (default 70%), number of tries (default unlimited) and answer shuffling (default off) are stored in the `assessments` table and read by `src/server/checks.ts`. Every result stores the pass mark it was marked against, so changing a setting never changes an earlier result. Re-importing the course never overwrites these settings.

**Editing questions.** Knowledge checks and final assessments are served and marked from the database (`checkQuestions` in `src/server/checks.ts`), with the course files as the starting point. Admins edit questions, answers, the right answer and explanations at `/admin/course` → a check → "Edit the questions". Once a check is edited there, re-importing the course files never changes its questions again (`questions_edited_at`, migration 013). Checks nobody has edited still follow the files. Lesson films, guides and activities are interactive components, so they stay in the course files.

**Certificates.** One free Essentials certificate comes after every Essentials module, including each final assessment (`/certificate`, rules in `src/server/certificates.ts`). Modules no longer have their own certificate. Module certificates issued earlier still show on the module page and still verify. Every certificate has an ID such as `BL-E-7KQ2-M9XD`, and anyone can check it at `/verify`. The check page shows only the name, what it was for, the dates and the ID, and search engines are told not to list it. Learners can download the PDF, copy the check link, add the certificate to their LinkedIn profile or share it in a post. On the live site (`VERCEL_ENV=production`), every planned module must be complete. Test sites skip modules that are still being made, unless `ESSENTIALS_REQUIRE_ALL=on`. Admins can withdraw a certificate by setting `revoked_at`; its check page then says so.

**Community forum (`/forum`).** The forum has sections, questions and discussions, answers, one level of comments on answers, "helpful" votes, accepted answers and reports. There are no private messages.
- Anyone can read. Posting needs an account, and public names show the first name and last initial only.
- Text is stored and shown as plain text, never HTML, and links get `rel="nofollow ugc"`.
- Fast posting is slowed down: at most 5 new conversations an hour and 20 replies per 10 minutes.
- Authors can edit or delete their own posts. Deleting an account removes the learner's name and words but keeps other people's replies.
- Admins moderate at `/admin/forum`: deal with reports, hide or show posts, pin or close conversations, and add or edit sections.
- Rules are in `src/server/forum.ts`. Starting sections are added by migration 010.

**Organisations (`/organisations`, `/org/<name>`).** Companies, schools and teams create an organisation and choose a plan, priced per learner per year (prices are set by admins at `/admin/organisations`). Owners and managers add members by email invite or a join link, and see everyone's progress and certificates.
- Members see the organisation's name and logo on their dashboard.
- The Buggle content plans include the Deep Dive when it launches (`deepDiveThroughOrg`).
- Payments use Stripe Checkout, Stripe's billing page, and webhooks at `/api/stripe/webhook`. Each webhook event is handled once.
- Without Stripe keys, test sites can switch a plan on without paying; the live site never can.
- Rules are in `src/server/organisations.ts` and `src/server/payments.ts`.

**Admin area (`/admin`).** Admin accounts are separate from learner accounts. They have their own Better Auth setup (`src/admin-auth.ts`), `admin_*` tables, `/api/admin-auth` routes and `buggle-admin` cookie, so a learner login never opens admin pages. There is no admin sign-up.
- The first admin is created once at `/admin/setup`, using the `ADMIN_SETUP_KEY` setting (20+ characters), and only while no admins exist.
- Other admins join by a one-time invite link that expires after 7 days. Only a hash of each link is stored.
- Every admin must set up an authenticator app (TOTP, with 10 backup codes) before any admin page opens. Sessions last 12 hours.
- Admins can see live numbers, look up learners and their results, give a learner one more try on a check with a tries limit, and change each check's pass mark, tries and shuffling. They can also withdraw or restore certificates and manage the team.
- Every change goes into an activity log (`admin_audit`).
- Rules are in `src/server/admin.ts`, and every page and action calls `requireAdmin()`.

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

Browser integration checks need the app running on localhost:3000 with `AUTH_RATE_LIMIT=off` (they sign in many times a minute), a valid local AUTH_SECRET and a configured test database with the migrations applied. `PLAYWRIGHT_BASE_URL` can select another local port. They sign up and log in through the real sign-in, confirm each test learner's email directly in the test database, and remove only their own records afterwards. `npm test` also runs database tests (`tests/db`) against an in-memory Postgres, including the real sign-in setup. They do not test the external Google consent screen. Do not run these fixtures against a public website. Automated accessibility checks are supported by keyboard, responsive layout and visual review; they do not establish complete WCAG certification.

## Sign-in and learning storage

Use `AUTH_SECRET`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` (Google is optional; email and password always work). Local callback: `http://localhost:3000/api/auth/callback/google`. Account emails need `RESEND_API_KEY`, and `EMAIL_FROM` once a sending domain is verified; without a key, test sites print the email link in the server log, and the live site refuses to send.

For Vercel, configure those credentials as sensitive production settings and authorize each site address followed by `/api/auth/callback/google` in Google Cloud. Sign-in works out the address from the request, so `AUTH_URL` is not needed. Preview deployments should not receive production secrets.

Each learner is an account in Better Auth; their progress is stored against the account ID. Accounts are never joined automatically because two emails match: learners link Google from their account page. Progress saved under the old Google sign-in (`google:<Google account ID>`) moves into the account the first time that Google account is used, and results earned as a guest move in on sign-in.

Neon PostgreSQL is connected to Vercel. Use the pooled `DATABASE_URL` for requests and optional `DATABASE_URL_UNPOOLED` for migrations. Never expose these as public browser variables. `npm run db:migrate` applies the additive, repeatable schema in `migrations/`; it does not delete existing records. On the `lms-platform` branch, a GitHub workflow applies migrations and imports the course into the test database (secret `TEST_DATABASE_URL`) on every push.

The database stores learners, lesson metadata, versioned learning checkpoints and immutable assessment attempts. Account-scoped routes enforce ownership and validate inputs. Optimistic checkpoint revisions reject stale saves from another tab or device. Submission keys make retries idempotent, and the database enforces the 7-of-10 pass rule. Reflection text is kept on the learner's device and is never uploaded.

## Application structure

The platform (`src/`) and the course (`courses/ai-literacy/`) are kept apart. The platform reads the course only through `@course`, `@course/ui` and `@course/assessments`; see `courses/README.md`.

- `courses/ai-literacy/content/`: approved lesson metadata, independent guides and film cue data.
- `courses/ai-literacy/activities/`: Read & Explore activities written for specific lessons, and their completion rules.
- `courses/ai-literacy/assessments.ts`: protected question and answer banks (server only).
- `src/components/blocks/`: reusable learning blocks any course can use.
- `src/components/story/StoryPlayer.tsx`: reusable responsive film playback, captions and transcript.
- `src/components/explore/`: the Read & Explore journey and resumable learning state.
- `src/components/assessment/`: separate official knowledge checks.
- `src/auth.ts`: sign-in with Better Auth (email and password, plus Google). Learning needs an account; anyone can browse.
- `src/app/sign-in`, `sign-up`, `forgot-password`, `reset-password`: the sign-in pages. They work without JavaScript.
- `src/server/identity.ts`: moves progress from the old Google sign-in (`google:<id>`) and from guests into an account, so nobody loses anything.
- `src/server/`: database access, authenticated request helpers and the course importer (`course-import.ts`).
- `migrations/006_better_auth.sql`: accounts, sessions, sign-in methods and email links (`auth_*` tables).
- `migrations/005_courses.sql`: courses, sections, items, content blocks and assessments stored as data; see `courses/README.md`.
- `src/app/api/me/learning/[slug]`: GET/POST learning checkpoints.
- `src/app/api/assessments/[id]`: GET questions without answer keys.
- `src/app/api/assessments/[id]/submissions`: POST server-graded, idempotent submissions.
- `src/app/api/me/progress` and `assessment-results`: account-owned verified results.
- `src/app/modules/[slug]/lessons/[lessonSlug]/reading`: complete server-rendered reading access.

The four classical approaches remain editorial material in `courses/ai-literacy/content/foundations-walkthrough.ts` and `scripts/narration-scripts.json` for later curriculum approval. They are not part of the current Lesson 1 UI. Reference slide decks remain local source material and are not deployed.

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

# AGENTS.md : AI Literacy Learning Platform

## 1. Mission

Build a reliable, accessible AI literacy learning platform for people with little or no technical background.

The platform bridges the gap between technical AI knowledge and everyday understanding.

This is a broad public education initiative, not a QA-specific or Testers Connect product.

The primary goal is to help learners understand AI through plain-language explanations, visual learning, guided practice, and verified assessments.

## 2. Source of Truth

Use the approved Product Requirements Document (PRD) as the primary source of requirements.

Do not invent product features, business rules, acceptance criteria, or curriculum content.

Maintain traceability between:

- PRD requirements
- User stories
- Implementation tasks
- Tests
- Delivered functionality

If requirements are missing, ambiguous, or contradictory:

1. Record the question.
2. Explain its impact.
3. Propose options where helpful.
4. Request approval before implementing the decision.

## 3. Confirmed Product Requirements

### Learning Experience

- Visual-first, narrated educational videos.
- Diagrams, animations, and practical demonstrations.
- Watch & Listen: continuous narrated illustrated films with captions, transcripts and learner-controlled playback.
- Read & Explore: separate interactive formative guides with progressive discovery, meaningful feedback and a complete accessible reading alternative.
- Guide activities are unscored and never consume official assessment attempts or satisfy progression.
- Written guides must not simply duplicate video transcripts.
- Learners can revisit lessons.
- Plain-language explanations before technical terminology.
- Examples relevant to different occupations and everyday life.
- Responsive and accessible learning interfaces.

### Narration production rule

- All Buggle Learn narration audio uses the user's own ElevenLabs voice. The welcome, Lesson 1 and Lesson 2 already use it.
- The credentials are `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. Both have already been added to `.env.local`, which is never committed. Never print, log, commit or copy their values anywhere else. If either is missing, ask the user to add it; do not substitute another voice.
- Use only `ELEVENLABS_VOICE_ID` for narration. Do not use any other ElevenLabs voice, another text-to-speech service, or browser speech.
- Before producing any new lesson narration, present its script for review. Generate the audio only after the user approves the script.
- Check that the generated audio matches the approved script, then align the animation, captions and transcript to the words actually spoken.
- Reuse existing approved narration for its own lesson without regenerating it. When the user supplies or approves a replacement, use the latest version for that lesson after checking its content. Clarify any mismatch before changing the published lesson.

### Assessments

- Mandatory knowledge checks throughout the learning path.
- Learners must achieve the approved passing score before progressing.
- Learners can review material and retry failed assessments.
- Assessment results must be validated and stored securely on the server.
- A final Module 1 assessment is required.

### Certification

- Only Module 1, Foundations of Artificial Intelligence, awards a certificate at initial launch.
- Certificates are awarded only after all Module 1 requirements are satisfied.
- Certificate type: Certificate of Completion.
- Certificates must not claim external accreditation.
- Certificate eligibility must be verified server-side.
- Certificates must include the learner's name, programme title, and completion date.

### Curriculum Direction

1. Foundations of Artificial Intelligence
2. Types of AI Systems
3. Machine Learning
4. Generative AI and Large Language Models
5. AI Agents and Workflows
6. Practical No-Code AI-Assisted Workflows

The detailed curriculum and scope of later modules require approval.

## 4. Product Decisions

### Approved

- Minimum passing score: 70%, including the Module 1 final assessment.
- Maximum lesson duration: eight minutes. Module planned content: 30 to 60 minutes, with a one-hour cap.
- The first two lessons can be previewed before Google sign-in. Sign-in is required for account progress and official results.
- Accessibility target: WCAG 2.2 AA.
- Buggle Learn is completely free. Every module, lesson, knowledge check, assessment and certificate is free, with no payments, paid tiers, subscriptions or paywalls. Do not add pricing, payment, upgrade or subscription prompts, and do not integrate a payment provider.
- Questions per knowledge check: 10.
- No fixed retry limit. After a failed assessment, learners review feedback and retry that assessment only; they do not restart lessons or modules, and completed progress is preserved.
- All required Module 1 lessons and quizzes must be passed before certificate eligibility.
- Module 1 awards the only certificate available at initial launch.
- Certificate type: Foundations of Artificial Intelligence : Certificate of Completion.
- Certificate uses the learner's confirmed name.
- Google sign-up is the only authentication method at launch.
- All modules are free. Google sign-in (free) is required for saved progress, official results and certificates; the first two lessons can be previewed without it.

### Recommended : Awaiting Approval

- Allow learners to confirm their certificate name before issuance.

## 5. Architecture Principles

Inspect the existing repository before recommending architectural changes.

Prefer:

- Simple, maintainable architecture.
- Type-safe interfaces.
- Reusable components.
- Clear frontend/backend separation.
- Secure authentication and authorization.
- Relational storage for learners, lessons, progress, and assessment records.
- Server-side validation of scores and certificate eligibility.
- Managed services where they reduce unnecessary maintenance.

Do not introduce microservices, event brokers, AI APIs, or other infrastructure without a justified requirement.

## 6. Implementation Workflow

### Gate 0 : Discovery

- Inspect existing code, dependencies, architecture, and deployment.
- Review the PRD and confirmed decisions.
- Identify missing requirements and risks.
- Produce a proposed implementation plan.

STOP for approval.

### Gate 1 : Design

- Define data models and relationships.
- Define API contracts.
- Define authentication and authorization.
- Design the learner journey and accessibility requirements.
- Establish acceptance tests.

STOP for approval.

### Gate 2 : Build in Vertical Slices

Implement complete, testable user journeys in this order:

1. Discover the platform and browse curriculum.
2. Register, sign in, and open a lesson.
3. Watch a lesson or use its written guide.
4. Complete a mandatory knowledge check.
5. Save assessment results and unlock progression.
6. Complete the Module 1 final assessment.
7. Verify eligibility and issue a certificate.
8. Review learning history and certificate.

For each slice:

- Implement frontend and backend changes together.
- Add required database migrations.
- Add automated tests.
- Verify accessibility.
- Demonstrate working functionality.
- Obtain review before proceeding.

### Gate 3 : Quality Assurance

Test:

- Functional requirements and acceptance criteria.
- Authentication and authorization.
- Assessment scoring and retries.
- Progression and locked lessons.
- Certificate eligibility.
- Duplicate submissions.
- API validation and error handling.
- Responsive layouts and accessibility.
- Data integrity and migration safety.
- Security and privacy requirements.

Never trust browser-submitted scores or completion flags.

### Gate 4 : Release

Before deployment:

- Run linting, type checks, and automated tests.
- Validate environment configuration.
- Check database migration safety.
- Verify video and learning asset availability.
- Perform end-to-end learner journey testing.
- Check logs, monitoring, and error reporting.
- Confirm rollback and recovery procedures.

The user has given standing approval to deploy approved, tested work to Vercel after it is merged. After each merge, verify the Vercel production deployment and share its live URL. Do not ask for repeat deployment permission. Separate approval requirements for credentials or unrelated changes still apply.

## 7. Engineering Quality Rules

- Keep functions and components focused.
- Avoid unnecessary abstraction.
- Prefer existing repository conventions.
- Use strict input validation.
- Never commit credentials or secrets.
- Apply least-privilege access.
- Do not expose assessment answers before submission.
- Do not allow users to modify another learner's records.
- Use accessible semantic components.
- Provide captions or transcripts for narrated content.
- Test critical business logic independently of the UI.
- Do not bypass failing tests to complete a task.

## 8. Definition of Done

A feature is complete only when:

- Its PRD requirement is traceable.
- Its acceptance criteria are satisfied.
- Required frontend and backend behaviour works.
- Automated tests pass.
- Security and accessibility have been considered.
- Errors and edge cases are handled.
- Documentation is updated.
- The feature has been reviewed.

## 9. Agent Reporting

For every implementation task, report:

1. Requirement or user story addressed.
2. Existing behaviour inspected.
3. Files changed.
4. Implementation summary.
5. Tests added and executed.
6. Known limitations or risks.
7. Decisions requiring human approval.
8. Recommended next vertical slice.

Do not claim functionality is complete without verification.

# AI Literacy Platform : Design System

**Document:** DESIGN_SYSTEM.md
**Status:** Design specification : initial version
**Product:** AI Literacy Learning Platform
**Design direction:** Friendly, professional, accessible, visual-first

---

## 1. Purpose

Define the visual identity, layouts, reusable components, responsive behaviour, and interaction standards for the AI Literacy Learning Platform.

The platform serves people with little or no technical background, including professionals, students, and curious individuals.

The design must make learning AI feel approachable without appearing childish, overly technical, or intimidating.

### Core design principle

"Understand it. See it. Practise it. Prove you've learned it."

The learning experience is the primary product. Navigation, dashboards, and supporting features must make learning easier rather than distract from it.

## 2. Design Objectives

The interface must:

1. Feel welcoming to complete beginners.
2. Maintain the credibility of a professional education platform.
3. Prioritise visual explanations over long blocks of text.
4. Provide clear navigation and progression.
5. Work well on mobile, tablet, and desktop.
6. Support learners with varying digital confidence.
7. Provide accessible and predictable interactions.
8. Make assessments and certificate requirements understandable.
9. Distinguish free and paid learning without confusing users.
10. Avoid unnecessary complexity.

## 3. Visual Identity

### 3.1 Colour Palette

Proposed design tokens:

| Token    | Hex     | Usage                             |
| -------- | ------- | --------------------------------- |
| Navy     | #17243C | Primary headings, navigation      |
| Violet   | #7155D9 | Primary actions, active states    |
| Teal     | #087F72 | Success, progress                 |
| Ivory    | #F7F5EF | Warm page backgrounds             |
| Lavender | #EAE5FA | Learning cards, subtle highlights |
| Slate    | #526174 | Secondary text                    |
| White    | #FFFFFF | Content surfaces                  |

These colours are the proposed visual direction and should be validated for accessibility.

### 3.2 Semantic Colours

Use semantic tokens rather than hardcoded colours throughout the application.

Required categories:

- Primary
- Secondary
- Background
- Surface
- Text primary
- Text secondary
- Border
- Success
- Warning
- Error
- Disabled
- Focus

Every semantic colour combination must meet the applicable accessibility contrast requirements.

Do not use colour alone to communicate status.

### 3.3 Typography

Recommended font families:

- Primary: Plus Jakarta Sans
- Alternative: Inter
- Fallback: system sans-serif

Suggested type scale:

| Element         | Desktop | Mobile |
| --------------- | ------- | ------ |
| Hero heading    | 48px    | 32px   |
| Page heading    | 36px    | 28px   |
| Section heading | 28px    | 24px   |
| Card heading    | 20px    | 18px   |
| Body            | 16px    | 16px   |
| Supporting text | 14px    | 14px   |
| Caption         | 12px    | 12px   |

Requirements:

- Learner-facing copy must not use em dashes.
- Comfortable line height.
- Strong visual hierarchy.
- Readable paragraph widths.
- Avoid unnecessary uppercase text.
- Do not rely on font weight alone to convey meaning.
- Support text resizing without content loss.

### 3.4 Spacing

Use a consistent spacing scale:

4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.

Prefer consistent spacing tokens over arbitrary values.

### 3.5 Borders and Corners

Recommended:

- Small controls: 8px radius.
- Cards: 12–16px radius.
- Large panels: 16–20px radius.
- Pills and progress indicators: fully rounded where appropriate.

Use subtle borders and restrained shadows.

Avoid excessive decoration.

### 3.6 Iconography

Use one consistent icon family.

Recommended: Lucide.

Icons must:

- Have accessible labels when interactive.
- Support rather than replace text.
- Use consistent sizes and stroke weights.
- Avoid decorative clutter.

## 4. Visual Learning Language

Visual explanations are a core product feature.

Use:

- Animated diagrams.
- Step-by-step visual sequences.
- Everyday objects and scenarios.
- Simple comparisons.
- Flow diagrams.
- Process animations.
- Consistent representations of AI concepts.

Avoid:

- Unnecessary robot imagery.
- Complex architecture diagrams for beginners.
- Dense technical terminology.
- Decorative animation without educational value.
- Excessive movement or flashing effects.

Every meaningful visual must support a learning objective.

## 5. Application Navigation

### Primary navigation

Recommended destinations:

1. Explore
2. My Learning
3. My Certificate
4. Profile

Navigation must remain simple and consistent.

### Authentication

Confirmed launch decision:

- Google sign-up/sign-in only.

Unauthenticated visitors should be able to understand the platform's offering.

Protected learning progress, assessments, and certificates require authenticated learner identity.

Whether all lesson content requires authentication remains a product decision.

### Navigation behaviour

- Clearly identify the current page.
- Provide a visible route back to the learning dashboard.
- Preserve lesson progress where supported.
- Avoid unnecessary navigation layers.
- Use clear labels rather than technical jargon.

## 6. Page Specifications

### 6.1 Landing Page

Purpose:

Help visitors understand what the platform offers and whether it is relevant to them.

Required sections:

1. Header and navigation.
2. Hero message.
3. Primary learning CTA.
4. Preview of the visual learning experience.
5. Learning outcomes.
6. Free module overview.
7. How learning works.
8. Foundations certificate information.
9. Footer.

Suggested hero:

"AI isn't just for tech people."

Supporting message:

"Understand artificial intelligence through everyday explanations, visual lessons, and practical activities. No coding or technical background required."

Primary CTA:

"Start learning for free"

Secondary CTA:

"Preview a lesson"

The landing page must not imply that the platform guarantees employment or professional accreditation.

### 6.2 Learning Dashboard

Purpose:

Give authenticated learners one clear next step.

Required elements:

- Welcome message.
- Current learning module.
- Overall module progress.
- Next available lesson.
- Continue learning action.
- Completed lessons.
- Locked lessons and their requirements.
- Assessment status.
- Foundations certificate status.

The dashboard must not overwhelm learners with unnecessary statistics.

### 6.3 Curriculum Page

Display modules in their approved learning sequence.

Each module card should show:

- Module title.
- Plain-language description.
- Learning outcomes.
- Estimated duration.
- Progress.
- Free or paid access.
- Available, locked, or completed state.

Do not imply that a module awards a certificate unless it does.

At initial launch, only Module 1 awards a certificate.

### 6.4 Lesson Player

This is the highest-priority screen.

Required elements:

- Module and lesson title.
- Narrated visual lesson player.
- Play/pause.
- Seek and replay.
- Playback speed.
- Volume.
- Captions.
- Full-screen option where supported.
- Two clearly named route controls: Watch & Listen and Read & Explore.
- Separate interactive guide with a complete reading alternative.
- Switching to the guide pauses the film; returning preserves the playback position.
- Key terminology.
- Lesson progress.
- Knowledge-check navigation.

Use a 16:9 film on wider screens and the authored portrait composition on phones. Preserve the current position and playback speed when switching sizes. Never autoplay.

The written guide must be accessible independently of video playback.

Do not require the learner to watch a talking-head video.

The video must actively explain concepts through visual cues, diagrams, animations, and demonstrations.

### 6.5 Read & Explore

The guide is an independent, interactive learning experience, not a transcript or a second slide player. Show one purposeful activity at a time with Previous/Continue, an activity count and optional navigation to earlier activities.

Use varied interactions: tap to reveal, inspect a diagram, compare changing outcomes, connect related ideas, find an unsupported claim, repair an example or reflect. Explain feedback immediately. Avoid turning every step into multiple choice.

All activities are unscored. Only the separate official knowledge check can award a pass. Provide keyboard and tap alternatives to dragging, visible focus, labelled controls, screen-reader feedback and reduced-motion behavior. Keep primary controls legible at phone widths and high zoom.

Save the route, activity state and film position. Show whether the place is saved on the device or account, and make failures and conflicting saves recoverable. Keep reflection text local and explain its storage.

Provide a complete server-rendered reading alternative with worked examples and all essential outcomes. It must work with JavaScript disabled and without playing the film.

Structure:

1. Lesson objective.
2. Plain-language introduction.
3. Step-by-step explanation.
4. Visual diagrams or supporting images.
5. Everyday scenario.
6. Key terms.
7. Summary.
8. Next learning activity.

Use headings, short paragraphs, and readable spacing.

Avoid dense walls of text.

### 6.6 Knowledge Check

Confirmed rules:

- 10 questions per knowledge check.
- Minimum passing score: 70%.
- Knowledge checks are mandatory.
- Passing is required for progression.
- After a failed assessment, learners review feedback and relevant material, then retry that assessment only. They do not restart lessons or modules, and completed progress is preserved. No fixed retry limit.

Recommended interface:

- One question at a time.
- Clear question numbering.
- Visible progress indicator.
- Accessible answer controls.
- Previous/next navigation where appropriate.
- Explicit submission action.
- Clear pass/fail result.
- Explanatory feedback.
- Review guidance and a retry action displayed after a failed result.

Do not reveal protected assessment answers before submission if doing so compromises assessment integrity.

The backend must calculate the official score.

### 6.7 Assessment Results

Show:

- Assessment title.
- Score.
- Pass/fail status.
- Corrective feedback.
- Retry availability.
- Next steps.

Do not use humiliating, judgemental, or discouraging language.

Failed assessments should provide a clear path back to learning material.

### 6.8 Certificate Screen

Confirmed:

- Module 1 certificate only.
- Certificate of Completion.
- Learner's confirmed name.
- Issued after verified completion.

Required interface:

- Completion status.
- Certificate eligibility.
- Name confirmation before issuance.
- Certificate preview.
- Download action.
- Issuance date.

The backend must verify eligibility.

Do not generate a certificate solely because the frontend reports completion.

### 6.9 Paid Learning Access

The platform will offer free and paid learning.

Confirmed:

- First two modules are free.
- Practical agent-workflow learning is intended to be paid.

Exact pricing tiers and content boundaries remain open.

Design requirements:

- Clearly label paid content.
- Explain what is included before payment.
- Do not interrupt free lessons with aggressive upselling.
- Preserve earned progress.
- Do not imply a certificate is available for paid modules at launch.

## 7. Component Library

Create reusable components for:

- AppHeader
- AppNavigation
- PageContainer
- PrimaryButton
- SecondaryButton
- ModuleCard
- LessonCard
- LessonPlayer
- LearningGuide
- ProgressBar
- ProgressIndicator
- QuizQuestion
- QuizAnswerOption
- QuizFeedback
- AssessmentResult
- CertificatePreview
- AccessGate
- LoadingState
- EmptyState
- ErrorState
- ConfirmationDialog

Reuse existing repository components where suitable.

Avoid introducing multiple competing UI libraries.

## 8. Interaction States

Every interactive component must support applicable states:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Success
- Error

Assessment components additionally require:

- Not started
- In progress
- Submitted
- Passed
- Failed
- Retry available after review

Learning components additionally require:

- Locked
- Available
- In progress
- Completed

## 9. Responsive Design

### Mobile

- Single-column layouts.
- Touch-friendly controls.
- Full-width lesson player.
- Written guide below video.
- Readable quiz answers.
- Minimal navigation complexity.

### Tablet

- Responsive card grids.
- Comfortable reading widths.
- Optional expanded navigation.

### Desktop

- Wider learning workspace.
- Optional lesson sidebar.
- Main content remains the focus.
- Avoid overly wide reading paragraphs.

Suggested breakpoints:

- Mobile: below 640px.
- Tablet: 640–1023px.
- Desktop: 1024px and above.

These are implementation recommendations, not business requirements.

## 10. Accessibility

Target WCAG 2.2 AA.

Requirements:

- Keyboard navigation.
- Visible focus indicators.
- Accessible labels.
- Semantic headings.
- Captions for narrated videos.
- Transcripts where appropriate.
- Text alternatives for meaningful visuals.
- Sufficient contrast.
- Responsive text resizing.
- Reduced-motion support.
- Accessible quiz controls.
- Clear error messages.
- No information conveyed through colour alone.

Visual learning must not exclude learners who cannot see or hear the content.

## 11. Performance

Prioritise mobile and variable-bandwidth connections.

Requirements:

- Lazy-load nonessential assets.
- Avoid unnecessary JavaScript.
- Optimise images and animations.
- Use appropriate video encoding and delivery.
- Provide readable written content when video cannot load.
- Avoid blocking the entire lesson because of nonessential media failures.

Define measurable performance budgets during architecture review.

## 12. Design Implementation Workflow

Before implementation:

1. Inspect the existing repository.
2. Review the PRD and approved decisions.
3. Identify existing design conventions.
4. Produce wireframes or component specifications.
5. Confirm responsive layouts.
6. Review accessibility requirements.
7. Obtain approval.

Implement one complete user journey at a time.

Do not redesign unrelated application areas without approval.

## 13. Design Definition of Done

A screen is complete when:

- It matches approved requirements.
- Responsive layouts work.
- Required interaction states exist.
- Accessibility checks pass.
- Navigation is functional.
- Errors and empty states are handled.
- Relevant automated tests pass.
- No placeholder functionality is represented as complete.
- The design has been reviewed.

## 14. Open Design Decisions

- Final product name and logo.
- Final font selection.
- Final approval of the colour palette.
- Exact video player implementation.
- Whether lesson navigation uses a sidebar.
- Exact quiz feedback timing.
- Final certificate artwork.
- Pricing page structure.
- Premium tier presentation.

Do not silently resolve these decisions during implementation.

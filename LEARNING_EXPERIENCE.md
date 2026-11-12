# AI Literacy Platform : Learning Experience Specification

**Document:** LEARNING_EXPERIENCE.md
**Status:** Initial specification
**Product:** AI Literacy Learning Platform
**Audience:** People with little or no technical background

---

## 1. Educational Mission

Make artificial intelligence understandable and accessible to everyday people.

The platform bridges the gap between technical AI education and practical understanding.

It is not intended exclusively for software professionals.

Learners may include:

- Teachers
- Nurses
- Receptionists
- Administrators
- HR professionals
- Tech Professionals
- Students
- Jobseekers
- Small-business owners
- Anyone curious about AI

No programming or technical background is required.

## 2. Learning Philosophy

The platform follows four principles:

1. Understand it.
2. See it.
3. Practise it.
4. Prove you've learned it.

Learners should understand the concept before being expected to use a tool.

Use everyday language without sacrificing technical accuracy.

**Everyday-first teaching:** Begin with something the learner already knows, show it happening through a realistic scenario, explain the idea in natural language, and only then introduce the technical term. The learner should never have to understand technical jargon before they can understand the example.

Do not assume learners are familiar with AI products or technical vocabulary.

Design for someone who has never encountered AI. Open the first lesson with a short working definition and a familiar example of automation that does not require AI, before mentioning products or the four classical approaches.

## 3. Learning Delivery Model

Every published lesson offers two distinct routes from the same page: **Watch & Listen** and **Read & Explore**. Both cover the same essential learning outcomes. Learners may choose either or switch between them. The official knowledge check is separate from both routes.

### 3.1 Narrated Visual Lessons

Each visual lesson has a clear opening, a sequence of demonstrations and a short recap. Give each abstract concept a realistic example and use the visuals to show what happens and why it matters.

Use illustrations, diagrams, visual comparisons and animation to make the steps or changes visible. Introduce terminology on screen after the example makes the idea clear. Keep on-screen explanation concise and provide captions for the spoken detail.

Use generated image illustrations to establish familiar human situations. Reuse suitable supplied images and the existing generated learner artwork. Keep changing values, dialogue, labels and explanations as accessible text or diagrams alongside the artwork. A static illustration establishes the setting; the progressive visual sequence must still explain what happens.

The primary presentation should not depend on a person speaking directly to the camera.

Watch & Listen is a continuous narrated, illustrated story with purposeful animation, demonstrations and diagrams. Vary the visual treatment to suit the concept. Read & Explore supplies learner-paced interactive discovery; do not add a second slide player beside the film. No media starts automatically.

Offer learner-controlled playback and an independent written guide. Continuous stories follow one character through believable situations, with purposeful character actions and visual changes timed to the narration. Learners can pause, seek, replay and move between meaningful moments. Switching to the written guide pauses playback.

Do not autoplay. Learners who prefer reduced motion can choose the written guide or transcript. Pausing freezes both the visual story and audio. Captions, transcripts, keyboard controls and independently useful written guides remain required.

Use original generated artwork for settings and approved character references. Reuse a consistent character model, poses, props, palette and motion components. Do not regenerate the character independently for every shot. Every animation and example needs an educational accuracy review.

Lesson 2 follows Maya in one continuous illustrated film using the user's supplied narration recording. The film runs for approximately 3 minutes 13 seconds. Its six moments are her morning alarm, finding a dog photo for a club poster, checking traffic, browsing a camera bag, finding a booking message in Spam, and preparing the community centre for an evening photography club. The alarm illustrates simple automation. The four possible AI uses illustrate recognition, prediction, recommendation and classification, with a human check in each case. Remotion is isolated production tooling; the app serves the rendered desktop and phone films, captions, and a plain transcript of the spoken words. The film has no branding banner; the page has no film-duration eyebrow or source-notes panel. Transcript content has no scene headings or "On screen" labels. The independent written guide remains available, and the existing reflection activity follows the film.

Recorded narration is the primary audio. Time meaningful movement and captions to the relevant words. Browser speech is not a replacement for produced narration. Narration should describe the meaningful visual actions so that its transcript is useful on its own.

**Narration recording comes before film production.** For every new lesson, present the proposed script and request the user's recording before rendering its narrated film. Use the supplied voice recording unchanged. Check that it covers the intended lesson, then align captions, transcript and meaningful visual changes to the words actually spoken. Do not generate or substitute a voice unless the user explicitly requests a voice preview for that lesson. A preview requires review and is not automatically approved for publication. Reuse existing approved recordings for their own lessons without requesting them again. When a replacement is supplied, use the latest file for the requested lesson after checking its content; clarify any mismatch before changing the published lesson.

Before implementing a new story, review and approve its storyboard, visual sequence, interactions and narration.

### 3.2 Read & Explore

Each lesson has an independent interactive learning guide covering the same essential outcomes as the film. It must teach the topic without requiring the learner to watch the film first.

- Introduce ideas progressively through familiar situations, illustrations, short explanations and meaningful feedback.
- Vary interactions according to the learning purpose: reveal information, match input to output, inspect evidence, compare outcomes, change a simulation, make a scenario decision or reflect.
- Matching must also work through click, tap and keyboard selection. Never require dragging.
- Do not make every activity a multiple-choice question or a static text card.
- Provide a worked explanation for every activity and a complete accessible reading alternative that works without JavaScript.
- Include plain definitions, diagrams, practical examples, key takeaways and a reflection.
- Allow learners to go back, revisit any activity and resume their place.
- Activities are formative and unscored. They do not create assessment attempts, pass a lesson or unlock gated content.
- Reflection notes stay on the device and are not sent to the server. Explain this and discourage personal or confidential information.

A transcript alone does not satisfy this requirement. The guide uses an independent teaching sequence and worked examples rather than copying the spoken script.

### 3.3 Mandatory Knowledge Checks

Every defined lesson or learning unit must have a mandatory knowledge check.

Confirmed:

- 10 questions.
- 70% minimum passing score.
- Passing required for progression.
- After a failed assessment, learners review feedback and relevant material, then retry that assessment only. They do not restart lessons or modules, and completed progress is preserved. No fixed retry limit.

### 3.4 Guided Practical Activities

Where relevant, learners apply concepts through guided tasks.

Activities must:

- Have a clear learning objective.
- Use plain-language instructions.
- Explain what the learner should observe.
- Include guidance on reviewing outputs.
- Avoid requiring programming knowledge.
- Use fictional or non-sensitive data.

External AI tools may be used, but the platform does not require its own AI model API for the initial learning experience.

## 4. Standard Lesson Structure

Each lesson provides the following across its two alternative learning routes. Learners choose Watch & Listen or Read & Explore before taking the separate knowledge check; both routes are not mandatory.

### Step 1 : Learning Objective

Explain what the learner will understand by the end.

Use plain language.

### Step 2 : Familiar Situation

Start with a relatable situation the learner can recognise before introducing the concept or its technical name.

For example:

"Have you noticed how your email sometimes knows which messages are spam?"

### Step 3 : Visual Explanation

Show the situation unfolding and narrate the meaningful changes as they happen. Explain the idea in everyday language, then introduce its technical name.

### Step 4: Read & Explore

Provide progressive interactive discovery with meaningful feedback, independent worked explanations and a complete reading alternative.

### Step 5 : Practical Connection

Show how the concept relates to work, education, or everyday life.

Use examples from varied contexts.

### Step 6 : Key Takeaways

Return to the examples and show how they connect to the main ideas.

### Step 7 : Knowledge Check

Present the mandatory 10-question assessment.

### Step 8 : Progression

If the learner passes, unlock the next required lesson.

If the learner fails, provide feedback and direct them to the relevant material. They may retry that assessment only. They do not restart the lesson or module, and completed progress is preserved. No fixed retry limit.

## 5. Lesson Duration

Approved: each lesson is no longer than eight minutes. Lessons may be shorter where the concept needs less explanation. Aim for 30 to 60 minutes of planned content per module, with a one-hour cap. Do not impose a timer on accessibility needs, reading, revisiting material or assessment retries.

Keep narration concise, show rather than repeat paragraphs, and provide pause, seek and replay. Lesson 1's supplied recording is approximately four minutes; Lesson 2's existing film is approximately three minutes thirteen seconds.

## 6. Curriculum Structure

Proposed curriculum sequence:

### Module 1 : Foundations of Artificial Intelligence

Purpose:

Help learners understand what AI is, how it developed, and why it matters.

Suggested topics:

1. What is artificial intelligence?
2. A brief history of AI.
3. AI in everyday life.
4. How AI differs from ordinary software.
5. What AI can and cannot do.
6. Responsible AI use.

This is the only module that awards a certificate at initial launch.

Detailed lesson titles require curriculum approval.

#### Approved Lessons 1 and 2

The November 2026 approval replaces Lesson 1's 39-slide walkthrough with a continuous six-scene film. The four classical approaches are retained as editorial material for a later learning unit, subject to curriculum approval. They are not the opening explanation of AI.

##### Lesson 1: What is AI?

| Scene                                | Narrative and meaningful visual change                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. What is AI?                       | Meet Maya in a familiar setting. Explain artificial intelligence in everyday language. Introduce recognising patterns, predicting, solving problems and creating content through practical examples.                |
| 2. Automatic does not always mean AI | Maya sets a kitchen timer, then speaks a reminder into a phone. Contrast a fixed countdown with a speech-recognition demonstration. Explain that some AI uses knowledge and rules, while some learns from examples. |
| 3. Learning from examples            | Show labelled cats and dogs, then a different dog and a partly hidden cat. Reveal a correct and an incorrect prediction. Label this as a simplified illustration, not a real model being trained.                   |
| 4. A first draft                     | Maya supplies meeting details. A fictional generative tool builds an invitation. Introduce generative AI after showing it create text.                                                                              |
| 5. Check the time                    | Compare the draft's incorrect meeting time with the team calendar. Maya corrects the draft using the record. A fluent answer is not proof of accuracy.                                                              |
| 6. Maya decides                      | Revisit the useful tasks, appropriate privacy precautions and human checks. End by inviting the learner to explain AI in their own words.                                                                           |

Use the user's latest approved recording unchanged. The actual spoken script is in `animation/foundations-script.json`; aligned cues and captions are in `public/lessons/what-is-ai/`. Reuse Maya's character and community-centre artwork and an original generated kitchen illustration. Keep essential visual changes synchronized to the recording.

Read & Explore has eight activities: reveal inputs and outputs; compare a timer with speech recognition; match information to useful results; test a simplified learning demonstration; assemble a safe invitation request; investigate a wrong day and unsupported parking claim; repair the draft and consider higher-stakes checking; explain the idea in the learner's own words. Its independent worked example is a volunteer meeting on Thursday at 6 pm in Room Three. The complete reading alternative includes all explanations, evidence and worked outcomes.

##### Lesson 2: AI in Your Day

Preserve Maya's existing film, supplied narration, illustrations, aligned captions and playback controls.

1. Morning: her seven o'clock alarm illustrates simple automation.
2. Photo: she searches for a dog photo, then checks the actual result.
3. Journey: she compares travel-time estimates and checks the route.
4. Shopping: she inspects a suggested camera bag and its fit and price.
5. Message: she finds a booking in Spam and checks through her records or a known contact.
6. Recap: connect recognition, prediction, recommendation and classification to suitable human checks.

Read & Explore follows the same day through seven activities: explore a location map; inspect the alarm and search a photo library; update traffic and compare changed estimates; inspect a camera bag's stated capacity and price; find and verify a missing message; connect tasks to their everyday names; reflect on a tool in the learner's own day. It applies the concepts rather than repeating Lesson 1's definition. Recognition, prediction, recommendation and classification are overlapping tasks, not exclusive categories of AI.

#### Accuracy and evidence

Source-supported claims and links remain in editorial lesson data, not a learner-facing source-notes panel. Evidence includes the OECD AI definition, Google's machine-learning introduction, NIST's generative AI risk profile, Apple photo-search documentation, Google DeepMind traffic prediction, AWS recommendations and Google Workspace spam filtering. Qualify examples as features that some tools implement with AI. A feature's appearance alone does not prove that it uses AI. All demonstrated records, prices, messages and travel times are fictional.

### Module 2 : Types of AI Systems

Purpose:

Help learners recognise that AI is not one single technology.

Suggested topics:

- Rules-based systems.
- Predictive AI.
- Generative AI.
- Different capabilities and limitations.
- Everyday applications.

Module 2 is free.

No certificate is awarded for this module at initial launch.

### Module 3 : Understanding Machine Learning

Purpose:

Explain how many AI systems learn patterns from data.

Suggested topics:

- What machine learning means.
- Training data.
- Supervised learning.
- Unsupervised learning.
- Classification and regression.
- Testing and evaluation.
- Data quality and bias.

### Module 4 : Generative AI and LLMs

Purpose:

Help learners understand tools that generate text, images, and other content.

Suggested topics:

- What generative AI means.
- What large language models are.
- How language models generate responses.
- Why context matters.
- Hallucinations and verification.
- Practical uses and limitations.

### Module 5 : Understanding AI Agents

Purpose:

Explain AI agents and AI-assisted workflows in accessible language.

Suggested topics:

- What an AI assistant is.
- What an AI agent is.
- Instructions and context.
- Tools and actions.
- Multi-step workflows.
- Human oversight.
- Common limitations.

Important distinction:

A configured ChatGPT Project is not automatically an autonomous AI agent.

An AI-assisted workflow may become more agent-like when a system can use tools, carry out multi-step tasks, and take actions toward a goal within defined boundaries.

Teach this distinction without unnecessary technical complexity.

### Module 6 : Creating AI-Assisted Workflows

Purpose:

Help learners build useful, no-code workflows for everyday tasks.

Suggested activities:

- Creating a structured ChatGPT Project.
- Writing reusable instructions.
- Providing relevant context.
- Organising information.
- Drafting routine documents.
- Reviewing AI-generated output.
- Understanding when human approval is required.

Avoid requiring Python or other programming languages.

Like every module, this practical-learning area is free.

## 7. Occupation-Based Learning

The platform must demonstrate how AI concepts apply across different occupations.

Examples may include:

### Teacher

- Drafting lesson outlines.
- Generating classroom activities.
- Simplifying explanations.
- Reviewing AI-generated teaching materials.

### Receptionist

- Drafting routine messages.
- Organising appointment information.
- Preparing administrative summaries.

### HR Professional

- Drafting job descriptions.
- Summarising non-confidential policies.
- Preparing interview questions.
- Recognising bias and privacy concerns.

### Administrator

- Structuring reports.
- Organising information.
- Creating document templates.

### Nurse

- Understanding AI terminology used in healthcare.
- Exploring low-risk administrative uses.
- Recognising why clinical decisions require qualified human judgement.

### Student

- Understanding difficult concepts.
- Creating study plans.
- Practising explanations.
- Checking AI-generated information.

Do not require learners to choose an occupation before accessing foundational learning.

Role-based examples should support the same core learning objectives.

## 8. Assessment Rules

### Confirmed

- Knowledge checks are mandatory.
- Each knowledge check contains 10 questions.
- Minimum passing score is 70%.
- At least 7 correct answers are required.
- Learners must pass before progressing.
- After a failed assessment, learners review feedback and relevant material, then retry that assessment only. They do not restart lessons or modules, and completed progress is preserved. No fixed retry limit.

Do not permanently lock learners out after a failed assessment.

### Assessment Design

Questions should test understanding rather than memorisation alone.

Use a suitable mixture of:

- Multiple-choice questions.
- Scenario-based questions.
- Concept recognition.
- Identifying appropriate AI use.
- Recognising limitations and risks.

Question formats requiring free-text grading or AI judging are not approved for the initial launch.

### Assessment Feedback

After submission, show:

- Score.
- Pass/fail status.
- Explanation of mistakes.
- Relevant revision materials.
- Retry action for the same assessment after review.
- Next available action.

The system must not treat an unsubmitted assessment as completed.

## 9. Assessment Security

Assessment scoring must occur on the server.

Requirements:

- Validate authenticated learner identity.
- Validate submitted question and answer identifiers.
- Calculate the official score on the backend.
- Store attempts and results.
- Allow learners to retry the same assessment after review without resetting completed lesson or module progress.
- Prevent duplicate submissions from creating inconsistent records.
- Prevent learners from changing scores or completion flags.
- Protect unpublished assessment answer keys.
- Record assessment completion consistently.

The frontend may display progress but is not the authority for official results.

## 10. Learning Progress

The system must track:

- Learner identity.
- Module enrolment or access.
- Available lessons.
- Completed lessons.
- Assessment attempts.
- Assessment results.
- Module completion.
- Certificate eligibility.
- Certificate issuance.

Progress must persist across authenticated sessions and devices. Save the selected route, current guide activity, non-sensitive interaction state and film position separately from official assessment results. Visitors can resume on the same device; after sign-in, an existing account checkpoint takes precedence over a guest checkpoint.

Only server-verified assessment results satisfy progression requirements. Playback, visited activities and reflection text are not evidence of a pass. Reject stale checkpoint writes rather than silently overwriting a newer save from another device. Explain failed saves honestly and allow retry. Reflection notes remain device-local.

A learner must not be able to modify another learner's records.

## 11. Progression Rules

A learner progresses when:

1. The required learning unit is completed.
2. Its mandatory knowledge check is passed.
3. Any additional approved prerequisites are satisfied.

The next gated lesson becomes available only after the progression rules are satisfied. The first two approved public preview lessons are an access exception; opening either preview does not award completion.

Previously completed lessons remain available for revision.

Record the learning place for convenience. Record official lesson completion only from a verified passing knowledge-check result.

Do not assume video playback alone proves understanding.

## 12. Foundations Certificate

### Confirmed

- Only Module 1 awards a certificate at launch.
- Certificate title:
  "Foundations of Artificial Intelligence : Certificate of Completion"
- The certificate uses the learner's confirmed name.
- Certificates are issued after verified completion.
- The platform supports certificate download.

### Eligibility

The learner must:

1. Complete all required Module 1 lessons.
2. Pass all required Module 1 knowledge checks.
3. Complete the Module 1 final assessment.
4. Meet the approved final assessment passing criteria.
5. Confirm the name displayed on the certificate.

The approved minimum passing threshold is 70%, including the Module 1 final assessment.

### Certificate Integrity

The backend must:

- Verify eligibility independently.
- Store certificate issuance records.
- Prevent duplicate issuance for the same eligible completion.
- Preserve issuance date and certificate identity.
- Prevent unauthorized certificate access.

Do not describe the certificate as externally accredited.

## 13. Authentication

Confirmed launch decision:

Google sign-up/sign-in only.

The platform must:

- Authenticate learners securely.
- Associate progress with a stable learner identity.
- Support session management.
- Prevent unauthorized access.
- Allow learners to review their certificate name.

Do not use a Google display name as an immutable identity key.

Use the authentication provider's stable user identifier.

## 14. Free Learning

Confirmed: Buggle Learn is completely free.

- Every module, lesson, guide, knowledge check, final assessment and certificate is free.
- There are no payments, paid tiers, premium features, subscriptions or paywalls.
- Do not add pricing, upgrade or subscription prompts, and do not integrate a payment provider.
- A free Google sign-in is needed only to save progress across devices, record official results and issue certificates.

## 15. Accessibility and Inclusion

Learning must support different abilities and levels of digital confidence.

Requirements:

- Captions timed to recorded narration and a transcript that describes meaningful visual changes.
- Written learning guides.
- Clear language.
- Readable typography.
- Keyboard-accessible assessments.
- Keyboard and screen reader access to all walkthrough controls. Announce learner-driven slide changes, keep navigation focus in place and identify the current slide with a visible label.
- Alternative text for meaningful visuals.
- Reduced-motion support. Use ordered still states to show the same steps when motion is reduced.
- Mobile-friendly learning. Keep controls reachable and preserve the labels and relationships in diagrams and comparisons as the layout reflows.
- Clear progress and error messages.
- Nonjudgmental feedback.

Avoid assuming learners understand technical terminology.

## 16. Content Quality

Do not use em dashes in learner-facing page or lesson copy.

Write like a friendly teacher speaking to a beginner. Use short sentences, natural transitions and familiar situations. Explain the idea before naming it, and keep technical terms that help the learner understand or apply it. Avoid textbook and corporate phrases in narration. When ordinary software illustrates a principle, make clear what the example demonstrates without calling the software AI on that basis.

Every lesson must be reviewed for:

1. Factual accuracy.
2. Plain-language clarity.
3. Correct use of terminology.
4. Visual changes that explain the concept and are timed to the relevant narration.
5. Accurate everyday examples that appear before the technical terminology.
6. Accessibility.
7. Responsible AI guidance.
8. Alignment with learning objectives.
9. Assessment quality.
10. Consistency with other modules.

AI-generated educational content must not be published without appropriate human review.

## 17. Learning Success Measures

Candidate measures:

- Lesson completion.
- Assessment pass rates.
- Retry frequency.
- Module completion.
- Certificate eligibility and issuance.
- Learner-reported confidence.
- Learner feedback on clarity.
- Concepts frequently misunderstood.
- Engagement with visual and written materials.

Success should measure learning and understanding, not just page views or video plays.

Analytics collection and privacy requirements must be approved before implementation.

## 18. End-to-End Learner Journey

1. Discover the platform.
2. Understand the offering.
3. Sign in with Google.
4. Open Module 1.
5. Choose the narrated visual lesson or its written learning guide.
6. Revisit the material or switch formats as needed.
7. Complete the knowledge check.
8. Pass at 70% or higher.
9. Unlock the next lesson.
10. Repeat until Module 1 lessons are complete.
11. Complete the final assessment.
12. Confirm certificate name.
13. Receive the Foundations certificate.
14. Continue to Module 2.
15. Explore later learning opportunities.

## 19. Learning Experience Definition of Done

A lesson is complete when:

- Its objective is documented.
- Its approved storyboard opens with a familiar situation, develops the idea through meaningful visual changes and ends with a recap.
- Its slides explain the concept without audio, and the same Previous slide and Next slide buttons work across the whole walkthrough.
- Its optional recorded narration, visual cues and captions are synchronised. Learners can start narration at the current slide, pause, resume or replay the scene.
- Its written learning guide is available as a separate option.
- Terminology is explained.
- At least one relatable scenario is included.
- Its mandatory knowledge check exists.
- Assessment scoring is verified.
- Progression works correctly.
- Accessibility requirements are met.
- The content has been reviewed.
- Required tests pass.

A module is complete when all its approved lessons and assessment requirements are implemented and verified.

## 20. Open Decisions

Resolve before implementing dependent functionality:

1. Remaining Module 1 lesson content and where the four classical approaches belong.
2. Module 1 final assessment question count and blueprint.
3. Detailed scope and approval of later modules.
4. Practical workflow tools for Module 6 that learners can use without a paid subscription. Buggle Learn itself is free throughout.
5. Certificate record retention and any later public verification experience.

Do not invent answers to these questions. The two lesson routes, first two public previews, Google authentication, 10-question checks, 70% pass threshold, assessment-only retries, narration recording rule and WCAG 2.2 AA target are already approved.

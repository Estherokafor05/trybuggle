
# AI Literacy Platform — Learning Experience Specification

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

The learning experience combines:

### 3.1 Narrated Visual Lessons

Each visual lesson has a clear opening, a sequence of demonstrations and a short recap. Give each abstract concept a realistic example and use the visuals to show what happens and why it matters.

Use illustrations, diagrams, visual comparisons and animation to make the steps or changes visible. Introduce terminology on screen after the example makes the idea clear. Keep on-screen explanation concise and provide captions for the spoken detail.

Use generated image illustrations to establish familiar human situations. Reuse suitable supplied images and the existing generated learner artwork. Keep changing values, dialogue, labels and explanations as accessible text or diagrams alongside the artwork. A static illustration establishes the setting; the progressive visual sequence must still explain what happens.

The primary presentation should not depend on a person speaking directly to the camera.

Open the walkthrough as a silent, self-paced presentation. Show one illustrated slide at a time, with a short explanation of what is happening and a visible slide count. Use one pair of Previous slide and Next slide buttons to move through the entire lesson, including between scenes. Each slide must make sense with the sound off and stay on screen until the learner moves on.

Offer Play narration as a separate action. It starts at the current slide and advances the visuals in sync through the rest of that scene. Learners can pause, resume or replay the scene. Pausing holds the narration and visual state together. Using the slide buttons stops narration and returns to self-paced browsing.

Recorded narration is the primary audio. Time each meaningful visual change and caption to the relevant part of the narration. Browser text-to-speech may be offered as an optional fallback, one scene cue at a time. Provide a descriptive transcript that includes the visual information needed to follow the explanation.

Before implementing a walkthrough, review and approve its storyboard, visual sequence, interactions and narration.

### 3.2 Step-by-Step Learning Guides

Every lesson has a written learning guide that learners can choose as a separate learning option.

The guide must:

- Explain the concept independently.
- Follow a logical sequence.
- Include definitions.
- Include relevant diagrams.
- Include practical scenarios.
- Summarise important points.
- Support revision before assessments.

A transcript alone does not satisfy this requirement.

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

Each lesson should provide the following. Learners may use the visual walkthrough or the written guide before taking the knowledge check.

### Step 1 — Learning Objective

Explain what the learner will understand by the end.

Use plain language.

### Step 2 — Familiar Situation

Start with a relatable situation the learner can recognise before introducing the concept or its technical name.

For example:

"Have you noticed how your email sometimes knows which messages are spam?"

### Step 3 — Visual Explanation

Show the situation unfolding and narrate the meaningful changes as they happen. Explain the idea in everyday language, then introduce its technical name.

### Step 4 — Step-by-Step Guide

Provide a separate written explanation with diagrams, definitions and examples that a learner can follow independently.

### Step 5 — Practical Connection

Show how the concept relates to work, education, or everyday life.

Use examples from varied contexts.

### Step 6 — Key Takeaways

Return to the examples and show how they connect to the main ideas.

### Step 7 — Knowledge Check

Present the mandatory 10-question assessment.

### Step 8 — Progression

If the learner passes, unlock the next required lesson.

If the learner fails, provide feedback and direct them to the relevant material. They may retry that assessment only. They do not restart the lesson or module, and completed progress is preserved. No fixed retry limit.

## 5. Lesson Duration

The stated requirement is a maximum of 8 minutes per module.

This requires clarification because a module may contain several lessons.

Do not reinterpret this as 8 minutes per lesson without approval.

Until clarified:

- Keep individual learning segments concise.
- Avoid unnecessarily long videos.
- Provide pause and replay controls.
- Allow self-paced reading.
- Do not hardcode an unapproved duration limit.

## 6. Curriculum Structure

Proposed curriculum sequence:

### Module 1 — Foundations of Artificial Intelligence

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

#### Walkthrough storyboard: Four ways to understand AI

The first Module 1 walkthrough uses this six-scene sequence. The recorded narration runs for about 2 minutes 31 seconds, with time for learners to pause or explore. Visual cues are timed against the recording.

**Learning objective:** Use everyday examples to explain the four classical approaches to understanding AI and distinguish them from types of AI technology.

##### Scene 1. AI doesn't always work the same way

**Visual sequence:** Four familiar situations appear as they are named: solving a puzzle, following a rule at a shop, asking for help and choosing a route. The puzzle comes into focus for the next scene.

**Narration:**

> When you hear the word AI, you might think of something like ChatGPT. But AI isn't just about chatting or answering questions.
>
> Some systems are designed to work through problems like people do. Others follow logical rules, hold conversations or help us make decisions.
>
> Let's look at four different ways of understanding AI, using things we see in everyday life.

##### Scene 2. Imagine solving a jigsaw puzzle

**Visual sequence:** A person finds corner pieces, groups pieces by colour and tries a fit. A computer model follows a similar sequence alongside them. Highlight the matching steps as they happen, then reveal the label **Thinking humanly**.

**Narration:**

> Imagine you're putting together a jigsaw puzzle.
>
> You probably wouldn't just pick up random pieces and hope they fit. You might start with the corners, group pieces with similar colours and slowly work your way through.
>
> Now imagine a computer designed to solve the puzzle using a similar approach.
>
> That's the idea behind thinking humanly. We're interested in whether a computer can work through a problem in a way that resembles how people think.

##### Scene 3. A simple supermarket discount

**Visual sequence:** Show an item priced at £20. Reveal the rule that members receive 10% off, then show that the shopper is a member. Connect the rule to the membership check, show the £2 discount and reveal the £18 total as the narrator says it. Then reveal **Thinking rationally**.

**Narration:**

> Let's say you're shopping, and the supermarket has a rule. Members get ten percent off.
>
> Your item costs twenty pounds, and you're a member.
>
> The system checks the rule, checks that you're a member and works out that you should pay eighteen pounds.
>
> It doesn't need to copy how a person thinks. It just needs to follow the information and rules correctly.
>
> That's the idea behind thinking rationally. It means using logic to reach a conclusion.

**Teaching note:** The checkout illustrates how reasoning can follow from a rule and the facts of a situation. A normal discount calculator is ordinary software and the calculation alone does not make it AI.

##### Scene 4. Asking for help at the library

**Visual sequence:** Reveal the visitor's question and the chat assistant's reply in order. When the visitor asks whether it is outside, show the assistant answer about the same returns box. Highlight that connection, then reveal **Acting humanly**.

**Narration:**

> Imagine you're at the library and you need to return a book.
>
> You ask the chat assistant, 'Where do I drop this off?'
>
> It replies, 'There's a returns box beside the main entrance.'
>
> You ask, 'Is it outside?' The assistant says, 'Yes, the box is just outside the main doors.'
>
> That conversation feels quite natural, doesn't it?
>
> This is what we mean by acting humanly. We're looking at how the system behaves and whether that resembles how a person might respond.

##### Scene 5. Choosing the best route to work

**Visual sequence:** A map shows two routes estimated at 10 and 12 minutes and highlights the quicker one. A traffic alert changes the first estimate to 18 minutes. The recommendation switches to the 12-minute route while the goal, **Arrive as quickly as possible**, stays visible. Then reveal **Acting rationally**.

**Narration:**

> You're running late for work, so you open your navigation app.
>
> It shows two routes. One is estimated at ten minutes, and the other at twelve.
>
> Naturally, you'd choose the ten-minute route.
>
> But just as you're about to leave, there's heavy traffic. That route is now estimated at eighteen minutes.
>
> The app changes its recommendation to the twelve-minute route.
>
> Why? Because your goal is to arrive as quickly as possible.
>
> That's what acting rationally means. The system looks at the information it has and chooses an action that best helps it achieve a goal.

##### Scene 6. So what's the difference?

**Visual sequence:** Bring back the four scenarios in a labelled 2×2 comparison. Show the everyday descriptions first, then place the technical terms underneath as they are spoken. Each cell can open its scene for replay.

| What we're looking at | Like a person | Using reason or goals |
| --- | --- | --- |
| **Thinking** | Solving a puzzle using steps a person might use.<br>**Thinking humanly** | Using a rule and the facts to work out the price.<br>**Thinking rationally** |
| **Acting** | Having a natural conversation.<br>**Acting humanly** | Choosing a route that serves your goal.<br>**Acting rationally** |

**Narration:**

> So, we've seen four ways of looking at AI.
>
> A computer solving a puzzle like a person is about thinking humanly.
>
> A system using rules to reach a conclusion is about thinking rationally.
>
> A chatbot having a natural conversation is about acting humanly.
>
> And a navigation app choosing the best route for your goal is about acting rationally.
>
> These are four ways to look at how a system thinks or behaves. They're different from types of AI technology, such as machine learning or generative AI. You can ask more than one of these questions about the same system.

**Separate written guide:** Use a worked example of a library self-service kiosk. Define the four approaches in plain language, show how to ask each question about the same tool, and give learners a short practice example they can revisit.

**Visual reference decisions:**

- The supplied four-quadrant illustration and the Session 1 slide deck informed the recap. Use a labelled 2×2 table so learners can compare the axes, read the terms and replay a scene.
- Reuse the generated learner illustration beside the opening definition, linking the welcome page and first lesson.
- Use the supplied checkout illustration in the shopping scene beside a receipt that builds up the £20 price, 10% membership rule, £2 discount and £18 total as they are explained.
- The library photo informs a new generated illustration of a visitor using a help screen, with a returns box outside. This keeps the adult illustration style consistent and shows the physical setting. Reveal the actual chat messages alongside it so the learner can see how the reply connects “it” to the returns box.
- The supplied GPS image informed the map. Draw two routes with readable estimates and update the recommendation when traffic changes.
- Keep the supplied brain-puzzle and robot images as references rather than illustrations of what AI literally is. They can imply a human mind or make AI look limited to robots. The calendar/map/shopping assistant sequence is a reference for later workflow lessons, after the foundations.

### Module 2 — Types of AI Systems

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

### Module 3 — Understanding Machine Learning

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

### Module 4 — Generative AI and LLMs

Purpose:

Help learners understand tools that generate text, images, and other content.

Suggested topics:

- What generative AI means.
- What large language models are.
- How language models generate responses.
- Why context matters.
- Hallucinations and verification.
- Practical uses and limitations.

### Module 5 — Understanding AI Agents

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

### Module 6 — Creating AI-Assisted Workflows

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

This is the intended paid practical-learning area.

The exact payment boundary remains open.

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

Progress must persist across authenticated sessions.

A learner must not be able to modify another learner's records.

## 11. Progression Rules

A learner progresses when:

1. The required learning unit is completed.
2. Its mandatory knowledge check is passed.
3. Any additional approved prerequisites are satisfied.

The next lesson becomes available only after the progression rules are satisfied.

Previously completed lessons remain available for revision.

The exact mechanism for recording lesson consumption or completion requires approval.

Do not assume video playback alone proves understanding.

## 12. Foundations Certificate

### Confirmed

- Only Module 1 awards a certificate at launch.
- Certificate title:
  "Foundations of Artificial Intelligence — Certificate of Completion"
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

The final assessment passing threshold should be explicitly confirmed before implementation.

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

## 14. Free and Paid Learning

Confirmed:

- Module 1 is free.
- Module 2 is free.
- Practical AI workflow creation is intended to be paid.

Proposed:

- Keep foundational conceptual learning accessible.
- Charge for advanced guided practical workflow-building experiences.

Open:

- Whether Modules 3–5 are free or paid.
- Whether pricing uses Free/Standard/Premium.
- Whether paid access is subscription-based or one-time.
- Exact premium features.
- Payment provider.
- Refund and cancellation rules.

Do not implement billing or payment gates until these decisions are approved.

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

1. Whether the 8-minute limit applies to a module or lesson.
2. Detailed Module 1 curriculum.
3. Final assessment question count.
4. Final assessment passing threshold.
5. How lesson completion is recorded.
6. Exact MVP module scope.
7. Pricing and paid-content boundaries.
8. Certificate verification requirements.
9. Whether unauthenticated users can preview lessons.

Do not invent answers to these questions.

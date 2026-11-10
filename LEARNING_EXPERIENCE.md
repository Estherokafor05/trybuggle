
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

Choose the visual format that best teaches the concept. Lessons may use continuous character-led animation, visual demonstrations, interactive simulations or self-paced illustrated sequences. Do not force every concept into one card or slide template. No media starts automatically.

Offer learner-controlled playback and a separate self-paced option. Continuous stories follow one character through believable situations, with purposeful character actions and visual changes timed to the narration. Learners can pause, seek, replay and move between meaningful moments. Switching to the written guide pauses playback.

Provide an equivalent reduced-motion experience using still keyframes, descriptions and optional narration. Pausing freezes both the visual story and audio. Captions, descriptive transcripts, keyboard controls and independently useful written guides remain required.

Use original generated artwork for settings and approved character references. Reuse a consistent character model, poses, props, palette and motion components. Do not regenerate the character independently for every shot. Every animation and example needs an educational accuracy review.

The approved first proof of concept is the 57-second journey scene from Lesson 2, following Maya as she checks traffic before leaving for the community centre. Remotion is isolated production tooling; the application serves rendered video, captions and still images. A React/SVG exercise lets learners change fictional traffic conditions and compare estimates. It is not a live AI predictor. The rest of the six-scene continuous story remains future work, and the existing complete walkthrough and guide stay available.

Recorded narration is the primary audio. Time meaningful movement and captions to the relevant words. Browser speech is not a replacement for produced narration. A descriptive transcript includes information needed to understand the visuals.

Before implementing a new story, review and approve its storyboard, visual sequence, interactions and narration.

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

#### Approved visual lesson storyboards

Approved on 10 November 2026. Both lessons use the same silent slide navigation and optional synchronised recorded narration. Technical terms follow the everyday example. No scene completion is treated as assessment success.

##### Lesson 1: Four ways to look at AI

**Scene 1. Four familiar situations**

- Visual: A person at a kitchen table introduces a puzzle, a checkout, a library and a map, one at a time.
  Narration: Think about putting a puzzle together, checking a discount, asking someone for help, or choosing your route to work.
- Visual: The four situations are connected to four questions.
  Narration: These familiar situations can help us explore four questions people ask about AI.
- Visual: Two labelled paths appear: the process, and what it does.
  Narration: Are we looking at how a system works through a problem, or what it does?
- Visual: The paths connect to comparing with people or checking reasoning and choices.
  Narration: And are we comparing it with people, or checking its reasoning and choices?
- Visual: The puzzle returns as the first example.
  Narration: Let's see what that means.

**Scene 2. How would you start this puzzle?**

- Visual: Loose puzzle pieces sit on a table.
  Narration: You've tipped a jigsaw puzzle onto the table. Where would you start?
- Visual: Corner pieces are highlighted and blue pieces are grouped beside the board.
  Narration: You might find the corners, group similar colours, then try a piece.
- Visual: An attempted piece does not fit. A matching piece replaces it.
  Narration: If it doesn't fit, you try another.
- Visual: A computer model appears beside the person's board, with the observed steps connected.
  Narration: Imagine researchers watching how people solve that puzzle, then building a computer model to follow similar steps.
- Visual: Compare the steps replays the person's and model's sequences side by side.
  Narration: They compare the model with what people actually do.
- Visual: Thinking humanly appears below the two processes.
  Narration: This approach is called thinking humanly. The interest is in the process, not just finishing the puzzle.

**Scene 3. Does the discount apply?**

- Visual: A shopper and a receipt show an item priced at £20.
  Narration: You're buying something for twenty pounds.
- Visual: The shop rule appears, followed by the shopper's membership card.
  Narration: The sign says members get ten percent off, and you have a membership card.
- Visual: An arrow connects the rule to the confirmed membership.
  Narration: The rule applies to you.
- Visual: The receipt subtracts £2 and shows a total of £18.
  Narration: Ten percent of twenty pounds is two pounds, so the price becomes eighteen pounds.
- Visual: Thinking rationally appears below the rule, fact and result.
  Narration: We've used a rule and a fact to work out what follows. That illustrates thinking rationally, which focuses on logical reasoning.
- Visual: A label explains that this is an ordinary software example. Compare member and non-member prices.
  Narration: A normal checkout can do this without AI. We're using the discount to explain the idea.

**Scene 4. Asking for help**

- Visual: A visitor holds a book beside a library help screen.
  Narration: You're at the library with a book to return.
- Visual: The visitor's question appears in the chat.
  Narration: You ask its chat assistant, 'Where do I drop this off?'
- Visual: The assistant's reply mentions a returns box.
  Narration: 'There's a returns box beside the main entrance.'
- Visual: The follow-up question appears. It refers to the returns box.
  Narration: 'Is it outside?'
- Visual: The reply appears and the returns box outside the entrance is highlighted.
  Narration: 'Yes, just outside the main doors.'
- Visual: The word it and the earlier returns box are linked.
  Narration: Notice how the reply connects your follow-up question to the same box. You're looking at whether the conversation resembles how a person might help.
- Visual: Acting humanly appears. The visitor checks the entrance sign.
  Narration: That's acting humanly. A natural-sounding reply doesn't prove the system thinks like a person, or that its directions are right.

**Scene 5. The quicker route changes**

- Visual: A map shows the destination and the goal: quickest safe route.
  Narration: You're about to leave for work. You want the quickest safe route.
- Visual: Route A is estimated at 10 minutes and highlighted. Route B is estimated at 12 minutes.
  Narration: Your map estimates ten minutes for one route and twelve for another. It recommends the ten-minute route.
- Visual: Traffic appears on A and its estimate changes to 18 minutes. B remains at 12.
  Narration: Then traffic builds up. That estimate changes to eighteen minutes, while the other stays at twelve.
- Visual: Route B becomes the recommendation. The destination stays fixed.
  Narration: The recommendation switches.
- Visual: Acting rationally appears below the updated map.
  Narration: This illustrates acting rationally: choosing an action expected to help achieve a goal, using the information available.
- Visual: A road sign and a check remind the learner to review the route before leaving.
  Narration: The estimate can still be wrong. You still need to follow road signs and check that the route is suitable.

**Scene 6. Four questions to take away**

- Visual: A labelled two-by-two comparison brings back the four examples.
  Narration: Let's bring the examples together.
- Visual: The puzzle cell reveals Thinking humanly.
  Narration: The puzzle asks whether the model follows a process like a person's: thinking humanly.
- Visual: The checkout cell reveals Thinking rationally.
  Narration: The discount asks whether the reasoning follows the rule and facts: thinking rationally.
- Visual: The library cell reveals Acting humanly.
  Narration: The conversation asks whether the response resembles a person's: acting humanly.
- Visual: The map cell reveals Acting rationally.
  Narration: The map asks whether the choice serves the goal: acting rationally.
- Visual: All four approaches remain visible. A reflection asks what else you need to know about two systems that finish the same puzzle.
  Narration: These are four approaches to studying AI. One system can be examined in more than one way. And an everyday example can illustrate an approach without being AI itself.

##### Lesson 2: AI in Your Day

**Scene 1. A normal day**

- Visual: An illustrated adult at home begins a day with a phone, journey, shopping and messages.
  Narration: You're getting ready for the day. You look for a photo, check your journey, browse for something you need and open your messages.
- Visual: The day's timeline connects four familiar moments.
  Narration: Some of these tools use AI behind the scenes. You don't have to open a chatbot to encounter it.
- Visual: Three questions appear: information in, result out, what would you check?
  Narration: Let's follow a few everyday moments and see what the tool receives, what it gives back, and where your judgement matters.

**Scene 2. Finding a photo**

- Visual: A mixed photo library appears. The search box fills with dog.
  Narration: A friend asks for that photo of your dog. You have hundreds of pictures, so you search for 'dog'.
- Visual: Likely dog pictures move forward, with one unrelated picture among the fictional results.
  Narration: A photo app can use AI to recognise patterns in the pictures and bring back likely matches, even when you haven't named the files.
- Visual: Photos and the search word lead to suggested matches. Machine learning appears.
  Narration: Learning patterns from examples is called machine learning, one way of building AI.
- Visual: Check the matches lets you identify the unrelated picture and open the intended photo.
  Narration: Open the results and check them. The app might miss the photo you wanted or include something that doesn't belong.

**Scene 3. Getting to work**

- Visual: At home, the learner sees traffic on a 30-minute route and a 20-minute alternative.
  Narration: You're checking your journey before leaving for work. Traffic has built up on your usual road, and the map suggests another route.
- Visual: Traffic now and patterns from earlier journeys feed into the route estimates.
  Narration: Some navigation systems use AI to combine current traffic information with patterns from earlier journeys.
- Visual: The estimates connect to the two roads, and the alternative is highlighted.
  Narration: That helps estimate what the roads may be like when you reach them.
- Visual: Prediction appears beside the estimated journey times.
  Narration: This is prediction: estimating something we don't yet know.
- Visual: Compare routes reveals journey details and reminds the learner to check before leaving.
  Narration: It helps you plan, but the time is an estimate. Check the route and follow road signs.

**Scene 4. Shopping for something useful**

- Visual: Two viewed backpacks lead to a row of suggested bags.
  Narration: You're looking for a backpack. After you browse a few, the shop suggests others.
- Visual: Viewed items and activity patterns connect to suggestions.
  Narration: Some shopping services use AI to find patterns in what people view or buy. Those patterns help them recommend products you might like.
- Visual: Recommendation appears. One suggested bag opens for inspection.
  Narration: That's a recommendation. It isn't a promise that something is right for you.
- Visual: Check the fit compares a 32 cm laptop with a 28 cm compartment, showing the mismatch.
  Narration: Check the price, size and features. A suggested bag might look appealing and still be too small for your laptop.

**Scene 5. A message goes to spam**

- Visual: A fictional booking message moves to Spam. Find the missing message opens the folder.
  Narration: You're waiting for a booking confirmation. It isn't in your inbox, so you check the spam folder. There it is.
- Visual: Message patterns, sender information and feedback feed into the sorting decision.
  Narration: Some email services use AI to look for patterns in messages, information about senders and feedback from users.
- Visual: A message is labelled Possibly unwanted, not definitely dangerous.
  Narration: They estimate which messages may be unwanted.
- Visual: Classification appears alongside Inbox and Spam.
  Narration: Sorting something into a group is called classification.
- Visual: The learner compares fictional booking details with their own plan. There are no live links or safe badges.
  Narration: That can save you time, but mistakes happen. Check expected messages carefully. And a message reaching your inbox doesn't automatically make it trustworthy.

**Scene 6. What might AI be doing in your day?**

- Visual: The day's four moments return on a timeline.
  Narration: The photo app suggested matches. The map estimated a journey time. The shop recommended a product. The email service sorted a message.
- Visual: Each result is paired with a human check.
  Narration: Different jobs, with different things for you to check.
- Visual: A clock set to 7:00 rings, showing a simple automatic action.
  Narration: Not every automatic feature uses AI. A basic alarm can ring at the time you set without it.
- Visual: A private practice activity offers prompts for one familiar tool.
  Narration: Think of one tool you use. What information does it receive? What does it give back? What would you check?
- Visual: The activity accepts uncertainty and suggests checking product documentation.
  Narration: If you don't know whether it uses AI, 'I'm not sure yet' is a useful answer.

**Interactions:** Compare puzzle-solving steps, compare membership prices, connect the library follow-up, compare routes, inspect photo matches, check backpack dimensions, find a misplaced message and replay recap examples. Reflection activities are unscored. Text notes are not submitted or persisted.

**Independent guides:** Lesson 1 examines a library kiosk through the four approaches, with a comparison diagram and practice questions. Lesson 2 follows the organisation of a community workshop, tracing information, results and human checks, with definitions and a source-verification step.

**Illustration choices:** Reuse the supplied checkout image and generated library illustration. Add an original generated kitchen-table puzzle illustration to establish the human scenario. Keep prices, routes, comparisons and conversation text as accessible UI alongside artwork. Use simplified fictional photo, shopping and inbox diagrams to show the changing information without copying a product interface. Reuse the generated learner artwork for the beginning of the day.

**Factual sources:** Russell and Norvig's introductory AI chapter; Apple WWDC19 Designing Great ML Experiences; Google DeepMind Traffic prediction with advanced Graph Neural Networks; AWS Amazon Personalize documentation; Google Workspace Understanding Gmail's spam filters. Links and supported claims appear in the lesson source lists. Situations, prices and travel times are illustrative, not reported product outcomes.

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

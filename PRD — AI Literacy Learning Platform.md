# Product Requirements Document: AI Literacy Learning Platform

**Status:** Approved learning decisions with remaining curriculum decisions identified below
**Product:** Buggle Learn
**Audience:** People new to AI, including nontechnical workers and students
**Purpose:** Define the learner journey, delivery experience, curriculum, assessments, and first certificate before redesigning or extending the codebase.

> **Drafting note:** Proposed decisions are identified as such. Open decisions need review before they become commitments. Every open decision is marked **⚠ OPEN DECISION** in the text and listed in full in section 12.

> **⚠ Open decisions at a glance** (decisions to 13 November 2026 are recorded in section 12; these stay open and are researched as we build)
>
> 1. **Overlaps and duplicates:** 4 of 16 still open (items 10, 11, 14 and 16 in section 6.1D).
> 2. **Path reviewers:** the rule is decided; the names are open, starting with Path B, and the qualified nurse for Path E.
> 3. **Employer offering:** whether to offer anything to companies, such as staff training on safe AI use. Buggle Learn is currently completely free.
> 4. **Success measures:** how we know the platform is working, for example how many learners finish Module 1 or share the safety checklist.
> 5. **Path G (Everyday Life):** its character, story and episodes.
> 6. **How "Which best describes you?" answers are stored and removed.**

## 1. Product overview

People are being encouraged or expected to use AI, while many have not had a clear opportunity to learn what AI is, how it developed, what different systems do, or how to use them thoughtfully. The platform gives beginners an accessible foundation and helps them connect that knowledge to work, study, and everyday life.

The platform is for people who are curious about AI or feel pressure to keep up with it. This includes receptionists, HR and admin staff, QA professionals, other nontechnical workers, and students. Learners should not need a technical background or coding experience to get started.

The learning experience moves from understanding AI to using it. It explains the foundations, introduces current concepts such as generative AI and agents, and gives learners practical ways to try AI while checking its output and limits.

## 1A. Unique selling proposition

**Headline: Learn to check AI, not just use it.** Most AI courses teach prompts. Buggle Learn teaches people to catch AI when it is wrong. Learners regularly meet short exercises in which an AI gives a confident but wrong answer, and they practise spotting and fixing it. This is safety presented as a practical skill, and it is the one learners cannot easily get from a free video tutorial. It is the primary differentiator and should be visible in marketing, on the landing page and in every module.

Supporting pillars:

1. **Learning paths by job, not by topic.** After the fundamentals, learners can follow paths such as AI for students, office and admin staff, small business owners, sales and customer service, nurses, or teachers, using examples from their real work (section 6.1C). This answers the question learners actually have: "What does this mean for me?"
2. **Protect yourself and your family.** Learners recognise voice-clone scams, deepfakes and fake investment bots. The topic is emotionally meaningful, easy to share ("send this to your mum") and clearly about safety in society.
3. **What not to paste into an AI tool.** Simple rules for using AI at work without leaking client, company or personal data. This content is free like everything else on Buggle Learn. Whether a separate employer offering should exist is an open decision (see section 12), because the approved product decision is that Buggle Learn is completely free.
4. **Built for everyone, everywhere.** People use AI in every part of the world, so Buggle Learn is for a global audience. Stories use a diverse cast, names, places, prices and tools from many countries, and keep examples neutral rather than tied to one market. Lessons are phone-first and light on data, with plain-text versions, short videos and, where possible, audio versions, so they work on cheap phones and slow connections. Local-language versions can follow learner demand.
5. **Proof learners can show.** Modules 1 to 3 together earn the main Certificate of Completion. Module 3 also gives its own shareable "AI Safety" badge, and optional Module 4 and each job path give a separate badge, so learners have something to show at each step and nobody is blocked by optional content. The AI Safety badge is the one people are most likely to share. Adding a partner organisation's name may come later.

## 2. Product goal

Help a beginner build enough understanding and confidence to:

- Explain in plain language what people mean by AI and recognize that it includes different kinds of systems.
- Describe, at a high level, how AI has developed and how common AI systems differ.
- Understand, through everyday examples, that many AI systems learn patterns from examples (machine learning), and understand generative AI, chat tools, assistants, configured workspaces, automated workflows and AI agents.
- Catch AI when it is confidently wrong, and know what information never to share with an AI tool.
- Use an accessible AI tool or workflow for a relevant task, assess the result, and make an informed choice about whether to use it.
- Recognize basic concerns such as inaccurate output, privacy, bias, and over-reliance.
- Demonstrate learning through mandatory knowledge checks and assessments, earning the main Certificate of Completion for Modules 1 to 3 and badges for the AI Safety module, optional Module 4 and job paths.

The platform supports understanding and informed use. It does not promise employment outcomes or imply that AI will replace or solve a learner’s work.

## 3. Primary users

### Primary: AI-curious or AI-pressured beginner

Someone who has little formal knowledge of AI. They may be asked to use AI at work, may worry about how it affects their role, or may simply want to understand the topic. They may be comfortable using websites and apps but unfamiliar with technical terms.

### Secondary: Student or independent learner

Someone studying or exploring AI who wants a clear introduction, practical examples, and a grounded account of the technology rather than hype or assumed technical knowledge.

### Example learners

The curriculum is written with specific everyday learners in mind, for example a sales assistant in a shop, a student, a teacher, a nurse, a small business owner and an office worker. Many will learn on a phone, in short moments at work or on a bus, with limited data.

### Shared needs

- Plain language and clear definitions when new terms appear.
- Examples from more than one kind of workplace and from study or everyday life.
- A nonjudgmental experience that does not label learners as behind or incapable.
- A way to learn at their own pace, without requiring coding.
- A balanced view that explains potential uses as well as limitations.
- Flexible access to the same lesson through video or a written learning guide.
- Clear feedback, visible progress, and a fair way to retry assessments.
- Examples from their own world: their job, their studies or their everyday life.
- Very short lessons that work on a phone and on limited data.

## 4. End-to-end customer journey

| Stage                           | Learner’s question or need                       | Platform experience                                                                                                                                 | Desired outcome                                                                              |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1. Discover                     | “Is this for someone like me?”                   | Clear introduction that welcomes beginners, workers across roles, and students.                                                                     | Learner recognizes that no technical background is required.                                 |
| 2. Understand the offer         | “What will I learn, and why should I trust it?”  | Learning-path overview, sample lesson, delivery explanation, and practical, balanced approach.                                                      | Learner knows what the course covers and what it does not promise.                           |
| 3. Choose a starting point      | “Where do I begin?”                              | Modules 1 to 3 for everyone, starting with AI foundations, then an optional Module 4 and a job path.                                                  | Learner can begin without understanding jargon or selecting a profession-specific course.    |
| 4. Choose how to learn a lesson | “Would I rather watch or read?”                  | A short narrated visual lesson and a separate structured guide teach the same learning outcomes. The learner may use either or both.                | Learner chooses a suitable format without being required to consume the same material twice. |
| 5. Check understanding          | “Have I understood the key idea?”                | A mandatory knowledge check follows every lesson, with explanatory feedback and an opportunity to retry.                                            | Learner receives feedback and demonstrates understanding before moving on.                   |
| 6. Practise and apply           | “How does this work in a situation I recognize?” | Guided activities use familiar scenarios from work, study, and everyday life.                                                                       | Learner applies a concept and sees where human review matters.                               |
| 7. Progress                     | “What have I completed, and what comes next?”    | Completion tracking, clear next steps, and access to previous lessons and guides.                                                                   | Learner moves through the structured path while being able to revisit material.              |
| 8. Complete Module 1            | “Can I show what I have learned so far?”         | Module assessment follows all Module 1 lessons and knowledge checks. Passing makes the learner eligible for the Module 1 Certificate of Completion. | Learner earns an early, clearly scoped recognition of learning.                              |
| 9. Continue                     | “What can I learn next?”                         | The next module is presented, with the learner’s progress retained. The full path concludes with a final assessment.                                | Learner continues through the curriculum and can demonstrate learning across the programme.  |

**Approved account decision (13 November 2026): no account needed for Module 1.** All of Module 1 (every lesson, guide, knowledge check and the final assessment) is open without an account. Learners are asked to sign up only once they want their certificate: after passing the final assessment they see "Sign up to get your certificate". Signing up collects the Module 1 certificate and lets them go on to Module 2, and their progress is saved to their account from then on.

**Approved change (13 November 2026): two ways to sign in.** Learners can sign in with Google or with an email address and password. Email and password is added for now, while the platform is being tested, for learners without a Google account or who prefer not to use one. Passwords are stored only as secure one-way hashes, never in plain text, with a way to reset a forgotten password. (Not yet built.)

**How guest results count.** Knowledge checks and the final assessment are still marked on the server, never in the browser. A visitor's results are stored against an anonymous ID kept in a secure cookie on their device, with no personal details. When they sign up, those results move into their new account, so the certificate is earned fairly. Signing out forgets the anonymous ID on that device. A guest who changes device before signing up starts again on the new device.

**Decided (13 November 2026): the same rule for every module.** In Module 2 and later modules too, sign-in is needed only to save progress or get a certificate or badge. Knowledge checks stay open to everyone.

## 5. Learning Experience and Delivery Requirements

### 5.1 Lesson formats

Each lesson has two complementary formats that cover the same learning outcomes:

1. **Watch & Listen:** A continuous, professionally illustrated and animated story with the user’s approved narration, synchronized captions, playback controls and a transcript. Meaningful visual changes explain the concept.
2. **Read & Explore:** An independent interactive guide using progressive discovery, illustrations, practical examples, varied meaningful interactions and explanatory feedback. It includes a complete accessible reading alternative and covers the same essential outcomes without requiring the video.

Learners may use either format or both. Watching the video and reading the guide are alternatives, not two mandatory steps. The knowledge check remains mandatory regardless of the format chosen.

**Approved duration:** Each lesson is no longer than eight minutes, and should aim for 5 to 8 minutes, phone-first, ending with something for the learner to do. Planned module content is 30 to 60 minutes with a one-hour cap; self-paced reading, accessibility needs and retries are not timed.

### 5.2 Lesson sequence

Each lesson follows this sequence:

1. Show the lesson title, learning outcomes, estimated time, and available formats.
2. Let the learner choose the video, written guide, or both.
3. Offer a guided practical activity where it supports the learning outcome.
4. Present a mandatory knowledge check.
5. Give feedback for correct and incorrect responses.
6. Record lesson completion when the learner passes the knowledge check.
7. Unlock the next lesson and keep earlier material available for review.

### 5.3 Accessibility and delivery

- Videos include accurate captions and a transcript or equivalent text access to spoken information.
- Diagrams and demonstrations include accessible descriptions where needed; meaning must not depend on color alone.
- Written guides use headings, readable text, clear definitions, and keyboard-accessible navigation.
- The learning experience works on common mobile and desktop screen sizes.
- Learners can pause, replay, revisit, or switch formats without losing their place.
- Activities identify any external tool, account, cost, or data-sharing requirement before the learner is asked to use it.

### 5.4 Feedback and progression

- Every lesson has a mandatory knowledge check tied to its stated learning outcomes.
- Feedback explains why an answer is correct or incorrect and points the learner to relevant material for review.
- After a failed check, the learner may review its feedback and the relevant lesson section, then retry that assessment only. They do not restart the lesson or module, and previously completed progress remains saved. There is no fixed retry limit.
- A learner must pass the lesson check before the next lesson unlocks.
- Learners can revisit completed lessons and guides at any time.
- Progress is recorded per learner and remains available when they return on another visit or device.
- The platform clearly distinguishes lesson completion, module completion, assessment pass, and certificate issuance.

**Proposed passing score:** At least 70% for each knowledge check and module/final assessment. The threshold should be configurable and validated against question quality before launch.

## 6. Curriculum and Module Structure

### 6.1 Learning sequence

*Source: "Buggle Learn: Curriculum Plan from Module 2", 12 November 2026.*

Every learner takes Modules 1 to 3, then picks a path for their job. Module 1 is live. Module 2 gets learners using AI tools, Module 3 covers safety, and the theory moves to an optional Module 4.

| Module | What it is | Who takes it | Status |
| ------ | ---------- | ------------ | ------ |
| 1. Foundations of Artificial Intelligence | What AI is, where it shows up, why you check it. | Everyone | **Live** (five lessons, final assessment, certificate) |
| 2. Talking to AI | Using chat tools for real tasks, practised on scripted chats inside the app. | Everyone | To build next |
| 3. Staying Safe with AI | Privacy, voice clones, deepfakes, scams, fair use. | Everyone | To build |
| 4. Go Deeper: How AI Works | Machine learning, bias, types of AI, agents. | Optional, for curious learners | To build |
| Your Path | AI for your job or everyday life, ending in a hands-on project. | Learner picks one | Office and Admin, Students, Small Business, then Everyday Life |

**Build order:** Module 2, then Module 3, then Path B (Maya, quickest because it reuses her), Path A (Ada), Path C (Bisi) and Path G (Everyday Life). Module 4 and Paths D to F follow.

What changed from the earlier plan, and why:

- **Old Module 2 (Types of AI Systems) is folded into Module 4.** All four planned lessons repeated Module 1 (Lessons 1.1, 1.2 and 1.4), so learners would feel they were starting over.
- **Old Module 3 (Machine Learning) moves to Module 4.** Lesson 1.1 already covers the basics, so the deeper version becomes optional. Machine learning is still explained wherever the core modules need it, through everyday examples.
- **Old Module 4 (Generative AI) becomes the core of the new Module 2.** Most people meet AI through ChatGPT, Claude or Gemini, so this comes straight after Foundations.
- **Safety gets its own module.** The earlier plan had no lessons on scams, deepfakes or data, yet safety is the platform's main selling point.
- **Old Modules 5 and 6 (agents and workflows) are split up.** Agents become an optional episode in Module 4 (4.4). Building a workflow becomes the final project of each job path, tied to real work.
- **The Everyday life track returns as Path G** (13 November 2026), for people who do not fit a job path.

### 6.1A The story model

Every module is one story, and every lesson is an episode in it. Each episode has the same shape:

1. **The situation:** the character hits a real problem in their day.
2. **The choice:** the learner decides what the character should do before seeing what happens.
3. **What happens:** the story shows the result, good or bad, and the idea behind it.
4. **Your turn:** the learner applies it to their own life.

Episodes stay 3 to 4 minutes, as a narrated film or an interactive guide, with a plain-text version and a knowledge check, as in Module 1. Characters carry over between modules so learners get to know them, and each module ends on a hook into the next. Each core module ends with a short refresher final assessment, as in Module 1.

**No AI tool runs inside the app.** Buggle Learn shows and teaches; it does not connect to ChatGPT, Gemini, Claude or any other tool. Learners watch the character's chats as scripted screens, then practise on those same scripted chats: choosing the better request, spotting the error, deciding what to check. Screens show a generic "AI chat tool", and real tools are named only as examples. What learners take away are cards and checklists they can use later in whichever tool they choose. This keeps the app free to run, tool-neutral, and safe from learners typing private data into it.

Storytelling rules for every episode:

- **Write the story first, then fit the lesson into it.** If the lesson cannot be told through something happening to the character, it probably belongs in optional Module 4.
- **Let characters get things wrong.** Maya nearly sends the fake grant and Mum nearly pays the voice clone. The mistake is what people remember.
- **The learner decides before the reveal.** Every episode pauses for the learner to choose what the character should do.
- **Keep a recurring cast.** Maya, her mum, Sam and the centre's members appear across modules, so learners care what happens to them.
- **End each module on a hook.** The open day's success leads into the week of close calls, and the job scam leads into Sam's computing course.
- **Give every path someone who looks like its learners.** A student should see a student, and a shop owner should see a shop owner.
- **Keep every story country-neutral.** No currencies, place names, local institutions or slang, so a learner anywhere recognises the situation. Vary characters' names and backgrounds across the paths. Real historical facts (for example the 1956 Dartmouth workshop) are fine.
- **End every lesson with something the learner does.** Module 1's "Put it in your own words" prompts already do this; keep them.

### 6.1B Core and optional modules

#### Module 2: Talking to AI

Learners watch Maya use an AI chat tool for real tasks and practise on her scripted chats, so they know how to ask well and check answers before they ever open a tool themselves.

**You leave with:** a one-page "ask well, then check" card to use with any AI chat tool.

**The story: Maya's open day.** Maya's manager asks her to organise the community centre's open day in three weeks, on top of her normal work. A colleague suggests trying an AI chat tool. Over five episodes Maya learns to use it, and nearly gets caught out at the end.

| Episode | What happens to Maya | What the learner learns | The learner's choice |
| ------- | -------------------- | ----------------------- | -------------------- |
| 2.1 A New Helper | A colleague shows Maya a chat tool. She asks it to describe the centre for a newsletter, and it writes something polished and confident in seconds. | What chat tools are and the main free ones. They write by predicting the next likely words, which makes them smooth and confident, but fluency is not the same as being right. (The made-up fact is saved for 2.5.) | What makes the answer sound so sure, and does that mean it is correct? |
| 2.2 The Email That Said Nothing | Maya types "write an email about the open day" and gets a bland email with a made-up date. She tries again with who it is for, what, when, and the tone. | How to ask well, with a one-line reminder to keep private details out that points ahead to 3.1. | Pick the request that will get the better email, then rewrite a weak one. |
| 2.3 Three Tries at the Flyer | The flyer text comes back too long and too formal. Maya asks for shorter, then friendlier, then a version in another language spoken at the centre. | A chat is a back and forth. Follow-up messages improve the result. | Choose Maya's next follow-up message. |
| 2.4 Thirty Pages by Friday | The local authority sends a 30-page guide for public events. Maya asks for a summary and a checklist, then checks it against the guide and finds it left out the first-aid rule. | Summarising, explaining jargon and planning, and checking against the original. | Spot what the summary missed. |
| 2.5 The Grant That Didn't Exist | The tool suggests a small grant for open days, with a name and a website. Maya almost puts it in her report, then checks: the grant does not exist. | Made-up facts and sources, out-of-date information, agreeing with you to please you. Where not to rely on AI: health, law, money. | How should Maya check the grant, and who should she ask? |

**How the story ends:** the open day goes well. Word gets round that Maya "uses AI", which sets up Module 3. **Final assessment:** a short refresher across the five episodes.

#### Module 3: Staying Safe with AI

Learners protect their information, their money and the people they care about, now that AI makes scams and fake content easier to produce.

**You leave with:** a one-page safety checklist to use yourself and share with family and colleagues.

**The story: a week of close calls.** In the week after the open day, Maya, her family and people at the centre run into five risks that AI makes easier. Some of them nearly go wrong.

| Episode | What happens | What the learner learns | The learner's choice |
| ------- | ------------ | ----------------------- | -------------------- |
| 3.1 The Volunteer List | A keen volunteer pastes the full members list, phone numbers included, into a free chat tool to "tidy it up". | Where chats are stored and how they may be used to train AI. What never to share. How to turn off chat history where the tool allows it. | Sort 10 items into "fine to share", "remove first" and "never". |
| 3.2 Mum, It's Me | Maya's mum gets a voice note in Maya's voice asking for money for an urgent hospital bill. | AI can copy a voice from a short clip. Hang up and call back on a number you know, agree a family code word, slow down. | What should Mum do next? |
| 3.3 The Video in the Group Chat | A video of a famous TV presenter promoting a trading app spreads in the centre's WhatsApp group, and several members want to invest. | Deepfakes and fake endorsements. How to check: who posted it, whether reliable outlets report it, a reverse image search, the "too good to be true" test. | Real, fake or unclear? Judge three posts. |
| 3.4 The Perfect Job Offer | Maya's nephew Sam gets a polished job offer after a chat with an "AI recruiter". Then they ask for a training fee. | How AI makes scams look professional. Red flags: urgency, secrecy, unusual payment methods, guaranteed returns. | Find the red flags in Sam's messages. |
| 3.5 The Summer Flyer | Maya uses AI to make a flyer for the summer programme. Every picture shows the same kind of family, and she asks Amina (from Lesson 1.5) how to make it fair. Her manager asks whether to say AI helped. | Bias in AI-made content and pictures, and how to make it represent everyone. Being honest about AI help and following workplace rules. Never making fake images or audio of real people. | What is acceptable? Decide in five short situations. |

**How the story ends:** Maya writes a one-page safety checklist for the centre, which is what learners download. **Final assessment:** the refresher, then the checklist download. The checklist should be easy to share on WhatsApp, because this module is the most likely to bring in new learners.

#### Module 4: Go Deeper: How AI Works (optional)

For learners who want to know what happens inside AI tools. It reuses the planned content from old Modules 2, 3 and 5, cut down so it builds on Module 1 rather than repeating it.

**You leave with:** a simple picture of how AI learns, why it can be unfair, and where a person must stay in control.

**The story: behind the scenes.** Sam, Maya's nephew from the job scam, has started a computing course. Maya finally asks him the questions she has been wondering about since Module 1, and he answers using things that happened in her own story.

| Episode | What happens | What the learner learns | Comes from |
| ------- | ------------ | ----------------------- | ---------- |
| 4.1 How Did My Keyboard Learn My Words? | Sam explains how Maya's phone keyboard learned to suggest the words she types most, and why it sometimes suggests the wrong one. | Training and testing, going beyond Lesson 1.1's photo example. | Old Module 3 |
| 4.2 Why Was She Turned Down? | A friend is refused a loan by an automated system, and nobody can explain why. | How gaps or unfairness in the training examples lead to biased results, with examples from loans and face recognition. | Old Module 3 |
| 4.3 Which Tool for Which Job? | Sam gives a short recap of the kinds of tools in Maya's story, then helps her choose the right kind of tool for a new job. | A brief recap of rules, predictions and new content (building on Lesson 1.4), then choosing the right kind of tool for a task. | Old Module 2, condensed |
| 4.4 The Assistant That Booked the Wrong Hall | Sam's classmate lets an AI agent book a venue. It books the wrong hall and pays the deposit. | How assistants, automated workflows and agents differ, and why a person must check before anything is sent, paid or deleted. | Old Module 5 |

The knowledge checks stay. **Decided:** Module 4 gives its own badge and does not count towards the main certificate, so it never blocks anyone.

### 6.1C Your Path: job paths

After Module 3, learners pick a path for their job. Each path is its own story: four episodes following one character through a busy stretch of their life. It ends with a project where the learner writes a **helper card**: a reusable request, with a list of what to check, that they can copy into whichever AI tool they use outside the app. That project replaces old Module 6. Names and settings are placeholders to adapt to the audience.

#### Path A: AI for Students

**The story: Ada's exam season.** Ada is a second-year student with a part-time job, four weeks from exams with an essay due. **Safety focus:** academic honesty, made-up references, relying on AI instead of learning.

| Episode | What happens to Ada | What the learner learns |
| ------- | ------------------- | ----------------------- |
| A1 Lost in Statistics | Ada cannot follow a topic. AI explains it at her level and sets practice questions, and she realises reading its answers is not the same as learning. | Study smarter: explanations, flashcards, quizzing yourself. |
| A2 Twelve References | AI gives Ada 12 references for her essay. In the library database she finds 4 of them do not exist. | Research: chat tools invent sources, so check every one. |
| A3 Write It for Me? | A friend submits an essay written entirely by AI and gets flagged. Ada uses AI to brainstorm, outline and get feedback, and says that she did. | Writing honestly: what your school allows, and saying when AI helped. |
| A4 The Internship Application | AI makes Ada's CV sound like experience she does not have. She rewrites it to be truthful, then practises the interview with AI. | CVs, cover letters and interview practice that stay truthful. |

**Final project:** Ada writes a revision helper card: a request that makes any chat tool quiz her and explain her wrong answers. The learner writes one for a subject of their own.

#### Path B: AI for Office and Admin Staff

**The story: Maya's busiest month.** The centre's annual report, a board meeting and the summer programme all land in the same month. **Safety focus:** keeping company and client data out of personal AI tools, and following workplace rules.

| Episode | What happens to Maya | What the learner learns |
| ------- | -------------------- | ----------------------- |
| B1 The Confusing Booking Form | Members keep filling in the centre's booking form wrongly. Maya uses AI to rewrite it, and the standard letters, in plain words. | Rewriting forms and standard letters in plain words, and checking nothing important was lost. |
| B2 The Board Meeting | Maya prepares the agenda and turns rough notes into minutes. A board member objects to being recorded. | Agendas, notes and minutes. Get everyone's consent before recording. |
| B3 The Annual Report | Maya turns the year's figures into a report and has AI explain a spreadsheet formula. She uses only the approved work tool for member data. | Reports, letters and spreadsheets. Workplace rules on data. |
| B4 The Summer Rota | AI drafts the volunteer rota but puts one volunteer on two shifts at once. Maya catches it. | Checking a plan for errors before it goes out. |

**Final project:** Maya writes a helper card for turning rough notes into minutes, with a list of what to check before sending. The learner writes one for a routine task in their own job.

#### Path C: AI for Small Business Owners

**The story: Bisi's festive season.** Bisi runs a small fashion shop and sells on WhatsApp and Instagram, with the busiest season coming. **Safety focus:** fake suppliers, payment scams, AI "business coaches" selling get-rich schemes, and trusting AI on tax or legal questions.

| Episode | What happens to Bisi | What the learner learns |
| ------- | -------------------- | ----------------------- |
| C1 The Sale Post | AI writes great product posts, but calls a polyester dress "100% silk". | Marketing posts, product descriptions and simple images, with claims that stay honest. |
| C2 Two Hundred Messages a Day | Customer messages pile up, and one customer is angry about a late delivery. | Customer replies, common questions and answers, handling complaints calmly. |
| C3 The Supplier Who Was Too Cheap | A new "supplier" offers prices that are too good and wants payment upfront to a personal account. Bisi also gets a tax letter she does not understand. | Invoices, price lists and budgets. Applying the Module 3 red flags to a supplier, without re-teaching them. Checking anything about tax with an accountant. |
| C4 Planning January | After the rush, Bisi looks at what competitors did and plans her next promotion. | Looking at competitors, planning a promotion, writing a one-page business plan. |

**Final project:** Bisi writes a customer-reply helper card that includes her prices, opening hours and policies. The learner writes one for their own business.

#### Path G: Everyday Life

A path for people who do not fit a job path, such as a parent or a retiree, covering money, side hustles and getting more from their phone. It is built after Path C and before Paths D to F. Its story, character and episodes are still to be written, following the story model and the overlap rules in section 6.1D (scams are taught in Module 3, so this path only refers back to them).

#### Later paths

These follow after Path G. The product owner writes every story, and one person who does that job reviews each path before it goes live.

| Path | The story | Likely episodes | Safety focus | Final project |
| ---- | --------- | --------------- | ------------ | ------------- |
| D. Sales and Customer Service | Daniel (the receptionist from Lesson 1.4) moves into a customer service role, chasing his monthly target while handling a difficult customer. | Replies and follow-ups; call and visit notes; a complaint that escalates; preparing for a big sales meeting. | Customer privacy; not promising what the business cannot deliver. | A follow-up message helper card for your products. |
| E. Nurses | A nurse's week of night shifts, with a new patient and worried relatives. Sarah, the pharmacist from Lesson 1.3, appears in the episode on doses. | Handover notes; explaining care to a family in plain words; shift admin; the moment AI must not decide, including a question about doses that Sarah helps answer. | Patient confidentiality; never trusting AI on doses, diagnoses or care decisions. | A plain-language explainer for one common care topic, checked by a senior colleague. |
| F. Teachers | A teacher's first term after the school allows AI. | Lesson plans and worksheets; marking support and feedback; messages to parents; an essay that might be AI-written. | Student data; judging AI-written work fairly; bias in AI material. | A lesson resource made with AI and adapted for your class. |

The Nurses path has the highest stakes. It does not go live without review by a qualified nurse. Trades such as construction and driving can come later still.

### 6.1D Overlaps and duplicates to resolve

Checked on 13 November 2026 against the five live Module 1 lessons and across the 12 November plan, by comparing every planned episode with every live lesson and with each other. (The earlier overlaps between old Module 2 and Lessons 1.1, 1.2 and 1.4 are not counted here, because the plan already resolves them by folding old Module 2 into Module 4.) Reinforcing an idea in a new situation is useful; repeating the same story or activity is not. Each item needs a decision before scripts are written.

| # | Overlap or duplicate | Where | Recommendation | Status |
| - | -------------------- | ----- | -------------- | ------ |
| 1 | **4.1 repeats Lesson 1.1 almost exactly.** | Lesson 1.1's guide already trains a pretend system on cat and dog photos, then a partly hidden cat fools it into guessing "dog". 4.1 is "how my phone learned dogs, and why it mistook a cat". | Give 4.1 a different example (for example how a phone keyboard learns your words), or go beyond 1.1 into why test data must differ from training data. | ✅ Resolved: 4.1 now uses the phone keyboard. |
| 2 | **Hiring bias appears three times.** | Lesson 1.5 (Amina: unfair interview questions, a CV ranking that favoured past hires), 3.5 (a job advert putting off older applicants) and 4.2 (a shortlisting tool favouring one kind of person). | Keep one hiring story. Use loans or face recognition for 4.2, and a non-hiring setting (for example a public notice or flyer) for 3.5, or reuse Amina as its character. | ✅ Resolved: 3.5 is now the Summer Flyer (fair pictures, with Amina) and 4.2 a refused loan. |
| 3 | **4.3 repeats Lesson 1.4.** | Lesson 1.4 already sorts tools into "ordinary software" and "AI", including rules-based expert systems; Lesson 1.2 names recognise, predict, recommend, classify. | Condense 4.3 into a recap with one new idea (choosing the right kind of tool for a job), not another sorting exercise. | ✅ Resolved: 4.3 is now a short recap plus choosing the right tool. |
| 4 | **"What never to share" is taught four times.** | Lesson 1.1 (keep private details out of a request), Lesson 1.5 (applicants' names and CVs), 2.2 (keep private details out), 3.1 (the volunteer list). Path B (approved tools for member data) repeats it again. | Make 3.1 the full lesson. 2.2 gives a one-line reminder that links ahead; Path B applies it only to workplace rules. | ✅ Resolved: 3.1 is the full lesson; 2.2 gives a one-line reminder pointing to 3.1. |
| 5 | **Made-up facts appear twice inside Module 2,** and again in every path. | 2.1 (wrong details about the centre's history) and 2.5 (an invented grant), plus Lesson 1.1 (the wrong day) and 1.5 (an invented driving licence); then A2, C1 and others. | Within Module 2, make 2.1 about fluency and prediction and keep the "catch the made-up fact" reveal for 2.5. Paths apply it to their own sources only. | ✅ Resolved: 2.1 is about fluency; the made-up fact is saved for 2.5. |
| 6 | **Path B repeats Module 2 with the same character and tasks.** | Module 2 has Maya writing an open-day email, a flyer in another language and a checklist; Path B has Maya replying to emails, translating for a family and making checklists. | Give Path B new tasks only (minutes, reports, spreadsheets, rotas), or give Path B a different office character so it does not feel like a rerun. | ✅ Resolved: B1 is now the booking form and standard letters; B4 is only about checking a plan. |
| 7 | **Scam red flags are taught twice.** | 3.4 (job scam: urgency, secrecy, payment methods, guaranteed returns) and C3 (a too-cheap supplier wanting upfront payment), plus Path C's "AI business coaches", which repeats 3.3's fake trading app. | Module 3 teaches the red flags; C3 applies them to suppliers in one short scene and refers back. | ✅ Resolved: C3 applies the Module 3 red flags without re-teaching them. |
| 8 | **Translation appears twice.** | 2.3 (a flyer in another language) and B1 (a reply to a family who speak another language). | Keep translation in 2.3; B1 focuses on tone and backlog. | ✅ Resolved: translation stays in 2.3 only. |
| 9 | **Summaries and checklists appear twice.** | 2.4 (summary and checklist of a 30-page guide) and B4 (rotas, plans and checklists). | Keep summarising in 2.4; B4 is about checking a plan for errors, which is new. | ✅ Resolved: summarising stays in 2.4; B4 is about checking. |
| 10 | **Academic honesty is told from two sides.** | Path A (A3, writing honestly) and Path F (judging AI-written work fairly). | Write them to give one consistent message when Path F is built. | ⚠ Open: decide when Path F is written. |
| 11 | **Health, law and money advice appears in several places.** | Lesson 1.1's guide (a medicine question), Lesson 1.5's knowledge check (medicine doses), 2.5 (health, law, money), C3 (tax), Path E (doses and diagnoses). | Keep 2.5 as the main lesson; Path E goes deeper with care-specific examples reviewed by a care professional. | ⚠ Open: Sarah now appears in Path E's dose episode; confirm 2.5 stays the main health, law and money lesson. |
| 12 | **The recurring cast leaves out three live characters.** | Lessons 1.3, 1.4 and 1.5 introduced Sarah (pharmacist), Daniel (receptionist) and Amina (HR); the plan's cast is Maya, her mum, Sam and the centre's members. | Reuse them where they fit: Amina for 3.5, Daniel in Path B or D, Sarah in a health scene. | ✅ Resolved: Amina in 3.5, Daniel leads Path D, Sarah in Path E. |
| 13 | **Maya leads Module 2, Module 3 and Path B.** | Path B is built first because it reuses Maya. | Accepted for speed (13 November). To avoid a rerun, give Path B only new tasks (see item 6). | ✅ Accepted for speed. |
| 14 | **Two different voice-note scams are possible.** | 3.2 (a voice clone of Maya asking for hospital money) and the earlier "that voice note might not be your uncle" example in section 6.2. | Use one: keep 3.2 and update the example in 6.2 to match. | ⚠ Open: keep 3.2 and update the 6.2 example to match. |
| 15 | **The Everyday life track has disappeared.** | The previous draft offered it for learners who do not fit a job (money, scams, school, side hustles, your phone). Module 3 now covers scams, and Path A covers school. | Drop it, or keep "money, side hustles and your phone" as a later path. | ✅ Resolved: added as Path G, Everyday Life. |
| 16 | **Country-specific details in live lessons.** | The stories must now be country-neutral. Lesson 2's camera bag is priced in dollars ("$38" in the guide and "$40" in a knowledge check answer). | Remove the currency (for example "within her budget"). Historical facts such as Dartmouth and IBM stay. | ⚠ Open: a fix to the live Lesson 2. |

**⚠ OPEN DECISION:** items 10, 11, 14 and 16 (the other twelve were resolved on 13 November 2026).

### 6.2 Relationship between concepts, lessons, activities, and assessments

- Each **module** has a purpose, module-level learning outcomes, ordered lessons, practical applications where appropriate, and a module assessment.
- Each **lesson** teaches a small set of concepts through the narrated visual lesson and the separate written guide.
- Each **practical activity** applies one or more lesson concepts to a familiar, low-risk scenario. It is guided and does not require coding unless a future course explicitly states otherwise.
- Each **knowledge check** assesses the outcomes of one lesson. It is mandatory and must be passed before the learner advances.
- Each **module assessment** checks whether the learner can connect and apply concepts from the module. All lesson checks and the module assessment must be passed for module completion.
- Each module ends with a **final assessment**: a short refresher across its episodes that opens after the last episode, as in Module 1. Modules 1 to 3 together earn the main Certificate of Completion. Module 3 also gives its own shareable "AI Safety" badge, and optional Module 4 and each job path give a separate badge.
- Responsible use, privacy, bias, verification, and human oversight appear in relevant lessons and activities across the sequence; they are not confined to a single end-of-course topic.
- **Safety is part of the fundamentals.** "AI can be confidently wrong", "never share your bank details, ID numbers, passwords or PINs with a chatbot" and "that voice note might not be your uncle" are taught in the core modules, so every learner gets them, including those who never reach a specialisation.

### 6.3 Content design expectations

- **Start with doing, then explain.** Early in a lesson, the learner does something they actually need on a scripted chat, such as writing a WhatsApp message to a customer or summarising a school note, then the lesson explains what just happened. People care about how it works once they have seen it work.
- New terms are defined in plain language and revisited in context.
- Examples span different jobs, study, and everyday life; the curriculum is not centered on QA.
- **Everyday examples, not tech examples.** Explain machine learning as "how your phone learned to suggest the next word" or "how a video app knows what you like". Avoid diagrams of neural networks.
- **Examples from the learner's world.** The modules stay the same for everyone; only the examples change. A sales assistant sees a customer-message example, a student sees an assignment example.
- **Every lesson ends with something to do.**
- Examples do not imply that every task should use AI or that AI output can be accepted without review.
- Lesson outcomes, activities, and assessment questions align; each assessed concept is taught in the lesson.

## 7. User stories and acceptance criteria

### Epic A: Discover the platform

#### Story A1: Recognize that the platform is for me

**As a person who is new to AI,** I want to understand who the platform is for, so I can decide whether I belong here.

**Acceptance criteria**

- The landing page states that the platform is for AI beginners and does not require a technical background or coding experience.
- The page includes examples representing multiple nontechnical work contexts and students; QA is one example, not the default or only audience.
- The language is respectful and does not describe learners as unintelligent, behind, or deficient.
- The page explains that learners can study at their own pace.

#### Story A2: Understand what I will learn

**As a prospective learner,** I want to see what the learning path covers, so I can decide whether it meets my needs.

**Acceptance criteria**

- The overview presents the modules in sequence and describes the learning formats and assessment approach.
- It leads with the promise to learn to check AI, not just use it.
- It explains that reliability, privacy, bias, verification, and human oversight recur throughout the curriculum.
- It does not promise employment outcomes or imply a professional qualification.
- A learner can identify the recommended first step without understanding AI terminology first.

### Epic B: Start and navigate learning

#### Story B1: Begin without technical prerequisites

**As a beginner,** I want to start the foundations path without setting up tools or writing code, so I can focus on understanding the subject.

**Acceptance criteria**

- A learner can preview the learning path and open the first lesson without a technical setup.
- The first module does not require programming, command-line use, or prior AI knowledge.
- Any required external AI account, tool, cost, or data-sharing condition is identified before the relevant activity.
- Technical terms are explained where they first become necessary.

#### Story B2: Choose how I consume a lesson

**As a learner,** I want to watch a narrated visual lesson or use a written guide, so I can learn in the format that works for me.

**Acceptance criteria**

- Each lesson provides a narrated visual lesson and a separate structured guide covering the same learning outcomes.
- The learner is not required to watch and read both formats before taking the knowledge check.
- Read & Explore is a complete interactive learning resource, not a video transcript or static text-card sequence.
- Interactions have an educational purpose, immediate explanatory feedback and keyboard/tap access; dragging is optional.
- A complete reading alternative works without JavaScript.
- Guide activities and reflections are unscored and do not create official assessment attempts.
- Route, activity state and film position are preserved; changing routes pauses the film.
- The guide's step bar distinguishes steps that are **done**, steps that were **visited but not finished**, and steps **not started**, so skipping a step never makes it look complete. (Learner feedback, 13 November 2026.)
- Use Remotion as isolated film production tooling and React for learning interactions.
- Lesson 1 opens with a plain definition, ordinary automation contrast, capabilities, learning from examples, generative AI, errors and human checks. Move the four approaches to a later unit pending curriculum approval.
- Preserve Lesson 2’s existing Maya film and supplied voice; its guide investigates objects and decisions through her day.
- Video meaning is available through captions and text access; diagrams and visuals have accessible alternatives where needed.
- The learner can switch formats or revisit either format without losing their place.

#### Story B3: Understand what AI means and how it developed

**As a learner,** I want a clear explanation of AI and its history, so I can make sense of claims and conversations about it.

**Acceptance criteria**

- The lesson explains that “AI” refers to a range of approaches and systems rather than one single product or capability.
- The history lesson presents selected developments in a clear sequence, with dates and claims checked against reliable sources before publication.
- It distinguishes historical context from predictions about the future.
- Familiar examples help the learner connect the concepts to everyday life.

#### Story B4: Tell common AI system types apart

**As a learner,** I want to understand common types of AI, so I can better recognize what a tool is designed to do.

**Acceptance criteria**

- The curriculum explains rules-based, predictive, machine-learning, and generative AI in beginner-friendly terms.
- It explains that categories can overlap and that product labels alone do not fully describe how a system works.
- Each category includes an understandable example of a task it may support.
- Learners can revisit definitions without losing their place in the learning path.

#### Story B5: Sign out of my account

**As a signed-in learner,** I want to sign out, so that nobody else using the same device can continue as me or see my progress.

**Acceptance criteria**

- A clearly labelled **Sign out** control appears in the site header on every page while the learner is signed in: beside the main navigation on larger screens, and inside the menu on phones, with the signed-in name shown there.
- Signing out ends the session on that device and returns the learner to the home page. The header then no longer offers Sign out.
- After signing out, the certificate page shows "Sign up to get your certificate" again and account APIs reject requests. Module 1 lessons stay open, because they never needed an account.
- Signing out does not delete anything. Saved progress, assessment results and certificates remain on the learner's account and reappear when they sign in again.
- Learning places and private notes kept in the browser stay filed under each learner's own account, so another person using the same device cannot see them by signing in themselves or browsing as a guest.
- The control is keyboard accessible, has a visible focus state and works on phones and desktop.

### Epic C: Practise and apply learning

#### Story C1: Find an example that feels relevant

**As a learner,** I want examples from different jobs, study, and everyday life, so I can connect abstract concepts to situations I know.

**Acceptance criteria**

- Examples span multiple occupations and include student or everyday-life contexts.
- Examples explain the task and role of AI rather than implying every task should be automated.
- Core lessons remain available to everyone; role examples do not gate foundational content.
- Examples show where a person remains responsible for deciding whether output is useful.

#### Story C2: Try a practical AI activity

**As a beginner,** I want guided practice with an AI task, so I can try the ideas rather than only read about them.

**Acceptance criteria**

- The activity has a clear objective and enough context to complete it.
- It teaches the learner to provide relevant context, review the response, and refine the request where appropriate.
- It asks the learner to check output instead of treating a fluent response as proof of accuracy.
- Practice happens on scripted chats inside the app; no AI tool runs inside Buggle Learn. Learners take away a card or checklist to use in any tool they choose.
- It does not ask learners to submit confidential workplace, personal, or sensitive information to a public AI tool.

#### Story C3: See examples from my world

**As a learner,** I want the examples in each lesson to come from my own life, so I can see straight away what AI means for me.

**Acceptance criteria**

- The learner is asked one optional question about who they are, after Module 3, when they pick a path, with no account needed (decided 13 November 2026). Proposed options are the job paths plus "Something else". They can skip it and change it later.
- Lessons use examples matching that answer where alternatives exist; the concepts, knowledge checks and certificate stay the same for everyone.
- Learners who skip the question see a general everyday-life example.
- The answer is used only to choose examples. It is not shared or used for anything else, and the learner can remove it.

#### Story C4: Learn in short moments on my phone

**As a learner with a busy day and limited data,** I want short lessons that work well on my phone, so I can learn during a quiet moment at work or on a bus.

**Acceptance criteria**

- Lessons aim for 5 to 8 minutes and never exceed the eight-minute maximum.
- Every lesson ends with something for the learner to do.
- Lessons work on common phones and slower connections, with audio-only and text options that use less data.
- Offline access, sharing through messaging apps such as WhatsApp, and local-language versions are proposed, driven by learner demand from a global audience.

### Epic D: Understand assistants, workspaces, workflows, and agents

> Agents are now taught in optional Module 4 (episode 4.4), and building a workflow is the final project of each job path (section 6.1C).

#### Story D1: Distinguish types of AI-supported interaction

**As a learner,** I want to understand the difference between an assistant, a configured workspace, an automated workflow, and an agent, so I can make sense of these terms and choose an appropriate approach.

**Acceptance criteria**

- The lesson defines each term in plain language and notes that product terminology can vary.
- It compares the concepts using the same example task, so differences in persistence, configuration, automation, tool use, and action are visible.
- It does not imply that every product uses these labels consistently or that every feature described as an agent is autonomous.
- A mandatory knowledge check asks learners to classify or compare examples and provides explanations for each answer.

#### Story D2: Understand how an agent works and where oversight matters

**As a learner,** I want to understand how an agent uses instructions, context, and tools to take actions, so I know what to review or limit.

**Acceptance criteria**

- The lesson explains relevant parts such as instructions, context, available tools, actions, and feedback loops without implying every agent has the same design.
- A familiar scenario shows the path from a user request to an agent action and its result.
- The learner can identify actions that should require confirmation or human review.
- The lesson does not require coding to understand the concepts.

#### Story D3: Complete a beginner-friendly agent or workflow activity

**As a learner,** I want to create or configure a simple AI-assisted workflow for a routine task, so I can practise using the concepts in a controlled way.

**Acceptance criteria**

- The activity uses an accessible no-code interface, such as a configured assistant or workspace, or provides a tool-independent alternative.
- The learner chooses a low-risk routine task and receives step-by-step instructions.
- The learner configures the purpose and instructions, supplies non-sensitive example context, and reviews the output.
- If the activity includes an automated action, the learner is shown how to limit it and where to require confirmation.
- The learner checks the result against a short rubric and identifies at least one limitation or possible failure.
- The learner can complete the activity without connecting a workplace account or sharing confidential data.

**Decided:** no AI tool runs inside the app; practical activities use scripted chats (section 6.1A).

### Epic E: Check understanding and progress

#### Story E1: Complete a mandatory knowledge check

**As a learner,** I want a knowledge check after each lesson with useful feedback, so I can tell whether I understood the material.

**Acceptance criteria**

- Every lesson ends with a mandatory check aligned to that lesson’s stated outcomes.
- The approved pass mark is 70%: at least 7 correct answers out of 10.
- Feedback explains why each selected answer is correct or incorrect and points to the relevant learning material.
- If the learner does not pass, they can revisit the relevant video or guide section and retry that assessment only; they do not restart the lesson or module, and completed progress remains saved.
- Passing the check records lesson completion and unlocks the next lesson.
- A learner cannot bypass the check by consuming both learning formats.

#### Story E2: Track and resume my learning

**As a learner,** I want my completion and assessment progress to be saved, so I can continue later and revisit earlier learning.

**Acceptance criteria**

- The learner can see completed, in-progress, and locked lessons and the reason a lesson is locked.
- Progress, attempts, and pass results persist when the learner returns on another visit or device.
- Earlier lessons and guides remain accessible after completion.
- The platform records the learner identity and relevant completion data consistently for assessment and certificate eligibility.
- Before an account is required, the learner is told what progress and personal data will be recorded and why.

#### Story E3: Complete a module and progress

**As a learner,** I want a clear module completion state and next step, so I know what I have achieved and how to continue.

**Acceptance criteria**

- A module is complete only when all its lesson checks and its module assessment have been passed.
- The module completion page summarizes the learning outcomes and offers the next module.
- Completion, assessment pass, and certificate issuance are displayed as separate states.
- The learner can revisit completed module material.

### Epic F: Earn a Certificate of Completion

#### Story F1: Earn the Module 1 certificate

**As a learner,** I want to receive a Certificate of Completion after successfully completing the Foundations of Artificial Intelligence module, so I have evidence of the learning I have completed.

**Acceptance criteria**

1. Each Module 1 lesson has a mandatory knowledge check.
2. The learner must achieve the approved passing score of at least 70% on each check before progressing to the next lesson.
3. A learner who does not pass can review the relevant materials and retake that assessment only. They do not restart completed lessons or the module, and completed progress remains saved.
4. The learner must complete all Module 1 lessons and pass the Module 1 final assessment.
5. A certificate is issued only after all Module 1 completion requirements have been recorded as satisfied.
6. The certificate title is **Foundations of Artificial Intelligence, Certificate of Completion**.
7. The certificate displays the learner’s name, module title, completion date, and issuing organisation.
8. The platform records assessment results and certificate issuance to prevent an award without satisfying the requirements.
9. The certificate is described as a certificate of completion, not an accredited qualification or proof of professional competence.

**Decided:** Modules 1 to 3 together earn the main Certificate of Completion. Module 3 also gives its own shareable "AI Safety" badge, and optional Module 4 and each job path give a separate badge. Public certificate verification is a later-release consideration; each certificate and badge records a unique ID. **⚠ OPEN DECISION:** what happens to the Module 1 certificate that is live today (section 12).

#### Story F2: Complete the full learning path

**As a learner,** I want a final assessment covering the full learning path, so I can demonstrate what I learned across the programme.

**Acceptance criteria**

- The final assessment becomes available only after all required modules and their assessments are complete.
- It covers the stated outcomes across all modules, including appropriate use, evaluation, and oversight.
- The learner receives explanatory feedback and can review relevant lessons before retrying if unsuccessful.
- Passing the final assessment records full-path completion separately from the Module 1 certificate.
- Any full-programme certificate requirements and name are clearly presented before the learner starts the full path.

**Decided (13 November 2026, updated):** Modules 1 to 3 together earn the main Certificate of Completion. Module 3 also gives its own shareable "AI Safety" badge, and optional Module 4 and each job path give a separate badge. A separate certificate for the whole programme is not currently planned.

### Epic G: Use AI thoughtfully

#### Story G1: Recognize limitations and risks

**As a learner,** I want to know what can go wrong when using AI, so I can make informed choices about its output.

**Acceptance criteria**

- Lessons explain that AI output can be inaccurate, incomplete, biased, or unsuitable for a task.
- Learners receive practical guidance on verifying important information and protecting private or sensitive data.
- Activities distinguish low-risk practice from decisions requiring qualified human judgment.
- Responsible use, privacy, bias, verification, and oversight recur across relevant modules.
- Content avoids fear-based messaging and does not present AI output as inherently trustworthy or inherently harmful.

#### Story G2: Catch AI when it is wrong

**As a learner,** I want to practise spotting AI mistakes, so I can rely on my own judgment rather than on how confident an answer sounds.

**Acceptance criteria**

- Every module includes at least one short exercise in which an AI gives a confident but wrong or unsuitable answer and the learner must find and fix the problem.
- Exercises cover made-up facts, wrong numbers or dates, unfair suggestions and advice that needs a qualified person.
- Feedback explains how the learner could have checked, using an independent source rather than asking the same AI.
- The exercises are formative and unscored unless they form part of an official knowledge check.

#### Story G3: Protect myself and my family from AI scams

**As a learner,** I want to recognise scams that use AI, so I can protect myself and the people I care about.

**Acceptance criteria**

- Learners learn to recognise voice-clone calls and voice notes, deepfake videos and fake investment or trading bots.
- Each scam type comes with simple, practical steps, such as calling back on a known number or agreeing a family code word.
- The content is easy to share with family and friends.
- It informs without frightening, and never asks learners for real personal or financial details.

#### Story G4: Know what not to paste into an AI tool

**As a worker,** I want simple rules about what I must never share with an AI tool, so I can use AI at work without leaking information.

**Acceptance criteria**

- Learners get a short, memorable list of what never to share: passwords, PINs, bank details and ID numbers, client and customer details, company confidential information and other people's personal data.
- They practise deciding what is safe to share in realistic work examples.
- The content explains how to check whether a tool is approved by their employer.
- The content is free, like all of Buggle Learn.

### Epic H: Share feedback

#### Story H1: Share feedback on the learning experience

**As a learner,** I want a simple way to say what was clear or confusing, so the platform can improve.

**Acceptance criteria**

- Feedback is optional and does not block lesson or module completion.
- The learner is told what information is collected and why before submitting it.
- Feedback does not request unnecessary personal or sensitive information.

- **Decided (13 November 2026):** after each lesson, a short pop-up asks "Did you find this lesson helpful?" and "How did it feel: easy, about right or hard?" One tap answers each; the learner can close it or skip it.
- Answers are stored by lesson so the team can see which lessons are unhelpful or too hard, and are not used for anything else.
- The pop-up appears at most once per lesson and never interrupts the film, the guide or the knowledge check.

## 8. Assessment and certification requirements

| Requirement                      | Proposed decision                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge checks                 | Mandatory after every lesson.                                                                                                                        |
| Passing score                    | At least 70% for each lesson check and assessment. Each lesson check has **5 questions; 4 correct to pass.**                                        |
| Failed assessment                | Learner reviews feedback and relevant material, then retries that assessment only. No restart of completed lessons or modules; no fixed retry limit. |
| Lesson progression               | Next lesson unlocks only after passing the current lesson check.                                                                                     |
| Module completion                | All lesson checks and the module assessment are passed.                                                                                              |
| Certificate eligibility          | For each module or job path: all its lesson checks and its final assessment passed. Module 1 is live; the others follow as they are built.        |
| Full-path final assessment       | Mandatory after completion of all modules; covers the full learning path.                                                                             |
| Certificates                     | Modules 1 to 3 earn the main Certificate of Completion. Module 3 also gives an "AI Safety" badge; Module 4 and each path give a badge. Module 1's certificate is live today (see section 12). |
| Certificate details              | Learner name, module title, completion date, and issuing organisation.                                                                               |
| Certificate record               | Store learner completion, assessment results, certificate issue date, and a unique certificate ID.                                                   |
| Public certificate verification  | Consider for a later release; do not expose learner information publicly without a separate privacy decision.                                        |
| Full-programme certificate       | Potential later credential after all modules and the full-path final assessment; scope and launch timing remain open.                                |

## 9. First-version scope

### In scope for the initial learning release

- A clear landing page that describes the platform and intended learners.
- Modules 1 to 3 for everyone, optional Module 4 and job paths, with Module 1 fully authored and assessed as the first release milestone.
- For each published lesson, a narrated visual lesson and a separate structured written guide.
- A mandatory knowledge check after every published lesson, with feedback, retries, and progression gating.
- A Module 1 final assessment and first Certificate of Completion.
- A beginner-friendly practical activity for understanding assistants, configured workspaces, workflows, and agents. The initial activity may use a configured assistant or workspace rather than requiring autonomous agent construction.
- Completion and assessment tracking sufficient to resume learning and issue the Module 1 certificate reliably.
- Examples relevant to varied work roles, students, and everyday life.
- Guidance on verification, privacy, bias, and human oversight throughout relevant lessons.
- Responsive and accessible presentation for common screen sizes and assistive technology.

### Not assumed for the initial release

- Public certificate verification.
- A full-programme certificate at launch; this remains an open decision.
- A custom AI chatbot, agent builder, AI-powered tutor, or any connection to outside AI tools. Learners "start with doing" on scripted chats.
- Requiring learners to build a coded agent.
- Paid plans, a discussion community, or workplace-system integrations.
- A promise that learners will become AI experts or improve their employment prospects.
- Collection of confidential workplace data.

## 10. Experience and content principles

- **Start with doing, then explain:** Let the learner try something useful first, then explain what happened and how it works.
- **Teach checking, not just using:** Every module helps learners catch AI when it is wrong.
- **Put safety in the fundamentals:** Scams, privacy and confident mistakes are core content, not an optional extra.
- **Use plain language:** Define necessary terminology and avoid using jargon as a test of belonging.
- **Respect the learner:** Treat lack of prior access to AI education as an education gap, not a personal failing.
- **Show more than one context:** Do not build the whole course around a single profession. Use the learner's own world where possible.
- **Keep it short and phone-first:** Lessons of 5 to 8 minutes that work on limited data.
- **Be balanced:** Explain capabilities, limits, risks, and uncertainty.
- **Keep human judgment visible:** Show where a person should verify, decide, or decline to use AI.
- **Teach through visuals:** Use narration, demonstrations, diagrams, and motion to make concepts easier to understand.
- **Offer equivalent learning access:** A learner should be able to meet lesson outcomes through the video or the written guide.
- **Be transparent:** Identify third-party tools, data handling, and requirements before asking learners to use them.
- **Design for accessibility:** Use readable text, clear structure, keyboard access, meaningful labels, captions or transcripts, and diagrams that do not rely on color alone.
- **Assess learning, not attendance:** Completion depends on demonstrated understanding, not just watching a video or opening a guide.
- **Use consistent punctuation:** Do not use em dashes in learner-facing pages or lesson copy.

## 11. Success measures to define

Success measures should show whether learners understand and can apply the basics, not just whether they visit the site. Candidate measures include:

- How many learners start and complete Module 1.
- How often learners download or share the Module 3 safety checklist.
- Pass rates and retry patterns for lesson checks and the Module 1 final assessment.
- Whether learners report increased confidence in understanding AI terms and assessing AI output.
- Which lessons learners find confusing or leave before completing.
- Whether learners use the video, guide, or both, and whether either format creates access barriers.
- Whether learners from different intended audiences find the examples relevant.
- Whether learners can distinguish an assistant, configured workspace, automated workflow, and agent in a knowledge check or practical task.

**⚠ OPEN DECISION:** which of these to track, with targets, collection methods, retention periods and privacy expectations (section 12, open decision 8). The lesson feedback pop-up (Story H1) provides the first helpfulness and difficulty ratings.

## 12. Approved decisions and remaining review

Approved:

- The unique selling proposition in section 1A, led by "Learn to check AI, not just use it".
- The curriculum plan of 12 November 2026 (section 6.1): Modules 1 to 3 for everyone (Foundations of AI, Talking to AI, Staying Safe with AI), optional Module 4 (Go Deeper: How AI Works), then a job path ending in a hands-on project.
- Build order: Module 2, Module 3, then Path B (Office and Admin, reusing Maya), Path A (Students) and Path C (Small Business). Module 4 and Paths D to F follow.
- **No AI tool runs inside the app.** Lessons show scripted chats and teach safe use; learners use real tools on their own, outside the app, with cards and checklists they take away.
- **Country-neutral stories:** no currencies, place names, local institutions or slang; a mix of names and backgrounds.
- **Writing and review:** the product owner writes every story; one person who does that job reviews each path before it goes live. Path E (Nurses) does not go live without review by a qualified nurse.
- The story model in section 6.1A: every module is one story, every lesson an episode (situation, choice, what happens, your turn), with a recurring cast and a hook into the next module.
- No standalone machine learning module in the core; machine learning is explained where needed, with more in optional Module 4.
- **13 November 2026:** all of Module 1, including every knowledge check and the final assessment, is open without an account. Learners sign up only to get their certificate ("Sign up to get your certificate"), which also lets them continue to Module 2 with progress saved from then on. Guest results are marked on the server against an anonymous ID and move into the account at sign-up.
- **13 November 2026:** the Module 1 Certificate of Completion stays as the first milestone. The main certificate for Modules 1 to 3 is added when Modules 2 and 3 exist; learners who already hold a Module 1 certificate keep it.
- **13 November 2026:** lessons never run longer than eight minutes; episodes aim for 3 to 4.
- **13 November 2026:** in every module, sign-in is needed only to save progress or get a certificate or badge; knowledge checks stay open to everyone.
- **13 November 2026:** the guide's step bar shows done, visited but not finished, and not started as separate states.
- **13 November 2026:** twelve of the sixteen overlaps in section 6.1D are resolved through episode changes (2.1, 2.2, 3.5, 4.1, 4.2, 4.3, B1, B4, C3); Daniel leads Path D, Sarah appears in Path E, and Amina appears in 3.5.
- **13 November 2026:** Everyday Life is added as Path G, built after Path C and before Paths D to F.
- **13 November 2026:** "Which best describes you?" is asked after Module 3, when learners choose a path, with no account needed. Modules 1 to 3 are the general path for everyone and are built first.
- **13 November 2026:** knowledge checks have 5 questions, with 4 correct to pass. The live 10-question Module 1 checks will be trimmed to 5.
- **13 November 2026:** learners can sign in with Google or with email and password (added for the testing period; not yet built).
- **13 November 2026:** the audience is global and diverse, with country-neutral stories and a diverse cast, not one market.
- **Certificates (updated):** Modules 1 to 3 together earn the main Certificate of Completion. Module 3 also gives its own shareable "AI Safety" badge, and optional Module 4 and each job path give a separate badge.
- **13 November 2026:** after each lesson, an optional pop-up asks whether the lesson was helpful and whether it felt easy, about right or hard.
- The first two lesson previews; two equivalent learning routes; 70% minimum passing score; unlimited assessment-only retries; eight-minute lesson maximum; WCAG 2.2 AA.
- Buggle Learn is completely free, with no payments, paid tiers or subscriptions.
- Module 1 Certificate of Completion, issued by Buggle Learn, using the learner's editable profile name, after all Module 1 lesson checks and the Module 1 final assessment are passed.
- Each core module ends with a short refresher final assessment; Module 1's has 8 questions (6 to pass, no time limit) and opens after the last lesson.
- Narration recordings are supplied by the user before film production, as defined in LEARNING_EXPERIENCE.md.

Resolved since earlier drafts: whether learners use AI tools inside the app (no), which country the stories are for (none in particular), who writes and reviews the paths; the remaining Module 1 lessons (all five are live), the Module 1 final assessment blueprint, the certificate ID format (such as BL-M1-XXXX-XXXX), where agents and workflows are taught (Module 4.4 and path projects), and which job paths come first.

**⚠ OPEN DECISIONS** (kept open and researched as we build)

1. **Overlaps and duplicates.** Four of the sixteen in section 6.1D remain: academic honesty across Paths A and F (10), where health, law and money advice is taught (11), the two voice-note scam examples (14), and the dollar prices in live Lesson 2 (16).
2. **Path reviewers.** The rule is decided (one person who does that job reviews each path; a qualified nurse for Path E). Name the reviewers, starting with Path B.
3. **Employer offering.** Whether to offer anything to companies, such as staff training on safe AI use. Buggle Learn is currently completely free; any paid offering would reverse that. Recommended: no, or only a free resource employers can share.
4. **Success measures.** Choose which numbers to track and set targets. Candidates: learners who start and finish Module 1, knowledge check pass rates, feedback pop-up ratings, certificates issued, and how often the Module 3 safety checklist is downloaded or shared.
5. **Path G (Everyday Life).** Its character, story, episodes and final project.
6. **"Which best describes you?" storage.** How the answer is stored and removed.

**Not yet reflected on the live site:** the site still shows the earlier six-module list; lesson checks still have 10 questions; Google is the only sign-in option; there is no feedback pop-up yet; Lesson 2 still prices the camera bag in dollars; and the AI practice lab prototype (an in-app AI) is set aside and will not be built.

## 13. Working definition of done for the first release

The first release is ready for learners when a person with no technical background can discover the platform, understand who it serves, begin the AI foundations path, choose a narrated visual lesson or structured guide for each lesson, pass mandatory knowledge checks with useful feedback, complete the Module 1 assessment, receive a Certificate of Completion when eligible, and continue to the next module with progress saved. The learner can revisit prior material and has practised distinguishing AI-supported assistants, workspaces, workflows, and agents through a safe beginner activity.

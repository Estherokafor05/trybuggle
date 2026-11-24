# AI Literacy course

This folder holds the course itself: what learners read, watch and answer. The platform in `src/` displays it. See `../README.md` for how the two connect.

| Folder or file | What it holds |
| --- | --- |
| `index.ts` | Everything the platform reads about the course (`@course`) |
| `ui.ts` | The course's own screens and illustrations (`@course/ui`) |
| `assessments.ts` | Knowledge check and final assessment questions and answers (`@course/assessments`, server code only) |
| `content/` | Modules, lesson metadata, films, Read & Explore guides, welcome, sample reflection answers |
| `activities/` | Read & Explore activities written for specific lessons, their completion rules and the films' "Your choice" moments |
| `components/` | The welcome intro and Module 1 illustrations |

Films, narration, captions and images stay in `public/lessons/<lesson>/`, because the website serves them from there.

## Modules and lessons

This list is generated from `content/modules.ts`.

### 1. Foundations of Artificial Intelligence (open)

Understand what AI means, how it developed, and where it already appears in everyday life.

Outcome: A clear starting point for making sense of AI.

1. **What is AI?** (`what-counts-as-ai`): Meet the idea of artificial intelligence in plain language, and learn why the label covers many different things.
2. **AI Is Already in Your Day** (`ai-in-your-day`): Spot familiar examples of AI at home, at work, and while you study.
3. **AI Did Not Start with ChatGPT** (`before-chatgpt`): Take a short trip through the ideas and turning points that shaped today's AI.
4. **AI or Ordinary Software?** (`ai-or-software`): See how systems that follow set instructions differ from systems that learn patterns.
5. **What AI Can Do, and Where You Stay in Charge** (`what-ai-can-do`): Recognize useful capabilities, common mistakes, and the importance of human judgment.

### 2. Talking to AI (next)

Watch Maya use an AI chat tool for real tasks, and practise asking well and checking answers before you open a tool yourself.

Outcome: A one-page “ask well, then check” card to use with any AI chat tool.

1. **A New Helper** (`a-new-helper`): What AI chat tools are, and why sounding confident is not the same as being right.
2. **The Email That Said Nothing** (`the-email-that-said-nothing`): How to ask well: who it is for, what it is about, when and where, and the tone.
3. **Three Tries at the Flyer** (`three-tries-at-the-flyer`): A chat is a back and forth. Follow-up messages improve the result.
4. **Thirty Pages by Friday** (`thirty-pages-by-friday`): Summarising, explaining jargon and planning, then checking against the original.
5. **The Grant That Didn't Exist** (`the-grant-that-didnt-exist`): Made-up facts and sources, and where not to rely on AI: health, law and money.

### 3. Staying Safe with AI (planned)

Protect your information, your money and the people you care about, now that AI makes scams and fake content easier to produce.

Outcome: A one-page safety checklist to use yourself and share with family and colleagues.

1. **The Volunteer List** (`the-volunteer-list`): What happens to what you type into a chat tool, and what never to share.
2. **Mum, It's Me** (`mum-its-me`): Voice-clone scams, and how to check before you act.
3. **The Video in the Group Chat** (`the-video-in-the-group-chat`): Deepfakes and fake endorsements, and how to check them.
4. **The Perfect Job Offer** (`the-perfect-job-offer`): How AI makes scams look professional, and the red flags to spot.
5. **The Summer Flyer** (`the-summer-flyer`): Bias in AI-made content, being honest about AI help, and fair use.

### 4. Go Deeper: How AI Works (planned)

Optional, for curious learners: how AI learns, why it can be unfair, and where a person must stay in control.

Outcome: A simple picture of how AI learns, why it can be unfair, and where people stay in control.

1. **How Did My Keyboard Learn My Words?** (`how-did-my-keyboard-learn`): Training and testing, through the phone keyboard.
2. **Why Was She Turned Down?** (`why-was-she-turned-down`): How gaps in training examples lead to unfair results.
3. **Which Tool for Which Job?** (`which-tool-for-which-job`): A short recap of kinds of AI, then choosing the right one.
4. **The Assistant That Booked the Wrong Hall** (`the-assistant-that-booked-the-wrong-hall`): Assistants, workflows and agents, and why a person checks before anything is sent, paid or deleted.


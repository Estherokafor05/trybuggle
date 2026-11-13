export type Track = "foundations" | "systems" | "practice";

export type ModuleStatus = "open" | "next" | "planned";

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
}

export interface Module {
  order: number;
  slug: string;
  title: string;
  summary: string;
  outcome: string;
  track: Track;
  status: ModuleStatus;
  handsOn: boolean;
  lessons: Lesson[];
}

export const TRACK_LABELS: Record<Track, string> = {
  foundations: "For everyone",
  systems: "Go deeper (optional)",
  practice: "Your path",
};

export const modules: Module[] = [
  {
    order: 1,
    slug: "ai-foundations",
    title: "Foundations of Artificial Intelligence",
    summary:
      "Understand what AI means, how it developed, and where it already appears in everyday life.",
    outcome: "A clear starting point for making sense of AI.",
    track: "foundations",
    status: "open",
    handsOn: false,
    lessons: [
      {
        slug: "what-counts-as-ai",
        title: "What is AI?",
        summary:
          "Meet the idea of artificial intelligence in plain language, and learn why the label covers many different things.",
      },
      {
        slug: "ai-in-your-day",
        title: "AI Is Already in Your Day",
        summary:
          "Spot familiar examples of AI at home, at work, and while you study.",
      },
      {
        slug: "before-chatgpt",
        title: "AI Did Not Start with ChatGPT",
        summary:
          "Take a short trip through the ideas and turning points that shaped today's AI.",
      },
      {
        slug: "ai-or-software",
        title: "AI or Ordinary Software?",
        summary:
          "See how systems that follow set instructions differ from systems that learn patterns.",
      },
      {
        slug: "what-ai-can-do",
        title: "What AI Can Do, and Where You Stay in Charge",
        summary:
          "Recognize useful capabilities, common mistakes, and the importance of human judgment.",
      },
    ],
  },
  {
    order: 2,
    slug: "talking-to-ai",
    title: "Talking to AI",
    summary:
      "Watch Maya use an AI chat tool for real tasks, and practise asking well and checking answers before you open a tool yourself.",
    outcome: "A one-page \u201cask well, then check\u201d card to use with any AI chat tool.",
    track: "foundations",
    status: "next",
    handsOn: true,
    lessons: [
      {
        slug: "a-new-helper",
        title: "A New Helper",
        summary: "What AI chat tools are, and why sounding confident is not the same as being right.",
      },
      {
        slug: "the-email-that-said-nothing",
        title: "The Email That Said Nothing",
        summary: "How to ask well: who it is for, what it is about, when and where, and the tone.",
      },
      {
        slug: "three-tries-at-the-flyer",
        title: "Three Tries at the Flyer",
        summary: "A chat is a back and forth. Follow-up messages improve the result.",
      },
      {
        slug: "thirty-pages-by-friday",
        title: "Thirty Pages by Friday",
        summary: "Summarising, explaining jargon and planning, then checking against the original.",
      },
      {
        slug: "the-grant-that-didnt-exist",
        title: "The Grant That Didn't Exist",
        summary: "Made-up facts and sources, and where not to rely on AI: health, law and money.",
      },
    ],
  },
  {
    order: 3,
    slug: "staying-safe-with-ai",
    title: "Staying Safe with AI",
    summary:
      "Protect your information, your money and the people you care about, now that AI makes scams and fake content easier to produce.",
    outcome: "A one-page safety checklist to use yourself and share with family and colleagues.",
    track: "foundations",
    status: "planned",
    handsOn: false,
    lessons: [
      { slug: "the-volunteer-list", title: "The Volunteer List", summary: "What happens to what you type into a chat tool, and what never to share." },
      { slug: "mum-its-me", title: "Mum, It's Me", summary: "Voice-clone scams, and how to check before you act." },
      { slug: "the-video-in-the-group-chat", title: "The Video in the Group Chat", summary: "Deepfakes and fake endorsements, and how to check them." },
      { slug: "the-perfect-job-offer", title: "The Perfect Job Offer", summary: "How AI makes scams look professional, and the red flags to spot." },
      { slug: "the-summer-flyer", title: "The Summer Flyer", summary: "Bias in AI-made content, being honest about AI help, and fair use." },
    ],
  },
  {
    order: 4,
    slug: "go-deeper",
    title: "Go Deeper: How AI Works",
    summary:
      "Optional, for curious learners: how AI learns, why it can be unfair, and where a person must stay in control.",
    outcome: "A simple picture of how AI learns, why it can be unfair, and where people stay in control.",
    track: "systems",
    status: "planned",
    handsOn: false,
    lessons: [
      { slug: "how-did-my-keyboard-learn", title: "How Did My Keyboard Learn My Words?", summary: "Training and testing, through the phone keyboard." },
      { slug: "why-was-she-turned-down", title: "Why Was She Turned Down?", summary: "How gaps in training examples lead to unfair results." },
      { slug: "which-tool-for-which-job", title: "Which Tool for Which Job?", summary: "A short recap of kinds of AI, then choosing the right one." },
      { slug: "the-assistant-that-booked-the-wrong-hall", title: "The Assistant That Booked the Wrong Hall", summary: "Assistants, workflows and agents, and why a person checks before anything is sent, paid or deleted." },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug);
}

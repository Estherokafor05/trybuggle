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
  foundations: "AI foundations",
  systems: "How AI systems work",
  practice: "Using AI in practice",
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
        title: "So, What Counts as AI?",
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
    slug: "types-of-ai-systems",
    title: "Understanding Different Types of AI Systems",
    summary:
      "Explore rules-based, predictive, and generative systems, and how their capabilities differ.",
    outcome: "A practical way to tell different AI systems apart.",
    track: "foundations",
    status: "next",
    handsOn: false,
    lessons: [
      {
        slug: "not-one-kind",
        title: "AI Is Not Just One Thing",
        summary: "Why one label can describe systems that work in very different ways.",
      },
      {
        slug: "rules-and-predictions",
        title: "Rules, Patterns, and Predictions",
        summary: "Compare systems that follow instructions with systems that learn from examples.",
      },
      {
        slug: "generating-new-things",
        title: "When AI Makes Something New",
        summary: "Meet generative systems and see how they differ from predictive tools.",
      },
      {
        slug: "choose-the-right-tool",
        title: "Which Kind Fits the Job?",
        summary: "Match everyday tasks with the kinds of systems that may support them.",
      },
    ],
  },
  {
    order: 3,
    slug: "machine-learning-foundations",
    title: "Understanding Machine Learning",
    summary:
      "Learn how computers find patterns in data, and why the examples they learn from matter.",
    outcome: "A simple mental model of how machine learning works.",
    track: "systems",
    status: "planned",
    handsOn: false,
    lessons: [
      {
        slug: "learning-from-examples",
        title: "Learning from Examples",
        summary: "How a computer can learn patterns instead of following only hand-written rules.",
      },
      {
        slug: "training-and-testing",
        title: "Practice, Then a Fair Test",
        summary: "What training and testing mean, using an everyday comparison.",
      },
      {
        slug: "data-quality",
        title: "When the Examples Miss the Mark",
        summary: "How gaps and bias in data can shape a system's results.",
      },
      {
        slug: "supervised-unsupervised",
        title: "Learning with and without Answer Keys",
        summary: "A plain-language introduction to supervised and unsupervised learning.",
      },
    ],
  },
  {
    order: 4,
    slug: "generative-ai-and-llms",
    title: "Understanding Generative AI and Large Language Models",
    summary:
      "Make sense of tools such as ChatGPT and Claude, how they respond, and why they can get things wrong.",
    outcome: "Confidence to use and check generative AI responses.",
    track: "systems",
    status: "planned",
    handsOn: false,
    lessons: [
      {
        slug: "what-generative-means",
        title: "What Does Generative AI Generate?",
        summary: "How tools create text, images, and other outputs from a request.",
      },
      {
        slug: "inside-a-language-model",
        title: "A Language Model, in Everyday Terms",
        summary: "A beginner-friendly picture of how a large language model produces a response.",
      },
      {
        slug: "context-matters",
        title: "Give It Context, Get a Better Answer",
        summary: "Why the information around a request can change the response.",
      },
      {
        slug: "check-the-answer",
        title: "Fluent Does Not Always Mean True",
        summary: "Why generative tools can be wrong and how to check important information.",
      },
    ],
  },
  {
    order: 5,
    slug: "ai-agents-and-workflows",
    title: "Understanding AI Agents and Workflows",
    summary:
      "Tell an assistant, a configured workspace, an automated workflow, and an agent apart.",
    outcome: "A clear picture of what agents can do and where oversight belongs.",
    track: "practice",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "assistant-workspace-workflow-agent",
        title: "Assistant, Workspace, Workflow, or Agent?",
        summary: "Compare four ideas that are often described with the same words.",
      },
      {
        slug: "how-agents-work",
        title: "How an Agent Gets from Request to Action",
        summary: "See how instructions, context, tools, and actions can work together.",
      },
      {
        slug: "keep-a-person-in-the-loop",
        title: "Where You Stay in Control",
        summary: "Recognize when an action needs a person's review or confirmation.",
      },
    ],
  },
  {
    order: 6,
    slug: "creating-ai-assisted-workflows",
    title: "Creating Your First AI-Assisted Workflow",
    summary:
      "Use accessible no-code tools to make a reusable helper for a routine, low-risk task.",
    outcome: "A simple workflow you can review and improve.",
    track: "practice",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "choose-a-routine-task",
        title: "Start with a Task You Know Well",
        summary: "Choose a routine task that is suitable for a first workflow.",
      },
      {
        slug: "set-up-a-reusable-workspace",
        title: "Give Your Helper a Clear Home",
        summary: "Configure a project or workspace with a clear purpose.",
      },
      {
        slug: "write-useful-instructions",
        title: "Instructions That Make Sense",
        summary: "Write reusable guidance and provide safe, relevant context.",
      },
      {
        slug: "review-and-improve",
        title: "Check It, Then Make It Better",
        summary: "Review the result, notice a limitation, and refine the workflow.",
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug);
}

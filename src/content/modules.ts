export type Track = "foundations" | "using-ai" | "testing-ai";

export type ModuleStatus = "open" | "next" | "planned";

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
}

export interface Module {
  /** Display number. Modules release in this order. */
  order: number;
  slug: string;
  title: string;
  /** One or two sentences on what the module covers. */
  summary: string;
  /** The single concrete thing someone has at the end. */
  outcome: string;
  track: Track;
  status: ModuleStatus;
  /** Whether any part of the module asks you to build something. */
  handsOn: boolean;
  lessons: Lesson[];
}

export const TRACK_LABELS: Record<Track, string> = {
  foundations: "Foundations",
  "using-ai": "AI as a tool for testing",
  "testing-ai": "Testing AI-native products",
};

export const modules: Module[] = [
  {
    order: 1,
    slug: "ai-foundations",
    title: "AI foundations",
    summary:
      "What AI actually is, the kinds of systems in use, and where each one fits. Plain language, no maths prerequisites.",
    outcome: "Language to tell a real capability from a sales claim.",
    track: "foundations",
    status: "open",
    handsOn: false,
    lessons: [
      {
        slug: "what-ai-is",
        title: "What we mean by AI",
        summary:
          "The word covers several different things. Separating them is the first useful skill.",
      },
      {
        slug: "types-of-systems",
        title: "The types of AI systems",
        summary:
          "Machine learning, natural language processing, computer vision, expert systems, generative models, robotics — what each one does and where you meet it.",
      },
      {
        slug: "where-each-fits",
        title: "Which system fits which problem",
        summary:
          "Why a rules engine beats a model for some jobs, and why the reverse is true for others.",
      },
    ],
  },
  {
    order: 2,
    slug: "machine-learning-foundations",
    title: "Machine learning foundations",
    summary:
      "How these systems get built: training data, patterns, limits. Enough to understand why a model fails the way it does.",
    outcome: "A working mental model of why output varies.",
    track: "foundations",
    status: "next",
    handsOn: false,
    lessons: [
      {
        slug: "learning-from-data",
        title: "Learning from data instead of rules",
        summary:
          "What training is, in terms you can explain to a product manager.",
      },
      {
        slug: "why-output-varies",
        title: "Why the same input gives different output",
        summary:
          "The property that breaks every assertion you have ever written.",
      },
      {
        slug: "where-bias-enters",
        title: "Where bias enters",
        summary:
          "Bias is a property of the data and the design, not a mood the model is in.",
      },
    ],
  },
  {
    order: 3,
    slug: "build-your-first-agent",
    title: "Build your first agent",
    summary:
      "End to end, start to finish, without writing Python. Instructions, tools, context, and what to do when it goes sideways.",
    outcome: "One agent running on your own work.",
    track: "using-ai",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "what-an-agent-is",
        title: "What an agent is, and is not",
        summary:
          "An agent is instructions plus tools plus a loop. Nothing more mysterious than that.",
      },
      {
        slug: "writing-instructions",
        title: "Writing instructions that hold up",
        summary:
          "The same precision you already use on acceptance criteria, pointed at a different reader.",
      },
      {
        slug: "giving-it-tools",
        title: "Giving it tools and context",
        summary: "What the agent can see, and what it must never touch.",
      },
      {
        slug: "when-it-goes-sideways",
        title: "When it goes sideways",
        summary: "Reading what went wrong and narrowing the instructions.",
      },
    ],
  },
  {
    order: 4,
    slug: "agent-workflows-for-qa",
    title: "Agent workflows for QA",
    summary:
      "The ones worth having: acceptance criteria review, test case drafting, bug report writing, triage of a failing run.",
    outcome: "Four workflows you can use on Monday.",
    track: "using-ai",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "acceptance-criteria-review",
        title: "An agent that reviews acceptance criteria",
        summary:
          "Catching the ambiguity before the ticket reaches a developer.",
      },
      {
        slug: "test-case-drafting",
        title: "An agent that drafts test cases",
        summary: "Drafts you edit, not cases you accept.",
      },
      {
        slug: "bug-reports",
        title: "An agent that writes the bug report",
        summary:
          "Steps, expected, actual, environment — written once, consistently.",
      },
      {
        slug: "triage",
        title: "An agent that triages a failing run",
        summary: "Sorting the real failure from the flake.",
      },
    ],
  },
  {
    order: 5,
    slug: "testing-ai-native-products",
    title: "Testing AI-native products",
    summary:
      "Accuracy, hallucination and bias as testable properties. Building an eval set, writing a rubric, catching regression when the model changes.",
    outcome: "An eval set for one real feature.",
    track: "testing-ai",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "grading-not-asserting",
        title: "Grading instead of asserting",
        summary:
          "Why equality assertions fail here, and what replaces them.",
      },
      {
        slug: "building-an-eval-set",
        title: "Building an eval set",
        summary: "Choosing cases that represent the problem, not the happy path.",
      },
      {
        slug: "writing-a-rubric",
        title: "Writing a rubric someone else could apply",
        summary: "Making a judgement call repeatable.",
      },
      {
        slug: "model-regression",
        title: "Regression when the model changes under you",
        summary:
          "Your code did not change and the behaviour did. What you do about it.",
      },
    ],
  },
  {
    order: 6,
    slug: "when-the-agent-is-wrong",
    title: "When the agent is wrong",
    summary:
      "Your agent drafted forty test cases. Are they any good? Grading your own agent's output, spotting where it quietly skipped the hard case, and knowing when to stop using it.",
    outcome: "A review habit you trust more than the agent.",
    track: "testing-ai",
    status: "planned",
    handsOn: true,
    lessons: [
      {
        slug: "reviewing-its-output",
        title: "Reviewing what it gave you",
        summary: "Reading forty generated cases without rubber-stamping them.",
      },
      {
        slug: "the-skipped-case",
        title: "The case it quietly skipped",
        summary:
          "Generated work is confident about the easy path and silent about the hard one.",
      },
      {
        slug: "knowing-when-to-stop",
        title: "Knowing when to stop using it",
        summary:
          "The call that matters most, and the one nobody teaches.",
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

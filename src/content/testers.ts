/** AI for Testers: early-access programme content (approved by the user, 16 Nov 2026). */

export const WAITLIST_ROLES = [
  "Manual tester, no code",
  "Automation engineer",
  "QA lead or manager",
  "Developer who tests",
  "Something else",
] as const;

export interface TesterModule {
  number: string;
  title: string;
  body: string;
  leaveWith: string;
  tag: "No code" | "Hands on";
  /** Replaces the "Module N" pill, e.g. for the module released first. */
  badge?: string;
}

export const testerModules: TesterModule[] = [
  {
    number: "01",
    title: "Understanding AI as a tester",
    body: "What AI actually is, the kinds of systems in use, and where each one fits. Plain language, no maths prerequisites.",
    leaveWith: "Language to tell a real capability from a sales claim.",
    tag: "No code",
    badge: "Out first",
  },
  {
    number: "02",
    title: "Machine learning foundations",
    body: "How these systems get built: training data, patterns, limits. Enough to understand why a model fails the way it does.",
    leaveWith: "A working mental model of why output varies.",
    tag: "No code",
  },
  {
    number: "03",
    title: "Build your first agent",
    body: "End to end, start to finish, without writing Python. Instructions, tools, context, and what to do when it goes sideways.",
    leaveWith: "One agent running on your own work.",
    tag: "Hands on",
  },
  {
    number: "04",
    title: "Agent workflows for QA",
    body: "The ones worth having: acceptance criteria review, test case drafting, bug report writing, triage of a failing run.",
    leaveWith: "Four workflows you can use on Monday.",
    tag: "Hands on",
  },
  {
    number: "05",
    title: "Testing AI-native products",
    body: "Accuracy, hallucination and bias as testable properties. Building an eval set, writing a rubric, catching regression when the model changes.",
    leaveWith: "An eval set for one real feature.",
    tag: "Hands on",
  },
  {
    number: "06",
    title: "When the agent is wrong",
    body: "Your agent drafted forty test cases. Are they any good? Grading your own agent's output, spotting where it quietly skipped the hard case, and knowing when to stop using it.",
    leaveWith: "A review habit you trust more than the agent.",
    tag: "Hands on",
  },
];

export const testerTracks = [
  {
    label: "Track A",
    title: "AI as a tool for testing",
    body: "The software under test behaves the same way every time. AI just makes you faster at testing it.",
    points: ["Agents that review acceptance criteria", "Drafting cases and bug reports", "Triaging a failed run"],
  },
  {
    label: "Track B",
    title: "Testing AI-native products",
    body: "Output varies run to run. You can't assert equality on it, so you grade it instead.",
    points: ["Accuracy, hallucination, bias", "Building an eval set and a rubric", "Regression when the model changes under you"],
  },
] as const;

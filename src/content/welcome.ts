// Welcome introduction shown before Lesson 1.
// Approved script text. When the user supplies a narration recording, a
// narrated film can replace the animated text, using these lines as captions.
export interface WelcomeScene {
  id: string;
  kicker: string;
  text: string;
}

export const welcomeScenes: WelcomeScene[] = [
  { id: "hello", kicker: "Hello", text: "Welcome to Buggle." },
  {
    id: "heard",
    kicker: "You're in the right place",
    text: "You've probably heard a lot about AI lately: at work, in the news, maybe from friends. If it feels confusing, you're in the right place.",
  },
  {
    id: "no-experience",
    kicker: "No experience needed",
    text: "You don't need any technical experience. No coding, and no jargon to start with.",
  },
  {
    id: "what-you-learn",
    kicker: "What you'll learn",
    text: "You'll learn what AI really is, in plain language, and see where it already shows up in your day.",
  },
  {
    id: "use-carefully",
    kicker: "Using it well",
    text: "You'll also learn how to use it carefully: checking its work and keeping your information safe.",
  },
  {
    id: "your-pace",
    kicker: "Your pace, your way",
    text: "Go at your own pace. Watch the films or read the guides, whichever suits you.",
  },
  {
    id: "ready",
    kicker: "Ready?",
    text: "Let's start with a simple question: what is AI?",
  },
];

export const firstLessonPath = "/modules/ai-foundations/lessons/what-counts-as-ai";

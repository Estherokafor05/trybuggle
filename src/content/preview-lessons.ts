interface PreviewLessonDetails {
  slug: string;
  title: string;
  duration: string;
  objective: string;
  visualTitle: string;
  guideSteps: { title: string; body: string }[];
  takeaway: string;
}

export type PreviewLesson = PreviewLessonDetails & (
  | { visualFormat: "four-ways" }
  | {
      visualFormat: "cards";
      narration: string;
      visualSteps: { label: string; title: string; body: string }[];
    }
);

export const previewLessons: PreviewLesson[] = [
  {
    slug: "what-counts-as-ai",
    title: "So, What Counts as AI?",
    duration: "4 minutes",
    objective: "Use everyday examples to compare four ways of understanding AI.",
    visualTitle: "Four ways to understand AI",
    visualFormat: "four-ways",
    guideSteps: [
      {
        title: "Start at a library kiosk",
        body: "Imagine you are borrowing a book at a self-service kiosk. You scan your library card, then scan the book. If the kiosk runs into a problem, it can guide you through what to do next. Use the same kiosk to explore four different questions.",
      },
      {
        title: "Compare how it works through a problem",
        body: "When a book fails to scan, a librarian might check which barcode you used before trying a different scanner. Imagine a computer model built by observing how librarians solve this problem. Does it work through the same steps in a similar order? Comparing its process with a person's is called thinking humanly.",
      },
      {
        title: "Follow a borrowing rule",
        body: "Say the library allows you to borrow a book when your card is active and the book is available to borrow. Both checks pass, so the kiosk allows the loan. Asking whether that decision follows from the rule and the facts illustrates thinking rationally.",
      },
      {
        title: "Notice what it says to the visitor",
        body: "A barcode fails to scan and the kiosk says, 'Could you turn the book over? The barcode is usually on the back.' Does that sound like the way a librarian might help? Comparing what the kiosk does with what a person might do is called acting humanly.",
      },
      {
        title: "Check whether its choice serves the goal",
        body: "You want a copy of your receipt. The printer is out of paper, and you have agreed to receive email receipts. The kiosk offers to email yours. Asking whether that choice makes sense for your goal and the options available is called acting rationally.",
      },
      {
        title: "Try it yourself",
        body: "The kiosk suggests a second scanner when the first one stops working. Pick one of the four approaches and write a question you could ask about its suggestion. For example, if the goal is to help you borrow the book, is the second scanner working and available?",
      },
    ],
    takeaway:
      "You can use several approaches to examine the same system. A kiosk can follow a simple borrowing rule using ordinary software. To tell whether it uses AI, you need evidence about how it produces its answers or choices.",
  },
  {
    slug: "ai-in-your-day",
    title: "AI Is Already in Your Day",
    duration: "5 minutes",
    objective: "Recognize familiar tasks where AI may be used and identify where a person should check the result.",
    visualTitle: "One day, several AI tasks",
    visualFormat: "cards",
    narration:
      "AI can support different tasks during an ordinary day. A service may suggest something you might like, flag a payment for review, translate a message, or create a draft image. These examples do different jobs, and a tool can combine more than one AI technique. A suggestion or flag is useful information to check, not a guarantee that the system is right.",
    visualSteps: [
      {
        label: "Morning",
        title: "A message is sorted",
        body: "A system may estimate whether an email looks like spam, then place it in a folder for you to review.",
      },
      {
        label: "During the day",
        title: "A suggestion appears",
        body: "A service may recommend a film, article, or product based on patterns in activity or preferences.",
      },
      {
        label: "At work or study",
        title: "A message is translated",
        body: "A language tool can produce a draft translation. Important names, meaning, and tone may still need a human check.",
      },
      {
        label: "When creating",
        title: "A new draft is made",
        body: "A generative tool can make an image or text draft from a request. Review it before using or sharing it.",
      },
    ],
    guideSteps: [
      {
        title: "Name the job",
        body: "Describe the task in ordinary words: sorting, suggesting, translating, recognizing, predicting, or creating.",
      },
      {
        title: "Notice what the system gives back",
        body: "It might provide a label, a score, a recommendation, or a new draft. Different outputs call for different kinds of review.",
      },
      {
        title: "Decide what needs a person",
        body: "Check important or high-impact results. Be especially careful with private information and decisions that affect someone else.",
      },
    ],
    takeaway:
      "AI can help with everyday tasks, but its output still needs a check that fits the task.",
  },
];

export function getPreviewLesson(slug: string): PreviewLesson | undefined {
  return previewLessons.find((lesson) => lesson.slug === slug);
}

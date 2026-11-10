interface PreviewLessonDetails {
  slug: string;
  title: string;
  duration: string;
  objective: string;
  visualTitle: string;
  guideSteps: { title: string; body: string }[];
  takeaway: string;
}

export type PreviewLesson = PreviewLessonDetails & {
  visualFormat: "four-ways" | "day";
  sources: { label: string; url: string; claim: string }[];
};

export const previewLessons: PreviewLesson[] = [
  {
    slug: "what-counts-as-ai",
    title: "So, What Counts as AI?",
    duration: "4 minutes",
    objective:
      "Explain four approaches to AI using familiar situations, without mistaking them for four separate kinds of technology.",
    visualTitle: "Four ways to look at AI",
    visualFormat: "four-ways",
    sources: [
      {
        label: "Russell and Norvig: Introduction to AI",
        url: "https://aima.cs.berkeley.edu/4th-ed/pdfs/newchap01.pdf",
        claim:
          "The four classical approaches compare thinking and acting, with human performance or rationality.",
      },
    ],
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
    objective:
      "Recognize familiar tasks where AI may be used and identify where a person should check the result.",
    visualTitle: "AI in your day, one moment at a time",
    visualFormat: "day",
    sources: [
      {
        label: "Apple: Designing Great ML Experiences",
        url: "https://developer.apple.com/videos/play/wwdc2019/803/",
        claim:
          "Photo search can use machine learning to recognise image content, including dogs.",
      },
      {
        label: "Google DeepMind: Traffic prediction",
        url: "https://deepmind.google/blog/traffic-prediction-with-advanced-graph-neural-networks/",
        claim:
          "Google Maps has used current and historical traffic information with machine learning to estimate journey times.",
      },
      {
        label: "AWS: Amazon Personalize",
        url: "https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html",
        claim:
          "Machine learning recommendations can use item interactions such as product clicks.",
      },
      {
        label: "Google: Gmail spam filters",
        url: "https://workspace.google.com/blog/identity-and-security/an-overview-of-gmails-spam-filters",
        claim:
          "Spam filtering can use machine learning, sender information and user feedback.",
      },
    ],
    guideSteps: [
      {
        title: "Start with a job you recognise",
        body: "Imagine you organise a community workshop. You use your phone and laptop to find a photo for a poster, plan your journey, choose supplies and read bookings. You do not need to know a product's technical name to begin. First ask: what am I trying to do?",
      },
      {
        title: "Trace the information and the result",
        body: "For the poster, you search your photo library for a dog picture. The app receives a search word and works with the pictures in the library. It returns suggested matches. Recognition means identifying patterns, such as features in a picture. Some apps do this using machine learning, which learns patterns from examples. Check that the result shows the picture you intended to use.",
      },
      {
        title: "Separate an estimate from a fact",
        body: "You plan how early to leave for the workshop. A navigation service may combine traffic now with patterns from earlier journeys to estimate a travel time. This is prediction: estimating something not yet known. It does not guarantee when you will arrive. Review the route and leave room for uncertainty.",
      },
      {
        title: "Test a suggestion against your needs",
        body: "A shop suggests a bag for carrying workshop supplies. Recommendation means suggesting something you might find useful. Some services use patterns in clicks or purchases. Write down your actual needs first: budget, capacity and dimensions. Compare those with the product details before choosing.",
      },
      {
        title: "Check how information was grouped",
        body: "A booking email goes to Spam. Classification means putting something into a group, such as Inbox or Spam. Some email services use machine learning to estimate which messages are unwanted. Check expected messages against your own booking records. A message in the inbox can still be misleading.",
      },
      {
        title: "Find evidence before calling it AI",
        body: "Look for an explanation in the product's official help or technical documentation. A label such as smart, or a feature that works automatically, is not enough evidence. A basic alarm can ring at a time you set without AI. If you cannot find a reliable explanation, say you are not sure yet.",
      },
      {
        title: "Try the three questions yourself",
        body: "Choose one tool from your day. Name the job, the information it receives and the result it gives back. Then choose a check that fits the result. Use the activity below to make notes without entering personal or confidential information.",
      },
    ],
    takeaway:
      "AI can help with everyday tasks, but its output still needs a check that fits the task.",
  },
];

export function getPreviewLesson(slug: string): PreviewLesson | undefined {
  return previewLessons.find((lesson) => lesson.slug === slug);
}

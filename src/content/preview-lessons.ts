export interface PreviewLesson {
  slug: string;
  title: string;
  duration: string;
  objective: string;
  sources: { label: string; url: string; claim: string }[];
}
export const previewLessons: PreviewLesson[] = [
  {
    slug: "what-counts-as-ai",
    title: "What is AI?",
    duration: "4 minutes to watch",
    objective:
      "Explain what AI is, how it can help, and why its results need a human check.",
    sources: [
      {
        label: "OECD: Explaining the AI system definition",
        url: "https://oecd.ai/en/wonk/definition",
        claim:
          "AI includes machine-learning and knowledge-based approaches; input can produce predictions, recommendations or generated content.",
      },
      {
        label: "Google: Supervised learning",
        url: "https://developers.google.com/machine-learning/intro-to-ml/supervised",
        claim:
          "Supervised learning uses labelled examples and is evaluated on new examples.",
      },
      {
        label: "NIST: Generative AI risk profile",
        url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
        claim: "Generative AI can produce confident but incorrect information.",
      },
    ],
  },
  {
    slug: "ai-in-your-day",
    title: "AI Is Already in Your Day",
    duration: "3 minutes to watch",
    objective:
      "Recognise familiar tasks where AI may be used and identify where a person should check the result.",
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
          "Traffic predictions can combine current and historical information with machine learning.",
      },
      {
        label: "AWS: Amazon Personalize",
        url: "https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html",
        claim:
          "Recommendations can use item interactions such as product clicks.",
      },
      {
        label: "Google: Gmail spam filters",
        url: "https://workspace.google.com/blog/identity-and-security/an-overview-of-gmails-spam-filters",
        claim:
          "Spam filtering can use machine learning, sender information and feedback.",
      },
    ],
  },
];
export function getPreviewLesson(slug: string): PreviewLesson | undefined {
  return previewLessons.find((lesson) => lesson.slug === slug);
}

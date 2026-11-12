export interface PreviewLesson {
  slug: string;
  title: string;
  duration: string;
  objective: string;
  /** Free to open before Google sign-in. Only Lessons 1 and 2 are. */
  preview: boolean;
  sources: { label: string; url: string; claim: string }[];
}
/** Every Module 1 lesson whose film, guide and knowledge check are ready. */
export const builtLessons: PreviewLesson[] = [
  {
    slug: "what-counts-as-ai",
    title: "What is AI?",
    duration: "4 minutes to watch",
    preview: true,
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
    preview: true,
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
  {
    slug: "before-chatgpt",
    title: "AI Did Not Start with ChatGPT",
    duration: "4 minutes to watch",
    preview: false,
    objective:
      "Describe how AI developed over decades and explain why chat tools made it feel new in 2022.",
    sources: [
      {
        label: "A. M. Turing (1950): Computing Machinery and Intelligence",
        url: "https://doi.org/10.1093/mind/LIX.236.433",
        claim:
          "Turing considered the question “Can machines think?” and proposed the imitation game, a conversation test.",
      },
      {
        label: "Dartmouth College: Artificial Intelligence Coined at Dartmouth",
        url: "https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth",
        claim:
          "The 1956 Dartmouth Summer Research Project on Artificial Intelligence gave the field its name.",
      },
      {
        label: "Encyclopaedia Britannica: Expert system",
        url: "https://www.britannica.com/technology/expert-system",
        claim:
          "Expert systems used knowledge and if-then rules gathered from human experts to solve problems in a narrow area.",
      },
      {
        label: "IBM: Deep Blue",
        url: "https://www.ibm.com/history/deep-blue",
        claim:
          "IBM's Deep Blue beat world chess champion Garry Kasparov in 1997 by searching through very large numbers of possible moves.",
      },
      {
        label: "OpenAI: Introducing ChatGPT (30 November 2022)",
        url: "https://openai.com/index/chatgpt/",
        claim: "OpenAI released ChatGPT to the public in November 2022.",
      },
    ],
  },
];
export const previewLessons = builtLessons.filter((lesson) => lesson.preview);
export function getPreviewLesson(slug: string): PreviewLesson | undefined {
  return previewLessons.find((lesson) => lesson.slug === slug);
}
export function getBuiltLesson(slug: string): PreviewLesson | undefined {
  return builtLessons.find((lesson) => lesson.slug === slug);
}

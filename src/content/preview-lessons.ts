export interface PreviewLesson {
  slug: string;
  title: string;
  duration: string;
  objective: string;
  /** Open without an account. All of Module 1 is; sign-up is only needed for the certificate. */
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
    preview: true,
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
  {
    slug: "ai-or-software",
    title: "AI or Ordinary Software?",
    duration: "4 minutes to watch",
    preview: true,
    objective:
      "Tell ordinary software apart from AI, and explain why automatic does not always mean AI.",
    sources: [
      {
        label: "OECD: Explaining the AI system definition",
        url: "https://oecd.ai/en/wonk/definition",
        claim:
          "AI systems infer from input how to produce outputs such as predictions; they can be built with machine learning, knowledge and rules, or both.",
      },
      {
        label: "Google: Classification (Machine Learning Crash Course)",
        url: "https://developers.google.com/machine-learning/crash-course/classification",
        claim:
          "A classification model learns from labelled examples to predict which category a new item belongs to, and its predictions can be wrong.",
      },
      {
        label: "Encyclopaedia Britannica: Expert system",
        url: "https://www.britannica.com/technology/expert-system",
        claim: "Expert systems are AI that uses knowledge and rules gathered from human experts.",
      },
    ],
  },
  {
    slug: "what-ai-can-do",
    title: "What AI Can Do, and Where You Stay in Charge",
    duration: "3 minutes to watch",
    preview: true,
    objective:
      "Use AI as a helper while checking its output, protecting personal information and keeping people responsible for decisions.",
    sources: [
      {
        label: "NIST: Generative AI risk profile",
        url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
        claim: "Generative AI can produce confident but false content, so its output needs checking.",
      },
      {
        label: "GOV.UK: Employers preventing discrimination in recruitment",
        url: "https://www.gov.uk/employer-preventing-discrimination/recruitment",
        claim:
          "Employers must not ask candidates whether they have children or plan to have children.",
      },
      {
        label: "GOV.UK: Responsible AI in recruitment",
        url: "https://www.gov.uk/government/publications/responsible-ai-in-recruitment-guide",
        claim: "AI tools used in hiring can perpetuate existing biases.",
      },
      {
        label: "ICO: Guidance on AI and data protection",
        url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
        claim: "Using personal information in AI tools must follow data protection law.",
      },
    ],
  },
  {
    slug: "a-new-helper",
    title: "A New Helper",
    duration: "3 minutes to watch",
    preview: true,
    objective:
      "Explain what an AI chat tool is, and why a confident, polished answer still needs checking before you rely on it.",
    sources: [
      {
        label: "Google: Introduction to large language models",
        url: "https://developers.google.com/machine-learning/crash-course/llm",
        claim:
          "Language models estimate how likely each word is to come next in a sequence, which is how they generate text.",
      },
      {
        label: "NIST: Generative AI risk profile",
        url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
        claim: "Generative AI can produce confident but false content, so its output needs checking.",
      },
    ],
  },
  {
    slug: "the-email-that-said-nothing",
    title: "The Email That Said Nothing",
    duration: "2 minutes to watch",
    preview: true,
    objective:
      "Write a clear request by saying who it is for, what it should say or do, when and where, and how it should sound, while keeping private details out.",
    sources: [
      {
        label: "Microsoft: Learn about Copilot prompts",
        url: "https://support.microsoft.com/en-us/topic/learn-about-copilot-prompts-f6c3b467-f07c-4db1-ae54-ffac96184dd5",
        claim: "A good request states the goal, the context, the information to use, and how the response should look.",
      },
      {
        label: "Google: Prompt design strategies",
        url: "https://ai.google.dev/gemini-api/docs/prompting-strategies",
        claim: "Clear, specific instructions and relevant context help a model give the response you want.",
      },
      {
        label: "ICO: Guidance on AI and data protection",
        url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
        claim: "Personal information should only be shared with AI tools where it is necessary and appropriate.",
      },
    ],
  },
  {
    slug: "three-tries-at-the-flyer",
    title: "Three Tries at the Flyer",
    duration: "2 minutes to watch",
    preview: true,
    objective:
      "Improve a close draft by telling the chat tool what to keep and what to change, and get someone who can check it to review anything you cannot check yourself.",
    sources: [],
  },
];
export const previewLessons = builtLessons.filter((lesson) => lesson.preview);
export function getPreviewLesson(slug: string): PreviewLesson | undefined {
  return previewLessons.find((lesson) => lesson.slug === slug);
}
export function getBuiltLesson(slug: string): PreviewLesson | undefined {
  return builtLessons.find((lesson) => lesson.slug === slug);
}

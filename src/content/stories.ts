import day from "../../public/lessons/maya-day/narration.json";
import foundations from "../../public/lessons/what-is-ai/narration.json";
import history from "../../public/lessons/before-chatgpt/narration.json";
export type StoryNarration = {
  duration: number;
  scenes: { id: string; start: number; end: number }[];
  cues: { text: string; scene: string; start: number; end: number }[];
};
export const stories: Record<
  string,
  {
    root: string;
    mediaVersion: string;
    narration: StoryNarration;
    title: string;
    introduction: string;
  }
> = {
  "what-counts-as-ai": {
    root: "/lessons/what-is-ai/",
    mediaVersion: "?v=20261112-1",
    narration: foundations,
    title: "What is AI?",
    introduction:
      "Join Maya as she explores familiar tools, tries a first draft and checks a detail that does not look right.",
  },
  "ai-in-your-day": {
    root: "/lessons/maya-day/",
    mediaVersion: "?v=a2cb24cf",
    narration: day,
    title: "A day with Maya",
    introduction:
      "Maya is preparing an evening photography club. Watch how she uses familiar tools and checks what they tell her.",
  },
  "before-chatgpt": {
    root: "/lessons/before-chatgpt/",
    mediaVersion: "?v=20261112-3",
    narration: history,
    title: "AI did not start with ChatGPT",
    introduction:
      "Sarah, a pharmacist, thought AI began with ChatGPT. Travel back to the 1950s with her and follow the story to today.",
  },
};

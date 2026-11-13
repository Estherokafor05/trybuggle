import day from "../../public/lessons/maya-day/narration.json";
import foundations from "../../public/lessons/what-is-ai/narration.json";
import history from "../../public/lessons/before-chatgpt/narration.json";
import software from "../../public/lessons/ai-or-software/narration.json";
import charge from "../../public/lessons/what-ai-can-do/narration.json";
import helper from "../../public/lessons/a-new-helper/narration.json";
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
  "ai-or-software": {
    root: "/lessons/ai-or-software/",
    mediaVersion: "?v=20261112-1",
    narration: software,
    title: "AI or ordinary software?",
    introduction:
      "Daniel, a receptionist, uses four tools that all work automatically. Find out which ones use AI, and how to tell.",
  },
  "what-ai-can-do": {
    root: "/lessons/what-ai-can-do/",
    mediaVersion: "?v=20261112-1",
    narration: charge,
    title: "Where you stay in charge",
    introduction:
      "Amina, who works in HR, uses an approved AI assistant to prepare for interviews. See what it does well, and what she checks.",
  },
  "a-new-helper": {
    root: "/lessons/a-new-helper/",
    mediaVersion: "?v=20261113-1",
    narration: helper,
    title: "A new helper",
    introduction:
      "Maya has three weeks to organise an open day. Her colleague Leo shows her an AI chat tool, and its first draft sounds perfect.",
  },
};

// Narrated welcome shown before Lesson 1.
// Audio: the user-supplied recording in public/lessons/welcome/narration.mp3,
// used unchanged. Cue and scene timings are aligned to the words actually
// spoken. Provenance and checksum are recorded in animation/assets.json.
import narration from "../../public/lessons/welcome/narration.json";

export interface WelcomeItem {
  text: string;
  at: number;
}

export interface WelcomeScene {
  id: string;
  start: number;
  end: number;
  kicker: string;
  headline: string;
  style?: string;
  items?: WelcomeItem[];
}

export interface WelcomeCue {
  text: string;
  start: number;
  end: number;
}

export const welcome: {
  duration: number;
  scenes: WelcomeScene[];
  cues: WelcomeCue[];
} = narration;

export const welcomeMedia = {
  root: "/lessons/welcome/",
  version: "?v=20261112-1",
};

export const firstLessonPath =
  "/modules/ai-foundations/lessons/what-counts-as-ai";

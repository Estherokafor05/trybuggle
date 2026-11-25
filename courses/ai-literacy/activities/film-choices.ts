// The "Your choice" moments in the Module 2 films. The film pauses at the end of
// its "choice" scene and asks the learner to choose. Unscored practice.
import type { Option } from "@/components/blocks/Blocks";
import type { FilmChoice } from "@/components/story/StoryPlayer";
import { missing } from "./EmailActivities";
import { nextMessages } from "./FlyerActivities";
import { checks } from "./GrantActivities";
import { sendOptions } from "./PagesActivities";

export type { FilmChoice };

const confident: Option[] = [
  { id: "yes", text: "Yes. It sounds sure, so it is probably right.", feedback: "Sounding sure is not the same as being right. A chat tool can sound just as confident when it is wrong." },
  { id: "check", text: "No. Check the details someone will rely on before using it.", correct: true, feedback: "Watch what Maya spots next." },
  { id: "polish", text: "Ask the chat tool to make it sound even better.", feedback: "Better wording does not make the facts any truer." },
];

export const filmChoices: Record<string, FilmChoice> = {
  "a-new-helper": { question: "If an answer sounds this confident, is that enough to trust what it says?", options: confident },
  "the-email-that-said-nothing": { question: "What could Maya add to make the biggest difference?", options: missing },
  "three-tries-at-the-flyer": { question: "What would you say to the chat tool next?", options: nextMessages },
  "thirty-pages-by-friday": { question: "Would you send it? What should Maya do?", options: sendOptions },
  "the-grant-that-didnt-exist": { question: "Before Maya sends her report, what would you check?", options: checks },
};

// Sample answers learners can reveal under each lesson's reflection prompts.

const exampleAnswers: Record<string, string> = {
  "what-counts-as-ai":
    "AI is a name for computer systems that can recognise patterns, make predictions or create things like text. A writing tool could help me start an email. Before sending it, I would check the dates and names against my own notes.",
  "ai-in-your-day":
    "My music app suggests songs. It uses what I've listened to before. It gives me a playlist. Before playing it at a club event, I would listen to check the songs suit the audience.",
  "ai-or-software":
    "My phone's alarm follows set instructions. My music app's suggestions might learn from what I play. Before I call something AI, I would ask what it actually does and how it decides.",
  "what-ai-can-do":
    "AI could help me draft emails. I would always check names, dates and prices. A decision about someone's job or health is one I would keep for a person.",
  "the-grant-that-didnt-exist":
    "I might ask a chat tool whether I can claim back the cost of a cancelled train. I would use the answer to learn what to ask, then check the train company's own refund page or an official consumer advice service.",
  "thirty-pages-by-friday":
    "My phone contract is long. Before acting on an AI summary, I would read the parts about the monthly price, how long I am tied in and what it costs to leave early.",
  "three-tries-at-the-flyer":
    "My CV summary is close but too long. I would type: keep my job titles and dates, make it no more than three lines. To change how it sounds, I would type: make it sound confident but friendly.",
  "the-email-that-said-nothing":
    "I might ask AI to write a message to my child's teacher. I would tell it who it is for, that I want to ask about a parents' evening, when I am free, and that it should sound short and polite.",
  "a-new-helper":
    "I could ask a chat tool to draft a short message to a customer. Before sending it, I would check the dates, prices and names, because those are things someone else will rely on.",
  "before-chatgpt":
    "AI didn't start with ChatGPT because people have been building and studying it since the 1950s. My email's spam filter is an older AI tool I've used without noticing. What surprised me most was that the name artificial intelligence is about seventy years old.",
};

/** The sample answer for a lesson; lessons without their own use Lesson 2's. */
export function reflectionExample(slug: string): string {
  return exampleAnswers[slug] ?? exampleAnswers["ai-in-your-day"];
}

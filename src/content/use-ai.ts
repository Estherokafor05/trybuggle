/**
 * "Start using AI" starter plans, shown after a learner completes a module.
 * Free, tool-neutral, country-neutral steps for three situations, followed by
 * an interest list for personal setup help (requested by a learner, approved
 * by the user on 19 Nov 2026). DRAFT wording: awaiting the user's review.
 */

export const SETUP_HELP_SITUATIONS = ["job", "business", "home"] as const;
export type Situation = (typeof SETUP_HELP_SITUATIONS)[number];

export interface StarterStep {
  title: string;
  body: string;
}

export interface StarterPlan {
  id: Situation;
  label: string;
  heading: string;
  intro: string;
  steps: StarterStep[];
  firstPrompt: string;
}

export const starterPlans: StarterPlan[] = [
  {
    id: "job",
    label: "In my job",
    heading: "Start using AI in your job",
    intro: "Pick one small, repeated task and let AI give you a first draft. You stay the person who checks it and signs it off.",
    steps: [
      {
        title: "Check your workplace rules first",
        body: "Ask your manager or IT team whether you may use AI tools at work, and which ones. Some workplaces have an approved tool. Others don't allow any yet.",
      },
      {
        title: "List three tasks that eat your week",
        body: "Look for writing and organising work: emails, meeting notes, reports, schedules, checklists. These are where AI helps most.",
      },
      {
        title: "Pick one and try it for a week",
        body: "Open a chat assistant (such as ChatGPT, Gemini, Copilot or Claude). Give it the context, the goal and the format you want, as you practised in the course.",
      },
      {
        title: "Never paste private information",
        body: "Remove names, customer details, passwords and anything confidential before you type. If you wouldn't post it on a noticeboard, don't paste it.",
      },
      {
        title: "Check everything before it goes out",
        body: "Read every draft, fix the facts and make it sound like you. The work still has your name on it.",
      },
    ],
    firstPrompt:
      "I work as a [your role]. Here are rough notes from today's meeting: [paste notes with names removed]. Turn them into a short summary with a list of actions and who owns each one.",
  },
  {
    id: "business",
    label: "In my business",
    heading: "Start using AI in your business",
    intro: "Use AI for the writing and admin that keeps you away from customers. Start free, and keep a person in charge of anything that is sent, paid or published.",
    steps: [
      {
        title: "Write down where your time goes",
        body: "Note a week of admin: replying to customers, writing posts, product descriptions, quotes and invoices. Circle the jobs you repeat.",
      },
      {
        title: "Start with one free chat assistant",
        body: "Use one tool for a few weeks before you pay for anything. Most of what a small business needs at first is in the free versions.",
      },
      {
        title: "Build a reusable 'about my business' note",
        body: "Write a short paragraph: what you sell, who your customers are and how you like to sound. Paste it at the start of each request so answers fit your business.",
      },
      {
        title: "Keep customer data out",
        body: "Don't paste customer names, phone numbers, addresses or payment details into a chat tool. Use placeholders such as [customer name].",
      },
      {
        title: "Approve before anything goes public",
        body: "Read every post, price and reply before it is sent. Check the facts, promises and prices yourself. AI can make up details that sound right.",
      },
    ],
    firstPrompt:
      "I run a small [type of business] selling [what you sell] to [your customers]. Write three short social media posts announcing [your offer]. Keep the tone friendly and simple, and end each one with how to order.",
  },
  {
    id: "home",
    label: "At home",
    heading: "Start using AI at home",
    intro: "Use AI as a patient helper for planning, explaining and writing. Keep your family's private details private.",
    steps: [
      {
        title: "Choose one everyday job",
        body: "Meal plans from what's in the cupboard, a weekly budget, a tricky letter, or explaining homework in simpler words. Start with one.",
      },
      {
        title: "Tell it about your situation",
        body: "Give the details that matter: how many people, your budget, time available, things to avoid. Better context gives better help.",
      },
      {
        title: "Protect your family's information",
        body: "Don't share ID numbers, bank details, passwords, medical records or photos of children. A chat tool is not a private diary.",
      },
      {
        title: "Double-check health, money and legal answers",
        body: "AI can be confidently wrong. For anything about health, money or the law, check with a trusted source or a qualified person before you act.",
      },
      {
        title: "Learn alongside your family",
        body: "Try it together with children or older relatives. Show them what you learned in the course, including how to spot scams that use AI.",
      },
    ],
    firstPrompt:
      "Plan five simple dinners for a family of [number] on a tight budget. We have [ingredients you already have]. Avoid [allergies or dislikes]. Give me one shopping list for the week.",
  },
];

export function getStarterPlan(id: string | null | undefined): StarterPlan | undefined {
  return starterPlans.find((plan) => plan.id === id);
}

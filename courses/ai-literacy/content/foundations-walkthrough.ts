export type FoundationSceneId =
  | "intro"
  | "puzzle"
  | "discount"
  | "library"
  | "routes"
  | "recap";
export interface FoundationScene {
  id: FoundationSceneId;
  title: string;
  audioSrc: string;
  duration: number;
  cues: { at: number; text: string; visual: string }[];
}
// Recorded with Kokoro-82M, bf_emma. Cue offsets measured against the bundled recording.
export const foundationScenes: FoundationScene[] = [
  {
    id: "intro",
    title: "Four familiar situations",
    audioSrc: "/lessons/four-ways/intro-v2.m4a",
    duration: 23.108667,
    cues: [
      {
        at: 0,
        text: "Think about putting a puzzle together,",
        visual: "A person at the kitchen table selects a puzzle piece.",
      },
      {
        at: 2.276,
        text: "checking a discount,",
        visual: "The view moves to a shopper at a checkout.",
      },
      {
        at: 3.986,
        text: "asking someone for help,",
        visual: "A visitor asks for help at the library.",
      },
      {
        at: 5.905,
        text: "or choosing your route to work.",
        visual: "A map shows a journey to work.",
      },
      {
        at: 8.083,
        text: "These familiar situations can help us explore four questions people ask about AI.",
        visual: "The four situations are connected to four questions.",
      },
      {
        at: 13.283,
        text: "Are we looking at how a system works through a problem, or what it does?",
        visual: "Two labelled paths appear: the process, and what it does.",
      },
      {
        at: 17.006,
        text: "And are we comparing it with people, or checking its reasoning and choices?",
        visual:
          "The paths connect to comparing with people or checking reasoning and choices.",
      },
      {
        at: 21.175,
        text: "Let's see what that means.",
        visual: "The puzzle returns as the first example.",
      },
    ],
  },
  {
    id: "puzzle",
    title: "How would you start this puzzle?",
    audioSrc: "/lessons/four-ways/puzzle-v2.m4a",
    duration: 25.361,
    cues: [
      {
        at: 0,
        text: "You've tipped a jigsaw puzzle onto the table. Where would you start?",
        visual: "Loose puzzle pieces sit on a table.",
      },
      {
        at: 3.749,
        text: "You might find the corners, group similar colours, then try a piece.",
        visual:
          "Corner pieces are highlighted and blue pieces are grouped beside the board.",
      },
      {
        at: 7.655,
        text: "If it doesn't fit, you try another.",
        visual:
          "An attempted piece does not fit. A matching piece replaces it.",
      },
      {
        at: 10.005,
        text: "Imagine researchers watching how people solve that puzzle, then building a computer model to follow similar steps.",
        visual:
          "A computer model appears beside the person's board, with the observed steps connected.",
      },
      {
        at: 16.755,
        text: "They compare the model with what people actually do.",
        visual:
          "Compare the steps replays the person's and model's sequences side by side.",
      },
      {
        at: 19.714,
        text: "This approach is called thinking humanly. The interest is in the process, not just finishing the puzzle.",
        visual: "Thinking humanly appears below the two processes.",
      },
    ],
  },
  {
    id: "discount",
    title: "Does the discount apply?",
    audioSrc: "/lessons/four-ways/discount-v2.m4a",
    duration: 26.369417,
    cues: [
      {
        at: 0,
        text: "You're buying something for twenty pounds.",
        visual: "A shopper and a receipt show an item priced at £20.",
      },
      {
        at: 2.555,
        text: "The sign says members get ten percent off, and you have a membership card.",
        visual:
          "The shop rule appears, followed by the shopper's membership card.",
      },
      {
        at: 6.806,
        text: "The rule applies to you.",
        visual: "An arrow connects the rule to the confirmed membership.",
      },
      {
        at: 8.682,
        text: "Ten percent of twenty pounds is two pounds, so the price becomes eighteen pounds.",
        visual: "The receipt subtracts £2 and shows a total of £18.",
      },
      {
        at: 13.581,
        text: "We've used a rule and a fact to work out what follows. That illustrates thinking rationally, which focuses on logical reasoning.",
        visual: "Thinking rationally appears below the rule, fact and result.",
      },
      {
        at: 20.884,
        text: "A normal checkout can do this without AI. We're using the discount to explain the idea.",
        visual:
          "A label explains that this is an ordinary software example. Compare member and non-member prices.",
      },
    ],
  },
  {
    id: "library",
    title: "Asking for help",
    audioSrc: "/lessons/four-ways/library-v2.m4a",
    duration: 28.26675,
    cues: [
      {
        at: 0,
        text: "You're at the library with a book to return.",
        visual: "A visitor holds a book beside a library help screen.",
      },
      {
        at: 2.503,
        text: "You ask its chat assistant, 'Where do I drop this off?'",
        visual: "The visitor's question appears in the chat.",
      },
      {
        at: 5.639,
        text: "'There's a returns box beside the main entrance.'",
        visual: "The assistant's reply mentions a returns box.",
      },
      {
        at: 8.528,
        text: "'Is it outside?'",
        visual: "The follow-up question appears. It refers to the returns box.",
      },
      {
        at: 10.184,
        text: "'Yes, just outside the main doors.'",
        visual:
          "The reply appears and the returns box outside the entrance is highlighted.",
      },
      {
        at: 12.632,
        text: "Notice how the reply connects your follow-up question to the same box. You're looking at whether the conversation resembles how a person might help.",
        visual: "The word it and the earlier returns box are linked.",
      },
      {
        at: 20.726,
        text: "That's acting humanly. A natural-sounding reply doesn't prove the system thinks like a person, or that its directions are right.",
        visual: "Acting humanly appears. The visitor checks the entrance sign.",
      },
    ],
  },
  {
    id: "routes",
    title: "The quicker route changes",
    audioSrc: "/lessons/four-ways/routes-v2.m4a",
    duration: 29.648292,
    cues: [
      {
        at: 0,
        text: "You're about to leave for work. You want the quickest safe route.",
        visual:
          "A map shows the destination and the goal: quickest safe route.",
      },
      {
        at: 3.558,
        text: "Your map estimates ten minutes for one route and twelve for another. It recommends the ten-minute route.",
        visual:
          "Route A is estimated at 10 minutes and highlighted. Route B is estimated at 12 minutes.",
      },
      {
        at: 9.372,
        text: "Then traffic builds up. That estimate changes to eighteen minutes, while the other stays at twelve.",
        visual:
          "Traffic appears on A and its estimate changes to 18 minutes. B remains at 12.",
      },
      {
        at: 14.951,
        text: "The recommendation switches.",
        visual:
          "Route B becomes the recommendation. The destination stays fixed.",
      },
      {
        at: 17.037,
        text: "This illustrates acting rationally: choosing an action expected to help achieve a goal, using the information available.",
        visual: "Acting rationally appears below the updated map.",
      },
      {
        at: 23.994,
        text: "The estimate can still be wrong. You still need to follow road signs and check that the route is suitable.",
        visual:
          "A road sign and a check remind the learner to review the route before leaving.",
      },
    ],
  },
  {
    id: "recap",
    title: "Four questions to take away",
    audioSrc: "/lessons/four-ways/recap-v2.m4a",
    duration: 31.430583,
    cues: [
      {
        at: 0,
        text: "Let's bring the examples together.",
        visual:
          "A labelled two-by-two comparison brings back the four examples.",
      },
      {
        at: 2.292,
        text: "The puzzle asks whether the model follows a process like a person's: thinking humanly.",
        visual: "The puzzle cell reveals Thinking humanly.",
      },
      {
        at: 7.307,
        text: "The discount asks whether the reasoning follows the rule and facts: thinking rationally.",
        visual: "The checkout cell reveals Thinking rationally.",
      },
      {
        at: 12.322,
        text: "The conversation asks whether the response resembles a person's: acting humanly.",
        visual: "The library cell reveals Acting humanly.",
      },
      {
        at: 17.438,
        text: "The map asks whether the choice serves the goal: acting rationally.",
        visual: "The map cell reveals Acting rationally.",
      },
      {
        at: 21.478,
        text: "These are four approaches to studying AI. One system can be examined in more than one way. And an everyday example can illustrate an approach without being AI itself.",
        visual:
          "All four approaches remain visible. A reflection asks what else you need to know about two systems that finish the same puzzle.",
      },
    ],
  },
];

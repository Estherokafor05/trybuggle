export type FoundationSceneId =
  | "intro"
  | "puzzle"
  | "discount"
  | "library"
  | "routes"
  | "recap";

export interface FoundationCue {
  at: number;
  text: string;
  visual: string;
}

export interface FoundationScene {
  id: FoundationSceneId;
  title: string;
  audioSrc: string;
  duration: number;
  cues: FoundationCue[];
}

// Cue offsets are measured in seconds against the bundled narration.
// Voice: bf_emma (British English), rendered locally with Kokoro-82M.
export const foundationScenes: FoundationScene[] = [
  {
    id: "intro",
    title: "Four ways to look at AI",
    audioSrc: "/lessons/four-ways/intro.m4a",
    duration: 24.346,
    cues: [
      {
        at: 0,
        text: "When you hear the word AI, you might think of something like ChatGPT. But AI isn't just about chatting.",
        visual: "A question introduces four everyday situations. The examples appear one at a time."
      },
      {
        at: 6.337,
        text: "Some systems work through problems like people do, like when you're solving a puzzle.",
        visual: "The puzzle comes into focus."
      },
      {
        at: 10.957,
        text: "Others follow logical rules, like applying a discount at a shop.",
        visual: "The shop checkout comes into focus."
      },
      {
        at: 14.96,
        text: "Some hold a conversation, like when you ask for help.",
        visual: "The library conversation comes into focus."
      },
      {
        at: 18.111,
        text: "Others help us choose what to do, like picking a route to work. Let's look at all four ways of understanding AI.",
        visual: "The map comes into focus, completing the preview."
      }
    ]
  },
  {
    id: "puzzle",
    title: "Solving a jigsaw puzzle",
    audioSrc: "/lessons/four-ways/puzzle.m4a",
    duration: 22.539,
    cues: [
      {
        at: 0,
        text: "Imagine you're putting together a jigsaw puzzle.",
        visual: "Loose puzzle pieces sit beside an empty puzzle board."
      },
      {
        at: 2.834,
        text: "You might start by finding the corners.",
        visual: "The corner pieces move into place."
      },
      {
        at: 5.223,
        text: "Then you group pieces with similar colours and try to fit a piece.",
        visual: "Pieces of the same colour come together and a matching piece fits into the board."
      },
      {
        at: 9,
        text: "Now imagine a computer designed to solve the puzzle in a similar way. It starts with the corners and matches colours too.",
        visual: "The model's board appears beside the person's board. The model starts with loose pieces, finds the corners, then groups colours and tries a fit."
      },
      {
        at: 15.85,
        text: "That's thinking humanly. We're interested in whether a computer works through the problem in a way that resembles how people think.",
        visual: "The phrase Thinking humanly appears alongside the comparison."
      }
    ]
  },
  {
    id: "discount",
    title: "A supermarket discount",
    audioSrc: "/lessons/four-ways/discount.m4a",
    duration: 23.544,
    cues: [
      {
        at: 0,
        text: "You're at the supermarket. The item you want costs twenty pounds.",
        visual: "A supermarket checkout shows a starting price of £20."
      },
      {
        at: 3.981,
        text: "The shop has a rule. Members get ten percent off.",
        visual: "The checkout displays the rule that members get 10% off."
      },
      {
        at: 7.201,
        text: "You're a member, so the rule applies to you.",
        visual: "A membership check confirms that the shopper qualifies."
      },
      {
        at: 9.686,
        text: "Ten percent of twenty pounds is two pounds. Take that off, and the total is eighteen pounds.",
        visual: "The checkout subtracts £2 from £20 and shows a new total of £18."
      },
      {
        at: 15.245,
        text: "That's an example of thinking rationally, using rules and facts to work out what follows. An ordinary checkout can follow this rule without being AI.",
        visual: "The phrase Thinking rationally appears beside the rule, the membership check and the total."
      }
    ]
  },
  {
    id: "library",
    title: "Asking for help at the library",
    audioSrc: "/lessons/four-ways/library.m4a",
    duration: 25.887,
    cues: [
      {
        at: 0,
        text: "Imagine you're at the library and you need to return a book.",
        visual: "A library chat window is ready to receive a question about a book."
      },
      {
        at: 3.343,
        text: "You ask the chat assistant, 'Where do I drop this off?'",
        visual: "The visitor's first question appears in the chat."
      },
      {
        at: 6.444,
        text: "It replies, 'There's a returns box beside the main entrance.'",
        visual: "The assistant points the visitor to a returns box beside the entrance."
      },
      {
        at: 9.921,
        text: "Then you ask, 'Is it outside?'",
        visual: "The visitor follows up with a question that uses the word it."
      },
      {
        at: 11.917,
        text: "It says, 'Yes, the box is just outside the main doors.'",
        visual: "The reply connects it to the same returns box."
      },
      {
        at: 15.19,
        text: "The reply sounds natural, and the assistant follows your question about the box. That's acting humanly. We're looking at how the system behaves and whether it resembles how a person might respond.",
        visual: "The phrase Acting humanly appears alongside the conversation."
      }
    ]
  },
  {
    id: "routes",
    title: "Choosing a route to work",
    audioSrc: "/lessons/four-ways/routes.m4a",
    duration: 26.57,
    cues: [
      {
        at: 0,
        text: "You're running late for work, so you open your navigation app. Your goal is to get there as quickly as possible.",
        visual: "A map shows the journey to work and the goal of arriving as quickly as possible."
      },
      {
        at: 5.935,
        text: "Route A is estimated at ten minutes, and Route B at twelve. The app recommends Route A.",
        visual: "The map marks Route A as recommended, with estimated times of 10 minutes for A and 12 for B."
      },
      {
        at: 11.147,
        text: "Then heavy traffic pushes Route A's estimate up to eighteen minutes.",
        visual: "A traffic alert appears on Route A and its estimate changes to 18 minutes."
      },
      {
        at: 15.03,
        text: "The app switches its recommendation to Route B. Its estimate is still twelve minutes.",
        visual: "The recommended route changes to B. The goal stays the same."
      },
      {
        at: 20.041,
        text: "That's acting rationally. The system uses the information it has and chooses an action that best helps it achieve its goal.",
        visual: "The phrase Acting rationally appears beside the updated map."
      }
    ]
  },
  {
    id: "recap",
    title: "So what's the difference?",
    audioSrc: "/lessons/four-ways/recap.m4a",
    duration: 28.052,
    cues: [
      {
        at: 0,
        text: "We've seen four ways of looking at AI.",
        visual: "A grid brings back the puzzle, checkout, chat and map. The rows show thinking and acting, and the columns distinguish a human comparison from rules or goals."
      },
      {
        at: 2.441,
        text: "Solving a puzzle using steps a person might use is thinking humanly.",
        visual: "The first cell links the puzzle to Thinking humanly."
      },
      {
        at: 6.467,
        text: "Using a rule and facts to work out the price is thinking rationally.",
        visual: "The second cell links the discount to Thinking rationally."
      },
      {
        at: 10.357,
        text: "Having a natural conversation is acting humanly.",
        visual: "The third cell links the conversation to Acting humanly."
      },
      {
        at: 13.482,
        text: "Choosing a route that serves your goal is acting rationally.",
        visual: "The fourth cell links the map to Acting rationally."
      },
      {
        at: 16.717,
        text: "These are four ways to look at how a system thinks or acts. They're different from types of technology, such as machine learning or generative AI. You can ask more than one of these questions about the same system.",
        visual: "All four cells remain visible. Each one can take you back to its example."
      }
    ]
  }
];

export type DaySceneId =
  | "day-intro"
  | "photos"
  | "journey"
  | "shopping"
  | "messages"
  | "day-recap";
export interface DayScene {
  id: DaySceneId;
  title: string;
  audioSrc: string;
  duration: number;
  cues: { at: number; text: string; visual: string }[];
}
// Recorded with Kokoro-82M, bf_emma. Cue offsets measured against the bundled recording.
export const dayScenes: DayScene[] = [
  {
    id: "day-intro",
    title: "A normal day",
    audioSrc: "/lessons/ai-in-your-day/day-intro-v2.m4a",
    duration: 21.227958,
    cues: [
      {
        at: 0,
        text: "You're getting ready for the day. You look for a photo,",
        visual: "An illustrated adult at home opens a photo library.",
      },
      {
        at: 3.007,
        text: "check your journey,",
        visual: "The person checks a map before leaving home.",
      },
      {
        at: 4.649,
        text: "browse for something you need",
        visual: "The day continues with browsing for a backpack.",
      },
      {
        at: 6.623,
        text: "and open your messages.",
        visual: "The person opens an inbox.",
      },
      {
        at: 8.669,
        text: "Some of these tools use AI behind the scenes. You don't have to open a chatbot to encounter it.",
        visual: "The day's timeline connects four familiar moments.",
      },
      {
        at: 14.504,
        text: "Let's follow a few everyday moments and see what the tool receives, what it gives back, and where your judgement matters.",
        visual:
          "Three questions appear: information in, result out, what would you check?",
      },
    ],
  },
  {
    id: "photos",
    title: "Finding a photo",
    audioSrc: "/lessons/ai-in-your-day/photos-v2.m4a",
    duration: 24.554542,
    cues: [
      {
        at: 0,
        text: "A friend asks for that photo of your dog. You have hundreds of pictures, so you search for 'dog'.",
        visual: "A mixed photo library appears. The search box fills with dog.",
      },
      {
        at: 5.407,
        text: "A photo app can use AI to recognise patterns in the pictures and bring back likely matches, even when you haven't named the files.",
        visual:
          "Likely dog pictures move forward, with one unrelated picture among the fictional results.",
      },
      {
        at: 13.328,
        text: "Learning patterns from examples is called machine learning, one way of building AI.",
        visual:
          "Photos and the search word lead to suggested matches. Machine learning appears.",
      },
      {
        at: 18.31,
        text: "Open the results and check them. The app might miss the photo you wanted or include something that doesn't belong.",
        visual:
          "Check the matches lets you identify the unrelated picture and open the intended photo.",
      },
    ],
  },
  {
    id: "journey",
    title: "Getting to work",
    audioSrc: "/lessons/ai-in-your-day/journey-v2.m4a",
    duration: 25.811458,
    cues: [
      {
        at: 0,
        text: "You're checking your journey before leaving for work. Traffic has built up on your usual road, and the map suggests another route.",
        visual:
          "At home, the learner sees traffic on a 30-minute route and a 20-minute alternative.",
      },
      {
        at: 7.024,
        text: "Some navigation systems use AI to combine current traffic information with patterns from earlier journeys.",
        visual:
          "Traffic now and patterns from earlier journeys feed into the route estimates.",
      },
      {
        at: 13.741,
        text: "That helps estimate what the roads may be like when you reach them.",
        visual:
          "The estimates connect to the two roads, and the alternative is highlighted.",
      },
      {
        at: 17.18,
        text: "This is prediction: estimating something we don't yet know.",
        visual: "Prediction appears beside the estimated journey times.",
      },
      {
        at: 20.793,
        text: "It helps you plan, but the time is an estimate. Check the route and follow road signs.",
        visual:
          "Compare routes reveals journey details and reminds the learner to check before leaving.",
      },
    ],
  },
  {
    id: "shopping",
    title: "Shopping for something useful",
    audioSrc: "/lessons/ai-in-your-day/shopping-v2.m4a",
    duration: 23.264458,
    cues: [
      {
        at: 0,
        text: "You're looking for a backpack. After you browse a few, the shop suggests others.",
        visual: "Two viewed backpacks lead to a row of suggested bags.",
      },
      {
        at: 4.457,
        text: "Some shopping services use AI to find patterns in what people view or buy. Those patterns help them recommend products you might like.",
        visual: "Viewed items and activity patterns connect to suggestions.",
      },
      {
        at: 12.329,
        text: "That's a recommendation. It isn't a promise that something is right for you.",
        visual:
          "Recommendation appears. One suggested bag opens for inspection.",
      },
      {
        at: 16.643,
        text: "Check the price, size and features. A suggested bag might look appealing and still be too small for your laptop.",
        visual:
          "Check the fit compares a 32 cm laptop with a 28 cm compartment, showing the mismatch.",
      },
    ],
  },
  {
    id: "messages",
    title: "A message goes to spam",
    audioSrc: "/lessons/ai-in-your-day/messages-v2.m4a",
    duration: 28.986083,
    cues: [
      {
        at: 0,
        text: "You're waiting for a booking confirmation. It isn't in your inbox, so you check the spam folder. There it is.",
        visual:
          "A fictional booking message moves to Spam. Find the missing message opens the folder.",
      },
      {
        at: 6.235,
        text: "Some email services use AI to look for patterns in messages, information about senders and feedback from users.",
        visual:
          "Message patterns, sender information and feedback feed into the sorting decision.",
      },
      {
        at: 13.495,
        text: "They estimate which messages may be unwanted.",
        visual:
          "A message is labelled Possibly unwanted, not definitely dangerous.",
      },
      {
        at: 16.577,
        text: "Sorting something into a group is called classification.",
        visual: "Classification appears alongside Inbox and Spam.",
      },
      {
        at: 20.02,
        text: "That can save you time, but mistakes happen. Check expected messages carefully. And a message reaching your inbox doesn't automatically make it trustworthy.",
        visual:
          "The learner compares fictional booking details with their own plan. There are no live links or safe badges.",
      },
    ],
  },
  {
    id: "day-recap",
    title: "What might AI be doing in your day?",
    audioSrc: "/lessons/ai-in-your-day/day-recap-v2.m4a",
    duration: 27.55525,
    cues: [
      {
        at: 0,
        text: "The photo app suggested matches. The map estimated a journey time. The shop recommended a product. The email service sorted a message.",
        visual: "The day's four moments return on a timeline.",
      },
      {
        at: 8.733,
        text: "Different jobs, with different things for you to check.",
        visual: "Each result is paired with a human check.",
      },
      {
        at: 11.577,
        text: "Not every automatic feature uses AI. A basic alarm can ring at the time you set without it.",
        visual: "A clock set to 7:00 rings, showing a simple automatic action.",
      },
      {
        at: 17.667,
        text: "Think of one tool you use. What information does it receive? What does it give back? What would you check?",
        visual:
          "A private practice activity offers prompts for one familiar tool.",
      },
      {
        at: 23.118,
        text: "If you don't know whether it uses AI, 'I'm not sure yet' is a useful answer.",
        visual:
          "The activity accepts uncertainty and suggests checking product documentation.",
      },
    ],
  },
];

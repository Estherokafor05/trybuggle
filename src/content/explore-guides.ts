// Read & Explore guides. Each step has an interactive activity (see
// components/explore) plus a written explanation used by the text-only
// reading page, so every learning outcome is available without JavaScript.
export type GuideStep = {
  id: string;
  title: string;
  /** One plain sentence telling the learner what they will do. */
  goal: string;
  reading: string[];
  takeaway: string;
};
export type ExploreGuide = {
  slug: string;
  title: string;
  steps: GuideStep[];
  reflections: string[];
};
export const exploreGuides: Record<string, ExploreGuide> = {
  "what-counts-as-ai": {
    slug: "what-counts-as-ai",
    title: "Help Maya understand AI",
    reflections: [
      "In my own words, AI is…",
      "One way AI could help me is…",
      "Before using an AI result, I would check…",
    ],
    steps: [
      {
        id: "meet",
        title: "What does AI mean?",
        goal: "Tap each tool to see what it does, then answer one question.",
        reading: [
          "Maya works at a community centre. People at work keep talking about AI, and she wants to understand what it actually means.",
          "AI is short for artificial intelligence. It is a name for computer systems that can do tasks such as recognising patterns, making predictions or creating text and pictures. AI covers many different kinds of tools, not one single machine.",
          "For example, a speech tool can take a recording and turn it into written words. A photo tool can look at a picture and suggest what is in it. A writing tool can take a short request and produce a first draft. These tools do not think or feel like a person, and their results still need checking.",
        ],
        takeaway:
          "AI is a broad name for computer systems that can recognise, predict or create.",
      },
      {
        id: "automatic",
        title: "Automatic or AI?",
        goal: "Start Maya's kitchen timer and decide whether it uses AI.",
        reading: [
          "Maya sets a kitchen timer for five minutes. When the time is up, it rings. The timer follows a fixed instruction that a person gave it. It does not need AI to do that.",
          "Next, Maya speaks a reminder into her phone: “Bring a notebook.” Her words appear as text. Some speech tools use AI to recognise patterns in the sound of a voice and work out the words.",
          "Both things happen automatically, but they work in different ways. Working automatically does not mean something uses AI. When you want to know whether a feature uses AI, look for reliable information about how it works.",
        ],
        takeaway: "Automatic does not always mean AI. Ask how it works.",
      },
      {
        id: "learn",
        title: "How can a computer learn?",
        goal: "Train a pretend system with examples, then test it on new pictures.",
        reading: [
          "Maya's phone can find photos of dogs, even though she never labelled them. One way to build a tool like this is to show a computer many example pictures, each labelled cat or dog. The computer finds patterns in the examples. This is called machine learning, and it is one common way to build AI.",
          "To see whether it learned well, we test it on pictures it has never seen. It might recognise a new dog correctly. But a partly hidden cat could fool it into guessing dog. AI can make mistakes, especially with unusual or unclear examples.",
          "This guide uses a small pretend example to show the idea. Real systems learn from far more examples, and the examples they learn from matter a great deal.",
        ],
        takeaway:
          "AI can learn patterns from examples, and it can still get things wrong.",
      },
      {
        id: "request",
        title: "Help Maya ask for a draft",
        goal: "Choose what Maya should tell an AI writing tool, then see what it writes.",
        reading: [
          "Maya needs to invite volunteers to a meeting on Thursday at 6 pm in Room Three. She uses an AI writing tool that her workplace allows. Tools that create new text or pictures are called generative AI.",
          "A good request includes what the message is for, the correct details and the tone she wants. It should not include private information, such as volunteers' phone numbers, because the tool does not need it.",
          "The tool writes: “Please join our volunteer meeting on Friday at 6 pm in Room Three. Parking is free.” It sounds confident and friendly. But a good request does not guarantee a correct result.",
        ],
        takeaway:
          "Give the tool useful details, keep private information out and expect to check the result.",
      },
      {
        id: "investigate",
        title: "Spot and fix the mistakes",
        goal: "Compare the draft with Maya's notes, find the problems and fix them.",
        reading: [
          "Maya's notes say Thursday, 6 pm, Room Three. They say nothing about parking. The draft says Friday, 6 pm, Room Three, and claims parking is free.",
          "Friday is wrong, so Maya changes it to Thursday. Free parking is not in her notes. It might be true, but she has no evidence, so she removes it. The time and room match, so they can stay.",
          "AI can produce information that sounds convincing but is not true. Asking the same tool whether it is sure is not a real check. Maya checks the facts against a reliable source and decides whether to send the message.",
        ],
        takeaway:
          "Check important details against a reliable source before you use an AI result.",
      },
      {
        id: "reflect",
        title: "Put it in your own words",
        goal: "Look back at what you learned, answer one last question and explain AI your way.",
        reading: [
          "You have learned that AI is a broad name for computer systems that can recognise patterns, make predictions or create content. Not everything automatic uses AI. Some AI learns from examples, and it can still make mistakes.",
          "When an AI answer could seriously affect someone, such as a question about health or medicine, involve a qualified person like a doctor or pharmacist. The more serious the consequences, the more careful the check.",
          "Try explaining AI to a friend using one example from your own life. Any notes you write here are private and stay on this device.",
        ],
        takeaway:
          "You can explain AI simply and know when its results need checking.",
      },
    ],
  },
  "ai-in-your-day": {
    slug: "ai-in-your-day",
    title: "Explore AI in Maya's day",
    reflections: [
      "A tool I use is…",
      "The information it uses is…",
      "What it gives me is…",
      "Before trusting it, I would check…",
    ],
    steps: [
      {
        id: "day-map",
        title: "Maya's day",
        goal: "Pick a place on the map to explore. Visit all four in any order.",
        reading: [
          "Maya is an administrator at a community centre. This evening she is running a photography club, and several everyday tools help her get ready.",
          "In each place, look for the technology that might use AI. Notice what information it uses, what it gives back and what Maya should check before relying on it. The examples are fictional, based on features some real products offer.",
        ],
        takeaway:
          "Look for the information a tool uses, what it gives back and what needs checking.",
      },
      {
        id: "home",
        title: "At home: finding a photo",
        goal: "Tap things in Maya's home to find the one that might use AI.",
        reading: [
          "Maya's alarm rings at seven because she set that time. A basic alarm follows her instruction and does not need AI.",
          "She needs a dog photo for the club poster, so she types dog into her photo app. Some photo apps use AI to recognise what is in each picture, so dog photos appear even though she never named the files. This is called recognition.",
          "The search finds several dogs, but Maya needs the club's dog in its teal collar. She opens the result and checks it is the right photo before using it.",
        ],
        takeaway:
          "Recognition finds likely matches. Maya checks the match is the right one.",
      },
      {
        id: "journey",
        title: "On the way: choosing a route",
        goal: "Find the tool that estimates journey times and see how its answer changes.",
        reading: [
          "Maya opens a map app. It estimates thirty minutes on her usual road and twenty minutes on another route. Some map apps use AI to combine current traffic with patterns from past journeys to estimate travel time. This is called prediction.",
          "Then traffic builds up and the other route changes to thirty-five minutes. A prediction is a best guess based on the information available. It is not a promise, and it can change.",
          "Maya checks the route suits her journey and leaves a little extra time, rather than trusting the first number she sees.",
        ],
        takeaway: "Predictions are best guesses and can change.",
      },
      {
        id: "centre",
        title: "At the centre: a missing email",
        goal: "Find where Maya's booking email went and decide how she should check it.",
        reading: [
          "At the centre, Maya cannot find the booking confirmation for tonight's room. She finds it in her Spam folder. Some email services use AI to sort messages into groups such as Inbox and Spam. This is called classification.",
          "Sorting can be wrong. A genuine message can land in Spam, and a misleading message can reach the Inbox. The folder alone does not prove whether a message is safe.",
          "Maya compares the details with her own booking record. If she is still unsure, she contacts the venue using details she already knows, not a link or number in the email.",
        ],
        takeaway: "A folder label is a sorting guess, not proof that a message is safe.",
      },
      {
        id: "shopping",
        title: "Shopping: a suggested bag",
        goal: "See why the shop suggests a bag, then check whether it fits.",
        reading: [
          "Maya looks online for a bag to carry the club camera. After she views a few, the shop suggests another one. Some shops use AI to find patterns in what people view and buy, and suggest products. This is called recommendation.",
          "The camera is 28 cm long, and the suggested bag fits cameras up to 25 cm. It is within budget, but it will not fit.",
          "A suggestion can be relevant without meeting your needs. Maya checks the size and price herself, then decides to keep looking.",
        ],
        takeaway: "A recommendation is a suggestion. You make the decision.",
      },
      {
        id: "day-reflect",
        title: "What did you notice?",
        goal: "Review the four ways AI helped Maya, then find an example in your own day.",
        reading: [
          "Across her day, Maya used tools that may use AI to recognise photos, predict journey times, classify emails and recommend products. In every case, Maya checked the result and made the decision herself.",
          "Think of a tool in your own day, such as a music app suggesting songs or a streaming service suggesting films. What information does it use? What does it give you? What would you check?",
          "It is fine to be unsure whether a tool uses AI. Look for reliable information from the company before deciding. Any notes you write here are private and stay on this device.",
        ],
        takeaway:
          "Recognise, predict, classify and recommend: AI helps, and you stay in charge.",
      },
    ],
  },
};

export type GuideStep = {
  id: string;
  title: string;
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
    title: "What is AI?",
    reflections: [
      "AI can help people…",
      "A result can go wrong when…",
      "Before using a result, I would…",
    ],
    steps: [
      {
        id: "meet",
        title: "Meet AI",
        goal: "Discover what goes in and what comes out of three familiar tools.",
        reading: [
          "AI is short for artificial intelligence. It is a broad name for computer systems that can recognise patterns, make predictions, work through problems or create content such as text and pictures.",
          "Imagine taking notes after a meeting. Some speech tools receive a recording and produce written words. A photo tool can receive a picture and suggest what is in it. A drafting tool receives a request and produces a possible starting point for your writing.",
          "The information a system receives is its input. The result it gives back is its output. A useful result still needs checking. A speech tool might mishear a name, for example. These systems do not need human feelings to carry out their tasks.",
        ],
        takeaway:
          "AI describes a broad field, with different ways to help with a task.",
      },
      {
        id: "automatic",
        title: "Automatic does not always mean AI",
        goal: "Operate a timer, then compare it with a speech-recognition demonstration.",
        reading: [
          "You set a kitchen timer for five minutes. It counts down and rings. This is a fixed instruction that ordinary software can follow without AI.",
          "Now imagine speaking a reminder into a phone. In a tool that uses AI speech recognition, patterns in the sound help produce written words. Both tasks happen automatically, but they use different methods.",
          "Some AI systems use knowledge and rules supplied by people. Others learn patterns from examples, and systems can combine approaches. A rule alone, or a label such as smart, is not enough to prove a feature uses AI. Check reliable product documentation when you need to know.",
        ],
        takeaway:
          "Ask how a feature works, not just whether it happens automatically.",
      },
      {
        id: "match",
        title: "What could help with the job?",
        goal: "Match each piece of information to a useful result.",
        reading: [
          "A meeting recording can go into a speech-recognition tool to produce written notes. The person reviewing the notes should check names and important details against the recording.",
          "Past visitor counts and relevant current information may help a system estimate tomorrow’s attendance. That estimate is a prediction, not a promise. An unusual event may change what happens.",
          "Instructions for a meeting invitation can go into a generative tool to produce a draft. The person sending it checks the date, place and wording. These tasks illustrate capabilities, not three separate boxes that every AI system must fit into.",
        ],
        takeaway:
          "Choose help that fits the task, then choose a check that fits the result.",
      },
      {
        id: "learn",
        title: "Let examples do some teaching",
        goal: "Follow a small training illustration, then try unfamiliar pictures.",
        reading: [
          "Suppose we want a system to recognise cats and dogs in pictures. During one kind of training, pictures come with labels identifying the animal. The system uses those examples to learn patterns. This is machine learning, one way to build AI.",
          "Testing means trying pictures that were not used for training. A system may recognise an unfamiliar dog correctly but mistake a partly hidden cat for a dog. A convincing label is not proof that the label is right.",
          "This guide uses a small, predetermined illustration. It does not train a real model, and four pictures would not demonstrate a reliable system. Real examples need to represent the situations the system will meet. Testing on new cases helps reveal weaknesses.",
        ],
        takeaway:
          "Training examples matter, and new situations can expose mistakes.",
      },
      {
        id: "request",
        title: "Give your helper a useful request",
        goal: "Build a safe request for a fictional volunteer meeting invitation.",
        reading: [
          "The event brief says: a volunteer meeting on Thursday at 6 pm in Room Three. You want a friendly invitation. Include the purpose, correct event details and desired tone in the request.",
          "You do not need to include volunteers’ private phone numbers. Use tools your organisation allows and share only information appropriate for the task. The example here is fictional and sends no information to an AI service.",
          "A tool that creates text from a request is an example of generative AI. It can provide a starting point, but it can still produce wrong or unsupported details. A request with useful context does not remove the need to review the result.",
        ],
        takeaway:
          "Give relevant context, protect private information and expect to review the draft.",
      },
      {
        id: "investigate",
        title: "Play fact detective",
        goal: "Compare the invitation with the event brief. Find a wrong detail and an unsupported claim.",
        reading: [
          "The event brief says Thursday, 6 pm, Room Three. The draft says Friday, 6 pm, Room Three, and claims that parking is free.",
          "Friday contradicts the brief, so it needs correcting to Thursday. Free parking is not mentioned in the brief. It might be true or false, but we do not have evidence for it. Remove it or verify it using a reliable source before including it.",
          "The time and room agree with the brief. Checking includes confirming correct details as well as finding errors. Confident wording does not prove that the information is accurate.",
        ],
        takeaway:
          "Wrong and unverified are different problems. Both need attention.",
      },
      {
        id: "repair",
        title: "Make the draft ready to use",
        goal: "Repair the invitation, then choose a sensible check for a higher-stakes situation.",
        reading: [
          "A checked invitation reads: Please join our volunteer meeting on Thursday at 6 pm in Room Three. The wrong day is corrected and the unverified parking claim is removed.",
          "The person responsible reads the whole message, confirms that it fits the task and decides whether to send it. Asking the same AI tool whether it is sure is not an independent fact check.",
          "For a health question or another decision that could seriously affect someone’s life, involve an appropriately qualified person. The level of checking should match the consequences of a mistake.",
        ],
        takeaway:
          "A person checks the evidence, makes corrections and decides what to do.",
      },
      {
        id: "reflect",
        title: "Explain it in your own words",
        goal: "Put together your own explanation. There is no score for this reflection.",
        reading: [
          "One possible explanation is: AI is a broad name for computer systems that can help recognise patterns, make predictions or create content. Some use knowledge and rules; others learn patterns from examples. Not every automatic feature uses AI.",
          "An AI result can be useful and still contain mistakes. Check important details against a reliable source, protect private information and use human judgment before acting.",
          "Try explaining this to a friend using one example from your work or home. Your notes are for you and stay on this device. The official knowledge check is a separate activity.",
        ],
        takeaway:
          "You can explain AI without jargon and describe a useful human check.",
      },
    ],
  },
  "ai-in-your-day": {
    slug: "ai-in-your-day",
    title: "Explore a day with Maya",
    reflections: [
      "A tool I use and the job I want it to do…",
      "The information it receives…",
      "The result it gives me…",
      "What I would check before using that result…",
      "Evidence that it uses AI, or what I am still unsure about…",
    ],
    steps: [
      {
        id: "day-map",
        title: "A day to investigate",
        goal: "Follow Maya or choose a place to explore. Return to any place whenever you like.",
        reading: [
          "Maya is an administrator at a community centre. She is preparing an evening photography club. Her day includes finding a photo, choosing a route, shopping for a camera bag and checking a booking message.",
          "Investigate what each tool receives, what it produces and what Maya needs to check. The examples are fictional demonstrations of features that some real products provide. A familiar-looking feature does not prove that a particular product uses AI.",
        ],
        takeaway:
          "Look for the job, the information, the result and the human check.",
      },
      {
        id: "home",
        title: "Find the right photo",
        goal: "Inspect the alarm and photo search, then choose a photo that suits a club poster.",
        reading: [
          "Maya’s alarm rings at seven because she set that time. A basic alarm can do this without AI.",
          "She searches her phone for dog. Some photo apps use AI to recognise patterns in the image content, so likely dog pictures can appear even if she never named the files. The search word and pictures are inputs; the suggested matches are outputs.",
          "For the poster, Maya needs a clear photo of the club’s dog wearing its teal collar. Other dog pictures may be relevant to the search but unsuitable for this task. She opens a result and checks the subject, clarity and permission to use the picture.",
        ],
        takeaway:
          "Recognition finds likely matches. Maya decides whether a match is useful.",
      },
      {
        id: "journey",
        title: "A better way to the centre?",
        goal: "Compare routes and see what changes when traffic information updates.",
        reading: [
          "Maya is about to travel to the centre. Her map estimates thirty minutes on the usual route and twenty on an alternative. Some navigation services combine current traffic and patterns from past journeys using AI to predict travel time.",
          "An estimate is not a guarantee. In our demonstration, a traffic update changes the alternative’s estimate to thirty-five minutes. The best choice can change when the information changes.",
          "Maya checks that the route suits her journey and leaves room for uncertainty. A faster estimate is not enough if a route is unsuitable. She makes the decision before travelling, not while being distracted on the road.",
        ],
        takeaway: "Predictions depend on available information and can change.",
      },
      {
        id: "shopping",
        title: "Suggested does not mean suitable",
        goal: "Inspect a suggested camera bag and test it against the club’s needs.",
        reading: [
          "Maya browses bags for the club camera. Some shops use patterns in browsing and purchases to recommend items. Those patterns can produce a relevant suggestion without knowing every requirement she has.",
          "The club’s camera is 28 cm long. In this fictional product specification, the bag’s maximum supported camera length is 25 cm. It costs $38, within the $40 budget, but it does not meet the stated size requirement.",
          "Maya checks the manufacturer’s fit information, price and other needs instead of treating the recommendation as a decision. A different bag with sufficient stated capacity may be a better fit.",
        ],
        takeaway:
          "A recommendation can be relevant and still be wrong for your needs.",
      },
      {
        id: "messages",
        title: "Where did the booking go?",
        goal: "Find a missing confirmation and decide how to check it safely.",
        reading: [
          "Maya expects a room-booking confirmation but cannot see it in her inbox. She finds a message in Spam. Some email services use AI with message patterns and other signals to classify messages into groups.",
          "Sorting can be wrong. A genuine message can land in Spam, and a misleading message can reach the inbox. Neither folder proves whether a message is safe.",
          "The message refers to a photography-club booking. Maya compares the date and room with her own booking record. If she is unsure, she contacts the centre using details she already knows, rather than relying on a link or phone number in the unexpected message.",
        ],
        takeaway: "A folder label is a sorting result, not a safety guarantee.",
      },
      {
        id: "tasks",
        title: "Connect the useful jobs",
        goal: "Match what Maya’s tools did to the everyday task they helped with.",
        reading: [
          "Photo search illustrates recognition: identifying patterns in pictures. The route estimate illustrates prediction: estimating something not yet known.",
          "The camera bag illustrates recommendation: suggesting something that may be useful. Sorting a message into Spam illustrates classification: assigning it to a group.",
          "These are overlapping tasks, not four exclusive kinds of AI. One system may perform several of them. Each result still needs a check suited to the situation.",
        ],
        takeaway:
          "Recognise, predict, recommend and classify describe useful tasks.",
      },
      {
        id: "day-reflect",
        title: "Find an example in your day",
        goal: "Choose a familiar tool and trace its input, output and a check you would make.",
        reading: [
          "For example, a music service may use listening activity to suggest songs. That suggestion might not suit your mood or the event you are planning. You choose whether to use it.",
          "Look for reliable product documentation before saying that a specific feature uses AI. It is fine to say you are not sure. A tool can be automatic without using AI.",
          "Describe a tool, the information it receives, the result it gives you and what you would check. Avoid personal or confidential details. This reflection is unscored, stays on this device and does not use an assessment attempt.",
        ],
        takeaway:
          "You can investigate a tool without assuming every smart-looking feature is AI.",
      },
    ],
  },
};

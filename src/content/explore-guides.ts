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
  "before-chatgpt": {
    slug: "before-chatgpt",
    title: "The AI Time Machine",
    reflections: [
      "In my own words, AI didn't start with ChatGPT because…",
      "One older AI tool I've used without noticing is…",
      "What surprised me most was…",
    ],
    steps: [
      {
        id: "time-1950",
        title: "1950: Could machines think?",
        goal: "Play a short version of Turing's conversation game, then answer one question.",
        reading: [
          "Sarah is a pharmacist. At a team meeting, her manager mentions that AI has been around for decades. Sarah is surprised, so she takes a trip back in time to find out where it began.",
          "Her first stop is 1950. Computers fill whole rooms and are mostly used for calculations. The mathematician Alan Turing writes a paper asking whether machines could think. Because “think” is hard to define, he suggests a practical test instead: a person chats by text with two hidden partners, one a person and one a machine. If the person cannot reliably tell which is which, that says something about what the machine can do.",
          "Turing's question was not about building any particular product. It was about whether machines could show behaviour we usually link with human intelligence, such as using language.",
        ],
        takeaway:
          "In 1950, Turing asked whether machines could show intelligent behaviour, decades before chat tools.",
      },
      {
        id: "time-1956",
        title: "1956: The field gets a name",
        goal: "Choose the name researchers gave their new field.",
        reading: [
          "In the summer of 1956, a group of researchers met at Dartmouth College in the United States. Their workshop was called the Dartmouth Summer Research Project on Artificial Intelligence.",
          "The name stuck. It is why we say “artificial intelligence”, or AI, today. That makes the term about seventy years old, much older than most of the tools people now link with it.",
        ],
        takeaway: "The term artificial intelligence comes from a 1956 workshop.",
      },
      {
        id: "time-rules",
        title: "1970s to 1980s: Teaching computers rules",
        goal: "Use a rule-based printer helper until it reaches a problem it cannot solve.",
        reading: [
          "For many years, a popular way to build AI was to write rules. Researchers asked experts, such as doctors or engineers, how they made decisions, then turned the answers into long lists of “if this, then that” instructions. These programs were often called expert systems.",
          "Imagine a printer helper. It asks whether the printer is switched on and whether there is paper in the tray, and gives the matching advice. For common problems, that works well.",
          "But rule-based systems were fragile. Every rule had to be written by hand, and when a problem came up that nobody had planned for, the system had no answer. When results fell short of big promises, interest and funding dropped for a while. These quiet periods are often called “AI winters”. Research carried on through them.",
        ],
        takeaway:
          "Rule-based systems worked for narrow jobs but got stuck when no rule fitted.",
      },
      {
        id: "time-1997",
        title: "1997 onwards: Searching and learning",
        goal: "Sort four examples: rules and searching, or learning from examples?",
        reading: [
          "In 1997, IBM's Deep Blue beat the world chess champion Garry Kasparov. Deep Blue did not learn chess the way a person does. It searched through enormous numbers of possible moves using rules and scoring that people had written.",
          "Over the following years, another approach grew: machine learning. Instead of writing every rule by hand, people gave computers many examples and let them find patterns. That made computers much better at recognising images, recognising speech and making predictions.",
          "Both approaches are part of AI's history, and many tools today combine them.",
        ],
        takeaway:
          "Deep Blue searched using rules written by people. Machine learning finds patterns in examples.",
      },
      {
        id: "time-2022",
        title: "2022: Put the story in order",
        goal: "Tap the milestones in the order they happened, then answer one question.",
        reading: [
          "By the 2010s, AI was already part of everyday life. Spam filters, photo search and route suggestions used it, often without people noticing.",
          "In November 2022, OpenAI released ChatGPT, and similar tools from other companies soon followed. For the first time, almost anyone could type a question in plain words and get a written reply on almost any topic.",
          "AI was not new in 2022. What changed was how visible and easy to use it became.",
        ],
        takeaway:
          "In 2022, chat tools made AI easy for anyone to talk to. AI itself was decades old.",
      },
      {
        id: "time-reflect",
        title: "Back to today",
        goal: "Help Sarah answer a colleague, then put the story in your own words.",
        reading: [
          "Sarah is back at work. She now knows that AI grew from decades of research: questions in the 1950s, rule-based systems, quiet periods when progress stalled, and the rise of machine learning. ChatGPT is one recent chapter in a much longer story.",
          "Think about a tool you have used for years, such as a spam filter or photo search. It may have been using AI long before chat tools appeared. Any notes you write here are private and stay on this device.",
        ],
        takeaway:
          "AI has been around for decades. It just became much easier to see.",
      },
    ],
  },
  "ai-or-software": {
    slug: "ai-or-software",
    title: "Step into Daniel's reception",
    reflections: [
      "A tool I use that follows set instructions is…",
      "A tool I use that might learn from examples is…",
      "Before I call something AI, I would ask…",
    ],
    steps: [
      {
        id: "rec-desk",
        title: "Daniel's desk",
        goal: "Tap each tool to see what it does, then guess which ones use AI.",
        reading: [
          "Daniel is a receptionist at a busy company. His colleagues say the new tools mean AI is helping with almost everything. Daniel is not so sure.",
          "His desk has four tools: a calendar that sends reminders, a check-in tablet for visitors, a shared inbox that suggests where messages should go, and a badge printer. All of them do things automatically. The question is how each one works.",
        ],
        takeaway: "Automatic tools are everywhere. How they work is what matters.",
      },
      {
        id: "rec-reminder",
        title: "Set a reminder",
        goal: "Book an appointment, choose a reminder and fast-forward the clock.",
        reading: [
          "Daniel books a visitor for two o'clock and asks for a reminder fifteen minutes before. At quarter to two, the reminder appears.",
          "The calendar is following an instruction someone wrote: when an appointment is fifteen minutes away, show a reminder. Change the time and the reminder moves with it. Same input, same result, every time. It does not learn, guess or predict, so it does not need AI.",
        ],
        takeaway: "Following a fixed instruction is ordinary software, not AI.",
      },
      {
        id: "rec-checkin",
        title: "Welcome a visitor",
        goal: "Sign a visitor in on the tablet, then see what happens with a small typo.",
        reading: [
          "A visitor types her name and who she is meeting on the reception tablet. The system saves her details, prints a badge and messages her host.",
          "Each step is an instruction set up in advance. If the visitor types the host's name with a small mistake, the system cannot work out who she meant. It simply reports that the host was not found. It follows steps; it does not understand.",
        ],
        takeaway: "A system can collect, store and act on information without AI.",
      },
      {
        id: "rec-inbox",
        title: "Teach the inbox",
        goal: "Sort example messages, then see how the tool predicts where new ones go.",
        reading: [
          "The shared inbox tool works differently. Nobody wrote a rule for every possible message. Instead, it was trained on messages that people had already sorted into folders such as Parking and Deliveries.",
          "It learns patterns, such as words that often appear in parking questions, and uses them to predict where a new message belongs. This is machine learning, one way of building AI. Its suggestions are predictions, so they can be wrong.",
        ],
        takeaway: "Some AI learns patterns from examples and uses them to predict.",
      },
      {
        id: "rec-mistake",
        title: "Spot the mistake",
        goal: "Check four suggestions from the inbox tool and fix any that are wrong.",
        reading: [
          "One message says: “The visitor check-in tablet isn't working.” The tool filed it under Visitor Information, probably because of the words “visitor” and “check-in”.",
          "Daniel reads the whole message. Someone is reporting a broken device, so it belongs with IT Support. The tool matched words; Daniel understood the need. Predictions like this still need a person to check them.",
        ],
        takeaway: "AI predictions can be wrong, so a person checks the important ones.",
      },
      {
        id: "rec-sort",
        title: "AI or ordinary software?",
        goal: "Sort five tools, then compare with your first guesses.",
        reading: [
          "The reminder and the check-in tablet follow instructions people wrote. A spreadsheet total follows a formula. None of these needs AI. The inbox tool learned from examples, which is one way AI can work.",
          "Some AI also uses rules, like the expert systems in Lesson 3, which captured experts' knowledge to make judgments. And sometimes you simply cannot tell: a product called “smart” may or may not use AI. Without reliable information about how it works, “not enough information” is an honest answer.",
          "Any notes you write here are private and stay on this device.",
        ],
        takeaway:
          "Don't go by the label. Ask what a system does and how it works.",
      },
    ],
  },
  "what-ai-can-do": {
    slug: "what-ai-can-do",
    title: "Help Amina hire fairly",
    reflections: [
      "One task AI could help me with is…",
      "Something I would always check is…",
      "A decision I would keep for a person is…",
    ],
    steps: [
      {
        id: "hr-brief",
        title: "Brief the assistant",
        goal: "Choose what Amina should give the AI assistant, then see its draft.",
        reading: [
          "Amina works in HR. Her team is hiring an office administrator, and she is using the AI assistant her company has approved to prepare interview materials.",
          "A useful request includes the public job description, the role title and the tone she wants. It should not include applicants' names or CVs: the assistant does not need them, and they are personal information. The assistant then writes a first draft of interview questions and a short job summary.",
        ],
        takeaway: "Give AI what the task needs and nothing personal it doesn't.",
      },
      {
        id: "hr-facts",
        title: "Fact-check the summary",
        goal: "Compare each claim in the AI summary with the job description.",
        reading: [
          "The summary says the role involves managing the diary, answering enquiries and keeping records, which all match the job description. It also says a full driving licence is required. The job description never mentions one.",
          "The assistant made that detail up and stated it confidently. If Amina published it, people without a licence might not apply. She removes it and checks every claim against the source.",
        ],
        takeaway: "AI can sound confident and still be wrong. Check claims against the source.",
      },
      {
        id: "hr-questions",
        title: "Review the questions",
        goal: "Keep or remove each suggested interview question.",
        reading: [
          "Most suggested questions are about the job, such as managing a busy diary or keeping records accurate. Two are not: “Do you have children, or are you planning to?” and “What year did you leave school?”, which can hint at a candidate's age.",
          "Questions like these have nothing to do with doing the job and could treat candidates unfairly. Amina removes them and checks the list against her company's approved interview guidance.",
        ],
        takeaway: "AI suggestions can be unfair. A person reviews them before they are used.",
      },
      {
        id: "hr-privacy",
        title: "The CV idea",
        goal: "Decide what to do with a colleague's suggestion about applicants' CVs.",
        reading: [
          "A colleague suggests pasting every applicant's CV into a public AI website to pick the best ones. The CVs contain names, addresses and work histories that people shared for one purpose: applying for this job.",
          "Before sharing personal information with any tool, Amina asks: is the tool approved, is it secure, and do our privacy rules allow it? Being able to process information does not make a tool the right place for it.",
        ],
        takeaway: "Protecting people's information is part of using AI responsibly.",
      },
      {
        id: "hr-ranking",
        title: "Who decides?",
        goal: "A tool ranks the candidates. Decide what Amina's team should do.",
        reading: [
          "A screening tool scores each CV and says Candidate B is the best match. It made that ranking by comparing CVs with people the company hired before.",
          "If past hiring was unfair, a tool like this can repeat the same pattern. That is why the interview panel assesses every candidate against the same agreed criteria, and the panel, not the tool, is responsible for the decision.",
        ],
        takeaway: "When a decision affects someone's job, people stay in charge.",
      },
      {
        id: "hr-checking",
        title: "How much checking?",
        goal: "Match each situation to the level of checking it needs.",
        reading: [
          "Not every AI result needs the same care. A draft reminder about a meeting needs a quick read. A summary of a company policy needs checking against the policy. Health questions and decisions about people's jobs need a qualified or responsible person to decide.",
          "The more serious the consequences of a mistake, the more careful the check. Any notes you write here are private and stay on this device.",
        ],
        takeaway: "Let AI help with the work, and keep people responsible for the decisions.",
      },
    ],
  },
  "a-new-helper": {
    slug: "a-new-helper",
    title: "Maya's new helper",
    reflections: [
      "One thing I could ask an AI chat tool to help with this week is…",
      "One detail I would check before using its answer is…",
    ],
    steps: [
      {
        id: "chat-busy",
        title: "Three weeks to an open day",
        goal: "Look at Maya's list and pick the jobs a chat tool could help with.",
        reading: [
          "Maya runs the office at a busy community centre. Her manager, Rosa, asks her to organise an open day in three weeks, on top of her normal work. By lunch her list is long: book the rooms, call the volunteers, get something into the newsletter, and answer a pile of emails.",
          "Her colleague Leo suggests an AI chat tool. There are several, such as ChatGPT, Gemini, Claude and Copilot, and most have a free version. You type a request in ordinary words, and it types an answer back. Chat tools are good with words: drafting, rewording and listing ideas. They cannot book a room or call a volunteer for you.",
        ],
        takeaway: "Chat tools help with words: drafts, rewording and ideas.",
      },
      {
        id: "chat-ask",
        title: "Ask the chat tool",
        goal: "Choose Maya's request and watch the chat tool answer.",
        reading: [
          "Maya types: \u201cWrite a short, welcoming paragraph about our community centre for the open day newsletter.\u201d A few seconds later, a warm, polished paragraph appears. It sounds professional, and Maya can already picture it in the newsletter.",
          "In this course, the chats are shown as examples inside the lesson. Nothing you type here is sent to any AI tool.",
        ],
        takeaway: "A chat tool can give you a polished first draft in seconds.",
      },
      {
        id: "chat-check",
        title: "Which line needs checking?",
        goal: "Read the draft and pick the line Maya should check before printing.",
        reading: [
          "Most of the paragraph is general and friendly: a welcoming place, something for everyone, come and say hello. But one line makes a specific claim: \u201cFor over fifty years, our centre has brought people together.\u201d",
          "Maya never told the tool when the centre opened. The line fits the kind of newsletter she asked for, but that does not make it true. She keeps the parts she likes and adds a note: check the opening date with Rosa before printing.",
        ],
        takeaway: "Check specific details, such as dates, numbers and names, before you use them.",
      },
      {
        id: "chat-why",
        title: "Why it sounds so sure",
        goal: "Build a sentence the way a chat tool does, one likely word at a time.",
        reading: [
          "A chat tool writes by predicting which words are most likely to come next, based on patterns it learned from an enormous amount of text. That is why its writing flows so smoothly: it has seen millions of well-written paragraphs.",
          "But it is not checking facts as it goes. It is choosing words that sound right. So it can sound exactly as confident when it is wrong as when it is right.",
        ],
        takeaway: "Sounding confident is not the same as being right.",
      },
      {
        id: "chat-turn",
        title: "Your turn",
        goal: "Think of something to ask a chat tool, and one detail you would check.",
        reading: [
          "The habit this module builds is simple: let AI help you get a first draft, then check the details someone else might rely on before you use it.",
          "Think of one thing you could ask an AI chat tool to help with this week, such as a message, a short description or a list of ideas, and one detail you would check in its answer. Any notes you write here are private and stay on this device.",
        ],
        takeaway: "Draft with AI, then check the details before you use them.",
      },
    ],
  },
  "the-email-that-said-nothing": {
    slug: "the-email-that-said-nothing",
    title: "Maya's invitation",
    reflections: [
      "A message I might ask AI to write this week is…",
      "To give it less to guess, I would tell it…",
    ],
    steps: [
      {
        id: "email-first",
        title: "Maya's first try",
        goal: "Read the email the chat tool wrote and find what is wrong with it.",
        reading: [
          "Maya wants to invite local clubs and groups to the open day. The gardening club could bring seedlings, and the chess club might run a quick game for anyone who wants to learn. She opens the chat tool and types: \u201cWrite an email about the open day.\u201d",
          "The reply talks about \u201can exciting event\u201d with \u201cfun for all the family\u201d, and says the open day is on the twelfth, a date Maya never gave. If she sent it as it was, the chess club would have no idea she wanted them to run a stall.",
        ],
        takeaway: "With almost nothing to go on, a chat tool writes something general and guesses the details.",
      },
      {
        id: "email-missing",
        title: "What was missing?",
        goal: "Decide what Maya could add to her request to make the biggest difference.",
        reading: [
          "The problem was not the tool. It was the request. Maya knows what the open day is for and who she wants there, but all she gave the tool was \u201cwrite an email about the open day\u201d.",
          "The tool only knows what you tell it. The more useful detail you give, the less it has to guess.",
        ],
        takeaway: "The tool only knows what you tell it.",
      },
      {
        id: "email-build",
        title: "Build a better request",
        goal: "Choose who it is for, what it should do, when and where, and the tone, then send it.",
        reading: [
          "Maya tries again: \u201cWrite a short, friendly email to the people who run local clubs and community groups. Invite them to run a stall at our open day in the main hall so they can meet people who might want to join.\u201d Then she adds the confirmed date and time.",
          "This time the invitation asks the groups to run a stall, and says where to go and when to be there. Maya checks both against the calendar, then tweaks the opening so it sounds like her.",
        ],
        takeaway: "Who, what, when and where, and tone: four details that make a request clear.",
      },
      {
        id: "email-private",
        title: "Keep contact details out",
        goal: "Decide what Maya should do with the group leaders' names and phone numbers.",
        reading: [
          "Maya almost pastes in the list of group leaders' names and phone numbers too. Then she stops. \u201cLocal club and group leaders\u201d is all the tool needs to write the invitation, so she keeps their contact details out of the chat.",
          "Module 3 explains what can happen to what you type into a chat tool.",
        ],
        takeaway: "Give the tool what it needs to write, not other people's personal details.",
      },
      {
        id: "email-turn",
        title: "Your turn",
        goal: "Pick the clearest request, then plan one of your own.",
        reading: [
          "Before you send a request, ask yourself four things. Who is it for? What do I want it to say or do? When and where, if those details matter? And how should it sound?",
          "Think of a message you might ask AI to write this week, and what you would tell it so it has less to guess. Any notes you write here are private and stay on this device.",
        ],
        takeaway: "Ask four questions before you send a request.",
      },
    ],
  },
};

// Server-only entry points import this bank. Never pass correct answers to a lesson component.
import type { Question } from "@/lib/assessment-scoring";
function q(
  id: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): Question {
  return {
    id,
    prompt,
    options: options.map((text, i) => ({ id: String(i), text })),
    correct: String(answer),
    explanation,
  };
}
export const assessmentBank: Record<string, Question[]> = {
  "what-counts-as-ai": [
    q(
      "meaning",
      "Which explanation would help someone new to AI?",
      [
        "AI is a broad field of systems that can recognise patterns, make predictions or create content.",
        "AI means a computer has human feelings.",
        "AI is any electrical device.",
      ],
      0,
      "AI covers a range of capabilities and approaches. It does not mean that a system feels like a person.",
    ),
    q(
      "timer",
      "A timer rings five minutes after you set it. What can you conclude?",
      [
        "It must have learned your habits.",
        "A fixed countdown can work without AI.",
        "Anything automatic is AI.",
      ],
      1,
      "The timer can follow a fixed instruction using ordinary software. Automatic operation alone does not prove AI is involved.",
    ),
    q(
      "methods",
      "How can AI systems be built?",
      [
        "Only by learning from huge collections of images.",
        "Only by copying a human brain.",
        "Using knowledge and rules, learning patterns from examples, or combinations of approaches.",
      ],
      2,
      "Machine learning is one way to build AI. Knowledge-based approaches also exist.",
    ),
    q(
      "input",
      "A speech tool turns a meeting recording into notes. What is its input?",
      [
        "The meeting recording.",
        "The written notes it produces.",
        "The person’s final decision to share the notes.",
      ],
      0,
      "Input is information a system receives. The generated notes are its output.",
    ),
    q(
      "learning",
      "A system uses labelled cat and dog pictures to learn patterns. What is this an example of?",
      [
        "A simple timer.",
        "Machine learning.",
        "A guarantee that every future picture will be labelled correctly.",
      ],
      1,
      "Learning patterns from examples is machine learning. It is one way to build AI and does not guarantee correct results.",
    ),
    q(
      "testing",
      "Why try pictures that were not used during training?",
      [
        "To avoid checking any predictions.",
        "To prove the system thinks like a person.",
        "To see how it handles new examples.",
      ],
      2,
      "Testing with new examples helps reveal whether learned patterns are useful beyond the training examples.",
    ),
    q(
      "generative",
      "A tool creates a first draft from Maya’s meeting request. Which description fits?",
      [
        "Generative AI creates content from a request.",
        "Every word must be a verified fact.",
        "The tool has automatically sent the invitation.",
      ],
      0,
      "Creating content is a generative task. A draft still needs review, and generating it does not mean it has been sent.",
    ),
    q(
      "wrongtime",
      "The draft says 9:00, but Maya never supplied a time. What is the best next step?",
      [
        "Trust it because the writing sounds confident.",
        "Check the actual meeting record and correct the draft.",
        "Ask the same tool if it is sure and treat that as proof.",
      ],
      1,
      "Compare the claim with a reliable source such as the actual calendar. Confidence is not evidence.",
    ),
    q(
      "privacy",
      "What should Maya include when requesting a fictional meeting invitation?",
      [
        "Every colleague’s private phone number.",
        "Unrelated confidential staff records.",
        "The relevant event details and tone, using a tool her workplace allows.",
      ],
      2,
      "Share appropriate information needed for the task. Private or confidential details should not be added unnecessarily.",
    ),
    q(
      "judgment",
      "An AI result concerns a decision that could seriously affect someone’s health. What matters?",
      [
        "Involving an appropriately qualified person and checking suitable evidence.",
        "Using it immediately if the wording sounds clear.",
        "Assuming AI makes human judgment unnecessary.",
      ],
      0,
      "The consequences of a mistake determine the level of checking. Serious decisions need suitable evidence and qualified human judgment.",
    ),
  ],
  "ai-in-your-day": [
    q(
      "alarm",
      "Maya’s basic alarm rings at the time she set. Does this alone show that it uses AI?",
      [
        "Yes, because it is on a phone.",
        "No. It can follow a fixed instruction without AI.",
        "Yes, because it helps her work.",
      ],
      1,
      "An automatic feature is not automatically an AI feature.",
    ),
    q(
      "photos",
      "Why might a photo app find dog pictures that Maya never named?",
      [
        "Some apps recognise patterns in image content.",
        "Every picture must secretly have a dog filename.",
        "The app knows exactly what Maya wants.",
      ],
      0,
      "Some photo apps use AI to recognise image content. A likely match still needs checking.",
    ),
    q(
      "choice",
      "Several dog pictures appear. What makes one useful for the club poster?",
      [
        "Being the first result is enough.",
        "Any dog picture is equally suitable.",
        "Maya checks the picture against the poster’s actual needs.",
      ],
      2,
      "Search relevance is not the same as task suitability. Maya checks the subject, clarity and permission to use the photo.",
    ),
    q(
      "route",
      "A map predicts a 20-minute journey. What does that mean?",
      [
        "Arrival in exactly 20 minutes is guaranteed.",
        "It is an estimate based on available information.",
        "No route check is needed.",
      ],
      1,
      "Travel-time predictions can change with traffic and other conditions. Maya checks the route and allows for uncertainty.",
    ),
    q(
      "update",
      "New traffic information makes the alternative route slower. What should Maya do?",
      [
        "Reconsider the options and route suitability using the update.",
        "Ignore the update because the first estimate was final.",
        "Always choose whichever route has the shortest distance.",
      ],
      0,
      "New information can change a prediction. The decision should also take the actual journey’s needs into account.",
    ),
    q(
      "recommend",
      "Why might a shop suggest another camera bag?",
      [
        "A recommendation proves the camera will fit.",
        "Every shop uses the same AI system.",
        "Some shops use patterns in browsing or purchases to suggest relevant items.",
      ],
      2,
      "Recommendations can use activity patterns. Their relevance does not guarantee that they meet all the buyer’s needs.",
    ),
    q(
      "fit",
      "The camera is 28 cm long. The suggested bag supports cameras up to 25 cm. What should Maya conclude?",
      [
        "The bag is suitable because it costs less than $40.",
        "The stated size requirement is not met, even if the price is suitable.",
        "The recommendation overrides the product specification.",
      ],
      1,
      "A suitable price does not fix a size mismatch. Check each requirement against the product’s actual specifications.",
    ),
    q(
      "classification",
      "An email service puts a message in Spam. What task does that illustrate?",
      [
        "Classification: assigning something to a group.",
        "Guaranteed verification of the sender.",
        "Creating a new photograph.",
      ],
      0,
      "Classification sorts information into categories. A folder label is not proof of safety.",
    ),
    q(
      "verify",
      "Maya is unsure whether a booking email is genuine. What is a sensible check?",
      [
        "Trust it because it reached the inbox.",
        "Use only the contact number inside the unexpected message.",
        "Compare her booking record and contact the centre through details she already trusts.",
      ],
      2,
      "A message can be misclassified. Check expected details and use a known contact if unsure.",
    ),
    q(
      "evidence",
      "A tool calls itself smart. How can you investigate whether a feature uses AI?",
      [
        "Assume every smart feature uses AI.",
        "Look for reliable product documentation and say you are unsure if evidence is missing.",
        "Judge it only by how modern its screen looks.",
      ],
      1,
      "A name or appearance does not establish how a feature works. Product evidence matters, and uncertainty is an honest answer.",
    ),
  ],
  "before-chatgpt": [
    q(
      "origins",
      "When did researchers start working on the idea of artificial intelligence?",
      [
        "In 2022, when ChatGPT was released.",
        "In the 1950s.",
        "In 1997, when a computer beat a chess champion.",
      ],
      1,
      "Turing's 1950 paper and the 1956 Dartmouth workshop mark the early days of AI research, decades before chat tools.",
    ),
    q(
      "turing",
      "What did Alan Turing suggest in 1950?",
      [
        "Judging a machine by whether its conversation could be told apart from a person's.",
        "Building the first chat app for the public.",
        "Stopping computers from doing calculations.",
      ],
      0,
      "Turing asked whether machines could think and proposed a conversation test to judge a machine by its behaviour.",
    ),
    q(
      "name",
      "Where did the term artificial intelligence come from?",
      [
        "A 1997 chess match.",
        "A 2022 product launch.",
        "A 1956 summer workshop at Dartmouth College.",
      ],
      2,
      "The Dartmouth Summer Research Project on Artificial Intelligence in 1956 gave the field its name.",
    ),
    q(
      "expert",
      "How did an expert system usually work?",
      [
        "It learned patterns from millions of photos.",
        "It followed if-then rules written down from human experts.",
        "It chatted with people in plain language.",
      ],
      1,
      "Expert systems turned experts' knowledge into rules that the computer followed.",
    ),
    q(
      "fragile",
      "A rule-based helper meets a problem nobody wrote a rule for. What is most likely to happen?",
      [
        "It works out a new rule by itself.",
        "It gets stuck or gives no useful answer.",
        "It fixes the problem faster than usual.",
      ],
      1,
      "A rule-based system can only follow the rules people gave it, which is why these systems were called fragile.",
    ),
    q(
      "winter",
      "What does the term AI winter describe?",
      [
        "The year AI research ended for good.",
        "A season when computers run more slowly.",
        "A period when interest and funding for AI dropped.",
      ],
      2,
      "When results fell short of big promises, interest and funding dropped for a while. Research still carried on.",
    ),
    q(
      "deep-blue",
      "How did Deep Blue beat Garry Kasparov in 1997?",
      [
        "It learned chess by chatting with players.",
        "It searched huge numbers of possible moves using rules and scoring written by people.",
        "It copied Kasparov's earlier games move by move.",
      ],
      1,
      "Deep Blue relied on search guided by human-written rules and scoring, not on learning the way people do.",
    ),
    q(
      "machine-learning",
      "What makes machine learning different from writing every rule by hand?",
      [
        "The computer finds patterns in many examples.",
        "The computer can never make mistakes.",
        "A person writes a rule for every possible situation.",
      ],
      0,
      "Machine learning finds patterns in examples. It can still make mistakes, so results need checking.",
    ),
    q(
      "before-2022",
      "Which of these was already using AI in many places before 2022?",
      [
        "A basic kitchen timer.",
        "Email spam filters.",
        "An ordinary light switch.",
      ],
      1,
      "Many email services used AI to sort spam long before chat tools appeared. A timer or switch follows fixed instructions.",
    ),
    q(
      "what-changed",
      "What changed in November 2022?",
      [
        "AI was invented.",
        "Almost anyone could type a question in plain words and get a written reply.",
        "Computers recognised speech for the first time.",
      ],
      1,
      "ChatGPT and similar tools made AI visible and easy to use. AI itself was decades old.",
    ),
  ],
  "ai-or-software": [
    q(
      "automatic",
      "A calendar shows a reminder 15 minutes before every meeting. What does this tell you?",
      [
        "It must be using AI.",
        "It can work by following a fixed instruction.",
        "It has learned the person's habits.",
      ],
      1,
      "A reminder can come from a fixed instruction written in advance. Working automatically does not prove AI is involved.",
    ),
    q(
      "check-in",
      "A visitor types the host's name with a typo and the system says “host not found”. What does that suggest?",
      [
        "It follows set steps rather than working out what was meant.",
        "It is an advanced AI that understands visitors.",
        "It learns from every visitor who signs in.",
      ],
      0,
      "The system only matches exact details. It follows its steps and cannot work out what someone meant.",
    ),
    q(
      "trained",
      "How was the smart inbox tool built?",
      [
        "Someone wrote a rule for every possible message.",
        "It was trained on messages that people had already sorted.",
        "It reads every message exactly the way a person does.",
      ],
      1,
      "The tool learned patterns from examples that people had sorted, then uses them to suggest folders.",
    ),
    q(
      "ml-name",
      "What is it called when a system learns patterns from examples and uses them to make predictions?",
      [
        "Machine learning.",
        "A spreadsheet formula.",
        "A scheduled reminder.",
      ],
      0,
      "Machine learning is one way of building AI: finding patterns in examples and using them to predict.",
    ),
    q(
      "prediction",
      "The inbox tool suggests a folder for a new message. What is that suggestion?",
      [
        "A guaranteed answer.",
        "A prediction that can be wrong.",
        "A rule that Daniel wrote.",
      ],
      1,
      "Learned patterns give a best guess. Predictions can be wrong, so important ones need checking.",
    ),
    q(
      "matched-words",
      "Why did the tool file “The visitor check-in tablet isn't working” under Visitor Information?",
      [
        "It matched words such as “visitor” and “check-in”.",
        "It understood the message perfectly.",
        "Daniel told it to file it there.",
      ],
      0,
      "The tool matched familiar words. Daniel read the whole message and saw it was a technical problem for IT Support.",
    ),
    q(
      "human-check",
      "An AI tool's prediction could cause a problem if it is wrong. What should happen?",
      [
        "Accept it, because computers don't make mistakes.",
        "A person checks it before it is used.",
        "Ask the tool whether it is sure.",
      ],
      1,
      "Predictions can be wrong. A person checks results that matter, rather than relying on the tool to check itself.",
    ),
    q(
      "spreadsheet",
      "A spreadsheet total updates when you change a number. Does that show it uses AI?",
      [
        "Yes, anything that updates itself is AI.",
        "Yes, because the result is correct.",
        "No, it can follow a formula someone set up.",
      ],
      2,
      "A formula is an instruction set up in advance. Automatic and correct does not mean AI.",
    ),
    q(
      "rules",
      "Which statement about rules and AI is true?",
      [
        "AI never uses rules.",
        "Some AI uses rules, such as expert systems built from experts' knowledge.",
        "Anything that follows rules is AI.",
      ],
      1,
      "Ordinary software follows rules, and some AI does too. Expert systems used rules captured from experts to make judgments.",
    ),
    q(
      "label",
      "A product is advertised as “smart”. How can you tell whether it uses AI?",
      [
        "Look for reliable information about how it works, and say you are unsure if there is none.",
        "The word “smart” proves it uses AI.",
        "If it looks modern, it uses AI.",
      ],
      0,
      "A label or appearance is not evidence. Reliable information about how it works matters, and “not sure” is an honest answer.",
    ),
  ],
  "what-ai-can-do": [
    q(
      "generative",
      "Amina asks an AI assistant to draft interview questions. What kind of AI is she using?",
      [
        "Generative AI, which creates new text.",
        "A spreadsheet formula.",
        "A basic alarm.",
      ],
      0,
      "Tools that create new text or pictures from a request are called generative AI.",
    ),
    q(
      "draft",
      "What is the best way to use an AI-generated draft?",
      [
        "Send it straight away.",
        "Treat it as a starting point to review and improve.",
        "Ask the AI to confirm it is correct.",
      ],
      1,
      "A draft saves time, but a person reviews and improves it before it is used.",
    ),
    q(
      "confident",
      "The AI summary says a driving licence is required, but the job description does not. What does this show?",
      [
        "AI can state made-up details confidently.",
        "The job description must be wrong.",
        "AI only writes true facts.",
      ],
      0,
      "Generative AI can produce confident but false details, so claims need checking.",
    ),
    q(
      "check-source",
      "How should Amina check the claims in an AI summary?",
      [
        "Trust them if they sound professional.",
        "Ask the AI whether it is sure.",
        "Compare them with the original source.",
      ],
      2,
      "Checking against the source is an independent check. Asking the same tool is not.",
    ),
    q(
      "fair-questions",
      "An AI suggests asking candidates whether they plan to have children. What should Amina do?",
      [
        "Keep it, because the AI suggested it.",
        "Remove it, because it is not about the job and could be unfair.",
        "Ask only some of the candidates.",
      ],
      1,
      "Questions about family plans are unrelated to the job and could treat candidates unfairly. Interview guidance says not to ask them.",
    ),
    q(
      "brief",
      "What should Amina give the AI assistant to draft interview questions?",
      [
        "The public job description and the role title.",
        "Every applicant's CV.",
        "Applicants' home addresses.",
      ],
      0,
      "Give the tool what the task needs. Personal information about applicants is not needed and should be protected.",
    ),
    q(
      "privacy",
      "A colleague wants to paste applicants' CVs into a public AI website. What should Amina check first?",
      [
        "Whether the website looks professional.",
        "Whether the tool is approved, secure and allowed under privacy rules.",
        "Whether the CVs are long.",
      ],
      1,
      "Personal information should only go into tools that are approved, secure and allowed for that purpose.",
    ),
    q(
      "bias",
      "Why might an AI screening tool rank candidates unfairly?",
      [
        "It can repeat unfair patterns from the information it learned from.",
        "It always chooses at random.",
        "It knows each candidate personally.",
      ],
      0,
      "If past information reflects unfair decisions, a tool that learned from it can repeat them.",
    ),
    q(
      "decision",
      "Who should decide which candidate gets the job?",
      [
        "The AI tool, because it is faster.",
        "The interview panel, using the same criteria for everyone.",
        "Whoever the AI ranks first.",
      ],
      1,
      "Decisions that affect people's jobs stay with responsible people using fair, agreed criteria.",
    ),
    q(
      "stakes",
      "Which situation needs the most careful human involvement?",
      [
        "AI drafts a reminder about a meeting.",
        "AI suggests a font for a poster.",
        "AI answers a question about medicine doses.",
      ],
      2,
      "The more serious the consequences, the more careful the check. Health questions need a qualified person.",
    ),
  ],
  "a-new-helper": [
    q(
      "what-is-a-chat-tool",
      "What is an AI chat tool?",
      [
        "A website or app where you type a request in ordinary words and it types an answer back.",
        "A search engine that only shows links to other websites.",
        "A tool that books rooms and calls people for you.",
      ],
      0,
      "Chat tools such as ChatGPT, Gemini, Claude and Copilot answer requests in ordinary words. They help with words, not with doing tasks like booking rooms.",
    ),
    q(
      "how-it-writes",
      "How does a chat tool write its answers?",
      [
        "It looks up each fact in a trusted database first.",
        "It predicts which words are most likely to come next, based on patterns in text it learned from.",
        "It copies the answer from one website.",
      ],
      1,
      "Chat tools predict likely next words. That is why their writing flows smoothly, but it is not checking facts as it goes.",
    ),
    q(
      "confident",
      "A chat tool's answer sounds polished and confident. What does that tell you?",
      [
        "It is definitely correct.",
        "It has been checked by an expert.",
        "Not much about whether it is correct: it can sound just as sure when it is wrong.",
      ],
      2,
      "Fluent, confident writing is what chat tools are built to produce. It is not a sign that the details are true.",
    ),
    q(
      "fifty-years",
      "The draft says the centre has served the community \u201cfor over fifty years\u201d. Maya never mentioned this. What should she do?",
      [
        "Check when the centre actually opened before printing it.",
        "Keep it, because it sounds good.",
        "Ask the chat tool if it is sure.",
      ],
      0,
      "Specific details the tool was not given, such as dates and numbers, need checking with a reliable source. Asking the same tool is not an independent check.",
    ),
    q(
      "first-draft",
      "What is the best way to use what a chat tool writes?",
      [
        "Paste it straight into the newsletter.",
        "Treat it as a first draft, and check the details someone else might rely on.",
        "Ignore it and start again from scratch.",
      ],
      1,
      "Let AI give you a quick first draft, then check the details before you use them.",
    ),
  ],
  "the-email-that-said-nothing": [
    q(
      "why-vague",
      "Maya asked \u201cWrite an email about the open day\u201d and got a vague email with a date she never gave. Why?",
      [
        "The chat tool was broken.",
        "It had almost nothing to go on, so it wrote something general and guessed the details.",
        "Chat tools always add a date to emails.",
      ],
      1,
      "The tool only knows what you tell it. With almost no detail, it fills the gaps with general wording and guesses.",
    ),
    q(
      "better-request",
      "Which request is most likely to get a useful email?",
      [
        "Write an email about our open day.",
        "Write a really good email.",
        "Write a short, friendly email inviting local club leaders to run a stall at our open day on Saturday the 21st in the main hall.",
      ],
      2,
      "It says who the email is for, what it should do, when and where, and how it should sound.",
    ),
    q(
      "four-questions",
      "Which questions help most before you send a request?",
      [
        "Who is it for, what should it say or do, when and where, and how should it sound?",
        "How long can my request be?",
        "Which chat tool is the most popular?",
      ],
      0,
      "Answering these four questions gives the tool what it needs, so it has less to guess.",
    ),
    q(
      "contacts",
      "Maya is about to paste the group leaders' names and phone numbers into the chat. What should she do?",
      [
        "Paste them, so the email feels personal.",
        "Leave them out: \u201clocal club and group leaders\u201d is all the tool needs.",
        "Paste only the phone numbers.",
      ],
      1,
      "Give the tool what it needs to write the email, not other people's personal details.",
    ),
    q(
      "check-details",
      "The improved email includes a date, a time and a place. What should Maya do before sending it?",
      [
        "Send it straight away, because her request was clear.",
        "Ask the chat tool to double-check itself.",
        "Check the date, time and place against the calendar.",
      ],
      2,
      "Even with a clear request, check the details someone will rely on against a reliable source.",
    ),
  ],
};

// Module final assessments: short refreshers across the module's lessons.
export const moduleAssessmentBank: Record<string, Question[]> = {
  "ai-foundations": [
    q(
      "explain-ai",
      "A new colleague asks you what AI is. Which answer is most accurate?",
      [
        "A computer that thinks and feels like a person.",
        "A broad name for computer systems that can recognise patterns, make predictions or create content.",
        "Any machine that runs on electricity.",
      ],
      1,
      "AI covers many kinds of systems that recognise, predict or create. It does not mean a machine thinks or feels like a person. (Lesson 1)",
    ),
    q(
      "photo-search",
      "Your photo app finds pictures of the beach that you never labelled. What is it most likely doing?",
      [
        "Recognising patterns in the pictures.",
        "Searching file names you typed.",
        "Choosing pictures at random.",
      ],
      0,
      "Some photo apps use AI to recognise what is in a picture, then suggest likely matches. It is still worth checking the results. (Lesson 2)",
    ),
    q(
      "journey-estimate",
      "A map app says your journey will take 25 minutes. What is that estimate?",
      [
        "A promise that cannot change.",
        "A prediction that can change as traffic changes.",
        "A fixed rule written for your route.",
      ],
      1,
      "Journey times are predictions based on current and past information. They are best guesses, not promises. (Lesson 2)",
    ),
    q(
      "history",
      "Which statement about the history of AI is true?",
      [
        "People have worked on AI since the 1950s, and chat tools made it much easier to use.",
        "AI began in 2022, when chat tools were released.",
        "AI was invented in 1997 when a computer won at chess.",
      ],
      0,
      "The term artificial intelligence dates from 1956. ChatGPT and similar tools in 2022 made AI far more visible, but it was not new. (Lesson 3)",
    ),
    q(
      "coffee-machine",
      "The office coffee machine starts brewing at 8 am every weekday. Does it need AI?",
      [
        "Yes, anything automatic uses AI.",
        "Yes, because it is useful.",
        "No, it can follow a set schedule.",
      ],
      2,
      "Following a fixed schedule is ordinary software. Automatic and useful does not mean AI. (Lesson 4)",
    ),
    q(
      "misfiled",
      "An inbox tool files a complaint under Compliments because it contains the word “thanks”. What does this show?",
      [
        "AI predictions can be wrong, so a person should check the important ones.",
        "The tool fully understands what people mean.",
        "Someone wrote a rule telling it to file complaints there.",
      ],
      0,
      "Tools that learn patterns match things like words. They can miss what a message actually means, so people check. (Lesson 4)",
    ),
    q(
      "request",
      "You ask an AI tool to draft a reply to a customer. What should you leave out of your request?",
      [
        "The tone you want.",
        "The customer's bank details.",
        "What the reply should be about.",
      ],
      1,
      "Give the tool what the task needs and nothing personal it does not. Bank details are private information. (Lesson 5)",
    ),
    q(
      "policy-summary",
      "An AI tool drafts a summary of a company policy that will go to all staff. What should happen next?",
      [
        "Send it, because it sounds professional.",
        "Ask the AI whether it is accurate.",
        "Check it against the actual policy before sharing it.",
      ],
      2,
      "People will rely on the summary, so check it against the source. Asking the same tool is not an independent check. (Lesson 5)",
    ),
  ],
};

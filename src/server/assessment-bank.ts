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
};

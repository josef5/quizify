import { OpenAI } from "openai";
import { useEffect, useState } from "react";
import sampleQuestions from "../test/sample-questions.json";
import "./App.css";

type GameState = "setup" | "loading" | "playing" | "finished";

type Question = {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
};

type Quiz = {
  questions: Question[];
};

type UserAnswer = {
  questionNumber: number;
  question: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type QuizResults = {
  responses: UserAnswer[];
};

function getShuffledAnswers(
  correctAnswer: string,
  wrongAnswers: string[],
): string[] {
  const answers = [correctAnswer, ...wrongAnswers];
  return answers.sort(() => Math.random() - 0.5);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [data, setData] = useState<Quiz | null>(null);
  const [userInstructions, setUserInstructions] = useState("");
  const [questionCount, setQuestionCount] = useState<1 | 5 | 10 | 15 | 20>(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [promptStore, setPromptStore] = useState<string[]>(() => {
    const storedPrompts = localStorage.getItem("quizify_prompts");
    return storedPrompts ? JSON.parse(storedPrompts) : [];
  });

  function transitionTo(nextState: GameState) {
    switch (nextState) {
      case "setup":
        setUserInstructions("");
        setCurrentQuestionIndex(0);
        setQuizResults({ responses: [] });
        break;
      case "loading":
        setData(null);
        setQuizResults({ responses: [] });
        break;
      case "playing":
        // Optionally reset question index or other state if needed
        break;
      case "finished":
        // Any cleanup if needed
        break;
    }

    setGameState(nextState);
  }

  function updatePromptStore(prompt: string) {
    if (!promptStore.includes(prompt)) {
      setPromptStore((prev) => [...prev, prompt]);

      localStorage.setItem(
        "quizify_prompts",
        JSON.stringify([...promptStore, prompt]),
      );
    }
  }

  async function fetchQuizTemp() {
    transitionTo("loading");

    await sleep(500); // Simulate loading delay

    updatePromptStore(userInstructions);

    setData({
      ...sampleQuestions,
      questions: sampleQuestions.questions.slice(0, questionCount),
    });

    transitionTo("playing");
  }

  // temp disabled
  async function fetchQuiz() {
    transitionTo("loading");

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const chatCompletion = await openai.chat.completions.create({
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a expert in multiple choice quiz writing.`,
          },
          {
            role: "user",
            content: userInstructions,
          },
          {
            role: "system",
            content: `The quiz should be a multiple choice quiz and have ${questionCount} questions, each with 1 correct answer and 3 wrong answers.`,
          },
          {
            role: "system",
            content: `Return the quiz in JSON format in this format:
            {
              questions: [
                {
                  "questionNumber": "<question number here>",
                  "question": "<question here>",
                  "correctAnswer": "<correct answer here>",
                  "wrongAnswers": [
                    "<wrong answer 1 here>",
                    "<wrong answer 2 here>",
                    "<wrong answer 3 here>"
                  ]
                }
              ]
            }
            `,
          },
        ],
        temperature: 0.7,
        model: "gpt-4o-mini",
      });

      const responseContent = JSON.parse(
        chatCompletion.choices[0].message.content ?? "",
      );

      setData(responseContent);

      // Check if the prompt store already contains the user instructions
      updatePromptStore(userInstructions);

      transitionTo("playing");
    } catch (error) {
      console.error(error);
    }

    console.log("Response data :", data);

    if (!data) {
      console.error("API response is empty");
      return;
    }
  }

  function getCurrentQuestion(): Question | null {
    if (!data || currentQuestionIndex >= data.questions.length) {
      return null;
    }
    return data.questions[currentQuestionIndex];
  }

  function startNextTurn() {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < data!.questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      transitionTo("finished");
    }
  }

  function getScore(responses: UserAnswer[]) {
    return `${responses.filter((response) => response.isCorrect).length}/${responses.length}`;
  }

  useEffect(() => {
    transitionTo("setup");
  }, []);

  const currentQuestion = getCurrentQuestion();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <h1 className="text-2xl font-bold">Quizify</h1>
        {(gameState === "setup" || gameState === "loading") && (
          <form className="flex flex-col gap-2">
            <label htmlFor="user-instructions">
              Enter your instructions for the quiz:
            </label>
            <textarea
              name="userInstructions"
              id="user-instructions"
              className="w-full rounded-sm p-2"
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder="Write your instructions here..."
              rows={8}
            ></textarea>
            <label htmlFor="question-count">Select number of questions:</label>
            <select
              name="questionCount"
              id="question-count"
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(Number(e.target.value) as 5 | 10 | 15 | 20)
              }
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
            <button
              className="rounded bg-blue-500 p-2 text-white disabled:opacity-50"
              onClick={(event) => {
                event.preventDefault();

                //*
                fetchQuizTemp();
                /*/
                fetchQuiz();
                //*/
              }}
              disabled={
                /* !userInstructions.trim() ||  */ gameState !== "setup"
              }
            >
              Quizify
            </button>

            {promptStore.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-bold">Previous Prompts:</h2>
                <ul className="list-disc pl-5">
                  {promptStore.map((prompt, index) => (
                    <li key={index}>
                      <button
                        onClick={(event) => {
                          event.preventDefault();

                          setUserInstructions(prompt);
                        }}
                      >
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        )}

        {gameState === "loading" && <p>Loading...</p>}

        {currentQuestion && gameState === "playing" && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">
              Question {currentQuestion.questionNumber}:
            </h2>
            <p>{currentQuestion.question}</p>
            <ul className="list-disc pl-5">
              {getShuffledAnswers(
                currentQuestion.correctAnswer,
                currentQuestion.wrongAnswers,
              ).map((answer, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setQuizResults((prevResults) => {
                        return {
                          responses: [
                            ...(prevResults?.responses || []),
                            {
                              questionNumber: currentQuestion.questionNumber,
                              question: currentQuestion.question,
                              answer: answer,
                              correctAnswer: currentQuestion.correctAnswer,
                              isCorrect:
                                answer === currentQuestion.correctAnswer,
                            },
                          ],
                        };
                      });

                      startNextTurn();
                    }}
                  >
                    {answer}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {gameState === "finished" && (
          <>
            {quizResults && (
              <>
                <p>{`Score: ${getScore(quizResults.responses)}`}</p>
                {quizResults.responses.map((response) => (
                  <div key={response.questionNumber} className="mt-4">
                    <p>{`${response.questionNumber}. ${response.question}`}</p>
                    <p
                      className={`${response.isCorrect ? "text-green-500" : "text-red-500"}`}
                    >{`Your answer: ${response.answer}`}</p>
                    {!response.isCorrect && (
                      <p>{`Correct Answer: ${response.correctAnswer}`}</p>
                    )}
                  </div>
                ))}
              </>
            )}

            <button
              className="mt-4 rounded-sm bg-blue-500 p-2 text-white"
              onClick={() => {
                transitionTo("setup");
              }}
            >
              Start Again
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default App;

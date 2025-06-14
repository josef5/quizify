import { OpenAI } from "openai";
import { useEffect, useState } from "react";
import sampleQuestionsData from "../test/sample-questions.json";
import "./App.css";

type GameState = "setup" | "loading" | "playing" | "finished";

type Question = {
  question_number: number;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
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
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  async function fetchOpenAi() {
    setData(null);
    setQuizResults({ responses: [] });
    setGameState("loading");

    await sleep(1000); // Simulate loading delay
    setData(sampleQuestionsData);
    setGameState("playing");
  }

  // temp disabled
  async function fetchOpenAiX() {
    setData(null);
    setQuizResults({ responses: [] });
    setGameState("loading");

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
            content: `The quiz should be a multiple choice quiz and have 10 questions, each with 1 correct answer and 3 wrong answers.`,
          },
          {
            role: "system",
            content: `Return the quiz in JSON format in this format:
            {
              questions: [
                {
                  "question_number": "<question number here>",
                  "question": "<question here>",
                  "correct_answer": "<correct answer here>",
                  "wrong_answers": [
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
      setGameState("playing");
    } catch (error) {
      console.error(error);
    }

    console.log("Response data :", data);

    if (!data) {
      console.error("API response is empty");
      return;
    }
  }

  useEffect(() => {
    if (data) {
      const currentQuestion = data.questions[currentQuestionIndex];
      setCurrentQuestion(currentQuestion);
    }
  }, [data, currentQuestionIndex]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <h1>Quizify</h1>
        {gameState === "setup" && (
          <form className="flex flex-col gap-2">
            <label htmlFor="user_instructions">
              Enter your instructions for the quiz:
            </label>
            <textarea
              name="user_instructions"
              id="user_instructions"
              className="w-full rounded p-2"
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder="Write your instructions here..."
              rows={8}
            ></textarea>
            <button
              className="rounded bg-blue-500 p-2 text-white"
              onClick={(event) => {
                event.preventDefault();

                fetchOpenAi();
              }}
            >
              Fetch
            </button>
          </form>
        )}

        {gameState === "loading" && <p>Loading...</p>}
        {currentQuestion && gameState === "playing" && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">
              Question {currentQuestion.question_number}:
            </h2>
            <p>{currentQuestion.question}</p>
            <ul className="list-disc pl-5">
              {getShuffledAnswers(
                currentQuestion.correct_answer,
                currentQuestion.wrong_answers,
              ).map((answer, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setQuizResults((prevResults) => {
                        return {
                          responses: [
                            ...(prevResults?.responses || []),
                            {
                              questionNumber: currentQuestion.question_number,
                              question: currentQuestion.question,
                              answer: answer,
                              correctAnswer: currentQuestion.correct_answer,
                              isCorrect:
                                answer === currentQuestion.correct_answer,
                            },
                          ],
                        };
                      });

                      setCurrentQuestionIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex < data!.questions.length) {
                          return nextIndex;
                        } else {
                          setGameState("finished");
                          return 0;
                        }
                      });
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
          <pre>{JSON.stringify(quizResults, null, 2)}</pre>
        )}
      </div>
    </>
  );
}

export default App;

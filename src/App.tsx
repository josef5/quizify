import { OpenAI } from "openai";
import { useEffect, useState } from "react";
import sampleQuestions from "../test/sample-questions.json";
import "./App.css";
import MainForm from "./components/main-form";
import { MainFormValues } from "./lib/schemas/form-schema";
import type { Question } from "./types";
import QuizQuestions from "./components/quiz-questions";

type GameState = "setup" | "loading" | "playing" | "finished";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [data, setData] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  function transitionTo(nextState: GameState) {
    switch (nextState) {
      case "setup":
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

  async function fetchQuizTemp({ questionCount }: MainFormValues) {
    transitionTo("loading");

    await sleep(500); // Simulate loading delay

    setData({
      ...sampleQuestions,
      questions: sampleQuestions.questions.slice(0, questionCount),
    });

    transitionTo("playing");
  }

  // temp disabled
  async function fetchQuiz({
    prompt,
    questionCount,
    model,
    temperature,
  }: MainFormValues) {
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
            content: prompt,
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
        temperature,
        model,
      });

      const responseContent = JSON.parse(
        chatCompletion.choices[0].message.content ?? "",
      );

      setData(responseContent);

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

  const currentQuestion = getCurrentQuestion();

  async function handleAnswer(answer: string) {
    setQuizResults((prevResults) => {
      if (!currentQuestion) {
        return prevResults;
      }

      return {
        responses: [
          ...(prevResults?.responses || []),
          {
            questionNumber: currentQuestion.questionNumber,
            question: currentQuestion.question,
            answer: answer,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: answer === currentQuestion.correctAnswer,
          },
        ],
      };
    });

    startNextTurn();
  }

  useEffect(() => {
    transitionTo("setup");
  }, []);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <h1 className="my-12 text-xl font-normal">Quizify</h1>
        {(gameState === "setup" || gameState === "loading") && (
          <MainForm
            isLoading={gameState === "loading"}
            onSubmit={(data: MainFormValues) => {
              //*
              fetchQuizTemp(data);
              /*/
              fetchQuiz(data);
              //*/
            }}
          />
        )}

        {currentQuestion && gameState === "playing" && (
          <QuizQuestions
            currentQuestion={currentQuestion}
            onAnswer={handleAnswer}
          />
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

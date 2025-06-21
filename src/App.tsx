import { OpenAI } from "openai";
import { useEffect, useState } from "react";
import sampleQuestions from "../test/sample-questions.json";
import "./App.css";
import MainForm from "./components/main-form";
import QuizQuestions from "./components/quiz-questions";
import Results from "./components/results";
import { MainFormValues } from "./lib/schemas/form-schema";
import { sleep } from "./lib/utils";
import type { GameState, Question, Quiz, QuizResults } from "./types";

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

  const currentQuestion = getCurrentQuestion();

  async function handleAnswer(answer: string) {
    setQuizResults((prevResults) => {
      if (!currentQuestion) {
        return prevResults;
      }

      const { questionNumber, question, correctAnswer } = currentQuestion;

      return {
        responses: [
          ...(prevResults?.responses || []),
          {
            questionNumber,
            question,
            answer,
            correctAnswer,
            isCorrect: answer === correctAnswer,
          },
        ],
      };
    });

    startNextTurn();
  }

  function handleRestart() {
    transitionTo("setup");
  }

  useEffect(() => {
    transitionTo("setup");
  }, []);

  return (
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
          questionCount={data?.questions.length ?? 0}
          onAnswer={handleAnswer}
        />
      )}
      {gameState === "finished" && quizResults && (
        <Results responses={quizResults.responses} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;

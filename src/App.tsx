import { Settings2 as SettingsIcon } from "lucide-react";
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { useEffect, useState } from "react";
import sampleQuestions from "../test/sample-questions.json";
import "./App.css";
import MainForm from "./components/main-form";
import QuizQuestions from "./components/quiz-questions";
import Results from "./components/results";
import Settings from "./components/settings";
import { Button } from "./components/ui/button";
import { decrypt } from "./lib/encryption";
import { MainFormValues } from "./lib/schemas/form-schema";
import { ResponseDataSchema } from "./lib/schemas/response-schema";
import { sleep } from "./lib/utils";
import type { GameState, Question, Quiz, QuizResults } from "./types";
import { useStore } from "./store/useStore";

// TODO: Mobile layout
// TODO: Accessibility
// TODO: Lightmode
// TODO: Set difficulty, replace temperature
// TODO: Testing
function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const toggleIsSettingsOpen = useStore((state) => state.toggleIsSettingsOpen);
  const encryptedApiKey = useStore((state) => state.encryptedApiKey);

  function transitionTo(nextState: GameState) {
    switch (nextState) {
      case "setup":
        setCurrentQuestionIndex(0);
        setQuizResults({ userAnswers: [] });
        break;
      case "loading":
        setQuizData(null);
        setQuizResults({ userAnswers: [] });
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

    setQuizData({
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
      const decryptedApiKey = await decrypt(encryptedApiKey);
      // const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
      const openai = new OpenAI({
        apiKey: decryptedApiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.responses.parse({
        model,
        temperature,
        instructions: `You are a expert in multiple choice quiz writing. Write a multiple choice quiz based on the input. The quiz should have ${questionCount} questions, each with 1 correct answer and 3 wrong answers. Return the quiz in json format`,
        input: prompt,
        text: {
          format: zodTextFormat(ResponseDataSchema, "event"),
        },
      });

      if (!response.output_parsed) {
        throw new Error("No quiz data returned from OpenAI API");
      }

      setQuizData(response.output_parsed as Quiz);

      transitionTo("playing");
    } catch (error) {
      console.error(error);
    }
  }

  function getCurrentQuestion(): Question | null {
    if (!quizData || currentQuestionIndex >= quizData.questions.length) {
      return null;
    }

    return quizData.questions[currentQuestionIndex];
  }

  function startNextTurn() {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < (quizData?.questions.length ?? 0)) {
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
        userAnswers: [
          ...(prevResults?.userAnswers || []),
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
    <>
      <Settings />
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col">
        <Button
          variant={"ghost"}
          className="absolute top-5 right-0 cursor-pointer text-neutral-500 has-[>svg]:p-0"
          onClick={() => {
            toggleIsSettingsOpen();
          }}
        >
          <SettingsIcon size={20} />
        </Button>
        <h1 className="my-12 text-xl font-black">Quizify</h1>
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
            questionCount={quizData?.questions.length ?? 0}
            onAnswer={handleAnswer}
          />
        )}
        {gameState === "finished" && quizResults && (
          <Results
            userAnswers={quizResults.userAnswers}
            onRestart={handleRestart}
          />
        )}
      </div>
    </>
  );
}

export default App;

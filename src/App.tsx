import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { useEffect, useState } from "react";
import sampleQuestions from "../test/sample-questions.json";
import "./App.css";
import MainForm from "./components/main-form";
import QuizQuestions from "./components/quiz-questions";
import Results from "./components/results";
import { MainFormValues } from "./lib/schemas/form-schema";
import { ResponseDataSchema } from "./lib/schemas/response-schema";
import { sleep } from "./lib/utils";
import type { GameState, Question, Quiz, QuizResults } from "./types";
import { Settings2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "./components/ui/input";
import { FormField, FormItem } from "./components/ui/form";

// TODO: Mobile layout
// TODO: Accessibility
// TODO: Lightmode
function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

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
      <div
        className={`overflow-hidden bg-neutral-600 ${isSettingsOpen ? "h-10" : "h-0"} px-5 shadow-[inset_0_-2px_15px_5px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center gap-2 pt-2 shadow-[0_-1px_0_0_rgba(0,0,0,0.25)]">
          <FormItem className="flex flex-1 items-center gap-2">
            <Label className="flex-shrink-0 text-xs">OpenAI API Key</Label>
            <Input
              type="text"
              placeholder="abc123..."
              // {...field}
              // onChange={(event) => field.onChange(Number(event.target.value))}
              className="dark:bg-input/60 dark:hover:bg-input/60 h-6 rounded-xs border-none pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs"
            />
          </FormItem>
          <Button
            variant="secondary"
            size={"sm"}
            className="bg-input hover:bg-input h-6 cursor-pointer rounded-sm text-xs text-white"
            onClick={() => {
              setIsSettingsOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </div>
      {/* <div className="h-0 bg-red-600 shadow-[0_0px_5px_10px_black]"></div> */}
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col">
        <Button
          variant={"ghost"}
          className="absolute top-5 right-0 cursor-pointer text-neutral-500 has-[>svg]:p-0"
          onClick={() => {
            setIsSettingsOpen((prev) => !prev);
          }}
        >
          <Settings2 size={20} />
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

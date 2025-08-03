import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import MainForm from "./components/main-form";
import QuizQuestions from "./components/quiz-questions";
import Results from "./components/results";
import Settings from "./components/settings";
import OpenSettingsButton from "./components/ui/open-settings-button";
import { useFetchQuiz } from "./hooks/useFetchQuiz";
import { MainFormValues } from "./lib/schemas/form-schema";
import { useStore } from "./store/useStore";
import type { GameState, Question, QuizResults } from "./types";

// TODO: Add Auth and database support
// TODO: Collect incorrect answers and reuse them in the quiz
function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const toggleIsSettingsOpen = useStore((state) => state.toggleIsSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentQuestionIndex = useStore((state) => state.currentQuestionIndex);
  const incrementCurrentQuestionIndex = useStore(
    (state) => state.incrementCurrentQuestionIndex,
  );
  const resetCurrentQuestionIndex = useStore(
    (state) => state.resetCurrentQuestionIndex,
  );
  const resetCurrentScore = useStore((state) => state.resetCurrentScore);

  const quizData = useStore((state) => state.quizData);
  const setQuizData = useStore((state) => state.setQuizData);
  const resetQuizData = useStore((state) => state.resetQuizData);
  const questionsTotal = useStore(
    (state) => state.quizData?.questions?.length ?? 0,
  );
  const isLastQuestion = currentQuestionIndex === questionsTotal - 1;

  function transitionTo(nextState: GameState) {
    switch (nextState) {
      case "setup":
        resetCurrentQuestionIndex();
        resetCurrentScore();
        setQuizResults({ userAnswers: [] });
        break;
      case "loading":
        resetQuizData();
        setQuizResults({ userAnswers: [] });
        break;
      case "playing":
        break;
      case "finished":
        break;
    }

    setGameState(nextState);
  }

  const { fetchQuiz } = useFetchQuiz();

  async function handleFetchQuiz(data: MainFormValues) {
    transitionTo("loading");

    const quizData = await fetchQuiz(data);

    if (quizData) {
      setQuizData(quizData);
      transitionTo("playing");
    } else {
      // Error handling is already done in the hook
      transitionTo("setup");
    }
  }

  function getCurrentQuestion(): Question | null {
    if (!quizData) {
      return null;
    }

    return quizData.questions[currentQuestionIndex];
  }

  function startNextTurn() {
    if (!isLastQuestion) {
      incrementCurrentQuestionIndex();
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

      const { text, correctAnswer } = currentQuestion;

      return {
        userAnswers: [
          ...(prevResults?.userAnswers || []),
          {
            questionNumber: currentQuestionIndex + 1,
            question: text,
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
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    transitionTo("setup");
  }, []);

  return (
    <>
      <Settings />
      <main className="relative mx-auto flex w-[87.5%] max-w-[560px] flex-col">
        <OpenSettingsButton
          className="absolute top-5 right-0"
          onClick={() => {
            toggleIsSettingsOpen();
          }}
          aria-label="Open settings"
        />
        <h1 className="my-12 text-xl font-black">Quizify</h1>
        {(gameState === "setup" || gameState === "loading") && (
          <MainForm
            isLoading={gameState === "loading"}
            onSubmit={(data: MainFormValues) => {
              setIsSettingsOpen(false);
              handleFetchQuiz(data);
            }}
          />
        )}

        {currentQuestion && gameState === "playing" && (
          <QuizQuestions onAnswer={handleAnswer} />
        )}
        {gameState === "finished" && quizResults && (
          <Results
            userAnswers={quizResults.userAnswers}
            onRestart={handleRestart}
          />
        )}
      </main>
      <Toaster expand={true} richColors />
    </>
  );
}

export default App;

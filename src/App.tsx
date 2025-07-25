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
import type { GameState, Question, Quiz, QuizResults } from "./types";

// TODO: Collect incorrect answers and reuse them in the quiz
function App() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const toggleIsSettingsOpen = useStore((state) => state.toggleIsSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const isDarkMode = useStore((state) => state.isDarkMode);

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

    // Shuffle questions randomly
    if (quizData && quizData.questions) {
      // Fisher-Yates shuffle
      const shuffled = [...quizData.questions];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // TODO: Remove the questionNumber from the data structure
      // and use the index directly in the UI (currentQuestionIndex)

      // Preserve question order by overwriting questionNumber
      quizData.questions = shuffled.map((question, idx) => ({
        ...question,
        questionNumber: idx + 1,
      }));
    }

    if (quizData) {
      setQuizData(quizData);
      transitionTo("playing");
    } else {
      // Error handling is already done in the hook
      transitionTo("setup");
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
      </main>
      <Toaster expand={true} richColors />
    </>
  );
}

export default App;

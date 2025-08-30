import { Subscription } from "@supabase/supabase-js";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import "./App.css";
import Auth from "./components/auth";
import MainForm from "./components/main-form";
import QuizQuestions from "./components/quiz-questions";
import Results from "./components/results";
import Settings from "./components/settings";
import OpenSettingsButton from "./components/ui/open-settings-button";
import { useFetchQuiz } from "./hooks/useFetchQuiz";
import { MainFormValues } from "./lib/schemas/form-schema";
import { sleep } from "./lib/utils";
import { useAuthStore } from "./store/authStore";
import { useProfileStore } from "./store/profileStore";
import { useStore } from "./store/mainStore";
import type { GameState } from "./types";

// TODO: Toast error text colour in light mode
// TODO: Switch to game as soon as quiz started and show a loader there
// TODO: Collect incorrect answers and reuse them in the quiz
function App() {
  const gameState = useStore((state) => state.gameState);
  const setGameState = useStore((state) => state.setGameState);
  const toggleIsSettingsOpen = useStore((state) => state.toggleIsSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentQuestion = useStore(
    (state) => state.quizData?.questions[state.userAnswers.length] ?? null,
  );
  const currentQuestionIndex = useStore((state) => state.userAnswers.length);
  const resetCurrentScore = useStore((state) => state.resetCurrentScore);
  const setQuizData = useStore((state) => state.setQuizData);
  const resetQuizData = useStore((state) => state.resetQuizData);
  const questionsTotal = useStore(
    (state) => state.quizData?.questions?.length ?? 0,
  );
  const userAnswers = useStore((state) => state.userAnswers);
  const addUserAnswer = useStore((state) => state.addUserAnswer);
  const resetUserAnswers = useStore((state) => state.resetUserAnswers);
  const isLastQuestion = currentQuestionIndex === questionsTotal - 1;
  const userAnswersExist = userAnswers.length > 0;
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const { fetchQuiz } = useFetchQuiz();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const authLoading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);

  function transitionTo(nextState: GameState) {
    switch (nextState) {
      case "setup":
      case "loading":
        resetQuizData();
        resetCurrentScore();
        resetUserAnswers();
        break;
      case "playing":
        break;
      case "finished":
        break;
    }

    setGameState(nextState);
  }

  async function handleFetchQuiz(data: MainFormValues) {
    try {
      if (!user) throw new Error("User not authenticated");

      transitionTo("loading");

      const quizData = await fetchQuiz(data);

      if (quizData) {
        setQuizData(quizData);
        transitionTo("playing");
      } else {
        // Error handling is already done in the hook
        transitionTo("setup");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error signing in");
      }

      console.error("Error fetching quiz:", error);

      transitionTo("setup");
    }
  }

  function startNextTurn() {
    if (isLastQuestion) {
      transitionTo("finished");
    }
  }

  async function handleAnswer(answer: string) {
    if (currentQuestion) {
      const { text, correctAnswer } = currentQuestion;
      const isCorrect = answer === currentQuestion.correctAnswer;

      addUserAnswer({
        questionNumber: currentQuestionIndex + 1,
        question: text,
        answer,
        correctAnswer,
        isCorrect,
      });
    }

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

  useEffect(() => {
    sleep(250).then(() => {
      if (!authLoading && !user) {
        setIsSettingsOpen(true);
      }
    });
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    let subscription: Subscription | void;

    const init = async () => {
      subscription = await initializeAuth();
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      {user ? <Settings /> : <Auth />}
      <main className="relative mx-auto flex w-[87.5%] max-w-xl flex-col">
        <OpenSettingsButton
          className="absolute top-5 right-0"
          onClick={() => {
            toggleIsSettingsOpen();
          }}
          aria-label="Open settings"
        />
        <h1 className="text-primary my-20 text-2xl font-black">Quizify</h1>
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

        {gameState === "finished" && userAnswersExist && (
          <Results userAnswers={userAnswers} onRestart={handleRestart} />
        )}
      </main>
      <Toaster expand={true} richColors />
    </>
  );
}

export default App;

import { DARK_MODE_LOCAL_STORAGE_KEY } from "@/lib/constants";
import { encryptSync } from "@/lib/encryption";
import { Quiz, UserAnswer } from "@/types";
import { create } from "zustand";

interface Store {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  toggleIsSettingsOpen: () => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;

  encryptedApiKey: string;
  encryptAndSetApiKey: (key: string) => void;
  encryptAndSaveApiKey: (key: string) => void;

  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  incrementCurrentQuestionIndex: () => void;
  resetCurrentQuestionIndex: () => void;

  quizData: Quiz | null;
  setQuizData: (data: Quiz | null) => void;
  resetQuizData: () => void;

  currentScore: number;
  setCurrentScore: (score: number) => void;
  incrementCurrentScore: () => void;
  resetCurrentScore: () => void;

  userAnswers: UserAnswer[];
  addUserAnswer: (answer: UserAnswer) => void;
  resetUserAnswers: () => void;
}

export const useStore = create<Store>((set) => ({
  isSettingsOpen: false,
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  toggleIsSettingsOpen: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  isDarkMode:
    localStorage.getItem(DARK_MODE_LOCAL_STORAGE_KEY) === "dark" || false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;

      localStorage.setItem(
        DARK_MODE_LOCAL_STORAGE_KEY,
        newMode ? "dark" : "light",
      );

      return { isDarkMode: newMode };
    }),
  setDarkMode: (value: boolean) => {
    localStorage.setItem("mode", value ? "dark" : "light");
    set({ isDarkMode: value });
  },

  encryptedApiKey: localStorage.getItem("apiKey") ?? "",
  encryptAndSetApiKey: (key: string) => {
    const encryptedApiKey = encryptSync(key);
    set({ encryptedApiKey });
  },
  encryptAndSaveApiKey: (key: string) => {
    const encryptedApiKey = encryptSync(key);
    localStorage.setItem("apiKey", encryptedApiKey);
    set({ encryptedApiKey });
  },

  quizData: null,
  setQuizData: (data: Quiz | null) => set({ quizData: data }),
  resetQuizData: () => set({ quizData: null }),

  currentQuestionIndex: 0,
  setCurrentQuestionIndex: (index: number) =>
    set({ currentQuestionIndex: index }),
  incrementCurrentQuestionIndex: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),

  currentScore: 0,
  setCurrentScore: (score: number) => set({ currentScore: score }),
  incrementCurrentScore: () =>
    set((state) => ({ currentScore: state.currentScore + 1 })),
  resetCurrentScore: () => set({ currentScore: 0 }),

  userAnswers: [],
  addUserAnswer: (answer: UserAnswer) =>
    set((state) => ({
      userAnswers: [...state.userAnswers, answer],
    })),
  resetUserAnswers: () => set({ userAnswers: [] }),
}));

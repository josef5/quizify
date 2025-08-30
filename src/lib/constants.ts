import { DifficultyLabels, DifficultySettings } from "@/types";

export const DIFFICULTY_LABELS: DifficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  harder: "Harder",
};

export const DIFFICULTY_SETTINGS: DifficultySettings = {
  easy: {
    temperature: 0.3,
    description:
      "The questions should be based on knowledge everybody, including a primary school child would know. This includes basic facts and general knowledge.",
  },
  medium: {
    temperature: 0.5,
    description:
      "The questions should be based on knowledge a high school student would know, but younger children would not know. This includes moderate reasoning and conceptual questions.",
  },
  hard: {
    temperature: 0.9,
    description:
      "The questions should be based on knowledge a university student would know, but younger students would not know. This includes analytical or expert-level, niche knowledge.",
  },
  harder: {
    temperature: 1.0,
    description:
      "The questions should be based on knowledge only a university professor would know. This includes advanced analytical or expert-level, niche knowledge.",
  },
};

export const QUIZ_PROMPTS_LOCAL_STORAGE_KEY = "quizifyPrompts";
export const DARK_MODE_LOCAL_STORAGE_KEY = "mode";
export const ANSWER_HOLD_DELAY = 1000; // Delay before showing the next question after an answer is selected
export const QUESTION_COUNT_EXTRA = 5; // Add 5 questions to the quiz for randomization

export const TOAST_OPTIONS = {
  success: {
    duration: 4000,
    style: {
      backgroundColor: "var(--correct)",
      color: "var(--toast-foreground)",
      border: "none",
    },
  },
  error: {
    duration: 10000,
    style: {
      backgroundColor: "var(--incorrect)",
      color: "var(--toast-foreground)",
      border: "none",
    },
    cancel: {
      label: "Dismiss",
      onClick: () => {},
    },
    cancelButtonStyle: {
      backgroundColor: "transparent",
      color: "var(--toast-foreground)",
      border: "1px solid var(--toast-foreground)",
    },
  },
};

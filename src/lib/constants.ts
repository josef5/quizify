import type { MainFormValues } from "./schemas/form-schema";

export const DIFFICULTY_LABELS: Record<MainFormValues["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_SETTINGS: Record<
  MainFormValues["difficulty"],
  { temperature: number; description: string }
> = {
  easy: {
    temperature: 0.3,
    description: "basic facts and general knowledge",
  },
  medium: {
    temperature: 0.5,
    description: "moderate reasoning and conceptual questions",
  },
  hard: {
    temperature: 0.9,
    description: "analytical or expert-level, niche knowledge",
  },
};

export const QUIZ_PROMPTS_LOCAL_STORAGE_KEY = "quizifyPrompts";
export const DARK_MODE_LOCAL_STORAGE_KEY = "mode";

export const ANSWER_HOLD_DELAY = 1000; // Delay before showing the next question after an answer is selected

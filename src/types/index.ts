import { MainFormValues } from "@/lib/schemas/form-schema";
import { QuestionSchemaType } from "@/lib/schemas/response-schema";

export type GameState = "setup" | "loading" | "playing" | "finished";

export type Quiz = {
  questions: Question[];
};

export type Question = QuestionSchemaType;

export type UserAnswer = {
  questionNumber: number;
  question: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export type DifficultyLabels = Record<MainFormValues["difficulty"], string>;

export type DifficultySettings = Record<
  MainFormValues["difficulty"],
  { temperature: number; description: string }
>;

export type Profile = {
  id: string;
  user_id: string;
  api_key_id: string | null;
  prompts: string[] | null;
  created_at: string;
  updated_at: string;
};

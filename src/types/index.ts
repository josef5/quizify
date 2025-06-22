export type GameState = "setup" | "loading" | "playing" | "finished";

export type Quiz = {
  questions: Question[];
};

export type Question = {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
};

export type Answer = {
  id: string;
  text: string;
};

export type UserAnswer = {
  questionNumber: number;
  question: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export type QuizResults = {
  userAnswers: UserAnswer[];
};

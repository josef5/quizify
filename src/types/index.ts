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

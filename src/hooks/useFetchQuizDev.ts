import { MainFormValues } from "@/lib/schemas/form-schema";
import sampleQuestions from "@/test/sample-questions.json";

export function useFetchQuiz() {
  const fetchQuiz = async ({ questionCount }: MainFormValues) =>
    Promise.resolve({
      ...sampleQuestions,
      questions: sampleQuestions.questions.slice(0, questionCount),
    });

  return { fetchQuiz };
}

import { MainFormValues } from "@/lib/schemas/form-schema";
import { sleep } from "@/lib/utils";
import sampleQuestions from "@/test/sample-questions.json";

// To use this just change the import to useFetchQuizDev
export function useFetchQuiz() {
  const fetchQuiz = async ({ questionCount }: MainFormValues) => {
    await sleep(2000);

    return Promise.resolve({
      ...sampleQuestions,
      questions: sampleQuestions.questions.slice(0, questionCount),
    });
  };

  return { fetchQuiz };
}

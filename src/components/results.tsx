import type { QuizResults, UserAnswer } from "../types";
import { Button } from "./ui/button";

const Results = ({
  responses,
  onRestart,
}: QuizResults & { onRestart: () => void }) => {
  function getScore(responses: UserAnswer[]) {
    const correctCount = responses.filter(
      (response) => response.isCorrect,
    ).length;

    return {
      questionsCount: responses.length,
      correctCount,
      text: `${correctCount}/${responses.length}`,
    };
  }

  const score = getScore(responses);

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 self-end text-base">
        <span className="text-7xl">{score.correctCount}</span>/
        {score.questionsCount}
      </h2>
      <ol className="mb-18 list-decimal">
        {responses.map(
          ({ questionNumber, question, answer, correctAnswer, isCorrect }) => (
            <li key={questionNumber} className="mt-4">
              <p>{question}</p>
              <p className="text-sm font-light">
                Your answer:{" "}
                <span
                  className={`text-base font-bold ${isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  {answer}
                </span>
              </p>
              {!isCorrect && (
                <p className="text-sm font-light">
                  Correct Answer:{" "}
                  <span className="text-base font-bold">{correctAnswer}</span>
                </p>
              )}
            </li>
          ),
        )}
      </ol>
      <Button
        type="submit"
        variant={"secondary"}
        onClick={onRestart}
        className="bg-input hover:bg-input mt-1 mb-24 h-12 w-full cursor-pointer rounded-sm text-white"
      >
        Start Again
      </Button>
    </div>
  );
};

export default Results;

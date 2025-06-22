import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import type { QuizResults, UserAnswer } from "../types";
import { Button } from "./ui/button";

const Results = ({
  userAnswers,
  onRestart,
}: QuizResults & { onRestart: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  function getScore(userAnswers: UserAnswer[]) {
    const correctCount = userAnswers.filter(
      (response) => response.isCorrect,
    ).length;

    return {
      questionsCount: userAnswers.length,
      correctCount,
      text: `${correctCount}/${userAnswers.length}`,
    };
  }

  const score = getScore(userAnswers);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.timeline().from(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.75,
      );
    },
    {
      dependencies: [],
      scope: containerRef,
    },
  );

  return (
    <div className="flex flex-col" ref={containerRef}>
      <h2 className="mb-4 self-end text-base">
        <span className="text-7xl font-black">{score.correctCount}</span>/
        {score.questionsCount}
      </h2>
      <ol className="mb-18 list-none">
        {userAnswers.map(
          ({ questionNumber, question, answer, correctAnswer, isCorrect }) => (
            <li key={questionNumber} className="mt-4 text-base font-normal">
              <p className="font-bold">
                {questionNumber}. {question}
              </p>
              <p className="">
                Your answer:{" "}
                <span
                  className={`font-bold ${isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  {answer}
                </span>
              </p>
              {!isCorrect && (
                <p className="">
                  Correct Answer: <span className="">{correctAnswer}</span>
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

import { cn } from "@/lib/utils";
import type { UserAnswer } from "@/types";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import FinishButton from "./ui/finish-button";

// TODO: Improve reveal animation

const Results = ({
  userAnswers,
  onRestart,
}: {
  userAnswers: UserAnswer[];
  onRestart: () => void;
}) => {
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
      <h2 className="mb-4 self-end text-base" aria-label="Final score">
        <span className="from-brand-1 to-brand-2 bg-gradient-to-br bg-clip-text text-7xl font-black text-transparent">
          {score.correctCount}
        </span>
        /{score.questionsCount}
      </h2>
      <ol className="mb-18 list-none" aria-label="Quiz results">
        {userAnswers.map(
          ({ questionNumber, question, answer, correctAnswer, isCorrect }) => (
            <li key={questionNumber} className="mt-4 text-base font-normal">
              <p className="font-bold">
                {questionNumber}. {question}
              </p>
              <p className="">
                Your answer:{" "}
                <span
                  className={cn(
                    "font-bold",
                    isCorrect ? "text-correct" : "text-incorrect",
                  )}
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
      <FinishButton label="Finish" onClick={onRestart} />
    </div>
  );
};

export default Results;

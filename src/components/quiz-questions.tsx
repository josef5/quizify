import type { Question } from "@/types";
import { Button } from "./ui/button";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { useMemo, useRef, useState } from "react";
import { sleep } from "@/lib/utils";

gsap.registerPlugin(useGSAP, SplitText);

function QuizQuestions({
  currentQuestion,
  onAnswer,
}: {
  currentQuestion?: Question | null;
  onAnswer: (answer: string) => void;
}) {
  const component = useRef<HTMLElement>();
  const questionRef = useRef<HTMLHeadingElement>(null);
  const answersRef = useRef<HTMLUListElement>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useGSAP(
    () => {
      if (!questionRef.current) return;

      const split = SplitText.create(questionRef.current, {
        type: "chars, words",
      });

      // Animate the question text then the answers
      gsap
        .timeline()
        .from(split.chars, {
          duration: 0.05,
          opacity: 0,
          stagger: 0.025,
        })
        .from(
          gsap.utils.selector(answersRef.current)("li"),
          {
            duration: 0.25,
            opacity: 0,
            stagger: 0.5,
          },
          "+=0.5",
        );
    },
    {
      dependencies: [currentQuestion?.question],
      scope: component.current,
    },
  );

  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return [];

    return getShuffledAnswers(
      currentQuestion.correctAnswer,
      currentQuestion.wrongAnswers,
    );
  }, [currentQuestion]);

  if (!currentQuestion) {
    return;
  }

  function getShuffledAnswers(
    correctAnswer: string,
    wrongAnswers: string[],
  ): string[] {
    const answers = [correctAnswer, ...wrongAnswers];
    return answers.sort(() => Math.random() - 0.5);
  }

  return (
    <div>
      {/* TODO: Add progress bar */}
      <p className="mb-2 flex text-xs font-normal">
        Question {currentQuestion.questionNumber}
      </p>
      <h2 className="my-2 text-xl" ref={questionRef}>
        {currentQuestion.question}
      </h2>
      <ul className="list-none pl-0" ref={answersRef}>
        {shuffledAnswers.map((answer) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === currentQuestion.correctAnswer;
          const answerClass = isCorrect
            ? "ring-2 ring-green-500"
            : "ring-2 ring-red-500";
          const selectedClass = isSelected ? answerClass : "";

          return (
            <li key={answer}>
              <Button
                variant={"secondary"}
                className={`bg-input hover:bg-input my-1 cursor-pointer rounded-sm text-white ${selectedClass}`}
                onClick={async () => {
                  setSelectedAnswer(answer);

                  // TODO: Set as constant
                  await sleep(1000); // Wait for the animation to finish

                  if (onAnswer) {
                    onAnswer(answer);
                  }
                }}
              >
                {answer}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default QuizQuestions;

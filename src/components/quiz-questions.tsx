import { ANSWER_HOLD_DELAY } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import type { Question } from "@/types";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useMemo, useRef, useState } from "react";
import AnswerButton from "./ui/answer-button";
import { Progress } from "./ui/progress";

gsap.registerPlugin(useGSAP, SplitText);

function QuizQuestions({
  currentQuestion,
  questionCount,
  onAnswer,
}: {
  currentQuestion?: Question | null;
  questionCount: number;
  onAnswer: (answer: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const answersRef = useRef<HTMLUListElement>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progressCount, setProgressCount] = useState(
    (currentQuestion?.questionNumber ?? 0) - 1,
  );

  useGSAP(
    () => {
      if (!questionRef.current) return;

      const split = SplitText.create(questionRef.current, {
        type: "chars, words",
      });

      // Animate the question text then the answers
      gsap
        .timeline()
        .from(
          split.chars,
          {
            duration: 0.05,
            opacity: 0,
            stagger: 0.025,
          },
          "+=0.5",
        )
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
      scope: containerRef,
    },
  );

  // Animate the container in when the question changes
  useGSAP(
    () => {
      setSelectedAnswer(null);

      if (!containerRef.current) return;

      gsap.timeline().to(
        containerRef.current,
        {
          opacity: 1,
          duration: 0.25,
        },
        0.25,
      );
    },
    {
      dependencies: [currentQuestion],
      scope: containerRef,
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
    <>
      <Progress
        value={Math.round((progressCount / questionCount) * 100)}
        className="mb-8 h-1 w-full"
      />
      <div ref={containerRef}>
        <p className="mb-2 flex text-xs font-normal">
          Question {currentQuestion.questionNumber}
        </p>
        <h2 className="my-2 mb-8 text-xl font-bold" ref={questionRef}>
          {currentQuestion.question}
        </h2>
        <ul className="list-none pl-0" ref={answersRef}>
          {shuffledAnswers.map((answer) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === currentQuestion.correctAnswer;

            return (
              <li key={answer}>
                <AnswerButton
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  disabled={selectedAnswer !== null}
                  onClick={async () => {
                    setSelectedAnswer(answer);
                    setProgressCount((prev) => prev + 1);

                    await sleep(ANSWER_HOLD_DELAY); // Wait for the animation to finish

                    // Animate the container out
                    gsap.timeline().to(containerRef.current, {
                      opacity: 0,
                      duration: 0.25,
                      onComplete: () => {
                        if (onAnswer) {
                          onAnswer(answer);
                        }
                      },
                    });
                  }}
                >
                  {answer}
                </AnswerButton>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default QuizQuestions;

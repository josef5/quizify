import { ANSWER_HOLD_DELAY } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import type { Question } from "@/types";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useMemo, useRef, useState } from "react";
import AnswerButton from "./ui/answer-button";
import { Progress } from "./ui/core/progress";
import { useStore } from "@/store/useStore";

gsap.registerPlugin(useGSAP, SplitText);

// TODO: Add current score
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
  const currentQuestionIndex = useStore((state) => state.currentQuestionIndex);
  const currentQuestionNumber = currentQuestionIndex + 1;
  const currentScore = useStore((state) => state.currentScore);
  const incrementCurrentScore = useStore(
    (state) => state.incrementCurrentScore,
  );
  // Updated independently so the progress bar can be animated
  const [progressCount, setProgressCount] = useState(currentQuestionIndex);
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
      dependencies: [currentQuestion?.text],
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
      currentQuestion.incorrectAnswers,
    );
  }, [currentQuestion]);

  if (!currentQuestion) {
    return;
  }

  function getShuffledAnswers(
    correctAnswer: string,
    incorrectAnswers: string[],
  ): string[] {
    const answers = [correctAnswer, ...incorrectAnswers];
    return answers.sort(() => Math.random() - 0.5);
  }

  return (
    <>
      <Progress
        value={Math.round((progressCount / questionCount) * 100)}
        className="mb-8 h-1 w-full"
        aria-label="Quiz progress"
      />
      <div ref={containerRef}>
        <div className="mb-2 flex text-xs font-normal">
          <p>Question {currentQuestionNumber}</p>
          <p className="ml-auto">Score: {currentScore}</p>
        </div>
        <h2
          className="my-2 mb-8 text-xl font-bold"
          ref={questionRef}
          data-testid="question"
        >
          {currentQuestion.text}
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

                    if (isCorrect) {
                      incrementCurrentScore();
                    }

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

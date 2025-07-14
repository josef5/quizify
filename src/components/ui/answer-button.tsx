import { cn } from "@/lib/utils";
import { Button } from "./button";

function AnswerButton({
  isCorrect,
  isSelected,
  className,
  children,
  ...props
}: { isCorrect: boolean; isSelected: boolean } & React.ComponentProps<
  typeof Button
>) {
  const answerClass = isCorrect
    ? "ring-2 ring-correct"
    : "ring-2 ring-incorrect";
  const selectedClass = isSelected ? answerClass : "";

  return (
    <Button
      variant={"secondary"}
      {...props}
      className={cn(
        "bg-grey-button-bg hover:bg-grey-button-hover text-primary my-1 h-auto cursor-pointer rounded-sm text-left whitespace-break-spaces transition-colors duration-200 ease-in-out disabled:opacity-100",
        className,
        selectedClass,
      )}
    >
      {children}
    </Button>
  );
}

export default AnswerButton;

import { Button } from "./button";

function FinishButton({
  label,
  onRestart,
}: {
  label: string;
  onRestart: () => void;
}) {
  return (
    <Button
      variant={"secondary"}
      onClick={onRestart}
      className="bg-grey-button-bg hover:bg-grey-button-hover text-primary mt-1 mb-24 h-12 w-full cursor-pointer rounded-sm transition-colors duration-200 ease-in-out"
    >
      {label}
    </Button>
  );
}

export default FinishButton;

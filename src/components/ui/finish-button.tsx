import { Button } from "./core/button";

function FinishButton({
  label,
  onRestart,
  ...props
}: {
  label: string;
  onRestart: () => void;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={"secondary"}
      onClick={onRestart}
      className="bg-grey-button-bg hover:bg-grey-button-hover text-primary mt-1 mb-24 h-12 w-full cursor-pointer rounded-sm font-bold transition-colors duration-200 ease-in-out"
      {...props}
    >
      {label}
    </Button>
  );
}

export default FinishButton;

import { Button } from "./core/button";

function FinishButton({
  label,
  ...props
}: {
  label: string;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={"secondary"}
      className="bg-secondary hover:bg-secondary-hover text-secondary-foreground mt-1 mb-24 h-12 w-full cursor-pointer rounded-sm font-bold transition-colors duration-200 ease-in-out"
      {...props}
    >
      {label}
    </Button>
  );
}

export default FinishButton;

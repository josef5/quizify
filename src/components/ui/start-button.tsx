import { cn } from "@/lib/utils";
import { Button } from "./core/button";

function StartButton({
  label,
  className,
  ...props
}: { label: string } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="submit"
      className={cn(
        "from-brand-1-lite to-brand-2-lite hover:from-brand-1 hover:to-brand-2 text-brand-foreground disabled:text-brand-foreground/60 my-4 h-12 w-full cursor-pointer rounded-sm bg-gradient-to-tr font-bold transition-colors duration-200 ease-in-out disabled:opacity-100",
        className,
      )}
      {...props}
    >
      {label}
    </Button>
  );
}

export default StartButton;

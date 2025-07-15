import { LoaderCircle } from "lucide-react";
import { Button } from "./core/button";
import { cn } from "@/lib/utils";

function StartButton({
  label,
  isLoading,
  className,
  ...props
}: { label: string; isLoading: boolean } & React.ComponentProps<
  typeof Button
>) {
  return (
    <Button
      type="submit"
      className={cn(
        "from-brand-1-lite to-brand-2-lite text-light hover:from-brand-1 hover:to-brand-2 my-4 h-12 w-full cursor-pointer rounded-sm bg-gradient-to-tr font-bold transition-colors duration-200 ease-in-out disabled:text-blue-300 disabled:opacity-100",
        className,
      )}
      {...props}
    >
      <div className="w-4">{/* Balance spinner on other side of label */}</div>
      {label}
      <div className="ml-1 w-4">
        {isLoading && <LoaderCircle size={16} className="animate-spin" />}
      </div>
    </Button>
  );
}

export default StartButton;

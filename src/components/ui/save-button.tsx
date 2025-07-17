import React from "react";
import { Button } from "./core/button";
import { cn } from "@/lib/utils";

function SaveButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      size={"sm"}
      className={cn(
        "text-settings-foreground bg-settings-primary hover:bg-settings-primary hover:border-settings-accent dark:active:border-brand-1 dark:hover:border-settings-accent dark:hover:bg-settings-primary active:border-brand-1 box-border h-6 grow cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs sm:grow-0",
        className,
      )}
      type="submit"
      {...props}
    >
      {children}
    </Button>
  );
}

export default SaveButton;

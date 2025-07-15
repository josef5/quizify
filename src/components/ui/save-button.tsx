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
        "text-settings-text bg-settings-button-bg hover:bg-settings-button-bg hover:border-settings-2 dark:active:border-brand-1 dark:hover:border-settings-2 dark:hover:bg-settings-button-bg active:border-brand-1 box-border h-6 grow cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs sm:grow-0",
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

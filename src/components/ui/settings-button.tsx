import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./button";

function SettingsButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size={"sm"}
      className={cn(
        "dark:active:border-brand-1 active:border-brand-1 hover:text-settings-3 dark:hover:border-settings-2 hover:border-settings-2 text-settings-3 border-settings-button-border h-6.5 grow cursor-pointer rounded-sm border-2 text-xs hover:bg-transparent dark:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export default SettingsButton;

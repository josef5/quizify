import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./core/button";

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
        "dark:active:border-brand-1 active:border-brand-1 hover:text-settings-foreground dark:hover:border-settings-accent hover:border-settings-accent text-settings-foreground border-foreground/10 hover:bg-settings-background dark:hover:bg-settings-background bg-settings-background h-6.5 grow cursor-pointer rounded-sm border-2 text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export default SettingsButton;

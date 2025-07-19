import React from "react";
import { Button } from "./core/button";
import { Settings2 as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function OpenSettingsButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={"ghost"}
      className={cn(
        "cursor-pointer text-neutral-500 hover:bg-transparent has-[>svg]:p-0 dark:hover:bg-transparent",
        className,
      )}
      aria-label="Open settings"
      {...props}
    >
      <SettingsIcon size={20} />
    </Button>
  );
}

export default OpenSettingsButton;

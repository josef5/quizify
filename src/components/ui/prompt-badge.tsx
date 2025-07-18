import { CircleX } from "lucide-react";
import { Badge } from "./core/badge";

function PromptBadge({
  children,
  onClick,
  onDelete,
  ...props
}: { onDelete: (event: React.SyntheticEvent) => void } & React.ComponentProps<
  typeof Badge
>) {
  return (
    <Badge
      variant="secondary"
      className="bg-input cursor-pointer rounded-[3px] px-1"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      {...props}
    >
      {children}
      <div
        onClick={onDelete}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onDelete(event);
          }
        }}
        aria-label="Remove prompt"
        role="button"
        tabIndex={0}
      >
        <CircleX
          size={12}
          className="text-badge-icon hover:text-badge-icon-hover"
        />
      </div>
    </Badge>
  );
}

export default PromptBadge;

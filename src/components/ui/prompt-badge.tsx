import { CircleX } from "lucide-react";
import { Badge } from "./core/badge";

function PromptBadge({
  children,
  onClick,
  onDelete,
}: { onDelete: (event: React.SyntheticEvent) => void } & React.ComponentProps<
  typeof Badge
>) {
  return (
    <Badge
      variant="secondary"
      className="bg-input cursor-pointer rounded-[3px] px-1"
      onClick={onClick}
    >
      {children}
      <div onClick={onDelete}>
        <CircleX
          size={12}
          className="text-badge-icon hover:text-badge-icon-hover"
        />
      </div>
    </Badge>
  );
}

export default PromptBadge;

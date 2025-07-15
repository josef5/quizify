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
      className="dark:bg-badge-bg hover:text-dark dark:text-light bg-badge-bg cursor-pointer rounded-[3px] px-1"
      onClick={onClick}
    >
      {children}
      <div onClick={onDelete}>
        <CircleX
          size={12}
          className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-200"
        />
      </div>
    </Badge>
  );
}

export default PromptBadge;

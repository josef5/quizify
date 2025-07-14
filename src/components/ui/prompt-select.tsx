import { ComponentProps } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type OptionLabels<T extends readonly string[]> = Partial<
  Record<T[number], string>
>;

// Ensure optionLabels keys match options
interface PromptSelectProps<T extends readonly string[]>
  extends ComponentProps<typeof Select> {
  options: T;
  optionLabels?: OptionLabels<T>;
}

function PromptSelect<T extends readonly string[]>({
  options,
  optionLabels,
  ...props
}: PromptSelectProps<T>) {
  return (
    <Select {...props}>
      <SelectTrigger
        className="dark:hover:bg-dropdown-bg bg-dropdown-bg dark:bg-dropdown-bg ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs shadow dark:shadow-none"
        data-size="custom"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-full">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {optionLabels?.[option as T[number]] ?? option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default PromptSelect;

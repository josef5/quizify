import type { Meta, StoryObj } from "@storybook/react-vite";

import PromptSelect from "./prompt-select";

const meta = {
  component: PromptSelect,
} satisfies Meta<typeof PromptSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: ["easy", "medium", "hard", "harder"],
    optionLabels: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      harder: "Harder",
    },
    value: "hard",
    defaultValue: "hard",
    onValueChange: (value: string) =>
      console.log("Selected difficulty:", value),
  },
};

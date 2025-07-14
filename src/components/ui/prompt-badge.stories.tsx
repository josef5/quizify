import type { Meta, StoryObj } from "@storybook/react-vite";

import PromptBadge from "./prompt-badge";

const meta = {
  component: PromptBadge,
} satisfies Meta<typeof PromptBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {},
    onDelete: () => {},
    children: "Prompt Badge",
  },
};

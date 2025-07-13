import type { Meta, StoryObj } from "@storybook/react-vite";

import StartButton from "./start-button";

const meta = {
  component: StartButton,
} satisfies Meta<typeof StartButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Quizify",
    isLoading: true,
    disabled: true,
  },
};

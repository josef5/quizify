import type { Meta, StoryObj } from "@storybook/react-vite";

import StartButton from "../components/ui/start-button";

const meta = {
  component: StartButton,
} satisfies Meta<typeof StartButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Quizify",
    isLoading: false,
    disabled: false,
  },
};

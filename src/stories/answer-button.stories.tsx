import type { Meta, StoryObj } from "@storybook/react-vite";

import AnswerButton from "../components/ui/answer-button";

const meta = {
  component: AnswerButton,
} satisfies Meta<typeof AnswerButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isCorrect: true,
    isSelected: true,
    children: "Answer",
  },
};

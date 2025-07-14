import type { Meta, StoryObj } from "@storybook/react-vite";

import FinishButton from "./finish-button";

const meta = {
  component: FinishButton,
} satisfies Meta<typeof FinishButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Finish",
    onRestart: () => {},
  },
};

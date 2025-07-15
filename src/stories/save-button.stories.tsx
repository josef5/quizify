import type { Meta, StoryObj } from "@storybook/react-vite";

import SaveButton from "../components/ui/save-button";

const meta = {
  component: SaveButton,
} satisfies Meta<typeof SaveButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Save",
    disabled: false,
  },
};

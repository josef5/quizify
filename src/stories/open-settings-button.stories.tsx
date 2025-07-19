import type { Meta, StoryObj } from "@storybook/react-vite";

import OpenSettingsButton from "../components/ui/open-settings-button";

const meta = {
  component: OpenSettingsButton,
} satisfies Meta<typeof OpenSettingsButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

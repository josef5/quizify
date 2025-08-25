import OpenSettingsButton from "@/components/ui/open-settings-button";
import { useStore } from "@/store/store";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import Settings from "../components/settings";

const meta = {
  component: Settings,
  render: (): JSX.Element => {
    const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);

    useEffect(() => {
      setIsSettingsOpen(true);

      return () => setIsSettingsOpen(false);
    }, [setIsSettingsOpen]);

    return (
      <>
        <Settings />
        <OpenSettingsButton onClick={() => setIsSettingsOpen(true)} />
      </>
    );
  },
} satisfies Meta<typeof Settings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

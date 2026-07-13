import type { Meta, StoryObj } from "@storybook/react-vite";
import ThemeToggle from "../atoms/ThemeToggle";

const meta = {
  title: "Islands/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "ライト / ダークテーマを切り替える island。`<html data-theme>` を書き換え、選択を localStorage に保存する。",
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

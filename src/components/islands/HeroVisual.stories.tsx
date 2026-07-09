import type { Meta, StoryObj } from "@storybook/react-vite";
import HeroVisual from "./HeroVisual";

const meta = {
  title: "Islands/HeroVisual",
  component: HeroVisual,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "ヒーロー背景の WebGL 演出(インクの粒子)。Three.js はアイドル時に動的 import され、`prefers-reduced-motion: reduce` では初期化されない。",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: "320px", background: "var(--color-bg)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

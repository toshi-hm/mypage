// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import HeroVisual from "../src/components/islands/HeroVisual";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockReducedMotion = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as MediaQueryList);
};

test("装飾コンテナは aria-hidden で支援技術から不可視になっている", () => {
  mockReducedMotion(true);
  const { container } = render(<HeroVisual />);
  const el = container.querySelector("[data-hero-visual]");

  expect(el).not.toBeNull();
  expect(el?.getAttribute("aria-hidden")).toBe("true");
});

test("prefers-reduced-motion: reduce では WebGL を初期化しない(canvas を追加しない)", async () => {
  mockReducedMotion(true);
  const { container } = render(<HeroVisual />);

  // 動的 import が仮に走った場合を考慮して 1 tick 待つ
  await new Promise((resolve) => setTimeout(resolve, 30));

  expect(container.querySelector("canvas")).toBeNull();
});

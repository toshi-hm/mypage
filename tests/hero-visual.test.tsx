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

test("モーション許可時はアイドル後にシーンを初期化し、WebGL 非対応なら静かにフォールバックする", async () => {
  mockReducedMotion(false);
  // requestIdleCallback を即時実行にして動的 import 経路を通す
  const ric = vi.fn((cb: IdleRequestCallback) => {
    cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    return 1;
  });
  vi.stubGlobal("requestIdleCallback", ric);
  vi.stubGlobal("cancelIdleCallback", vi.fn());

  const { container, unmount } = render(<HeroVisual />);

  // 動的 import(three 含む)の完了を待つ
  await vi.waitFor(() => {
    expect(ric).toHaveBeenCalled();
  });
  await new Promise((resolve) => setTimeout(resolve, 50));

  // happy-dom は WebGL 非対応 → canvas を追加せずフォールバック(エラーも出さない)
  expect(container.querySelector("canvas")).toBeNull();

  // unmount で cleanup が例外なく実行できる
  unmount();
});

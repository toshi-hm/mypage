import { describe, expect, test } from "vitest";
import { SLUG_PATTERN } from "../src/utils/articles";

// content.config.ts と同じ規約の正を直接検証する。
// astro:content のスキーマ実装や、Bun/Vitest間のZod named import互換性には依存しない。
const isValidTag = (tag: string) => SLUG_PATTERN.test(tag);

describe("タグ規約(英数字ケバブケース)", () => {
  test("正しいタグは受理される", () => {
    expect(["astro", "cloud-flare", "web3"].every(isValidTag)).toBe(true);
  });

  test("日本語・大文字・空文字は拒否される", () => {
    expect(isValidTag("日記")).toBe(false);
    expect(isValidTag("Astro")).toBe(false);
    expect(isValidTag("")).toBe(false);
  });
});

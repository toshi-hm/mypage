import { describe, expect, test } from "vitest";
import { SLUG_PATTERN } from "../src/utils/articles";

// content.config.ts と同じ規約の正を直接検証する。
// astro:content のスキーマ実装や、Bun/Vitest間のZod named import互換性には依存しない。
const isValidTag = (tag: string) => SLUG_PATTERN.test(tag);
const isValidTagList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((tag) => typeof tag === "string" && isValidTag(tag));

describe("タグ規約(英数字ケバブケース)", () => {
  test("正しいタグは受理される", () => {
    expect(isValidTagList(["astro", "cloud-flare", "web3"])).toBe(true);
    expect(isValidTagList([])).toBe(true);
  });

  test("日本語・大文字・空文字は拒否される", () => {
    expect(isValidTag("日記")).toBe(false);
    expect(isValidTag("Astro")).toBe(false);
    expect(isValidTag("")).toBe(false);
  });

  test("タグ全体は配列でなければならず、非文字列を拒否する", () => {
    expect(isValidTagList("astro")).toBe(false);
    expect(isValidTagList(["astro", 42])).toBe(false);
    expect(isValidTagList(["astro", "invalid_tag"])).toBe(false);
  });
});

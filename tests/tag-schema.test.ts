import { describe, expect, test } from "vitest";
import { articleSchema } from "../src/content.config";

const parseArticle = (tags: unknown) =>
  articleSchema.safeParse({ title: "Test", pubDate: "2026-01-01", tags });

describe("タグ規約(英数字ケバブケース)", () => {
  test("正しいタグは受理される", () => {
    expect(parseArticle(["astro", "cloud-flare", "web3"]).success).toBe(true);
    expect(parseArticle([]).success).toBe(true);
  });

  test("日本語・大文字・空文字は拒否される", () => {
    expect(parseArticle(["日記"]).success).toBe(false);
    expect(parseArticle(["Astro"]).success).toBe(false);
    expect(parseArticle([""]).success).toBe(false);
  });

  test("タグ全体は配列でなければならず、非文字列を拒否する", () => {
    expect(parseArticle("astro").success).toBe(false);
    expect(parseArticle(["astro", 42]).success).toBe(false);
    expect(parseArticle(["astro", "invalid_tag"]).success).toBe(false);
  });

  test("タグ未指定時は空配列になる", () => {
    const result = articleSchema.safeParse({ title: "Test", pubDate: "2026-01-01" });

    expect(result.success && result.data.tags).toEqual([]);
  });
});

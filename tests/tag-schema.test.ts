import { describe, expect, test } from "vitest";
import { z } from "zod";
import { SLUG_PATTERN } from "../src/utils/articles";

// content.config.ts の tags スキーマと同じ定義(astro:content は Vitest から
// 直接インポートできないため、規約の正を成すパターンを共有して検証する)
const tagsSchema = z.array(z.string().regex(SLUG_PATTERN)).default([]);

describe("タグ規約(英数字ケバブケース)", () => {
  test("正しいタグは受理される", () => {
    expect(tagsSchema.safeParse(["astro", "cloud-flare", "web3"]).success).toBe(true);
  });

  test("日本語・大文字・空文字は拒否される", () => {
    expect(tagsSchema.safeParse(["日記"]).success).toBe(false);
    expect(tagsSchema.safeParse(["Astro"]).success).toBe(false);
    expect(tagsSchema.safeParse([""]).success).toBe(false);
  });
});

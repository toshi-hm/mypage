import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import TagList from "../src/components/atoms/TagList.astro";
import { collectTags } from "../src/utils/articles";

const withTags = (tags: string[]) => ({ data: { tags } });

describe("collectTags", () => {
  test("タグを集計し count 降順 → 同数はタグ名昇順で返す", () => {
    const result = collectTags([
      withTags(["astro", "meta"]),
      withTags(["astro"]),
      withTags(["bun"]),
    ]);

    expect(result).toEqual([
      { tag: "astro", count: 2 },
      { tag: "bun", count: 1 },
      { tag: "meta", count: 1 },
    ]);
  });

  test("タグなし記事のみなら空配列", () => {
    expect(collectTags([withTags([])])).toEqual([]);
  });
});

describe("TagList", () => {
  test("各タグが /tags/<tag>/ へのリンクになる", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TagList, {
      props: { tags: ["astro", "meta"] },
    });

    expect(result).toContain('href="/tags/astro/"');
    expect(result).toContain('href="/tags/meta/"');
  });

  test("タグが空なら何も描画しない", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TagList, { props: { tags: [] } });

    expect(result).not.toContain("<ul");
  });
});

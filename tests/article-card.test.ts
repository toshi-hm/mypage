import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import ArticleCard from "../src/components/ArticleCard.astro";

test("タイトル・リンク・日付を描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArticleCard, {
    props: {
      slug: "hello-world",
      title: "はじめての記事",
      summary: "概要テキスト",
      pubDate: new Date(2026, 6, 1),
    },
  });

  expect(result).toContain('href="/articles/hello-world/"');
  expect(result).toContain("はじめての記事");
  expect(result).toContain("概要テキスト");
  expect(result).toContain("2026-07-01");
});

test("タグを渡すと描画される", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArticleCard, {
    props: {
      slug: "tagged",
      title: "タグ付き記事",
      summary: "",
      pubDate: new Date(2026, 6, 1),
      tags: ["astro", "meta"],
    },
  });

  expect(result).toContain("astro");
  expect(result).toContain("meta");
});

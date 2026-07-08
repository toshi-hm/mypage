import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import LinkCard from "../src/components/LinkCard.astro";

test("タイトルとリンク先を描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LinkCard, {
    props: { title: "About", href: "/about/" },
  });

  expect(result).toContain("About");
  expect(result).toContain('href="/about/"');
});

test("description を渡すと描画される", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LinkCard, {
    props: { title: "GitHub", href: "/x/", description: "リポジトリ一覧" },
  });

  expect(result).toContain("リポジトリ一覧");
});

test("外部リンクは新しいタブで開き rel を付与する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LinkCard, {
    props: { title: "GitHub", href: "https://github.com/toshi-hm" },
  });

  expect(result).toContain('target="_blank"');
  expect(result).toContain('rel="noopener noreferrer"');
});

test("内部リンクには target を付与しない", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LinkCard, {
    props: { title: "About", href: "/about/" },
  });

  expect(result).not.toContain("target=");
});

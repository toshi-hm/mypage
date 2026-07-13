import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import SectionHeading from "../src/components/molecules/SectionHeading.astro";

test("セクション番号と見出しを描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(SectionHeading, {
    props: { index: "01", title: "Latest Articles" },
  });

  expect(result).toContain("<h2");
  expect(result).toContain("01");
  expect(result).toContain("Latest Articles");
});

test("一覧リンクを任意で描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(SectionHeading, {
    props: { index: "02", title: "Works", href: "/works/", linkLabel: "All works" },
  });

  expect(result).toContain('href="/works/"');
  expect(result).toContain("All works");
});

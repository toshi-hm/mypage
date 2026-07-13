import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// 主要ページに axe-core(WCAG 2.0/2.1 A・AA)を適用し、違反 0 件を CI で強制する
const pages = [
  { name: "トップ", path: "/" },
  { name: "記事一覧", path: "/articles/" },
  { name: "記事詳細", path: "/articles/how-articles-work/" },
  { name: "Works", path: "/works/" },
  { name: "About", path: "/about/" },
  { name: "タグ一覧", path: "/tags/" },
  { name: "検索", path: "/search/" },
];

for (const { name, path } of pages) {
  test(`${name}(${path})に axe 違反がない`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

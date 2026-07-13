import { expect, test } from "@playwright/test";

test("検索語を入力すると Pagefind の結果が表示される", async ({ page }) => {
  await page.goto("/search/");
  await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();

  const input = page.locator("input[type='text'], input[type='search']").first();
  await input.waitFor();
  await input.fill("Cloudflare");

  // Pagefind UI が公開記事への結果リンクを描画する(記事本文がインデックスされている)
  const articleLink = page.locator("a[href*='/articles/hello-world/']").first();
  await expect(articleLink).toBeVisible({ timeout: 10_000 });
});

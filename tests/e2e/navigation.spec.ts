import { expect, test } from "@playwright/test";

test("トップ → Articles → 記事詳細 → タグページと回遊できる", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Hama Toshiya/);

  await page.getByRole("navigation").getByRole("link", { name: "Articles" }).click();
  await expect(page).toHaveURL(/\/articles\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Articles" })).toBeVisible();

  // 記事詳細へ(公開記事が最低 1 件ある前提。0 件ならこのテストは失敗してよい)
  await page.locator("article h2 a").first().click();
  await expect(page).toHaveURL(/\/articles\/[a-z0-9-]+\/$/);
  await expect(page.locator("article h1")).toBeVisible();

  // タグページへ
  const tagLink = page.locator(".tags a").first();
  await tagLink.click();
  await expect(page).toHaveURL(/\/tags\/[a-z0-9-]+\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("#");
});

test("Works と About にナビゲーションできる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Works" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Works" })).toBeVisible();

  await page.getByRole("navigation").getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("日常を少し便利にする");
});

test("スキルアイコンのCDN失敗時は略称へフォールバックする", async ({ page }) => {
  await page.route("https://cdn.jsdelivr.net/**", (route) => route.abort());
  await page.route("https://cdn.jsdelivr.net/gh/devicons/**", (route) => route.abort());
  await page.goto("/about/");

  await expect(page.locator(".skill-icon.is-fallback").first()).toBeVisible();
  await expect(page.locator(".skill-fallback").first()).toHaveText("TS");
});

test("存在しない URL では 404 ページが表示される", async ({ page }) => {
  const response = await page.goto("/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("お探しのページは見つかりませんでした。")).toBeVisible();
  const notFoundNavigation = page.getByRole("navigation", { name: "404ページの移動先" });
  await expect(notFoundNavigation.getByRole("link", { name: "記事を検索" })).toHaveAttribute(
    "href",
    "/search/",
  );
  await expect(notFoundNavigation.getByRole("link", { name: "記事一覧" })).toHaveAttribute(
    "href",
    "/articles/",
  );
  await expect(notFoundNavigation.getByRole("link", { name: "Works" })).toHaveAttribute(
    "href",
    "/works/",
  );
  await expect(notFoundNavigation.getByRole("link", { name: "About" })).toHaveAttribute(
    "href",
    "/about/",
  );
});

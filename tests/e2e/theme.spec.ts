import { expect, test } from "@playwright/test";

test("テーマ切替が反映され、リロード後も永続する", async ({ page }) => {
  await page.goto("/");

  // OS 設定に依存しないよう、初期テーマを確認してから切り替える
  const initial = await page.evaluate(() => document.documentElement.dataset["theme"]);
  expect(initial === "light" || initial === "dark").toBe(true);
  const next = initial === "light" ? "dark" : "light";

  await page.getByRole("banner").getByRole("button").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);

  // localStorage 経由で永続化され、リロード直後(インラインスクリプト)から適用される
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);
});

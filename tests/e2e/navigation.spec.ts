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
  await expect(
    page.getByRole("heading", { level: 1, name: "日常を少し便利にする、プロダクトをつくる。" }),
  ).toBeVisible();
  const profileImage = page.getByRole("img", { name: "濱俊也のプロフィール写真" });
  await expect(profileImage).toBeVisible();
  await expect(profileImage).toBeInViewport();
  const aboutIntro = page.locator(".about-intro");
  await expect(
    aboutIntro.getByRole("link", { name: "GitHub（外部サイト・新しいタブ）" }),
  ).toBeVisible();
  await expect(
    aboutIntro.getByRole("link", { name: "LinkedIn（外部サイト・新しいタブ）" }),
  ).toBeVisible();
});

test("Aboutの並行開始マーカーが経歴カードの間に表示される", async ({ page }) => {
  const viewports = [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/about/");

    const getBox = async (selector: string) => {
      const box = await page.locator(selector).boundingBox();
      if (!box) {
        throw new Error(`要素の矩形を取得できません: ${selector}`);
      }
      return box;
    };
    const parallelMarker = await getBox(".parallel-marker");
    const graduateSchool = await getBox(
      ".career-item.education:has-text('立教大学大学院 人工知能科学研究科')",
    );
    const softwareEngineer = await getBox(".career-item.work:has-text('LINEヤフー株式会社')");
    const college = await getBox(".career-item.education:has-text('立教大学 理学部')");

    expect(parallelMarker.y).toBeGreaterThan(graduateSchool.y + graduateSchool.height);
    expect(parallelMarker.y).toBeGreaterThan(softwareEngineer.y + softwareEngineer.height);
    expect(college.y).toBeGreaterThan(parallelMarker.y + parallelMarker.height);

    if (viewport.width > 700) {
      const jobLabel = await getBox(".work-entry .lane-label");
      const educationLabel = await getBox(".education-entry .lane-label");
      expect(jobLabel.x).toBeLessThan(educationLabel.x);
      expect(
        Math.abs(
          softwareEngineer.y + softwareEngineer.height - graduateSchool.y - graduateSchool.height,
        ),
      ).toBeLessThan(1);
    }
  }
});

test("Aboutの経歴タイムラインにイベント月と期間が表示される", async ({ page }) => {
  await page.goto("/about/");

  await expect(page.locator(".timeline-event")).toHaveCount(4);
  for (const date of ["2026-03", "2024-04", "2024-03", "2020-04"]) {
    await expect(page.locator(`.timeline-event[data-date="${date}"]`)).toBeVisible();
  }

  const periods = page.locator(".timeline-period");
  await expect(periods).toHaveCount(3);
  for (let index = 0; index < (await periods.count()); index += 1) {
    const box = await periods.nth(index).boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height).toBeGreaterThan(box?.width ?? 0);
  }
});

test("Featured Works から housekeeper の詳細ページへ遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "housekeeperの詳細ページ" }).click();

  await expect(page).toHaveURL(/\/works\/housekeeper\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "housekeeper" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "housekeeperとは" })).toBeVisible();
  await expect(page.getByText("Supabase MCPとChatGPT")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" })
      .locator("strong"),
  ).toHaveText("toshi-hm/housekeeper");
});

test("Featured Works から PageLink Copy Button の詳細ページへ遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "PageLink Copy Buttonの詳細ページ" }).click();

  await expect(page).toHaveURL(/\/works\/pagelink-copy-button\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "PageLink Copy Button" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "どのようなツールなのか" })).toBeVisible();
  await expect(page.getByText("タイトル付きリンクをコピー")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Chromeのページ右下に表示されたPageLink Copy Button" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Chromeの右クリックメニューに表示されたPageLink Copy Button" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" })
      .locator("strong"),
  ).toHaveText("toshi-hm/pagelink-copy-button");
});

test("Featured Works から Meet Subtitles の詳細ページへ遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Meet Subtitlesの詳細ページ" }).click();

  await expect(page).toHaveURL(/\/works\/meet-subtitles-tool\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Meet Subtitles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "従来の課題" })).toBeVisible();
  await expect(page.getByText("クリップボードにコピー")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Google Meet画面上に表示されたMeet Subtitlesパネル" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: "GitHubリポジトリ（外部サイト・新しいタブ）" })
      .locator("strong"),
  ).toHaveText("toshi-hm/meet-subtitles-tool");
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

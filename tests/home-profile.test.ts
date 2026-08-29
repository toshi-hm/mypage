import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import HomeProfile from "../src/components/organisms/HomeProfile.astro";

test("トップページにプロフィール情報と写真を描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HomeProfile);

  expect(result).toContain("濱 俊也");
  expect(result).toContain("Hama Toshiya");
  expect(result).toContain("LINEヤフー株式会社");
  expect(result).toContain("修士（人工知能科学）");
  expect(result).toContain('src="/images/profile.webp"');
  expect(result).toContain('alt="濱俊也のプロフィール写真"');
  expect(result).toContain('href="/about/"');
});

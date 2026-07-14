import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import HomeHero from "../src/components/organisms/HomeHero.astro";

test("価値提案と主要導線を静的HTMLとして描画する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HomeHero);

  expect(result).toContain("<h1");
  expect(result).toContain("ITで日常を");
  expect(result).toContain("より便利にしたい");
  expect(result).toContain('href="/works/"');
  expect(result).toContain('href="/about/"');
});

test("背景アニメーションを支援技術から隠す", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HomeHero);

  expect(result).toContain('class="signal-field"');
  expect(result).toContain('aria-hidden="true"');
  expect(result).toContain('role="presentation"');
});

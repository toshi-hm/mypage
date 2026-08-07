import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import SkillList from "../src/components/molecules/SkillList.astro";

describe("SkillList", () => {
  test("スキル名と CDN のアイコン画像を描画する", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: {
        skills: [
          {
            name: "TypeScript",
            iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/typescript.svg",
          },
        ],
      },
    });

    expect(result).toContain("TypeScript");
    expect(result).toContain(
      '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/typescript.svg"',
    );
    expect(result).toContain('width="24" height="24" loading="lazy"');
  });

  test("featured なスキルには featured クラスが付く", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: {
        skills: [
          { name: "React", iconUrl: "https://example.com/react.svg", featured: true },
          { name: "Bun", iconUrl: "https://example.com/bun.svg" },
        ],
      },
    });

    const items = result.split("<li").slice(1);
    const reactItem = items.find((item) => item.includes("react.svg"));
    const bunItem = items.find((item) => item.includes("bun.svg"));

    expect(reactItem).toContain('class="featured"');
    expect(bunItem).not.toContain('class="featured"');
  });

  test("アイコンは装飾として aria-hidden で隠す", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: { skills: [{ name: "Vue.js", iconUrl: "https://example.com/vue.svg" }] },
    });

    expect(result).toContain('aria-hidden="true"');
    expect(result).toContain('alt=""');
  });
});

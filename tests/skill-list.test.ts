import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import SkillList from "../src/components/molecules/SkillList.astro";

describe("SkillList", () => {
  test("スキル名とアイコン用の略称を描画する", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: { skills: [{ name: "TypeScript", code: "TS" }] },
    });

    expect(result).toContain("TypeScript");
    expect(result).toContain("TS");
  });

  test("featured なスキルには featured クラスが付く", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: {
        skills: [
          { name: "React", code: "RE", featured: true },
          { name: "Bun", code: "BUN" },
        ],
      },
    });

    const items = result.split("</li>");
    const reactItem = items.find((item) => item.includes(">RE<"));
    const bunItem = items.find((item) => item.includes(">BUN<"));

    expect(reactItem).toMatch(/<li class="featured"/);
    expect(bunItem).not.toMatch(/<li class="featured"/);
  });

  test("アイコンは装飾として aria-hidden で隠す", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(SkillList, {
      props: { skills: [{ name: "Vue.js", code: "VUE" }] },
    });

    expect(result).toContain('aria-hidden="true"');
  });
});

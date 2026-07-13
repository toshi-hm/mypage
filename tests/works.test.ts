import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import WorkCard from "../src/components/molecules/WorkCard.astro";
import { sortWorks } from "../src/utils/works";

const work = (name: string, order: number) => ({ data: { name, order } });

describe("sortWorks", () => {
  test("order 昇順 → 同値は name 昇順で並ぶ(元配列は変更しない)", () => {
    const entries = [work("b-tool", 2), work("z-app", 1), work("a-lib", 2)];
    const sorted = sortWorks(entries);

    expect(sorted.map((e) => e.data.name)).toEqual(["z-app", "a-lib", "b-tool"]);
    expect(entries.map((e) => e.data.name)).toEqual(["b-tool", "z-app", "a-lib"]);
  });
});

describe("WorkCard", () => {
  test("名称・説明・tech タグ・リンクを描画する", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(WorkCard, {
      props: {
        name: "mypage",
        description: "個人ホームページ",
        url: "https://example.com",
        repo: "https://github.com/toshi-hm/mypage",
        tech: ["astro", "bun"],
      },
    });

    expect(result).toContain("mypage");
    expect(result).toContain("個人ホームページ");
    expect(result).toContain("astro");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('href="https://github.com/toshi-hm/mypage"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  test("url / repo を省略するとリンクを描画しない", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(WorkCard, {
      props: { name: "tool", description: "説明" },
    });

    expect(result).not.toContain("href=");
  });
});

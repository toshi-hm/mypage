import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import RepositoryBookmark from "../src/components/molecules/RepositoryBookmark.astro";

describe("RepositoryBookmark", () => {
  test("GitHubリポジトリの情報付きブックマークを描画する", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(RepositoryBookmark, {
      props: {
        href: "https://github.com/toshi-hm/example",
        title: "toshi-hm/example",
        description: "リポジトリの説明",
      },
    });

    expect(result).toContain('href="https://github.com/toshi-hm/example"');
    expect(result).toContain("GitHubリポジトリ");
    expect(result).toContain("toshi-hm/example");
    expect(result).toContain("リポジトリの説明");
    expect(result).toContain("github.com/toshi-hm/example");
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });
});

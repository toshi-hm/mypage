import { describe, expect, test } from "vitest";
import { buildBlogPostingLd, buildWebSiteLd } from "../src/utils/structured-data";

describe("buildWebSiteLd", () => {
  test("WebSite スキーマの主要フィールドを持つ", () => {
    const ld = buildWebSiteLd({
      name: "Hama Toshiya | mypage",
      description: "個人ホームページ",
      url: "https://example.com/",
    });

    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("WebSite");
    expect(ld["name"]).toBe("Hama Toshiya | mypage");
    expect(ld["url"]).toBe("https://example.com/");
  });
});

describe("buildBlogPostingLd", () => {
  const base = {
    title: "記事タイトル",
    description: "概要",
    url: "https://example.com/articles/post/",
    pubDate: new Date("2026-07-01T00:00:00Z"),
    tags: ["astro", "meta"],
    authorName: "Hama Toshiya",
  };

  test("BlogPosting スキーマの主要フィールドを持つ", () => {
    const ld = buildBlogPostingLd(base);

    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld["headline"]).toBe("記事タイトル");
    expect(ld["datePublished"]).toBe("2026-07-01T00:00:00.000Z");
    expect(ld["keywords"]).toBe("astro,meta");
    expect(ld["author"]).toEqual({ "@type": "Person", name: "Hama Toshiya" });
    expect(ld["dateModified"]).toBeUndefined();
  });

  test("updatedDate があれば dateModified を出力する", () => {
    const ld = buildBlogPostingLd({ ...base, updatedDate: new Date("2026-07-08T00:00:00Z") });
    expect(ld["dateModified"]).toBe("2026-07-08T00:00:00.000Z");
  });

  test("タグが空なら keywords を出力しない", () => {
    const ld = buildBlogPostingLd({ ...base, tags: [] });
    expect(ld["keywords"]).toBeUndefined();
  });
});

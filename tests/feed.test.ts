import { describe, expect, test } from "vitest";
import { toFeedItems } from "../src/utils/articles";

const entry = (
  id: string,
  pubDate: string,
  extra: Partial<{ description: string; body: string }> = {},
) => ({
  id,
  data: {
    title: `記事 ${id}`,
    description: extra.description,
    pubDate: new Date(pubDate),
    tags: [],
    draft: false,
  },
  body: extra.body,
});

describe("toFeedItems", () => {
  test("pubDate 降順で並び、link は /articles/<slug>/ 形式になる", () => {
    const items = toFeedItems([entry("old-post", "2026-01-01"), entry("new-post", "2026-07-01")]);

    expect(items.map((i) => i.link)).toEqual(["/articles/new-post/", "/articles/old-post/"]);
    expect(items[0]?.title).toBe("記事 new-post");
    expect(items[0]?.pubDate).toEqual(new Date("2026-07-01"));
  });

  test("description は excerpt(description 優先、なければ本文抜粋)", () => {
    const items = toFeedItems([
      entry("a", "2026-07-01", { description: "明示的な概要" }),
      entry("b", "2026-06-01", { body: "## 見出し\n\n本文テキスト。" }),
    ]);

    expect(items[0]?.description).toBe("明示的な概要");
    expect(items[1]?.description).toBe("見出し 本文テキスト。");
  });
});

import { describe, expect, test } from "vitest";
import { relatedArticles } from "../src/utils/articles";

const entry = (id: string, tags: string[], pubDate = "2026-07-01") => ({
  id,
  data: { tags, pubDate: new Date(pubDate) },
});

describe("relatedArticles", () => {
  test("共有タグ数が多い順に返し、自分自身は含めない", () => {
    const entries = [
      entry("current", ["a", "b", "c"]),
      entry("two-shared", ["a", "b"]),
      entry("one-shared", ["c", "x"]),
      entry("none", ["x", "y"]),
    ];

    const result = relatedArticles(entries, "current");

    expect(result.map((e) => e.id)).toEqual(["two-shared", "one-shared"]);
  });

  test("共有数が同じなら pubDate 降順", () => {
    const entries = [
      entry("current", ["a"]),
      entry("old", ["a"], "2026-01-01"),
      entry("new", ["a"], "2026-06-01"),
    ];

    expect(relatedArticles(entries, "current").map((e) => e.id)).toEqual(["new", "old"]);
  });

  test("max 件数で打ち切る", () => {
    const entries = [
      entry("current", ["a"]),
      entry("r1", ["a"], "2026-06-01"),
      entry("r2", ["a"], "2026-05-01"),
      entry("r3", ["a"], "2026-04-01"),
      entry("r4", ["a"], "2026-03-01"),
    ];

    expect(relatedArticles(entries, "current", 3)).toHaveLength(3);
  });

  test("共有タグ 0 件・対象 id 不在なら空", () => {
    expect(relatedArticles([entry("current", ["a"]), entry("x", ["z"])], "current")).toEqual([]);
    expect(relatedArticles([entry("x", ["a"])], "missing")).toEqual([]);
  });
});

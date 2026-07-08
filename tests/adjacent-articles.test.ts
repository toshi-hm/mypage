import { describe, expect, test } from "vitest";
import { getAdjacentArticles } from "../src/utils/articles";

const entry = (id: string, pubDate: string) => ({ id, data: { pubDate: new Date(pubDate) } });

// pubDate 降順: newest > middle > oldest
const entries = [
  entry("oldest", "2026-01-01"),
  entry("newest", "2026-07-01"),
  entry("middle", "2026-03-01"),
];

describe("getAdjacentArticles", () => {
  test("中間の記事は両隣が返る", () => {
    const { newer, older } = getAdjacentArticles(entries, "middle");
    expect(newer?.id).toBe("newest");
    expect(older?.id).toBe("oldest");
  });

  test("最新記事に newer はない", () => {
    const { newer, older } = getAdjacentArticles(entries, "newest");
    expect(newer).toBeUndefined();
    expect(older?.id).toBe("middle");
  });

  test("最古記事に older はない", () => {
    const { newer, older } = getAdjacentArticles(entries, "oldest");
    expect(newer?.id).toBe("middle");
    expect(older).toBeUndefined();
  });

  test("1 件のみなら両方 undefined", () => {
    const { newer, older } = getAdjacentArticles([entry("only", "2026-01-01")], "only");
    expect(newer).toBeUndefined();
    expect(older).toBeUndefined();
  });

  test("存在しない id なら両方 undefined", () => {
    const { newer, older } = getAdjacentArticles(entries, "missing");
    expect(newer).toBeUndefined();
    expect(older).toBeUndefined();
  });
});

import { describe, expect, test } from "vitest";
import {
  excerpt,
  formatDate,
  isPublishable,
  SLUG_PATTERN,
  sortByPubDateDesc,
} from "../src/utils/articles";

describe("isPublishable", () => {
  test("公開記事はどの環境でも公開対象", () => {
    expect(isPublishable({ draft: false }, true)).toBe(true);
    expect(isPublishable({ draft: false }, false)).toBe(true);
  });

  test("draft は本番では除外、dev では表示", () => {
    expect(isPublishable({ draft: true }, true)).toBe(false);
    expect(isPublishable({ draft: true }, false)).toBe(true);
  });
});

describe("excerpt", () => {
  test("description があればそのまま使う", () => {
    expect(excerpt({ description: "概要です" }, "本文")).toBe("概要です");
  });

  test("description がなければ本文から Markdown 記法を除いて抜粋する", () => {
    const body = "## 見出し\n\nこれは **強調** と [リンク](https://example.com) を含む本文です。";
    expect(excerpt({}, body)).toBe("見出し これは 強調 と リンク を含む本文です。");
  });

  test("コードブロックは抜粋に含めない", () => {
    const body = "前置き\n\n```ts\nconst x = 1;\n```\n\n後続の文。";
    expect(excerpt({}, body)).toBe("前置き 後続の文。");
  });

  test("最大長を超えたら省略記号を付ける", () => {
    const body = "あ".repeat(200);
    const result = excerpt({}, body, 120);
    expect(result).toHaveLength(121);
    expect(result.endsWith("…")).toBe(true);
  });

  test("本文がなければ空文字", () => {
    expect(excerpt({}, undefined)).toBe("");
  });
});

describe("sortByPubDateDesc", () => {
  test("pubDate の新しい順に並ぶ(元配列は変更しない)", () => {
    const entries = [
      { data: { pubDate: new Date("2026-01-01") }, id: "old" },
      { data: { pubDate: new Date("2026-07-01") }, id: "new" },
      { data: { pubDate: new Date("2026-03-01") }, id: "mid" },
    ];
    const sorted = sortByPubDateDesc(entries);

    expect(sorted.map((e) => e.id)).toEqual(["new", "mid", "old"]);
    expect(entries.map((e) => e.id)).toEqual(["old", "new", "mid"]);
  });
});

describe("formatDate", () => {
  test("YYYY-MM-DD 形式で整形する", () => {
    expect(formatDate(new Date(2026, 6, 8))).toBe("2026-07-08");
    expect(formatDate(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("SLUG_PATTERN", () => {
  test("英数字ケバブケースを許可する", () => {
    expect(SLUG_PATTERN.test("hello-world")).toBe(true);
    expect(SLUG_PATTERN.test("post2")).toBe(true);
  });

  test("日本語・大文字・アンダースコアは不許可", () => {
    expect(SLUG_PATTERN.test("こんにちは")).toBe(false);
    expect(SLUG_PATTERN.test("Hello-World")).toBe(false);
    expect(SLUG_PATTERN.test("hello_world")).toBe(false);
    expect(SLUG_PATTERN.test("-leading")).toBe(false);
    expect(SLUG_PATTERN.test("trailing-")).toBe(false);
  });
});

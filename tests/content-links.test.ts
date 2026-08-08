import { describe, expect, test } from "vitest";
import { extractHrefs, findBrokenInternalLinks, isValidHttpUrl } from "../scripts/validate-content-links";

describe("content link validation", () => {
  test("HTMLからhrefを抽出する", () => {
    expect(extractHrefs('<a href="/about/">About</a><a href="https://example.com">External</a>')).toEqual([
      "/about/",
      "https://example.com",
    ]);
  });

  test("http(s) URLだけを受理する", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://localhost:4321")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  test("生成物に存在しないサイト内パスを検出する", () => {
    expect(findBrokenInternalLinks(["/", "/about/", "/missing/", "https://example.com"], "dist")).toContain("/missing/");
  });
});

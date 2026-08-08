import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import {
  extractHrefs,
  findBrokenFragments,
  findBrokenInternalLinks,
  findInvalidHrefs,
  isValidHttpUrl,
} from "../scripts/validate-content-links";

describe("content link validation", () => {
  test("HTMLからhrefを抽出する", () => {
    expect(
      extractHrefs('<a href="/about/">About</a><a href="https://example.com">External</a>'),
    ).toEqual(["/about/", "https://example.com"]);
  });

  test("http(s) URLだけを受理する", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://localhost:4321")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  test("危険なスキームをHTMLリンクから検出する", () => {
    expect(
      findInvalidHrefs([
        "/about/",
        "https://example.com",
        "javascript:alert(1)",
        "data:text/plain,x",
      ]),
    ).toEqual(["data:text/plain,x", "javascript:alert(1)"]);
  });

  test("存在しない同一ページのフラグメントを検出する", () => {
    expect(
      findBrokenFragments('<main id="main"><a href="#main">OK</a><a href="#missing">NG</a></main>'),
    ).toEqual(["#missing"]);
  });

  test("生成物に存在しないサイト内パスだけを検出する", async () => {
    const distDir = await mkdtemp(join(tmpdir(), "mypage-content-links-"));
    try {
      await writeFile(join(distDir, "index.html"), "");
      await mkdir(join(distDir, "about"), { recursive: true });
      await writeFile(join(distDir, "about", "index.html"), "");
      await mkdir(join(distDir, "empty"));

      expect(
        findBrokenInternalLinks(
          ["/", "/about/", "/empty", "/missing/", "https://example.com"],
          distDir,
        ),
      ).toEqual(["/empty", "/missing/"]);
    } finally {
      await rm(distDir, { recursive: true, force: true });
    }
  });

  test("ページを基準に相対リンクを解決する", async () => {
    const distDir = await mkdtemp(join(tmpdir(), "mypage-content-links-"));
    try {
      await mkdir(join(distDir, "articles", "hello"), { recursive: true });
      await writeFile(join(distDir, "articles", "hello", "index.html"), "");

      expect(
        findBrokenInternalLinks(["./index.html", "../missing/"], distDir, "/articles/hello/"),
      ).toEqual(["/articles/missing/"]);
    } finally {
      await rm(distDir, { recursive: true, force: true });
    }
  });
});

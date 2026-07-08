import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { SLUG_PATTERN } from "../src/utils/articles";

const articlesDir = fileURLToPath(new URL("../src/content/articles", import.meta.url));

// スラッグ規約(docs/design-articles.md 参照): ファイル名 = スラッグ。
// 英数字ケバブケース以外(日本語スラッグ等)は CI で落とす。
test("記事ファイル名はすべて英数字ケバブケースである", async () => {
  const files = (await readdir(articlesDir)).filter((f) => f.endsWith(".md"));

  expect(files.length).toBeGreaterThan(0);

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    expect(slug, `不正なスラッグ: ${file}`).toMatch(SLUG_PATTERN);
  }
});

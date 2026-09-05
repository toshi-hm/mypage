import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { expect, test } from "vitest";
import { SITE_URL } from "../src/consts";
import { getRoutePath, validateSeoMetadata } from "../scripts/validate-seo-metadata";

function buildHtml(url: string): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <title>About | Hama Toshiya</title>
    <meta name="description" content="プロフィール">
    <meta name="keywords" content="プロフィール, Web開発">
    <meta property="og:title" content="About | Hama Toshiya">
    <meta property="og:description" content="プロフィール">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="Hama Toshiya | mypage">
    <meta property="og:locale" content="ja_JP">
    <meta property="og:image" content="${SITE_URL}/images/profile.webp">
    <meta property="og:image:alt" content="プロフィール写真">
    <link rel="canonical" href="${url}">
  </head>
  <body></body>
</html>`;
}

test("生成ルートを公開URLへ変換する", () => {
  expect(getRoutePath("index.html")).toBe("/");
  expect(getRoutePath("about/index.html")).toBe("/about/");
  expect(getRoutePath("404.html")).toBe("/404/");
  expect(getRoutePath("articles/example/index.html")).toBe("/articles/example/");
});

test("有効な生成HTMLを検証できる", async () => {
  const directory = await mkdtemp(join(tmpdir(), "seo-metadata-"));
  try {
    await mkdir(join(directory, "about"), { recursive: true });
    await mkdir(join(directory, "images"), { recursive: true });
    await writeFile(join(directory, "about", "index.html"), buildHtml(`${SITE_URL}/about/`));
    await writeFile(join(directory, "images", "profile.webp"), "image");

    await expect(validateSeoMetadata(directory)).resolves.toBeUndefined();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("生成ファイルとog:urlの不一致を検出する", async () => {
  const directory = await mkdtemp(join(tmpdir(), "seo-metadata-"));
  try {
    await mkdir(join(directory, "about"), { recursive: true });
    await mkdir(join(directory, "images"), { recursive: true });
    await writeFile(join(directory, "about", "index.html"), buildHtml(`${SITE_URL}/wrong/`));
    await writeFile(join(directory, "images", "profile.webp"), "image");

    await expect(validateSeoMetadata(directory)).rejects.toThrow(
      "og:urlが生成ファイルの公開URLと一致していません",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});


async function expectValidationError(
  html: string,
  message: string,
  includeImage = true,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "seo-metadata-"));
  try {
    await mkdir(join(directory, "about"), { recursive: true });
    await mkdir(join(directory, "images"), { recursive: true });
    await writeFile(join(directory, "about", "index.html"), html);
    if (includeImage) {
      await writeFile(join(directory, "images", "profile.webp"), "image");
    }

    await expect(validateSeoMetadata(directory)).rejects.toThrow(message);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("必須メタタグの欠落を検出する", async () => {
  const html = buildHtml(`${SITE_URL}/about/`).replace(
    '    <meta name="keywords" content="プロフィール, Web開発">\n',
    "",
  );

  await expectValidationError(html, "meta name=keywords はcontent付きで1つだけ指定してください");
});

test("必須メタタグの重複を検出する", async () => {
  const html = buildHtml(`${SITE_URL}/about/`).replace(
    "  </head>",
    '    <meta name="keywords" content="重複">\n  </head>',
  );

  await expectValidationError(html, "meta name=keywords はcontent付きで1つだけ指定してください");
});

test("不正な絶対URLを検出する", async () => {
  const html = buildHtml("not-a-url");

  await expectValidationError(html, "og:urlが不正なURLです");
});

test("canonicalとog:urlの不一致を検出する", async () => {
  const html = buildHtml(`${SITE_URL}/about/`).replace(
    `<link rel="canonical" href="${SITE_URL}/about/">`,
    `<link rel="canonical" href="${SITE_URL}/other/">`,
  );

  await expectValidationError(html, "og:urlとcanonicalのURLが一致していません");
});

test("OGP画像の欠落を検出する", async () => {
  await expectValidationError(
    buildHtml(`${SITE_URL}/about/`),
    "og:imageの実体がdistにありません",
    false,
  );
});

test("SITE_URLと異なるoriginのog:urlを検出する", async () => {
  await expectValidationError(
    buildHtml("https://example.com/about/"),
    "og:urlがSITE_URLのoriginと一致していません",
  );
});

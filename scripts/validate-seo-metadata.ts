import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../src/consts";

const REQUIRED_META = [
  ["name", "description"],
  ["name", "keywords"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:type"],
  ["property", "og:url"],
  ["property", "og:site_name"],
  ["property", "og:locale"],
  ["property", "og:image"],
  ["property", "og:image:alt"],
] as const;

type Attributes = Record<string, string>;

function getAttributes(tag: string): Attributes {
  const attributes: Attributes = {};
  const pattern = /([:\w-]+)\s*=\s*"([^"]*)"/g;

  for (const match of tag.matchAll(pattern)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function findMetaTags(html: string, attribute: string, value: string): Attributes[] {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];

  return tags.map(getAttributes).filter((attributes) => attributes[attribute] === value);
}

async function findHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(path);
      return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
    }),
  );

  return files.flat(1);
}

export function getRoutePath(relativePath: string): string {
  if (relativePath === "index.html") return "/";
  if (relativePath === "404.html") return "/404/";
  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }
  return `/${relativePath}`;
}

function assertAbsoluteUrl(value: string, label: string, filePath: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return `${filePath}: ${label}はHTTP(S)の絶対URLではありません。`;
    }
    return null;
  } catch {
    return `${filePath}: ${label}が不正なURLです。`;
  }
}

export async function validateSeoMetadata(distDirectory: string): Promise<void> {
  const files = (await findHtmlFiles(distDirectory)).toSorted();
  const errors: string[] = [];
  const expectedSiteUrl = new URL(SITE_URL);

  for (const filePath of files) {
    const relativePath = relative(distDirectory, filePath).replaceAll("\\", "/");
    const html = await readFile(filePath, "utf8");
    const titles = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) ?? [];

    if (titles.length !== 1 || titles[0].replace(/<[^>]+>/g, "").trim() === "") {
      errors.push(`${relativePath}: titleは空でないものを1つだけ指定してください。`);
    }

    const metadata = new Map<string, Attributes>();
    for (const [attribute, value] of REQUIRED_META) {
      const matches = findMetaTags(html, attribute, value);
      const key = `${attribute}=${value}`;
      const match = matches[0];
      const content = match?.content;

      if (matches.length !== 1 || !content) {
        errors.push(`${relativePath}: meta ${key} はcontent付きで1つだけ指定してください。`);
      } else {
        metadata.set(key, match);
      }
    }

    const canonicalLinks = (html.match(/<link\b[^>]*>/gi) ?? [])
      .map(getAttributes)
      .filter((attributes) => attributes.rel === "canonical");

    if (canonicalLinks.length !== 1 || !canonicalLinks[0].href) {
      errors.push(`${relativePath}: canonical linkを1つだけ指定してください。`);
    }

    const ogUrl = metadata.get("property=og:url")?.content;
    const ogImage = metadata.get("property=og:image")?.content;
    const ogImageAlt = metadata.get("property=og:image:alt")?.content;
    const canonicalUrl = canonicalLinks[0]?.href;

    for (const [label, value] of [
      ["og:url", ogUrl],
      ["og:image", ogImage],
      ["canonical", canonicalUrl],
    ] as const) {
      if (value) {
        const error = assertAbsoluteUrl(value, label, relativePath);
        if (error) errors.push(error);
      }
    }

    if (ogUrl && canonicalUrl && ogUrl !== canonicalUrl) {
      errors.push(`${relativePath}: og:urlとcanonicalのURLが一致していません。`);
    }

    const expectedUrl = new URL(getRoutePath(relativePath), expectedSiteUrl).href;
    if (ogUrl && ogUrl !== expectedUrl) {
      errors.push(`${relativePath}: og:urlが生成ファイルの公開URLと一致していません。`);
    }

    if (ogImage && ogImageAlt) {
      try {
        const imageUrl = new URL(ogImage);
        if (imageUrl.origin === expectedSiteUrl.origin) {
          const imagePath = join(distDirectory, imageUrl.pathname.replace(/^\/+/, ""));
          try {
            if (!(await stat(imagePath)).isFile()) {
              errors.push(`${relativePath}: og:imageの実体がdistにありません。`);
            }
          } catch {
            errors.push(`${relativePath}: og:imageの実体がdistにありません。`);
          }
        }
      } catch {
        // URL形式のエラーは上の絶対URL検証で報告する。
      }
    }

    if (ogUrl) {
      try {
        if (new URL(ogUrl).origin !== expectedSiteUrl.origin) {
          errors.push(`${relativePath}: og:urlがSITE_URLのoriginと一致していません。`);
        }
      } catch {
        // URL形式のエラーは上の絶対URL検証で報告する。
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(["SEOメタデータ検証に失敗しました。", ...errors].join("\n"));
  }

  console.log(`SEOメタデータを${files.length}件検証しました。`);
}

if (import.meta.main) {
  const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
  await validateSeoMetadata(join(rootDirectory, "dist"));
}

import { readdir, readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function extractHrefs(html: string): string[] {
  return [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]);
}

export function isValidHttpUrl(value: string): boolean {
  try {
    return HTTP_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function toPathname(href: string, basePath = "/"): string | undefined {
  if (href.startsWith("#")) return undefined;

  try {
    const baseUrl = new URL(basePath, "https://mypage.local/");
    const url = new URL(href, baseUrl);
    if (url.origin !== baseUrl.origin) return undefined;
    return url.pathname || "/";
  } catch {
    return undefined;
  }
}

function getCandidates(distDir: string, pathname: string): string[] {
  if (pathname === "/") return [join(distDir, "index.html")];
  if (pathname.endsWith("/")) return [join(distDir, pathname, "index.html")];
  return [
    join(distDir, pathname),
    join(distDir, pathname, "index.html"),
    join(distDir, `${pathname}.html`),
  ];
}

export function findBrokenInternalLinks(
  hrefs: string[],
  distDir: string,
  basePath = "/",
): string[] {
  return [
    ...new Set(
      hrefs
        .map((href) => toPathname(href, basePath))
        .filter((pathname): pathname is string => Boolean(pathname)),
    ),
  ]
    .filter(
      (pathname) =>
        !getCandidates(distDir, pathname).some((candidate) => {
          try {
            return statSync(candidate).isFile();
          } catch {
            return false;
          }
        }),
    )
    .toSorted();
}

function getRoutePath(htmlFile: string, distDir: string): string {
  const relativePath = htmlFile.slice(distDir.length).replaceAll("\\", "/");
  if (relativePath === "/index.html") return "/";
  return relativePath.replace(/\/index\.html$/, "/");
}

async function collectHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? collectHtmlFiles(path)
        : entry.name.endsWith(".html")
          ? [path]
          : [];
    }),
  );
  return files.flat();
}

async function main() {
  const distDir = join(process.cwd(), "dist");
  const works = JSON.parse(
    await readFile(join(process.cwd(), "src/content/works.json"), "utf8"),
  ) as {
    works?: Array<{ url?: string; repo?: string }>;
  };
  const invalidUrls = (works.works ?? []).flatMap((work) =>
    [work.url, work.repo]
      .filter((url): url is string => Boolean(url))
      .filter((url) => !isValidHttpUrl(url)),
  );

  const htmlFiles = await collectHtmlFiles(distDir);
  const htmlContents = await Promise.all(
    htmlFiles.map(async (file) => ({
      file,
      html: await readFile(file, "utf8"),
    })),
  );
  const hrefs = htmlContents.flatMap(({ html }) => extractHrefs(html));
  const brokenLinks = [
    ...new Set(
      htmlContents.flatMap(({ file, html }) =>
        extractHrefs(html)
          .map((href) => ({ href, pathname: toPathname(href, getRoutePath(file, distDir)) }))
          .filter(({ pathname }): pathname is string => Boolean(pathname))
          .filter(
            ({ pathname }) =>
              !getCandidates(distDir, pathname).some((candidate) => {
                try {
                  return statSync(candidate).isFile();
                } catch {
                  return false;
                }
              }),
          )
          .map(({ href }) => href),
      ),
    ),
  ].toSorted();

  if (invalidUrls.length > 0 || brokenLinks.length > 0) {
    if (invalidUrls.length > 0) console.error(`Invalid content URLs:\n${invalidUrls.join("\n")}`);
    if (brokenLinks.length > 0) console.error(`Broken internal links:\n${brokenLinks.join("\n")}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${htmlFiles.length} HTML files and ${new Set(hrefs).size} hrefs.`);
}

if (import.meta.main) await main();

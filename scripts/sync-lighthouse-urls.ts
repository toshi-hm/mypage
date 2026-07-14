import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FIXED_URLS = [
  "http://localhost/index.html",
  "http://localhost/articles/index.html",
  "http://localhost/works/index.html",
];

type LighthouseConfig = {
  ci?: {
    collect?: {
      url?: unknown;
    };
  };
};

async function findArticleIndexPaths(
  directory: string,
  segments: string[] = [],
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  const nestedPaths = await Promise.all(
    directories.map(async (entry) => {
      const nextSegments = segments.concat(entry.name);
      const nestedDirectory = join(directory, entry.name);
      const nestedEntries = await readdir(nestedDirectory, { withFileTypes: true });
      const currentPath = nestedEntries.some(
        (nestedEntry) => nestedEntry.isFile() && nestedEntry.name === "index.html",
      )
        ? [nextSegments.join("/")]
        : [];

      return currentPath.concat(await findArticleIndexPaths(nestedDirectory, nextSegments));
    }),
  );

  return nestedPaths.flat();
}

export async function discoverArticleUrls(articlesDirectory: string): Promise<string[]> {
  const articlePaths = await findArticleIndexPaths(articlesDirectory);

  return articlePaths
    .toSorted((left, right) => left.localeCompare(right, "en"))
    .map((articlePath) => `http://localhost/articles/${articlePath}/index.html`);
}

export async function syncLighthouseUrls(
  configPath: string,
  articlesDirectory: string,
): Promise<string[]> {
  const config = JSON.parse(await readFile(configPath, "utf8")) as LighthouseConfig;
  const collect = config.ci?.collect;

  if (!collect || !Array.isArray(collect.url)) {
    throw new Error("lighthouserc.json の ci.collect.url が見つかりません。");
  }

  const articleUrls = await discoverArticleUrls(articlesDirectory);
  collect.url = [...FIXED_URLS, ...articleUrls];
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

  return articleUrls;
}

if (import.meta.main) {
  const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
  const articleUrls = await syncLighthouseUrls(
    join(rootDirectory, "lighthouserc.json"),
    join(rootDirectory, "dist/articles"),
  );

  console.log(`Lighthouse の対象に公開記事 ${articleUrls.length} 件を同期しました。`);
}

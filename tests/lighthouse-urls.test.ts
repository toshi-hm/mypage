import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, test } from "vitest";
import { discoverArticleUrls, syncLighthouseUrls } from "../scripts/sync-lighthouse-urls";

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "mypage-lighthouse-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("discoverArticleUrls", () => {
  test("ビルド済みの公開記事だけをURL順で返す", async () => {
    const root = await createTemporaryDirectory();
    const articlesDirectory = join(root, "articles");

    await mkdir(join(articlesDirectory, "second-post"), { recursive: true });
    await mkdir(join(articlesDirectory, "first-post"), { recursive: true });
    await mkdir(join(articlesDirectory, "draft-post"), { recursive: true });
    await writeFile(join(articlesDirectory, "index.html"), "article list");
    await writeFile(join(articlesDirectory, "second-post/index.html"), "second");
    await writeFile(join(articlesDirectory, "first-post/index.html"), "first");

    await expect(discoverArticleUrls(articlesDirectory)).resolves.toEqual([
      "http://localhost/articles/first-post/index.html",
      "http://localhost/articles/second-post/index.html",
    ]);
  });
});

describe("syncLighthouseUrls", () => {
  test("固定ページを保ち、古い記事URLを現在のビルド結果で置き換える", async () => {
    const root = await createTemporaryDirectory();
    const articlesDirectory = join(root, "articles");
    const configPath = join(root, "lighthouserc.json");

    await mkdir(join(articlesDirectory, "hello-world"), { recursive: true });
    await writeFile(join(articlesDirectory, "hello-world/index.html"), "hello");
    await writeFile(
      configPath,
      JSON.stringify({
        ci: { collect: { url: ["http://localhost/articles/deleted/index.html"] } },
      }),
    );

    await syncLighthouseUrls(configPath, articlesDirectory);

    const config = JSON.parse(await readFile(configPath, "utf8")) as {
      ci: { collect: { url: string[] } };
    };
    expect(config.ci.collect.url).toEqual([
      "http://localhost/index.html",
      "http://localhost/articles/index.html",
      "http://localhost/works/index.html",
      "http://localhost/articles/hello-world/index.html",
    ]);
  });

  test("ci.collect.url がない設定はエラーにする", async () => {
    const root = await createTemporaryDirectory();
    const articlesDirectory = join(root, "articles");
    const configPath = join(root, "lighthouserc.json");

    await mkdir(articlesDirectory, { recursive: true });
    await writeFile(configPath, JSON.stringify({ ci: { collect: {} } }));

    await expect(syncLighthouseUrls(configPath, articlesDirectory)).rejects.toThrow(
      "ci.collect.url が見つかりません",
    );
  });
});

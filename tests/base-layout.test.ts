import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { expect, test } from "vitest";
import BaseLayout from "../src/layouts/BaseLayout.astro";

const createContainer = async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  return AstroContainer.create({ renderers });
};

test("OGP画像をX向け画像メタデータにも反映する", async () => {
  const container = await createContainer();
  const result = await container.renderToString(BaseLayout, {
    props: {
      title: "Home",
      ogImage: "https://example.com/og.png",
    },
  });

  expect(result).toContain('<meta property="og:image" content="https://example.com/og.png"');
  expect(result).toContain('<meta name="twitter:image" content="https://example.com/og.png"');
});

test("LINE Seed JPをセルフホストしてサイト全体の標準フォントとして読み込む", async () => {
  const container = await createContainer();
  const result = await container.renderToString(BaseLayout, {
    props: { title: "Home" },
  });
  const stylesheet = await readFile(resolve("src/styles/global.css"), "utf8");

  expect(result).not.toContain("fonts.googleapis.com");
  expect(stylesheet).toContain('@import "@fontsource/line-seed-jp/japanese-400.css"');
  expect(stylesheet).toContain('@import "@fontsource/line-seed-jp/latin-400.css"');
});


test("全ページ共通のSEOメタデータを出力する", async () => {
  const container = await createContainer();
  const result = await container.renderToString(BaseLayout, {
    props: {
      title: "About",
      description: "プロフィール",
      keywords: ["Hama Toshiya", "プロフィール"],
    },
  });

  expect(result).toContain("<title>About | Hama Toshiya</title>");
  expect(result).toContain('<meta name="description" content="プロフィール"');
  expect(result).toContain('<meta name="keywords" content="Hama Toshiya, プロフィール"');
  expect(result).toContain('<meta property="og:title" content="About | Hama Toshiya"');
  expect(result).toContain('<meta property="og:description" content="プロフィール"');
  expect(result).toContain('<meta property="og:type" content="website"');
  expect(result).toContain('<meta property="og:url" content="http://localhost/about"');
  expect(result).toContain('<meta property="og:site_name" content="Hama Toshiya | mypage"');
  expect(result).toContain('<meta property="og:locale" content="ja_JP"');
  expect(result).toContain('<meta property="og:image" content="http://localhost/images/profile.webp"');
});

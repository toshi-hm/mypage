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

test("LINE Seed JPをサイト全体の標準フォントとして読み込む", async () => {
  const container = await createContainer();
  const result = await container.renderToString(BaseLayout, {
    props: { title: "Home" },
  });

  expect(result).toContain('href="https://fonts.googleapis.com"');
  expect(result).toContain('href="https://fonts.gstatic.com" crossorigin');
  expect(result).toContain(
    "https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700;800&display=swap",
  );
});
